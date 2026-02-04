const express = require("express");
const { linkedInCallback, getUser } = require("../controller/Auth.controller");

const router = express.Router();

router.get("/callback", linkedInCallback);
router.get("/get-user", getUser);

module.exports = router;
