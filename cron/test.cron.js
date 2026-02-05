const cron = require("node-cron");
const Schedule = require("../models/schedule.model");
const { runSchedule } = require("../controller/schedule.controller");

cron.schedule("*/30 * * * *", async () => {
    console.log(" Test Cron running (every 30 min)...");

    // Pick only test schedules
    const schedules = await Schedule.find({
        isActive: true,
    }).limit(1); // sirf 1 schedule test ke liye

    for (const schedule of schedules) {
        console.log(" Running TEST schedule:", schedule._id);
        await runSchedule(schedule);
    }
});
