const express = require("express");
const router = express.Router();
const { login, signup } = require("../controllers/authController");
const { body } = require("express-validator");

router.post("/signup", [
    body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], signup);


router.post("/login", login);

module.exports = router;
