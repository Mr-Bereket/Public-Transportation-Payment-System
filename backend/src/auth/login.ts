import { Request, Response, Router } from "express";
import db from "../app/db";
import { sign } from "jsonwebtoken";
const loginRoute = Router();

loginRoute.post("/", async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const user = await db("PASSENGER").where({ PhoneNumber: phone }).first();
  if (user && password == user.Password ) {
    console.log(user);
    const token = sign({ PassengerID: user.PassengerID }, "hahuhi");
    res.json({ token, user});
  } else {
    res.send("invalid credentials");
  }
});

export default loginRoute;
