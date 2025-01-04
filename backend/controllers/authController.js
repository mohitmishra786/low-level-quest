const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.signup = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("Signup request received for username:", username);
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const user = await User.create(username, password);
    console.log("User created:", user);
    res.status(201).json({ message: "Signup successful", user });
  } catch (error) {
    console.error("Signup failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    console.log("Login attempt for username:", username);
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ message: "Login successful", token });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
