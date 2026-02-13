const mongoose = require("mongoose")

const ScheduleSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        socialAccount: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SocialAccount",
            required: true,
        },

        frequency: {
            type: String,
            enum: ["daily", "weekly", "alternate"],
            default: "daily",
        },

        days: [
            {
                type: String,
                enum: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
            },
        ],

        time: {
            type: String,
            required: true,
        },

        timezone: {
            type: String,
            default: "Asia/Kolkata",
        },

        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
            },
        ],

        description: {
            type: String,
            trim: true,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        lastRunAt: Date,

        nextRunAt: Date,
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model("Schedule", ScheduleSchema)
