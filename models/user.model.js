const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        phone: {
            type: String,
        },
        avatar: {
            type: String,
        },
    },
    { timestamps: true }
);

const User = mongoose.model("User", UserSchema, "users");

module.exports = User;
