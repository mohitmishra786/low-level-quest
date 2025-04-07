const express = require('express');
const router = express.Router();
const { executeCodeEndpoint } = require('../controllers/codeExecutionController');

router.post('/execute', executeCodeEndpoint);

module.exports = router; 