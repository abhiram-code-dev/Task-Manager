const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        
        // Check if URI is a placeholder or invalid
        if (!uri || uri.includes("<db_password>") || uri.includes("admin:12345")) {
            console.log("⚠️ No valid database credentials found. Starting Mock Database (In-Memory)...");
            return await connectMockDB();
        }

        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000 // Stop trying after 5 seconds to fallback faster
        });
        console.log("MongoDB Connected ✅");
    } catch (err) {
        console.error("❌ Could not connect to remote database. Falling back to Mock Database...");
        await connectMockDB();
    }
};

const connectMockDB = async () => {
    try {
        const mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
        console.log("Mock Database (In-Memory) Connected ✅");
        console.log("Note: Data will be cleared when the server restarts.");
    } catch (err) {
        console.error("❌ Critical Failure: Could not start even the mock database.", err);
        process.exit(1);
    }
};

module.exports = connectDB;
