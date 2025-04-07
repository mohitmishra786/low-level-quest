const express = require('express');
const router = express.Router();
const problemsController = require('../controllers/problemsController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', problemsController.getProblems);
router.get('/:id', problemsController.getProblemById);
router.get('/:id/hints', problemsController.getHints);
router.get('/:id/discussions', problemsController.getDiscussions);
router.get('/discussions/:discussionId/comments', problemsController.getComments);

// Protected routes
router.use(authMiddleware);
router.post('/:id/status', problemsController.updateProblemStatus);
router.post('/:id/run', problemsController.runCode);
router.post('/:id/submit', problemsController.submitSolution);
router.post('/:id/hints', problemsController.createHint);
router.post('/:id/discussions', problemsController.createDiscussion);
router.post('/discussions/:discussionId/comments', problemsController.createComment);

module.exports = router; 