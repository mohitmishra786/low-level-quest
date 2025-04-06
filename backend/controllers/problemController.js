// backend/controllers/problemController.js
const pool = require('../db');

// Problem CRUD operations
const getAllProblems = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM problems ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching problems' });
    }
};

const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM problems WHERE id = $1', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching problem' });
    }
};

const createProblem = async (req, res) => {
    try {
        const { title, description, difficulty, initial_code } = req.body;
        const result = await pool.query(
            'INSERT INTO problems (title, description, difficulty, initial_code) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, description, difficulty, initial_code]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error creating problem' });
    }
};

const updateProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, difficulty, initial_code } = req.body;
        const result = await pool.query(
            'UPDATE problems SET title = $1, description = $2, difficulty = $3, initial_code = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [title, description, difficulty, initial_code, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error updating problem' });
    }
};

const deleteProblem = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM problems WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Problem not found' });
        }
        
        res.json({ message: 'Problem deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting problem' });
    }
};

// Hints operations
const getHints = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching hints from database for problem:', id);
        
        const result = await pool.query(
            'SELECT * FROM hints WHERE problem_id = $1 ORDER BY order_index',
            [id]
        );
        
        console.log('Found hints:', result.rows.length);
        res.json(result.rows);
    } catch (err) {
        console.error('Error in getHints:', err);
        res.status(500).json({ error: 'Error fetching hints' });
    }
};

const createHint = async (req, res) => {
    try {
        const { id } = req.params;
        const { content, order_index } = req.body;
        const result = await pool.query(
            'INSERT INTO hints (problem_id, content, order_index) VALUES ($1, $2, $3) RETURNING *',
            [id, content, order_index]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error creating hint' });
    }
};

const updateHint = async (req, res) => {
    try {
        const { id, hintId } = req.params;
        const { content, order_index } = req.body;
        const result = await pool.query(
            'UPDATE hints SET content = $1, order_index = $2 WHERE id = $3 AND problem_id = $4 RETURNING *',
            [content, order_index, hintId, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Hint not found' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error updating hint' });
    }
};

const deleteHint = async (req, res) => {
    try {
        const { id, hintId } = req.params;
        const result = await pool.query(
            'DELETE FROM hints WHERE id = $1 AND problem_id = $2 RETURNING *',
            [hintId, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Hint not found' });
        }
        
        res.json({ message: 'Hint deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting hint' });
    }
};

// Discussion operations
const getDiscussions = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('Fetching discussions from database for problem:', id);
        
        const result = await pool.query(
            `SELECT d.*, u.username as user_username,
                    (SELECT json_agg(
                        json_build_object(
                            'id', c.id,
                            'content', c.content,
                            'user_id', c.user_id,
                            'user_username', u2.username,
                            'created_at', c.created_at,
                            'updated_at', c.updated_at
                        )
                    )
                    FROM comments c
                    JOIN users u2 ON c.user_id = u2.id
                    WHERE c.discussion_id = d.id) as comments
             FROM discussions d
             JOIN users u ON d.user_id = u.id
             WHERE d.problem_id = $1
             ORDER BY d.created_at DESC`,
            [id]
        );
        
        console.log('Found discussions:', result.rows.length);
        res.json(result.rows);
    } catch (err) {
        console.error('Error in getDiscussions:', err);
        res.status(500).json({ error: 'Error fetching discussions' });
    }
};

const createDiscussion = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id;
        
        console.log('Creating new discussion:', { problemId: id, userId, title });
        
        const result = await pool.query(
            'INSERT INTO discussions (problem_id, user_id, title, content) VALUES ($1, $2, $3, $4) RETURNING *',
            [id, userId, title, content]
        );
        
        // Fetch the created discussion with user info and comments
        const discussion = await pool.query(
            `SELECT d.*, u.username as user_username,
                    (SELECT json_agg(
                        json_build_object(
                            'id', c.id,
                            'content', c.content,
                            'user_id', c.user_id,
                            'user_username', u2.username,
                            'created_at', c.created_at,
                            'updated_at', c.updated_at
                        )
                    )
                    FROM comments c
                    JOIN users u2 ON c.user_id = u2.id
                    WHERE c.discussion_id = d.id) as comments
             FROM discussions d
             JOIN users u ON d.user_id = u.id
             WHERE d.id = $1`,
            [result.rows[0].id]
        );
        
        console.log('Discussion created successfully');
        res.status(201).json(discussion.rows[0]);
    } catch (err) {
        console.error('Error in createDiscussion:', err);
        res.status(500).json({ error: 'Error creating discussion' });
    }
};

const updateDiscussion = async (req, res) => {
    try {
        const { id, discussionId } = req.params;
        const { title, content } = req.body;
        const userId = req.user.id;
        
        const result = await pool.query(
            'UPDATE discussions SET title = $1, content = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND problem_id = $4 AND user_id = $5 RETURNING *',
            [title, content, discussionId, id, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Discussion not found or unauthorized' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error updating discussion' });
    }
};

const deleteDiscussion = async (req, res) => {
    try {
        const { id, discussionId } = req.params;
        const userId = req.user.id;
        
        const result = await pool.query(
            'DELETE FROM discussions WHERE id = $1 AND problem_id = $2 AND user_id = $3 RETURNING *',
            [discussionId, id, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Discussion not found or unauthorized' });
        }
        
        res.json({ message: 'Discussion deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting discussion' });
    }
};

// Comment operations
const getComments = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const result = await pool.query(
            `SELECT c.*, u.username as user_username
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.discussion_id = $1
             ORDER BY c.created_at ASC`,
            [discussionId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Error fetching comments' });
    }
};

const createComment = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        
        console.log('Creating new comment:', { discussionId, userId });
        
        const result = await pool.query(
            'INSERT INTO comments (discussion_id, user_id, content) VALUES ($1, $2, $3) RETURNING *',
            [discussionId, userId, content]
        );
        
        // Fetch the created comment with user info
        const comment = await pool.query(
            `SELECT c.*, u.username as user_username
             FROM comments c
             JOIN users u ON c.user_id = u.id
             WHERE c.id = $1`,
            [result.rows[0].id]
        );
        
        console.log('Comment created successfully');
        res.status(201).json(comment.rows[0]);
    } catch (err) {
        console.error('Error in createComment:', err);
        res.status(500).json({ error: 'Error creating comment' });
    }
};

const updateComment = async (req, res) => {
    try {
        const { discussionId, commentId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;
        
        const result = await pool.query(
            'UPDATE comments SET content = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND discussion_id = $3 AND user_id = $4 RETURNING *',
            [content, commentId, discussionId, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found or unauthorized' });
        }
        
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error updating comment' });
    }
};

const deleteComment = async (req, res) => {
    try {
        const { discussionId, commentId } = req.params;
        const userId = req.user.id;
        
        const result = await pool.query(
            'DELETE FROM comments WHERE id = $1 AND discussion_id = $2 AND user_id = $3 RETURNING *',
            [commentId, discussionId, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Comment not found or unauthorized' });
        }
        
        res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error deleting comment' });
    }
};

module.exports = {
    getAllProblems,
    getProblemById,
    createProblem,
    updateProblem,
    deleteProblem,
    getHints,
    createHint,
    updateHint,
    deleteHint,
    getDiscussions,
    createDiscussion,
    updateDiscussion,
    deleteDiscussion,
    getComments,
    createComment,
    updateComment,
    deleteComment
};