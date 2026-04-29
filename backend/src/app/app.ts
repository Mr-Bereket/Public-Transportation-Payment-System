import express, { Request, Response } from "express";
import loginRoute from "../auth/login";
import signupRoute from "../auth/signup";
import walletRoute from "../routes/wallet";
import userRoute from "../routes/user";
const app = express();

app.use(express.json());

app.use("/user", userRoute);
app.use("/auth/login", loginRoute);
app.use("/auth/signup", signupRoute);
app.use("/wallet", walletRoute);

app.listen(3000, (e) => {
  e ? console.error(e) : console.log("running on :3000");
});
