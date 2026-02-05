const express = require("express")
const Post = require("../models/post.model")
const router = express.Router()

router.get("/", async (req, res) => {
    try {
        const posts = await Post.find()
            .populate("user", "name email")
            .populate("category", "name")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: posts.length,
            data: posts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch posts",
            error: error.message,
        });
    }
})


module.exports = router
