const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
    {
        name: String,
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: String,
        avatar: String,
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

userSchema.virtual("socialAccounts", {
    ref: "SocialAccount",
    localField: "_id",
    foreignField: "userId",
});

module.exports = mongoose.model("User", userSchema);
