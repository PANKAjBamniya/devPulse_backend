const Schedule = require("../models/schedule.model");
const Post = require("../models/post.model");
const { generateLinkedInPost } = require("../utils/gemini");
const { postToLinkedIn } = require("../utils/linkedin");
const User = require("../models/user.model")


const createSchedule = async (req, res, next) => {
    try {
        const userId = req.user._id
        const { time, frequency, timezone, categories, description } = req.body

        // validation
        if (
            !time ||
            !time.hour ||
            !time.minute ||
            !time.period ||
            !categories ||
            categories.length === 0
        ) {
            return res.status(400).json({
                success: false,
                message: "Time and at least one category are required",
            })
        }

        // prevent duplicate schedule
        const existing = await Schedule.findOne({ user: userId })
        if (existing) {
            return res.status(409).json({
                success: false,
                message: "Schedule already exists. Use update instead.",
            })
        }

        const schedule = await Schedule.create({
            user: userId,
            time,
            frequency,
            timezone,
            categories,
            description,
        })

        res.status(201).json({
            success: true,
            message: "Schedule created successfully",
            data: schedule,
        })
    } catch (error) {
        next(error)
    }
}


const updateSchedule = async (req, res, next) => {
    try {
        const userId = req.user._id
        const { time, frequency, timezone, categories, description, isActive } =
            req.body

        const schedule = await Schedule.findOne({ user: userId })

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found",
            })
        }

        if (time) schedule.time = time
        if (frequency) schedule.frequency = frequency
        if (timezone) schedule.timezone = timezone
        if (categories && categories.length > 0)
            schedule.categories = categories
        if (description !== undefined) schedule.description = description
        if (typeof isActive === "boolean") schedule.isActive = isActive

        await schedule.save()

        res.status(200).json({
            success: true,
            message: "Schedule updated successfully",
            data: schedule,
        })
    } catch (error) {
        next(error)
    }
}



const getMySchedule = async (req, res, next) => {
    try {
        const schedule = await Schedule.findOne({ user: req.user._id })
            .populate("categories", "name")

        if (!schedule) {
            return res.status(404).json({
                success: false,
                message: "Schedule not found",
            })
        }

        res.status(200).json({
            success: true,
            data: schedule,
        })
    } catch (error) {
        next(error)
    }
}

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
        console.log('🔍 Running schedule for user:', schedule.user);

        const user = await User.findById(schedule.user);

        // 🔥 DEBUG: Log the entire user object
        console.log('👤 User found:', !!user);
        console.log('📱 User LinkedIn object:', user?.linkedin);
        console.log('🔑 Has accessToken:', !!user?.linkedin?.accessToken);
        console.log('🎯 Has authorUrn:', !!user?.linkedin?.authorUrn);

        if (!user) {
            throw new Error("User not found");
        }

        if (!user.linkedin) {
            throw new Error("LinkedIn not connected for this user");
        }

        if (!user.linkedin.accessToken) {
            throw new Error("LinkedIn access token missing");
        }

        if (!user.linkedin.authorUrn) {
            throw new Error("LinkedIn authorUrn missing");
        }

        const { accessToken, expiresAt, authorUrn } = user.linkedin;

        console.log('✅ LinkedIn data retrieved:', {
            hasToken: !!accessToken,
            hasUrn: !!authorUrn,
            expiresAt,
            isExpired: Date.now() > new Date(expiresAt).getTime()
        });

        if (Date.now() > new Date(expiresAt).getTime()) {
            throw new Error("LinkedIn token expired – reconnect required");
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

        if (!content || !content.trim()) {
            throw new Error("GeminiAI returned empty content");
        }

        post = await Post.create({
            user: schedule.user,
            category: schedule.categories[0],
            content,
            status: "generated",
            scheduledAt: new Date(),
        });

        console.log("📤 Posting to LinkedIn...");
        console.log("Author URN:", authorUrn);

        await postToLinkedIn({
            text: content,
            accessToken,
            authorUrn,
        });

        post.status = "posted";
        post.postedAt = new Date();
        await post.save();

        schedule.lastRunAt = new Date();
        await schedule.save();

        console.log("✅ LinkedIn post published:", post._id);

    } catch (error) {
        console.error("❌ Post failed:", error.message);

        if (post) {
            post.status = "failed";
            post.errorMessage = error.message;
            await post.save();
        }
    }
};

module.exports = { createSchedule, getMySchedule, toggleSchedule, updateSchedule, runSchedule }