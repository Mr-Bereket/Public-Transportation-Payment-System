"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const db_1 = __importDefault(require("../app/db"));
const jsonwebtoken_1 = require("jsonwebtoken");
const loginRoute = (0, express_1.Router)();
loginRoute.post("/", async (req, res) => {
    const { phone, password } = req.body;
    const user = await (0, db_1.default)("PASSENGER").where({ PhoneNumber: phone }).first();
    if (user && password == user.Password) {
        console.log(user);
        const token = (0, jsonwebtoken_1.sign)({ PassengerID: user.PassengerID }, "hahuhi");
        res.json({ token, user });
    }
    else {
        res.send("invalid credentials");
    }
});
exports.default = loginRoute;
