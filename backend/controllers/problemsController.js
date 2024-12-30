const pool = require("../db");

exports.getProblems = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM problems");
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch problems:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
