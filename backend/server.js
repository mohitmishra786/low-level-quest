const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const problemsRoutes = require("./routes/problemsRoutes");
const codeExecutionRoutes = require("./routes/codeExecutionRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api", problemsRoutes);
app.use("/api", codeExecutionRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
