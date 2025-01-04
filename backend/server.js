const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const problemsRoutes = require("./routes/problemsRoutes");
const { signup } = require("./controllers/authController");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.post("/api/auth/signup", signup);
app.use("/api", problemsRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
