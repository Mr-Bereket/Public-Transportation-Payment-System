"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = require("bcryptjs");
const express_1 = require("express");
const db_1 = __importDefault(require("../app/db"));
const jsonwebtoken_1 = require("jsonwebtoken");
const secret = "hahuhi";
const signupRoute = (0, express_1.Router)();
signupRoute.post("/", async (req, res) => {
    const { name, phone, pass } = req.body;
    const hashedPass = await (0, bcryptjs_1.hash)(pass, 10);
    // Use a transaction to ensure both happen or none happen
    const trx = await db_1.default.transaction();
    try {
        // 1. Insert Passenger
        const [passengerId] = await trx("PASSENGER").insert({
            Name: name,
            PhoneNumber: phone,
            Password: hashedPass,
        });
        // 2. Insert Smart Card (linked to passengerId)
        await trx("SMART_CARD").insert({
            CardID: `TR-${Date.now()}`, // You need a unique Card ID
            PassengerID: passengerId,
            Balance: 0,
            Status: "active",
            CardType: "Standard",
        });
        // 3. Commit the changes to the DB
        await trx.commit();
        const token = (0, jsonwebtoken_1.sign)({ PassengerID: passengerId }, secret);
        // Send response ONLY after everything is confirmed
        res.json({ token });
    }
    catch (err) {
        // If anything fails, undo everything (rollback)
        await trx.rollback();
        if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).send("Phone number already exists");
        }
        console.error(err);
        res.status(500).send("Internal server error");
    }
});
exports.default = signupRoute;
