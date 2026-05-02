import { knex } from "knex";

const db = knex({
  client: "mysql2",
  connection: {
    host: "https://friendly-system-rq7495gvqqghxxv6-3306.app.github.dev/",
    port: 3306,
    user: "root",
    password: "1q2w3e",
    database: "PublicTransportDB",
  },
});

export default db;
