require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve static frontend files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Routes Mount Points
app.use("/auth", authRoutes); // Auth base path modified to /auth to match existing frontend expectations
app.use("/tasks", taskRoutes); // Tasks base path

// MongoDB Connection Setup
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.log("Database connection error:", err));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});