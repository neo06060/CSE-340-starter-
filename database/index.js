/**
 * Database connection configuration
 * using pg (node-postgres)
 */

const { Pool } = require("pg")
require("dotenv").config()

let pool

if (process.env.NODE_ENV === "development") {
  // ✅ Local development — also uses SSL (Render requires SSL even if you test remotely)
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })

  // Exporting a custom query function with logging
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("✅ executed query:", text)
        return res
      } catch (error) {
        console.error("❌ error in query:", text, error)
        throw error
      }
    },
  }
} else {
  // ✅ Production (e.g., Render) — must also use SSL
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false, // 👈 required for Render's free Postgres
    },
  })

  module.exports = pool
}
