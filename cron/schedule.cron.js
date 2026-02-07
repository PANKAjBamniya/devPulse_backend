const cron = require("node-cron");
const moment = require("moment-timezone");
const Schedule = require("../models/schedule.model");
const { runSchedule } = require("../controller/schedule.controller");


cron.schedule("* * * * *", async () => {
    console.log(" Main Cron running...");

    const schedules = await Schedule.find({ isActive: true });

    for (const schedule of schedules) {
        const now = moment().tz(schedule.timezone);

        let hour = parseInt(schedule.time.hour);
        const minute = parseInt(schedule.time.minute);

        if (schedule.time.period === "PM" && hour !== 12) hour += 12;
        if (schedule.time.period === "AM" && hour === 12) hour = 0;

        const scheduledMoment = moment()
            .tz(schedule.timezone)
            .hour(hour)
            .minute(minute)
            .second(0);

        const diffMinutes = Math.abs(now.diff(scheduledMoment, "minutes"));
        if (diffMinutes > 1) continue;

        if (schedule.lastRunAt) {
            const lastRun = moment(schedule.lastRunAt).tz(schedule.timezone);
            if (lastRun.isSame(now, "day")) {
                console.log("⏭️ Skipped (already ran today)");
                continue;
            }
        }

        // 🔁 Alternate day logic
        if (schedule.frequency === "Alternate" && schedule.lastRunAt) {
            const diffDays = now.diff(
                moment(schedule.lastRunAt).tz(schedule.timezone),
                "days"
            );
            if (diffDays < 2) continue;
        }

        console.log("🚀 Running MAIN schedule:", schedule._id);
        await runSchedule(schedule);
    }
});

