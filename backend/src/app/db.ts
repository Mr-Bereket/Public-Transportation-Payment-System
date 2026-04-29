import { knex } from "knex";

const db = knex({
  client: "mysql2",
  connection: {
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "1q2w3e",
    database: "transport_payment",
  },
});

export default db;
