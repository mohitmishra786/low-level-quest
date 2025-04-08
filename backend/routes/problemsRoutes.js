const express = require("express");
const router = express.Router();
const {
  getProblems,
  getProblemById,
} = require("../controllers/problemsController");

router.get("/problems", getProblems);
router.get("/problems/:id", getProblemById);

module.exports = router;
