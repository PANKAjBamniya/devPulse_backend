const express = require("express");
const { register, login, getMe } = require("../controller/Auth.controller");
const { protect } = require("../middlewares/auth.middleware");

const router = express.Router();

// login And regiser Routes
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe)


module.exports = router;