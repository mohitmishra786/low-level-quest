const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const problemRoutes = require("./routes/problemRoutes");
const authRoutes = require("./routes/authRoutes");
const codeExecutionRoutes = require("./routes/codeExecutionRoutes");

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);

  // Debug auth header
  const authHeader = req.header("Authorization");
  if (authHeader) {
    console.log(`Auth header: ${authHeader.substr(0, 15)}...`);
  } else {
    console.log("No Authorization header found");
  }

  next();
});

// Routes
app.use("/api/problems", problemRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/execute", codeExecutionRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Something went wrong!",
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
