const express = require("express")

const router = express.Router()

const crypto = require("crypto")

router.get("/", (req, res) => {
    const clientId = process.env.TWITTER_CLIENT_ID;
    const redirectUri = process.env.TWITTER_REDIRECT_URI;

    const codeVerifier = crypto.randomBytes(32).toString("hex");

    const codeChallenge = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64url");


    req.session.codeVerifier = codeVerifier;

    const authUrl =
        "https://twitter.com/i/oauth2/authorize" +
        "?response_type=code" +
        "&client_id=" + clientId +
        "&redirect_uri=" + encodeURIComponent(redirectUri) +
        "&scope=" + encodeURIComponent("tweet.read users.read offline.access") +
        "&state=state123" +
        "&code_challenge=" + codeChallenge +
        "&code_challenge_method=S256";

    res.redirect(authUrl);
});



router.get("/callback",);


module.exports = router
