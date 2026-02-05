const cron = require("node-cron");
const moment = require("moment-timezone");
const Schedule = require("../models/schedule.model");
const { runSchedule } = require("../controller/schedule.controller");


cron.schedule("* * * * *", async () => {
    console.log(" Main Cron running...");

    const schedules = await Schedule.find({ isActive: true });

    for (const schedule of schedules) {
        const now = moment().tz(schedule.timezone);

        // Convert schedule time to 24h
        let hour = parseInt(schedule.time.hour);
        const minute = parseInt(schedule.time.minute);

        if (schedule.time.period === "PM" && hour !== 12) hour += 12;
        if (schedule.time.period === "AM" && hour === 12) hour = 0;

        const isSameTime =
            now.hour() === hour && now.minute() === minute;

        if (!isSameTime) continue;

        // Avoid duplicate run (same day)
        if (schedule.lastRunAt) {
            const lastRun = moment(schedule.lastRunAt).tz(schedule.timezone);
            if (lastRun.isSame(now, "day")) continue;
        }

        // Alternate day logic
        if (schedule.frequency === "Alternate" && schedule.lastRunAt) {
            const diff = now.diff(moment(schedule.lastRunAt), "days");
            if (diff < 2) continue;
        }

        console.log("🚀 Running MAIN schedule:", schedule._id);
        await runSchedule(schedule);
    }
});
