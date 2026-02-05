const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },

        content: {
            type: String,
            required: true,
            trim: true,
        },

        status: {
            type: String,
            enum: ["pending", "generated", "posted", "failed"],
            default: "pending",
        },

        scheduledAt: {
            type: Date,
            required: true,
        },

        postedAt: {
            type: Date,
        },

        errorMessage: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
);

module.exports = mongoose.model("Post", PostSchema);
