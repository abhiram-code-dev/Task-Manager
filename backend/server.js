require("dotenv").config();
const express = require("express");
const cors = require("cors");
app.use(cors());
const connectDB = require("./config/db");
const path = require("path");


const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes Mount Points
app.use("/auth", authRoutes); // Auth base path modified to /auth to match existing frontend expectations
app.use("/tasks", taskRoutes); // Tasks base path

// Connect Database
connectDB();
// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Load index.html by default
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
