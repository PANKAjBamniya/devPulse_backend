const express = require("express");
const { facebookCallback } = require("../controller/facebook.controller");
const router = express.Router();


router.get("/callback", facebookCallback);

app.post("/facebook/data-deletion", (req, res) => {
    res.json({
        url: "https://yourdomain.com/deletion-confirmation",
        confirmation_code: "123456"
    });
});


module.exports = router;
