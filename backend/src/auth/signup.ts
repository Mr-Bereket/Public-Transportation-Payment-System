import { hash } from "bcryptjs";
import { Router } from "express";
import db from "../app/db";
import { sign } from "jsonwebtoken";

const secret = "hahuhi";

const router = Router();
router.post("/", async (req, res) => {
  const { name, phone, pass } = req.body;
  const hashedPass = await hash(pass, 10);
  await db("user")
    .insert({ Name: name, PhoneNumber: phone, Password: hashedPass })
    .then((data) => {
      console.log(data);
      const token = sign({ PhoneNo: phone }, secret);
      res.send(token);
    })
    .catch((err) => {
      //console.error(err)
      err.code == "ER_DUP_ENTRY"
        ? res.send("phone number exixsts")
        : res.send("unknown error");
    });
});

export default router;
