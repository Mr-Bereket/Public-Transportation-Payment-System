import { Router, Response, Request } from "express";
import authenticator from "../auth/authenticator";
import db from "../app/db";

const walletRoute = Router();

//get wallet data
walletRoute.get("/", authenticator, async (req: any, res: Response) => {
  try {
    // req.user was attached by your authenticator middleware!
    const passengerId = req.user.PassengerID;

    // Look up the card associated with this passenger
    const card = await db("SMART_CARD")
      .where({ PassengerID: passengerId })
      .first();

    if (!card) {
      return res
        .status(404)
        .json({ error: "No smart card found for this user" });
    }
    // Return the balance
    return res.json({
      card_id: card.CardID,
      balance: card.Balance,
      status: card.Status,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//deposit
walletRoute.post("/deposit", authenticator, async (req: any, res: Response) => {
  const { amount } = req.body;
  const passengerID = req.user.PassengerID;

  const trx = await db.transaction();

  try {
    const card = await trx("SMART_CARD")
      .where({ PassengerID: passengerID })
      .first();

    if (!card) {
      return res
        .status(404)
        .json({ error: "No smart card found for this user" });
    }

    await trx("SMART_CARD").where({ PassengerID: passengerID }).increment({
      Balance: amount,
    });
    await trx("TRANSACTION").insert({
      CardID: card.CardID,
      Amount: amount,
      Type: "deposit", // <--- Explicitly label it!
      PaymentStatus: "completed",
      TimeStamp: new Date(),
    });
    await trx.commit();
    return res.json({
      card_id: card.CardID,
      balance: card.Balance,
      status: card.Status,
    });
  } catch (err) {
    await trx.rollback();
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get transaction history
walletRoute.get("/history", authenticator, async (req: any, res: Response) => {
  try {
    const passengerId = req.user.PassengerID;

    // 1. First, find the CardID linked to this passenger
    const card = await db("SMART_CARD")
      .where({ PassengerID: passengerId })
      .first();

    if (!card) {
      return res.status(404).json({ error: "No wallet found" });
    }

    // 2. Fetch all transactions for that card
    // We order by TimeStamp descending so the newest is on top
    const transactions = await db("TRANSACTION")
      .where({ CardID: card.CardID })
      .orderBy("TimeStamp", "desc")
      .limit(20); // Just get the last 20

    return res.json(transactions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Could not fetch history" });
  }
});
export default walletRoute;
