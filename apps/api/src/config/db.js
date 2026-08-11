"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = getDb;
const pg_1 = require("pg");
let pool = null;
function getDb() {
    if (!pool) {
        pool = new pg_1.Pool({
            connectionString: process.env.DATABASE_URL,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });
    }
    return pool;
}
//# sourceMappingURL=db.js.map