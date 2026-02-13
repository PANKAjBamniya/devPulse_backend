const Schedule = require("../models/schedule.model");
const Post = require("../models/post.model");
const { generateLinkedInPost } = require("../utils/gemini");
const { postToLinkedIn } = require("../utils/linkedin");
const User = require("../models/user.model")
const SocialAccount = require("../models/socialAccountModel")


const createSchedule = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const {
            socialAccount,
            time,          // "09:15"
            frequency,
            days,
            timezone,
            categories,
            description,
        } = req.body;

        if (!time || !categories?.length || !socialAccount) {
            return res.status(400).json({
                success: false,
                message: "Time, social account and at least one category required",
            });
        }

        const existing = await Schedule.findOne({
            user: userId,
            socialAccount,
        });

        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Schedule already exists for this platform",
            });
        }

        const schedule = await Schedule.create({
            user: userId,
            socialAccount,
            time,
            frequency,
            days,
            timezone,
            categories,
            description,
        });

        res.status(201).json({
            success: true,
            message: "Schedule created",
            data: schedule,
        });

    } catch (error) {
        next(error);
    }
};


const updateSchedule = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { socialAccount } = req.body;

        const schedule = await Schedule.findOne({
            user: userId,
            socialAccount,
        });

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found",
            });
        }

        Object.assign(schedule, req.body);

        await schedule.save();

        res.status(200).json({
            success: true,
            message: "Schedule updated",
            data: schedule,
        });

    } catch (error) {
        next(error);
    }
};




const getMySchedule = async (req, res, next) => {
    try {
        const id = req.params.socialAccountId;

        const schedule = await Schedule.findOne({
            _id: id,
            user: req.user._id
        })
            .populate("socialAccount");


        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found",
            });
        }

        res.status(200).json({
            success: true,
            data: schedule,
        });

    } catch (error) {
        next(error);
    }
};


const getMyAllSchedules = async (req, res, next) => {
    try {
        const schedules = await Schedule.find({
            user: req.user._id,
        })
            .populate("categories", "name")
            .populate("socialAccount");

        res.status(200).json({
            success: true,
            data: schedules,
        });

    } catch (error) {
        next(error);
    }
};


const toggleSchedule = async (req, res, next) => {
    try {
        const schedule = await Schedule.findOne({ user: req.user._id })

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found",
            })
        }

        schedule.isActive = !schedule.isActive
        await schedule.save()

        res.status(200).json({
            success: true,
            message: `Schedule ${schedule.isActive ? "enabled" : "disabled"}`,
            isActive: schedule.isActive,
        })
    } catch (error) {
        next(error)
    }
}


// RunSchedule 
const runSchedule = async (schedule) => {
    let post;

    try {
        const socialAccount = await SocialAccount
            .findById(schedule.socialAccount)
            .select("+accessToken");

        if (!socialAccount || !socialAccount.isConnected) {
            console.log("❌ Social account not connected");
            return;
        }

        if (!socialAccount.accessToken) {
            throw new Error("Access token missing");
        }

        const categoryName = schedule.categories?.[0]?.name;

        const prompt = `
            You are generating a DAILY scheduled LinkedIn post.

            Context:
            This post is part of an automated posting system.

            Category: ${categoryName}
            Description: ${schedule.description}

            Rules:
            - Write ONLY ONE practical daily tip strictly related to the category
            - Keep it under 120 words
            - Include 1 actionable best practice
            - Use a friendly but professional tone
            - End with 2–3 relevant hashtags
            - Do NOT mention announcements, series, or scheduling
        `;

        const content = await generateLinkedInPost(prompt);

        if (!content?.trim()) {
            throw new Error("AI returned empty content");
        }

        post = await Post.create({
            user: schedule.user,
            category: schedule.categories[0],
            content,
            status: "generated",
            scheduledAt: new Date(),
        });

        await postToLinkedIn({
            text: content,
            accessToken: socialAccount.accessToken,
            authorUrn: `urn:li:person:${socialAccount.platformUserId}`
        });

        post.status = "posted";
        post.postedAt = new Date();
        await post.save();

        schedule.lastRunAt = new Date();
        await schedule.save();

        console.log("✅ LinkedIn post published");

    } catch (error) {
        console.error("❌ Post failed:", error.message);

        if (post) {
            post.status = "failed";
            post.errorMessage = error.message;
            await post.save();
        }
    }
};


module.exports = { createSchedule, getMySchedule, toggleSchedule, updateSchedule, runSchedule, getMyAllSchedules }