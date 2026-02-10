const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

exports.protect = async (req, res, next) => {
    try {
        let token;

        // 1️⃣ Cookie based auth
        if (req.cookies?.token) {
            token = req.cookies.token;
        }

        // 2️⃣ Header based auth (Bearer)
        if (
            !token &&
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }

        // 3️⃣ No token
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // 4️⃣ Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5️⃣ Fetch user
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
            });
        }

        // 6️⃣ Attach user
        req.user = user;
        next();
    } catch (error) {
        console.error("❌ Auth middleware error:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
