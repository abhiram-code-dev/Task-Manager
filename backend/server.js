require("dotenv").config();
const express = require("express");
const cors = require("cors");
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

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on https://Task-Manager-backend.onrender.com`);
});
