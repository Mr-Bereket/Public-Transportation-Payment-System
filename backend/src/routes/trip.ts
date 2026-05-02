import { Request, Response, Router } from "express";
import authenticator from "../auth/authenticator";
import db from "../app/db";

const tripRoute = Router();

// 1. Get all available schedules/routes with buses
tripRoute.get("/schedules", async (req: Request, res: Response) => {
  try {
    // Get all routes with their schedules and buses
    const schedules = await db("SCHEDULE")
      .join("ROUTE", "SCHEDULE.RouteID", "=", "ROUTE.RouteID")
      .select(
        "SCHEDULE.ScheduleID",
        "SCHEDULE.RouteID",
        "ROUTE.RouteName",
        "SCHEDULE.ArrivalTime",
        "SCHEDULE.DepartureTime",
        "SCHEDULE.DaysOfWeek"
      )
      .orderBy("SCHEDULE.DepartureTime");

    return res.json(schedules);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch schedules" });
  }
});

// 2. Get route details with all stops
tripRoute.get("/routes/:routeId", async (req: Request, res: Response) => {
  try {
    const { routeId } = req.params;

    // Get route info
    const route = await db("ROUTE")
      .where({ RouteID: routeId })
      .first();

    if (!route) {
      return res.status(404).json({ error: "Route not found" });
    }

    // Get all stops for this route
    const stops = await db("ROUTE_STOPS")
      .join("STOPS", "ROUTE_STOPS.StopID", "=", "STOPS.StopID")
      .where({ RouteID: routeId })
      .select(
        "STOPS.StopID",
        "STOPS.StopName",
        "STOPS.Latitude",
        "STOPS.Longitude",
        "ROUTE_STOPS.StopOrder"
      )
      .orderBy("ROUTE_STOPS.StopOrder");

    return res.json({
      ...route,
      stops: stops,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch route details" });
  }
});

// 3. Get all trips (scheduled instances) for a specific route
tripRoute.get("/route/:routeId/trips", async (req: Request, res: Response) => {
  try {
    const { routeId } = req.params;

    const trips = await db("TRIP_INSTANCE")
      .join("SCHEDULE", "TRIP_INSTANCE.ScheduleID", "=", "SCHEDULE.ScheduleID")
      .join("BUS", "TRIP_INSTANCE.BusID", "=", "BUS.BusID")
      .where("SCHEDULE.RouteID", routeId)
      .select(
        "TRIP_INSTANCE.TripInstanceID",
        "TRIP_INSTANCE.ActualDate",
        "TRIP_INSTANCE.ActualStartTime",
        "TRIP_INSTANCE.ActualEndTime",
        "TRIP_INSTANCE.PassengerCount",
        "BUS.PlateNumber",
        "BUS.Capacity",
        "BUS.BusType"
      )
      .orderBy("TRIP_INSTANCE.ActualDate", "TRIP_INSTANCE.ActualStartTime");

    // Calculate available seats for each trip
    const tripsWithAvailability = trips.map((trip: any) => ({
      ...trip,
      availableSeats: trip.Capacity - trip.PassengerCount,
    }));

    return res.json(tripsWithAvailability);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch trips" });
  }
});

// 4. Get trip details
tripRoute.get("/trips/:tripInstanceId", async (req: Request, res: Response) => {
  try {
    const { tripInstanceId } = req.params;

    const trip = await db("TRIP_INSTANCE")
      .where({ TripInstanceID: tripInstanceId })
      .join("SCHEDULE", "TRIP_INSTANCE.ScheduleID", "=", "SCHEDULE.ScheduleID")
      .join("BUS", "TRIP_INSTANCE.BusID", "=", "BUS.BusID")
      .join("DRIVER", "TRIP_INSTANCE.DriverID", "=", "DRIVER.DriverID")
      .select(
        "TRIP_INSTANCE.*",
        "SCHEDULE.RouteID",
        "SCHEDULE.DepartureTime as scheduledDepartureTime",
        "SCHEDULE.ArrivalTime as scheduledArrivalTime",
        "BUS.PlateNumber",
        "BUS.Capacity",
        "BUS.BusType",
        "DRIVER.Name as DriverName"
      )
      .first();

    if (!trip) {
      return res.status(404).json({ error: "Trip not found" });
    }

    return res.json({
      ...trip,
      availableSeats: trip.Capacity - trip.PassengerCount,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch trip details" });
  }
});

// 5. Buy a ticket for a trip
tripRoute.post(
  "/trips/:tripInstanceId/buy-ticket",
  authenticator,
  async (req: any, res: Response) => {
    try {
      const { tripInstanceId } = req.params;
      const passengerId = req.user.PassengerID;
      const ticketPrice = 5.0; // Fixed ticket price, can be made dynamic

      // Start transaction
      const trx = await db.transaction();

      // 1. Check if trip exists and has available seats
      const trip = await trx("TRIP_INSTANCE")
        .where({ TripInstanceID: tripInstanceId })
        .first();

      if (!trip) {
        await trx.rollback();
        return res.status(404).json({ error: "Trip not found" });
      }

      const bus = await trx("BUS").where({ BusID: trip.BusID }).first();

      if (trip.PassengerCount >= bus.Capacity) {
        await trx.rollback();
        return res.status(400).json({ error: "Trip is fully booked" });
      }

      // 2. Check if passenger already has a ticket for this trip
      const existingTicket = await trx("TRANSACTION")
        .join("SMART_CARD", "TRANSACTION.CardID", "=", "SMART_CARD.CardID")
        .where({
          "SMART_CARD.PassengerID": passengerId,
          "TRANSACTION.TripInstanceID": tripInstanceId,
          "TRANSACTION.Type": "fare",
        })
        .first();

      if (existingTicket) {
        await trx.rollback();
        return res.status(400).json({ error: "You already have a ticket for this trip" });
      }

      // 3. Get passenger's card
      const card = await trx("SMART_CARD")
        .where({ PassengerID: passengerId })
        .first();

      if (!card) {
        await trx.rollback();
        return res.status(404).json({ error: "No smart card found" });
      }

      // 4. Check balance
      if (card.Balance < ticketPrice) {
        await trx.rollback();
        return res.status(400).json({
          error: "Insufficient balance",
          required: ticketPrice,
          balance: card.Balance,
        });
      }

      // 5. Deduct fare from card
      await trx("SMART_CARD")
        .where({ CardID: card.CardID })
        .decrement({ Balance: ticketPrice });

      // 6. Create transaction record
      await trx("TRANSACTION").insert({
        CardID: card.CardID,
        TripInstanceID: tripInstanceId,
        Amount: ticketPrice,
        Type: "fare",
        PaymentStatus: "completed",
        TimeStamp: new Date(),
      });

      // 7. Increment passenger count on trip
      await trx("TRIP_INSTANCE")
        .where({ TripInstanceID: tripInstanceId })
        .increment({ PassengerCount: 1 });

      // Commit transaction
      await trx.commit();

      // Get updated card balance
      const updatedCard = await db("SMART_CARD")
        .where({ CardID: card.CardID })
        .first();

      return res.json({
        message: "Ticket purchased successfully",
        ticketPrice: ticketPrice,
        newBalance: updatedCard.Balance,
        tripInstanceId: tripInstanceId,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Could not purchase ticket" });
    }
  }
);

// 6. Get passenger's booked trips
tripRoute.get(
  "/my-bookings",
  authenticator,
  async (req: any, res: Response) => {
    try {
      const passengerId = req.user.PassengerID;

      // Get all trips the passenger has booked
      const bookings = await db("TRANSACTION")
        .join("SMART_CARD", "TRANSACTION.CardID", "=", "SMART_CARD.CardID")
        .join("TRIP_INSTANCE", "TRANSACTION.TripInstanceID", "=", "TRIP_INSTANCE.TripInstanceID")
        .join("SCHEDULE", "TRIP_INSTANCE.ScheduleID", "=", "SCHEDULE.ScheduleID")
        .join("ROUTE", "SCHEDULE.RouteID", "=", "ROUTE.RouteID")
        .join("BUS", "TRIP_INSTANCE.BusID", "=", "BUS.BusID")
        .where({
          "SMART_CARD.PassengerID": passengerId,
          "TRANSACTION.Type": "fare",
        })
        .select(
          "TRANSACTION.TransactionID",
          "TRANSACTION.Amount",
          "TRANSACTION.TimeStamp as bookedAt",
          "TRIP_INSTANCE.TripInstanceID",
          "TRIP_INSTANCE.ActualDate",
          "TRIP_INSTANCE.ActualStartTime",
          "TRIP_INSTANCE.ActualEndTime",
          "ROUTE.RouteName",
          "BUS.PlateNumber",
          "BUS.BusType"
        )
        .orderBy("TRIP_INSTANCE.ActualDate", "desc");

      return res.json(bookings);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Could not fetch bookings" });
    }
  }
);

// 7. Cancel a booking (refund)
tripRoute.post(
  "/trips/:tripInstanceId/cancel",
  authenticator,
  async (req: any, res: Response) => {
    try {
      const { tripInstanceId } = req.params;
      const passengerId = req.user.PassengerID;
      const ticketPrice = 5.0; // Should match purchase price

      const trx = await db.transaction();

      // 1. Find the booking
      const booking = await trx("TRANSACTION")
        .join("SMART_CARD", "TRANSACTION.CardID", "=", "SMART_CARD.CardID")
        .where({
          "SMART_CARD.PassengerID": passengerId,
          "TRANSACTION.TripInstanceID": tripInstanceId,
          "TRANSACTION.Type": "fare",
        })
        .first();

      if (!booking) {
        await trx.rollback();
        return res.status(404).json({ error: "Booking not found" });
      }

      // 2. Refund the money
      await trx("SMART_CARD")
        .where({ CardID: booking.CardID })
        .increment({ Balance: ticketPrice });

      // 3. Mark original transaction as cancelled (update status)
      await trx("TRANSACTION")
        .where({ TransactionID: booking.TransactionID })
        .update({ PaymentStatus: "cancelled" });

      // 4. Create refund transaction record
      await trx("TRANSACTION").insert({
        CardID: booking.CardID,
        TripInstanceID: tripInstanceId,
        Amount: ticketPrice,
        Type: "refund",
        PaymentStatus: "completed",
        TimeStamp: new Date(),
      });

      // 5. Decrement passenger count
      await trx("TRIP_INSTANCE")
        .where({ TripInstanceID: tripInstanceId })
        .decrement({ PassengerCount: 1 });

      await trx.commit();

      return res.json({
        message: "Booking cancelled and refunded successfully",
        refundAmount: ticketPrice,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Could not cancel booking" });
    }
  }
);

export default tripRoute;
