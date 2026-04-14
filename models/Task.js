const mongoose = require("mongoose");

// The Task schema definition
const TaskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    
    // Status can be pending, in-progress, or completed
    status: { type: String, enum: ["pending", "in-progress", "completed"], default: "pending" },
    
    // Priority level of the task
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    
    // Optional due date
    dueDate: { type: Date },

    // The history loop to keep track of changes
    history: [{
        action: { type: String },
        date: { type: Date, default: Date.now }
    }],
    
    // Direct link to the user
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Task", TaskSchema);