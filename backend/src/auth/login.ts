import { Request, Response, Router } from "express";
import db from "../app/db";
import { sign } from "jsonwebtoken";
import { compare } from "bcryptjs";
const loginRoute = Router();

loginRoute.post("/", async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const user = await db("PASSENGER").where({ PhoneNumber: phone }).first();
  if (user && (await compare(password, user.Password))) {
    console.log(user);
    const token = sign({ PassengerID: user.PassengerID }, "hahuhi");
    res.json({ token });
  } else {
    res.send("invalid credentials");
  }
});

export default loginRoute;
