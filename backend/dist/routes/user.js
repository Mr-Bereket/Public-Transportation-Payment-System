"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticator_1 = __importDefault(require("../auth/authenticator"));
const db_1 = __importDefault(require("../app/db"));
const userRoute = (0, express_1.Router)();
// Add this to a new file routes/user.ts or into app.ts
userRoute.get("/me", authenticator_1.default, async (req, res) => {
    try {
        // req.user was already fetched from the DB by the authenticator!
        const user = req.user;
        // Don't send the password back to the frontend, even if it's hashed
        const { Password, ...safeUser } = user;
        return res.json(safeUser);
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
//update
userRoute.patch("/update", authenticator_1.default, async (req, res) => {
    const { name, phone } = req.body;
    const passengerId = req.user.PassengerID;
    // 1. Validation: Make sure they sent at least something to update
    if (!name && !phone) {
        return res.status(400).json({ error: "Nothing to update provided" });
    }
    try {
        // 2. Perform the update
        await (0, db_1.default)("PASSENGER")
            .where({ PassengerID: passengerId })
            .update({
            Name: name || req.user.Name, // Keep old name if new one isn't provided
            PhoneNumber: phone || req.user.PhoneNumber,
        });
        // 3. Get the updated user data to send back
        const updatedUser = await (0, db_1.default)("PASSENGER")
            .where({ PassengerID: passengerId })
            .first();
        const { Password, ...safeUser } = updatedUser;
        return res.json({
            message: "Profile updated successfully",
            user: safeUser,
        });
    }
    catch (err) {
        // Handle unique constraint for phone number
        if (err.code === "ER_DUP_ENTRY") {
            return res
                .status(400)
                .json({ error: "This phone number is already in use" });
        }
        console.error(err);
        return res.status(500).json({ error: "Update failed" });
    }
});
exports.default = userRoute;
