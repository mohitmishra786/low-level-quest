const pool = require("../db");

exports.getProblems = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*,
             COUNT(DISTINCT s.id) as submission_count,
             COUNT(DISTINCT CASE WHEN s.status = 'accepted' THEN s.id END) as accepted_count
      FROM problems p
      LEFT JOIN submissions s ON p.id = s.problem_id
      GROUP BY p.id
      ORDER BY p.id
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
    const problemQuery = await pool.query(
      `
      SELECT p.*, pd.examples, pd.constraints, pd.hints, pd.starter_code
      FROM problems p
      LEFT JOIN problem_details pd ON p.id = pd.problem_id
      WHERE p.id = \$1
    `,
      [id],
    );

    if (problemQuery.rows.length === 0) {
      return res.status(404).json({ error: "Problem not found" });
    }

    const problem = problemQuery.rows[0];

    // Get test cases that aren't hidden
    const testCasesQuery = await pool.query(
      `
      SELECT input, expected_output
      FROM test_cases
      WHERE problem_id = \$1 AND NOT is_hidden
    `,
      [id],
    );

    problem.testCases = testCasesQuery.rows;
    res.json(problem);
  } catch (error) {
    console.error("Failed to fetch problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.submitSolution = async (req, res) => {
  try {
    const { problemId } = req.params;
    const { code, language } = req.body;
    const userId = req.user.id; // Assuming you have authentication middleware

    // Here you would run the code against test cases
    // For now, we'll just save the submission
    const result = await pool.query(
      `
      INSERT INTO submissions (user_id, problem_id, code, language, status)
      VALUES (\$1, \$2, \$3, \$4, \$5)
      RETURNING *
    `,
      [userId, problemId, code, language, "pending"],
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to submit solution:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id; // Assuming you have authentication middleware

    const result = await pool.query(
      `
      SELECT * FROM submissions
      WHERE problem_id = \$1 AND user_id = \$2
      ORDER BY created_at DESC
    `,
      [problemId, userId],
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch submissions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
