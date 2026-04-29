import express, { Request, Response, Errback } from "express";
import loginRoute from "../auth/login";
const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send(200);
});
app.use("/auth/login", loginRoute);

app.listen(3000, (e) => {
  e ? console.log(e) : console.log("running on :3000");
});
