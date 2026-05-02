"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = require("jsonwebtoken");
const db_1 = __importDefault(require("../app/db"));
const authenticator = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const decoded = (0, jsonwebtoken_1.verify)(token, "hahuhi");
        // IMPORTANT: you must await this database call
        const user = await (0, db_1.default)("PASSENGER")
            .where({ PassengerID: decoded.PassengerID }) // filter by a specific key, not the whole payload
            .first();
        if (!user) {
            return res.status(403).json({ error: "User not found" });
        }
        // attach user to req so other routes can use it
        req.user = user;
        next();
    }
    catch (err) {
        console.error(err);
        return res.status(403).json({ error: "Invalid or expired token" });
    }
};
exports.default = authenticator;
