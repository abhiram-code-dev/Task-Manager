const jwt = require("jsonwebtoken");

// Middleware to protect routes, ensuring only logged-in users can access them
module.exports = function(req, res, next) {
    // Get the token from the request header 
    const token = req.header("Authorization");

    // If there's no token, the user isn't logged in
    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        // Tokens are usually sent as "Bearer <token_string>", we extract just the token
        const tokenString = token.startsWith("Bearer ") ? token.slice(7) : token;
        
        // Verify the token matches our secret key
        const verified = jwt.verify(tokenString, process.env.JWT_SECRET);
        
        // Attach the user's decoded information (like userId) to the request object
        req.user = verified;
        
        // Proceed to the actual route handler
        next(); 
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};
