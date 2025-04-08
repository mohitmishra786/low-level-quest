const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Test the database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to the database:", err.stack);
  } else {
    console.log("Successfully connected to the database");
    release();
  }
});

// Log database errors
pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
  if (err.client) {
    err.client.release();
  }
});

// Add query logging in development
if (process.env.NODE_ENV === "development") {
  const originalQuery = pool.query;
  pool.query = (...args) => {
    console.log("Executing query:", args[0]);
    if (args.length > 1) {
      console.log("Query parameters:", args[1]);
    }
    return originalQuery.apply(pool, args);
  };
}

module.exports = pool;
