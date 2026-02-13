const express = require("express")

const router = express.Router()

router.get("/", async (req, res) => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    req.session.codeVerifier = codeVerifier;

    const authUrl =
        "https://twitter.com/i/oauth2/authorize" +
        "?response_type=code" +
        `&client_id=${process.env.TWITTER_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.TWITTER_REDIRECT_URI)}` +
        "&scope=tweet.read%20tweet.write%20users.read%20offline.access" +
        "&state=twitter_state" +
        `&code_challenge=${codeChallenge}` +
        "&code_challenge_method=S256";

    res.json({ url: authUrl });
});


router.get("/callback",);


module.exports = router
