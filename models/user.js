const mongoose = require("mongoose");

// The User schema defines what information is stored for each user
const UserSchema = new mongoose.Schema({
    // Username must be provided and must be unique in the database
    username: { type: String, required: true, unique: true },
    // Password will be hashed securely before saving
    password: { type: String, required: true }
}, { timestamps: true }); // Automatically record when the user was created

module.exports = mongoose.model("User", UserSchema);