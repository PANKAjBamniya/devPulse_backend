const express = require("express");
const router = express.Router();
const { twitterLogin, twitterCallback } = require("../controller/twitter.controller")

router.get("/", twitterLogin)
router.get("/callback", twitterCallback)


module.exports = router;
