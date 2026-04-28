const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const app = express();
app.use(express.json());

dotenv.config();

//routes
const authSignupRoute = require("../auth/signup");
const authLoginRoute = require("../auth/login");
const userRoutes = require("../routes/user");

app.use("/user", userRoutes);
app.use("/auth/login", authLoginRoute);
app.use("/auth/signup", authSignupRoute);

app.listen(3000, (e) => {
  if (!e) {
    console.log("server running on port 3000");
  } else {
    console.error(e);
  }
});
