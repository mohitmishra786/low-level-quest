const express = require('express');
const router = express.Router();
const ExecutionController = require('../controllers/ExecutionController');

// POST /api/execute - Execute code
router.post('/execute', ExecutionController.executeCode);

// GET /api/execute/:requestId - Get execution status
router.get('/execute/:requestId', ExecutionController.getExecutionStatus);

// DELETE /api/execute/:requestId - Cancel execution
router.delete('/execute/:requestId', ExecutionController.cancelExecution);

module.exports = router; 