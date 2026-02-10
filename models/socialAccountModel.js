const mongoose = require("mongoose");

const socialAccountSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        platform: {
            type: String,
            enum: ["linkedin", "twitter", "medium", "facebook", "instagram"],
            required: true,
        },

        platformUserId: {
            type: String,
            required: true,
        },

        username: String,
        displayName: String,
        profileImage: String,
        followerCount: Number,

        accessToken: {
            type: String,
            select: false,
        },

        refreshToken: {
            type: String,
            select: false,
        },

        tokenExpiry: Date,

        rawProfileData: {
            type: mongoose.Schema.Types.Mixed,
            select: false,
        },

        isConnected: {
            type: Boolean,
            default: true,
        },

        lastUsedAt: Date,
    },
    { timestamps: true }
);


module.exports =
    mongoose.models.SocialAccount ||
    mongoose.model("SocialAccount", socialAccountSchema);
