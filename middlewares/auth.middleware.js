const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

exports.protect = async (req, res, next) => {
    try {
        let token

        // 1️⃣ Cookie based auth (frontend)
        if (req.cookies?.token) {
            token = req.cookies.token
        }

        // 2️⃣ Authorization header (Postman / mobile)
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

        const user = await User.findById(decoded.id)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found",
            })
        }

        req.user = user
        next()
    } catch (error) {
        next(error)
    }
}
