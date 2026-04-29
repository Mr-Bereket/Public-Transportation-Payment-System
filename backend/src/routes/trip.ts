import { Request, Response, Router } from "express";

const tripRoute = Router();
tripRoute.get("/", (req: Request, res: Response) => {
  res.send("trip");
});
