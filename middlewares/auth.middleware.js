const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

exports.protect = async (req, res, next) => {
    try {
        let token

        if (req.cookies?.token) {
            token = req.cookies.token
        }

        if (
            !token &&
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer")
        ) {
            token = req.headers.authorization.split(" ")[1]
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token missing",
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        // 🔥 FIX: Use decoded.userId instead of decoded.id
        const user = await User.findById(decoded.userId || decoded.id)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            })
        }

        req.user = user
        next()
    } catch (error) {
        console.error('❌ Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        })
    }
}