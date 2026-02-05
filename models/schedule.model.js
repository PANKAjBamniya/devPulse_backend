const mongoose = require("mongoose")

const ScheduleSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        time: {
            hour: {
                type: String, // "09"
                required: true,
            },
            minute: {
                type: String, // "15"
                required: true,
            },
            period: {
                type: String, // "AM" | "PM"
                enum: ["AM", "PM"],
                required: true,
            },
        },

        frequency: {
            type: String,
            enum: ["Daily", "Alternate"],
            default: "Daily",
        },

        timezone: {
            type: String,
            default: "Asia/Kolkata",
        },

        categories: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Category",
                required: true,
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

        lastRunAt: {
            type: Date,
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    }
)

module.exports = mongoose.model("Schedule", ScheduleSchema)
