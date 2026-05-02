"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const knex_1 = require("knex");
const db = (0, knex_1.knex)({
    client: "mysql2",
    connection: {
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "1q2w3e",
        database: "PublicTransportDB",
    },
});
exports.default = db;
