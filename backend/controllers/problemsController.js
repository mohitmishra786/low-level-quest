// backend/controllers/problemsController.js

const pool = require("../db");
const { executeCode } = require('../utils/codeExecutor');

exports.getProblems = async (req, res) => {
  try {
    const userId = req.user?.id; // Optional user ID for getting problem status
    const query = `
      SELECT
        p.id,
        p.title,
        p.difficulty,
        c.name as category,
        p.created_at,
        COALESCE(ups.status, 'not_attempted') as status,
        COALESCE(ups.attempts, 0) as attempts
      FROM problems p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN user_problem_status ups ON p.id = ups.problem_id AND ups.user_id = $1
      ORDER BY p.id ASC
    `;
    
    const result = await pool.query(query, [userId || null]);
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch problems:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getProblemById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const query = `
      SELECT 
        p.*,
        c.name as category_name,
        COALESCE(ups.status, 'not_attempted') as status,
        COALESCE(ups.attempts, 0) as attempts
      FROM problems p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN user_problem_status ups ON p.id = ups.problem_id AND ups.user_id = $1
      WHERE p.id = $2
    `;

    const result = await pool.query(query, [userId || null, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Problem not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to fetch problem:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateProblemStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO user_problem_status (user_id, problem_id, status, attempts)
      VALUES ($1, $2, $3, 1)
      ON CONFLICT (user_id, problem_id) 
      DO UPDATE SET 
        status = $3,
        attempts = user_problem_status.attempts + 1,
        solved_at = CASE WHEN $3 = 'solved' THEN NOW() ELSE user_problem_status.solved_at END,
        last_attempted_at = NOW()
      RETURNING *
    `;

    const result = await pool.query(query, [userId, id, status]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Failed to update problem status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get total problems count by difficulty
    const totalProblemsQuery = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE difficulty = 'Easy') as total_easy,
        COUNT(*) FILTER (WHERE difficulty = 'Medium') as total_medium,
        COUNT(*) FILTER (WHERE difficulty = 'Hard') as total_hard
      FROM problems
    `);

    // Get user's solved problems
    const userStatsQuery = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'solved') as solved,
        COUNT(*) FILTER (WHERE p.difficulty = 'Easy' AND ups.status = 'solved') as easy_solved,
        COUNT(*) FILTER (WHERE p.difficulty = 'Medium' AND ups.status = 'solved') as medium_solved,
        COUNT(*) FILTER (WHERE p.difficulty = 'Hard' AND ups.status = 'solved') as hard_solved,
        SUM(attempts) as total_attempts
      FROM user_problem_status ups
      JOIN problems p ON p.id = ups.problem_id
      WHERE ups.user_id = $1
    `, [userId]);

    const totals = totalProblemsQuery.rows[0];
    const userStats = userStatsQuery.rows[0];

    const stats = {
      solved: parseInt(userStats.solved) || 0,
      total: parseInt(totals.total) || 0,
      totalAttempts: parseInt(userStats.total_attempts) || 0,
      easy: {
        solved: parseInt(userStats.easy_solved) || 0,
        total: parseInt(totals.total_easy) || 0
      },
      medium: {
        solved: parseInt(userStats.medium_solved) || 0,
        total: parseInt(totals.total_medium) || 0
      },
      hard: {
        solved: parseInt(userStats.hard_solved) || 0,
        total: parseInt(totals.total_hard) || 0
      }
    };

    res.json(stats);
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.runCode = async (req, res) => {
  try {
    const { code } = req.body;
    console.log('Running code for user:', req.user?.id);
    
    if (!code) {
      console.log('No code provided');
      return res.status(400).json({
        success: false,
        error: 'No code provided'
      });
    }

    // Get the first test case for this problem
    const testCaseQuery = 'SELECT * FROM test_cases WHERE problem_id = $1 LIMIT 1';
    const testCase = await pool.query(testCaseQuery, [req.params.id]);
    
    if (testCase.rows.length === 0) {
      console.log('No test cases found for problem:', req.params.id);
      return res.status(400).json({
        success: false,
        error: 'No test cases found for this problem'
      });
    }

    // Wrap the user's code with our implementation of my_malloc and my_free
    const wrappedCode = `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// User's code starts here
${code}
// User's code ends here
    `;

    console.log('Executing code with test case:', testCase.rows[0]);
    const result = await executeCode(wrappedCode, testCase.rows[0].input);
    console.log('Code execution result:', result);
    
    res.json({
      success: true,
      output: result.output,
      error: result.error,
      executionTime: result.executionTime,
      testCase: {
        input: testCase.rows[0].input,
        expectedOutput: testCase.rows[0].expected_output
      }
    });
  } catch (error) {
    console.error('Failed to run code:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to execute code'
    });
  }
};

exports.submitSolution = async (req, res) => {
  try {
    const { id } = req.params;
    const { code } = req.body;
    const userId = req.user.id;

    console.log('Submitting solution for problem:', id);
    console.log('User ID:', userId);

    if (!code) {
      console.log('No code provided');
      return res.status(400).json({
        success: false,
        error: 'No code provided'
      });
    }

    // Get test cases for the problem
    const testCasesQuery = 'SELECT * FROM test_cases WHERE problem_id = $1';
    const testCases = await pool.query(testCasesQuery, [id]);
    console.log('Found test cases:', testCases.rows.length);

    if (testCases.rows.length === 0) {
      console.log('No test cases found for problem:', id);
      return res.status(400).json({
        success: false,
        error: 'No test cases found for this problem'
      });
    }

    // Wrap the user's code with our implementation of my_malloc and my_free
    const wrappedCode = `
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Implementation of memory allocation functions
void* my_malloc(size_t size) {
    return malloc(size);
}

void my_free(void* ptr) {
    free(ptr);
}

// User's code starts here
${code}
// User's code ends here
    `;

    // Run code against each test case
    const results = [];
    let allPassed = true;

    for (const testCase of testCases.rows) {
      console.log('Running test case:', testCase.id);
      const result = await executeCode(wrappedCode, testCase.input);
      console.log('Test case result:', result);
      
      const passed = result.output?.trim() === testCase.expected_output.trim();
      console.log('Test case passed:', passed);
      
      if (!passed) allPassed = false;
      
      results.push({
        input: testCase.input,
        expectedOutput: testCase.expected_output,
        actualOutput: result.output,
        passed,
        error: result.error
      });
    }

    // Update problem status
    const status = allPassed ? 'solved' : 'attempted';
    console.log('Updating problem status to:', status);
    
    const updateQuery = `
      INSERT INTO user_problem_status (user_id, problem_id, status, attempts)
      VALUES ($1, $2, $3, 1)
      ON CONFLICT (user_id, problem_id) 
      DO UPDATE SET 
        status = $3,
        attempts = user_problem_status.attempts + 1,
        solved_at = CASE WHEN $3 = 'solved' THEN NOW() ELSE user_problem_status.solved_at END,
        last_attempted_at = NOW()
      WHERE user_problem_status.user_id = $1 AND user_problem_status.problem_id = $2
      RETURNING *
    `;
    
    const updateResult = await pool.query(updateQuery, [userId, id, status]);
    console.log('Status update result:', updateResult.rows[0]);

    res.json({
      success: true,
      passed: allPassed,
      results
    });
  } catch (error) {
    console.error('Failed to submit solution:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to submit solution'
    });
  }
};

exports.getHints = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT * FROM hints 
      WHERE problem_id = $1 
      ORDER BY sequence_number ASC
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch hints:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createHint = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, sequenceNumber } = req.body;
    
    const query = `
      INSERT INTO hints (problem_id, content, sequence_number)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [id, content, sequenceNumber]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to create hint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getDiscussions = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        d.*,
        u.username,
        COUNT(c.id) as comment_count
      FROM discussions d
      LEFT JOIN users u ON d.user_id = u.id
      LEFT JOIN comments c ON d.id = c.discussion_id
      WHERE d.problem_id = $1
      GROUP BY d.id, u.username
      ORDER BY d.created_at DESC
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch discussions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;
    
    const query = `
      INSERT INTO discussions (problem_id, user_id, title, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [id, userId, title, content]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to create discussion:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const query = `
      SELECT 
        c.*,
        u.username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.discussion_id = $1
      ORDER BY c.created_at ASC
    `;
    const result = await pool.query(query, [discussionId]);
    res.json(result.rows);
  } catch (error) {
    console.error("Failed to fetch comments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.createComment = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    
    const query = `
      INSERT INTO comments (discussion_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [discussionId, userId, content]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Failed to create comment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
