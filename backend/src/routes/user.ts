import { Request, Response, Router } from "express";
import authenticator from "../auth/authenticator";
import db from "../app/db";

const userRoute = Router();

// Add this to a new file routes/user.ts or into app.ts
userRoute.get("/me", authenticator, async (req: Request, res: Response) => {
  try {
    // req.user was already fetched from the DB by the authenticator!
    const user = (req as any).user;

    // Don't send the password back to the frontend, even if it's hashed
    const { Password, ...safeUser } = user;

    return res.json(safeUser);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

//update
userRoute.patch("/update", authenticator, async (req: any, res: Response) => {
  const { name, phone } = req.body;
  const passengerId = req.user.PassengerID;

  // 1. Validation: Make sure they sent at least something to update
  if (!name && !phone) {
    return res.status(400).json({ error: "Nothing to update provided" });
  }

  try {
    // 2. Perform the update
    await db("PASSENGER")
      .where({ PassengerID: passengerId })
      .update({
        Name: name || req.user.Name, // Keep old name if new one isn't provided
        PhoneNumber: phone || req.user.PhoneNumber,
      });

    // 3. Get the updated user data to send back
    const updatedUser = await db("PASSENGER")
      .where({ PassengerID: passengerId })
      .first();

    const { Password, ...safeUser } = updatedUser;

    return res.json({
      message: "Profile updated successfully",
      user: safeUser,
    });
  } catch (err: any) {
    // Handle unique constraint for phone number
    if (err.code === "ER_DUP_ENTRY") {
      return res
        .status(400)
        .json({ error: "This phone number is already in use" });
    }
    console.error(err);
    return res.status(500).json({ error: "Update failed" });
  }
});

export default userRoute;
