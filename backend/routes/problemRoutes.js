const express = require("express");
const router = express.Router();
const problemsController = require("../controllers/problemsController");
const authMiddleware = require("../middleware/auth");

// Debug route
router.get("/debug/auth", (req, res) => {
  const authHeader = req.header("Authorization");
  res.json({
    authHeader: authHeader ? `${authHeader.substr(0, 15)}...` : "none",
    env: {
      jwtSecret: process.env.JWT_SECRET
        ? "Set (length: " + process.env.JWT_SECRET.length + ")"
        : "Not set",
    },
  });
});

// Apply auth middleware to these routes
router.get("/user/stats", authMiddleware, problemsController.getUserStats);
router.get("/", authMiddleware, problemsController.getProblems);
router.get("/:id", authMiddleware, problemsController.getProblemById);

// These can remain public if needed
router.get("/:id/hints", problemsController.getHints);
router.get("/:id/discussions", problemsController.getDiscussions);
router.get("/discussions/:discussionId/comments", problemsController.getComments);

// Protected routes
router.post("/:id/status", authMiddleware, problemsController.updateProblemStatus);
router.post("/:id/run", authMiddleware, problemsController.runCode);
router.post("/:id/submit", authMiddleware, problemsController.submitSolution);
router.post("/:id/hints", authMiddleware, problemsController.createHint);
router.post("/:id/discussions", authMiddleware, problemsController.createDiscussion);
router.post("/discussions/:discussionId/comments", authMiddleware, problemsController.createComment);

module.exports = router;