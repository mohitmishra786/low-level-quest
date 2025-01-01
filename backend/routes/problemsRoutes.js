const express = require("express");
const router = express.Router();
const {
  getProblems,
  getProblemById,
  submitSolution,
  getSubmissions,
} = require("../controllers/problemsController");
const auth = require("../middleware/auth");

router.get("/problems", getProblems);
router.get("/problems/:id", getProblemById);
router.post("/problems/:problemId/submit", auth, submitSolution);
router.get("/problems/:problemId/submissions", auth, getSubmissions);

module.exports = router;
