"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const login_1 = __importDefault(require("../auth/login"));
const signup_1 = __importDefault(require("../auth/signup"));
const wallet_1 = __importDefault(require("../routes/wallet"));
const user_1 = __importDefault(require("../routes/user"));
const trip_1 = __importDefault(require("../routes/trip"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/user", user_1.default);
app.use("/auth/login", login_1.default);
app.use("/auth/signup", signup_1.default);
app.use("/wallet", wallet_1.default);
app.use("/trips", trip_1.default);
app.listen(3000, (e) => {
    e ? console.error(e) : console.log("running on :3000");
});
