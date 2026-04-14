const router = require("express").Router();
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

// Apply the auth middleware to ALL routes in this file
router.use(authMiddleware);

// GET DASHBOARD STATS
router.get("/stats", async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id });
        const stats = {
            total: tasks.length,
            pending: tasks.filter(t => t.status === "pending").length,
            inProgress: tasks.filter(t => t.status === "in-progress").length,
            completed: tasks.filter(t => t.status === "completed").length
        };
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Error fetching stats" });
    }
});

// CREATE A TASK
router.post("/add", async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body;
        const task = new Task({
            title,
            description,
            status: status || "pending",
            priority: priority || "medium",
            dueDate: dueDate ? new Date(dueDate) : undefined,
            userId: req.user.id,
            history: [{ action: "Task created." }]
        });
        
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: "Error creating task" });
    }
});

// GET ALL TASKS (With Filters and Search)
router.get("/", async (req, res) => {
    try {
        const { search, status, priority, dueDate } = req.query;
        
        // Base query binds to the specific user securely
        let query = { userId: req.user.id };

        // Append filters dynamically if they exist in the url
        if (search) query.title = { $regex: search, $options: "i" }; // Case-insensitive search
        if (status) query.status = status;
        if (priority) query.priority = priority;
        
        if (dueDate) {
            // Compare Date exactly, or filter dynamically depending on logic
            // For a basic filter, we ensure it matches the day (simplistic)
            const target = new Date(dueDate);
            target.setHours(0,0,0,0);
            const nextDay = new Date(target);
            nextDay.setDate(target.getDate() + 1);
            query.dueDate = { $gte: target, $lt: nextDay };
        }

        const tasks = await Task.find(query).sort({ createdAt: -1 }); // Newest first
        res.json(tasks);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Error fetching tasks" });
    }
});

// UPDATE A TASK
router.put("/:id", async (req, res) => {
    try {
        const originalTask = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!originalTask) return res.status(404).json({ message: "Task not found" });

        // Generate history log dynamically if certain things changed
        let changeAction = "Task details updated.";
        if (req.body.status && req.body.status !== originalTask.status) {
            changeAction = `Status changed from ${originalTask.status} to ${req.body.status}.`;
        } else if (req.body.priority && req.body.priority !== originalTask.priority) {
            changeAction = `Priority changed from ${originalTask.priority} to ${req.body.priority}.`;
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { 
                ...req.body,
                $push: { history: { action: changeAction } } 
            },
            { new: true } // Returns the updated document
        );
        
        res.json(task);
    } catch (err) {
        res.status(500).json({ message: "Error updating task" });
    }
});

// DELETE A TASK
router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json({ message: "Task deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Error deleting task" });
    }
});

module.exports = router;