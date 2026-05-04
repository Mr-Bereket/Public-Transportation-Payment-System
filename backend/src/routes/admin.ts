import { Request, Response, Router } from "express";
import db from "../app/db";

const adminRoute = Router();

// Overview counts
adminRoute.get("/overview", async (req: Request, res: Response) => {
  try {
    const [passengerCount] = await db("PASSENGER").count("PassengerID as count");
    const [routeCount] = await db("ROUTE").count("RouteID as count");
    const [activeTripsCount] = await db("TRIP_INSTANCE")
      .where("ActualDate", ">=", new Date().toISOString().split('T')[0])
      .count("TripInstanceID as count");
    
    // Calculate total revenue from completed transactions
    const [revenueData] = await db("TRANSACTION")
      .where("PaymentStatus", "completed")
      .sum("Amount as total_revenue");
    
    const totalRevenue = revenueData?.total_revenue || 0;

    return res.json({
      passengers: passengerCount.count,
      routes: routeCount.count,
      activeTrips: activeTripsCount.count,
      totalRevenue: totalRevenue,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch overview data" });
  }
});

// Routes management
adminRoute.get("/routes", async (req: Request, res: Response) => {
  try {
    const routes = await db("ROUTE").select("*");
    return res.json(routes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch routes" });
  }
});

adminRoute.post("/routes", async (req: Request, res: Response) => {
  try {
    const { RouteName } = req.body;
    if (!RouteName) {
      return res.status(400).json({ error: "RouteName is required" });
    }

    const [routeId] = await db("ROUTE").insert({ RouteName });
    return res.json({ RouteID: routeId, RouteName });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not create route" });
  }
});

adminRoute.delete("/routes/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Get all schedules for this route
    const schedules = await db("SCHEDULE").where({ RouteID: id }).select("ScheduleID");
    const scheduleIds = schedules.map((s: any) => s.ScheduleID);
    
    // Delete route stops
    await db("ROUTE_STOPS").where({ RouteID: id }).del();
    
    // Delete trip instances related to schedules on this route
    if (scheduleIds.length > 0) {
      await db("TRIP_INSTANCE").whereIn("ScheduleID", scheduleIds).del();
    }
    
    // Delete schedules
    await db("SCHEDULE").where({ RouteID: id }).del();
    
    // Finally delete the route
    await db("ROUTE").where({ RouteID: id }).del();
    
    return res.json({ message: "Route deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not delete route" });
  }
});

// Get trips
adminRoute.get("/trips", async (req: Request, res: Response) => {
  try {
    const trips = await db("TRIP_INSTANCE")
      .join("SCHEDULE", "TRIP_INSTANCE.ScheduleID", "=", "SCHEDULE.ScheduleID")
      .join("ROUTE", "SCHEDULE.RouteID", "=", "ROUTE.RouteID")
      .join("BUS", "TRIP_INSTANCE.BusID", "=", "BUS.BusID")
      .join("DRIVER", "TRIP_INSTANCE.DriverID", "=", "DRIVER.DriverID")
      .select(
        "TRIP_INSTANCE.TripInstanceID",
        "TRIP_INSTANCE.ScheduleID",
        "ROUTE.RouteName",
        "TRIP_INSTANCE.BusID",
        "BUS.PlateNumber",
        "TRIP_INSTANCE.DriverID",
        "DRIVER.Name as DriverName",
        "TRIP_INSTANCE.ActualDate",
        "TRIP_INSTANCE.ActualStartTime",
        "TRIP_INSTANCE.ActualEndTime",
        "TRIP_INSTANCE.DelayMinutes",
        "TRIP_INSTANCE.PassengerCount"
      )
      .orderBy("TRIP_INSTANCE.ActualDate", "desc");
    return res.json(trips);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch trips" });
  }
});

// Trip scheduling
adminRoute.post("/trips", async (req: Request, res: Response) => {
  try {
    const { ScheduleID, BusID, DriverID, ActualDate, ActualStartTime, ActualEndTime } = req.body;

    if (!ScheduleID || !BusID || !DriverID || !ActualDate || !ActualStartTime || !ActualEndTime) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const [tripId] = await db("TRIP_INSTANCE").insert({
      ScheduleID,
      BusID,
      DriverID,
      ActualDate,
      ActualStartTime,
      ActualEndTime,
      DelayMinutes: 0,
      PassengerCount: 0,
    });

    return res.json({ TripInstanceID: tripId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not create trip" });
  }
});

// Get schedules for dropdown (to select route)
adminRoute.get("/schedules", async (req: Request, res: Response) => {
  try {
    const schedules = await db("SCHEDULE")
      .join("ROUTE", "SCHEDULE.RouteID", "=", "ROUTE.RouteID")
      .select(
        "SCHEDULE.ScheduleID",
        "SCHEDULE.RouteID",
        "ROUTE.RouteName",
        "SCHEDULE.ArrivalTime",
        "SCHEDULE.DepartureTime",
        "SCHEDULE.DaysOfWeek"
      );
    return res.json(schedules);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch schedules" });
  }
});

// Get buses for dropdown
adminRoute.get("/buses", async (req: Request, res: Response) => {
  try {
    const buses = await db("BUS").select("BusID", "PlateNumber", "Capacity", "BusType");
    return res.json(buses);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch buses" });
  }
});

// Get drivers for dropdown
adminRoute.get("/drivers", async (req: Request, res: Response) => {
  try {
    const drivers = await db("DRIVER").select("DriverID", "Name", "LicenseNumber");
    return res.json(drivers);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch drivers" });
  }
});

// Hire a new driver
adminRoute.post("/drivers", async (req: Request, res: Response) => {
  try {
    const { Name, LicenseNumber, Status, HireDate } = req.body;
    
    if (!Name || !LicenseNumber) {
      return res.status(400).json({ error: "Name and LicenseNumber are required" });
    }

    const [driverId] = await db("DRIVER").insert({
      Name,
      LicenseNumber,
      Status: Status || "active",
      HireDate: HireDate || new Date().toISOString().split('T')[0],
    });

    return res.json({ DriverID: driverId, Name, LicenseNumber });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not hire driver" });
  }
});

// Fire a driver (delete)
adminRoute.delete("/drivers/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Check if driver has active trips
    const activeTripCount = await db("TRIP_INSTANCE")
      .where({ DriverID: id })
      .where("ActualDate", ">=", new Date().toISOString().split('T')[0])
      .count("TripInstanceID as count");
    
    if (Number(activeTripCount[0].count) > 0) {
      return res.status(400).json({ error: "Cannot remove driver with active trips" });
    }
    
    await db("DRIVER").where({ DriverID: id }).del();
    return res.json({ message: "Driver removed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not remove driver" });
  }
});

// Add a new bus
adminRoute.post("/buses", async (req: Request, res: Response) => {
  try {
    const { PlateNumber, Capacity, BusType, Status } = req.body;
    
    if (!PlateNumber || !Capacity || !BusType) {
      return res.status(400).json({ error: "PlateNumber, Capacity, and BusType are required" });
    }

    const [busId] = await db("BUS").insert({
      PlateNumber,
      Capacity,
      BusType,
      Status: Status || "available",
    });

    return res.json({ BusID: busId, PlateNumber, Capacity, BusType });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not add bus" });
  }
});

// Remove a bus (delete)
adminRoute.delete("/buses/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // Check if bus has active trips
    const activeTripCount = await db("TRIP_INSTANCE")
      .where({ BusID: id })
      .where("ActualDate", ">=", new Date().toISOString().split('T')[0])
      .count("TripInstanceID as count");
    
    if (Number(activeTripCount[0].count) > 0) {
      return res.status(400).json({ error: "Cannot remove bus with active trips" });
    }
    
    await db("BUS").where({ BusID: id }).del();
    return res.json({ message: "Bus removed successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not remove bus" });
  }
});

export default adminRoute;