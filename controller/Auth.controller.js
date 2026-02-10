const expressAsyncHandler = require("express-async-handler");
const User = require("../models/user.model");
const SocialAccount = require("../models/socialAccountModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// REGISTER
const register = expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all details");
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
        res.status(400);
        throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        authProvider: "email",
    });

    const payload = await buildUserPayload(user._id);

    res.status(201).json({
        success: true,
        ...payload,
        token: generateToken(user._id),
    });
});


// LOGIN
const login = expressAsyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide email and password");
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    // 🔥 build payload (same as register)
    const payload = await buildUserPayload(user._id);

    res.status(200).json({
        success: true,
        message: "Login successful",
        ...payload,
        token: generateToken(user._id),
    });
});



const getMe = async (req, res) => {
    try {
        // req.user middleware se aa raha hai (User document)
        const user = req.user;
        // 🔥 Social accounts alag collection se lao
        const socialAccounts = await SocialAccount.find(
            { userId: user._id, isConnected: true },
            "platform displayName profileImage followerCount"
        );

        return res.status(200).json({
            success: true,
            user,
            socialAccounts,
            connectedPlatforms: socialAccounts.map((a) => a.platform),
            connectedCount: socialAccounts.length,
        });
    } catch (error) {
        console.error("❌ getMe error:", error.message);
        res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};





// JWT
const generateToken = (id) => {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};


const buildUserPayload = async (userId) => {
    const user = await User.findById(userId)
        .select("-password")
        .lean();

    const socialAccounts = await SocialAccount.find(
        { userId, isConnected: true },
        "platform displayName profileImage followerCount"
    );

    return {
        user,
        socialAccounts,
        connectedPlatforms: socialAccounts.map(a => a.platform),
        connectedCount: socialAccounts.length,
    };
};



module.exports = { register, login, getMe };
