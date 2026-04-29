import { hash } from "bcryptjs";
import { Router } from "express";
import db from "../app/db";
import { sign } from "jsonwebtoken";

const secret = "hahuhi";

const signupRoute = Router();

signupRoute.post("/", async (req, res) => {
  const { name, phone, pass } = req.body;
  const hashedPass = await hash(pass, 10);

  // Use a transaction to ensure both happen or none happen
  const trx = await db.transaction();

  try {
    // 1. Insert Passenger
    const [passengerId] = await trx("PASSENGER").insert({
      Name: name,
      PhoneNumber: phone,
      Password: hashedPass,
    });

    // 2. Insert Smart Card (linked to passengerId)
    await trx("SMART_CARD").insert({
      CardID: `TR-${Date.now()}`, // You need a unique Card ID
      PassengerID: passengerId,
      Balance: 0,
      Status: "active",
      CardType: "Standard",
    });

    // 3. Commit the changes to the DB
    await trx.commit();

    const token = sign({ id: passengerId }, secret);

    // Send response ONLY after everything is confirmed
    res.json({ token });
  } catch (err: any) {
    // If anything fails, undo everything (rollback)
    await trx.rollback();

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).send("Phone number already exists");
    }
    console.error(err);
    res.status(500).send("Internal server error");
  }
});

export default signupRoute;
