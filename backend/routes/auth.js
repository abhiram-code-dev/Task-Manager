const router = require("express").Router();
const User = require("../models/user"); // Updated to match exact file name matching case
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// SIGNUP ROUTE: Register a new user
router.post("/signup", async (req, res) => {
    try {
        // 1. Check if user already exists
        const userExists = await User.findOne({ username: req.body.username });
        if (userExists) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // 2. Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // 3. Create and save the new user
        const newUser = new User({
            username: req.body.username,
            password: hashedPassword
        });
        const savedUser = await newUser.save();

        // 4. Generate a JWT token for auto-login after signup
        const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        
        res.json({ message: "Account created successfully", token });
    } catch (error) {
        res.status(500).json({ message: "Server error during signup" });
    }
});

// LOGIN ROUTE: Authenticate existing user
router.post("/login", async (req, res) => {
    try {
        // 1. Find the user in the database
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).json({ message: "User not found" });

        // 2. Check if password matches the hashed password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Invalid password" });

        // 3. Generate a JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

        // 4. Send the token back
        res.json({ message: "Login success", token });
    } catch (error) {
        res.status(500).json({ message: "Server error during login" });
    }
});

module.exports = router;