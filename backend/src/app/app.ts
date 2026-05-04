import express from "express";
import cors from "cors";
import loginRoute from "../auth/login";
import signupRoute from "../auth/signup";
import walletRoute from "../routes/wallet";
import userRoute from "../routes/user";
import tripRoute from "../routes/trip";
import adminRoute from "../routes/admin";
import  *  as dotenv from "dotenv";
const app = express();

dotenv.config({
  
});

app.use(cors());
app.use(express.json());

app.use("/user", userRoute);
app.use("/auth/login", loginRoute);
app.use("/auth/signup", signupRoute);
app.use("/wallet", walletRoute);
app.use("/trips", tripRoute);
app.use("/admin", adminRoute);

app.listen(3000, (e) => {
  e ? console.error(e) : console.log("running on :3000");
});
