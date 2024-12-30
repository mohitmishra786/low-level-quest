const express = require("express");
const router = express.Router();
const { getProblems } = require("../controllers/problemsController");

router.get("/problems", getProblems);

module.exports = router;
