const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes Mount Points
app.use("/auth", authRoutes); 
app.use("/tasks", taskRoutes); 

// Connect Database
connectDB();

// Serve frontend files
app.use(express.static(path.join(__dirname, "../frontend")));

// Load index.html by default
app.get("/*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
