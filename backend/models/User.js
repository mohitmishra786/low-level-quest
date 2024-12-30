const pool = require("../db");
const bcrypt = require("bcrypt");

class User {
  static async findByUsername(username) {
    const query = "SELECT * FROM users WHERE username = $1";
    const values = [username];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async create(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query =
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING *";
    const values = [username, hashedPassword];
    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = User;
