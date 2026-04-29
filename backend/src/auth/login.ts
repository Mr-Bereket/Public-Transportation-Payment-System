import { Request, Response, Router } from "express";
import authenticator from "./authenticator";
const loginRoute = Router();

loginRoute.post("/", (req: Request, res: Response) => {
  authenticator(req);
  res.send(req.body.token);
});

export default loginRoute;
