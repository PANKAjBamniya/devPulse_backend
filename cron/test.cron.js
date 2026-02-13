const cron = require("node-cron");
const Schedule = require("../models/schedule.model");
const { runSchedule } = require("../controller/schedule.controller");

cron.schedule("*/1 * * * *", async () => {
    console.log(" Test Cron running (every 10 min)...");

    const schedules = await Schedule.find({
        isActive: true,
    }).limit(1);

    for (const schedule of schedules) {
        console.log(" Running TEST schedule:", schedule._id);
        await runSchedule(schedule);
    }
});
