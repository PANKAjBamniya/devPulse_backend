const express = require("express");
const { connectLinkedIn } = require("../controller/linkedinAuth.controller");
const { protect } = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/callback", connectLinkedIn);



module.exports = router;
