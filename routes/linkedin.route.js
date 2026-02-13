const express = require("express");
const { connectLinkedIn } = require("../controller/linkedinAuth.controller");
const router = express.Router();

router.get("/callback", connectLinkedIn);


module.exports = router;
