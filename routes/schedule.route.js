const express = require("express")
const { protect } = require("../middlewares/auth.middleware")
const { createSchedule, updateSchedule, getMySchedule, toggleSchedule } = require("../controller/schedule.controller")
const router = express.Router()


router.post("/", protect, createSchedule)
router.put("/", protect, updateSchedule)
router.get("/me", protect, getMySchedule)
router.patch("/toggle", protect, toggleSchedule)



module.exports = router
