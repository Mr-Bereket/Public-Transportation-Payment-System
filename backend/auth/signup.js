const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../app/db");

const secret = "hahuhi";

router.post("/", async (req, res) => {
  const { name, phone, pass } = req.body;
  const hashedPass = await bcrypt.hash(pass, 10);
  await db("user")
    .insert({ Name: name, PhoneNumber: phone, Password: hashedPass })
    .then((data) => {
      console.log(data);
      const token = jwt.sign({ PhoneNo: phone }, secret);
      res.send(token);
    })
    .catch((err) => {
      //console.error(err)
      err.code == "ER_DUP_ENTRY"
        ? res.send("phone number exixsts")
        : res.send("unknown error");
    });
});

module.exports = router;
