const express = require("express");
const { linkedInCallback, getUser, logout } = require("../controller/Auth.controller");

const router = express.Router();

router.get("/callback", linkedInCallback);
router.get("/get-user", getUser);
router.post("/logout", logout);


module.exports = router;
