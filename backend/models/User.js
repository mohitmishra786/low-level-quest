const pool = require("../db");
const bcrypt = require("bcrypt");

class User {
  static async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = $1";
    const values = [username];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async create(username, email, password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const query =
        "INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *";
      const values = [username, email, hashedPassword];
      console.log("Query:", query);
      console.log("Values:", values);
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error("Error in User.create:", error);
      throw error;
    }
  }
}

module.exports = User;
