const jwt = require("jsonwebtoken");
const pool = require("../db");

/**
 * Authentication middleware
 * Verifies the JWT token in the Authorization header
 * and attaches the user to the request object
 */
const auth = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.header("Authorization");
    console.log(
      "Auth middleware - Authorization header:",
      authHeader ? `${authHeader.substr(0, 15)}...` : "none"
    );

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    console.log(
      "Auth middleware - Token extracted:",
      token ? `${token.substr(0, 10)}...` : "none"
    );

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Auth middleware - JWT decoded successfully:", decoded);

      // Get the user from the database
      console.log("Auth middleware - Looking up user with ID:", decoded.userId);
      const result = await pool.query(
        "SELECT id, username, email FROM users WHERE id = $1",
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        console.log("Auth middleware - User not found in database");
        return res.status(401).json({ error: "User not found" });
      }

      // Attach the user to the request object
      req.user = result.rows[0];
      console.log("Auth middleware - User attached to request:", req.user.id);
      next();
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      return res.status(401).json({ error: "Invalid token" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;
