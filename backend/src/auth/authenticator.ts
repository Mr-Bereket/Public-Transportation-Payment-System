import { Request } from "express";
import { verify } from "jsonwebtoken";

const authenticator = async (req: Request) => {
  const authHead = req.headers["authorization"];
  const token = authHead && authHead.split(" ")[1];
  verify(token, "hahuhi", (err, data) => {
    err ? console.error(err) : (req.body.phone = data);
  });
};

export default authenticator;
