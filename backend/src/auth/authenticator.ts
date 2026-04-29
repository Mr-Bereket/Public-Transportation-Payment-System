import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import db from "../app/db";

const authenticator = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }
  try {
    const decoded = verify(token, "hahuhi") as { PassengerID: number };

    // IMPORTANT: you must await this database call
    const user = await db("PASSENGER")
      .where({ PassengerID: decoded.PassengerID }) // filter by a specific key, not the whole payload
      .first();

    if (!user) {
      return res.status(403).json({ error: "User not found" });
    }

    // attach user to req so other routes can use it
    (req as any).user = user;
    next();
  } catch (err) {
    console.error(err);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

export default authenticator;
