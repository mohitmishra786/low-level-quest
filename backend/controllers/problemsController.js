// const pool = require("../db");

// exports.getProblems = async (req, res) => {
//   try {
//     const result = await pool.query("SELECT * FROM problems");
//     res.json(result.rows);
//   } catch (error) {
//     console.error("Failed to fetch problems:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const pool = require("../db");

exports.getProblems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        difficulty,
        acceptance,
        category,
        tags,
        status
      FROM problems
      ORDER BY id ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch problems:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM problems WHERE id = \$1", [
      id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const stats = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE status = 'solved') as solved_count,
        COUNT(*) FILTER (WHERE status = 'attempted') as attempted_count,
        COUNT(*) FILTER (WHERE difficulty = 'Easy' AND status = 'solved') as easy_solved,
        COUNT(*) FILTER (WHERE difficulty = 'Medium' AND status = 'solved') as medium_solved,
        COUNT(*) FILTER (WHERE difficulty = 'Hard' AND status = 'solved') as hard_solved
      FROM problems
      WHERE user_id = \$1
    `,
      [userId],
    );

    res.json(stats.rows[0]);
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
