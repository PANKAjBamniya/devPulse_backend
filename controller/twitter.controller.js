const axios = require("axios")
const crypto = require("crypto");

const twitterCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!req.session.codeVerifier) {
            return res.status(400).json({ error: "Missing code_verifier in session" });
        }

        const tokenRes = await axios.post(
            "https://api.twitter.com/2/oauth2/token",
            new URLSearchParams({
                code,
                grant_type: "authorization_code",
                client_id: process.env.TWITTER_CLIENT_ID,
                redirect_uri: process.env.TWITTER_REDIRECT_URI,
                code_verifier: req.session.codeVerifier,
            }),
            {
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
            }
        );

        const { access_token } = tokenRes.data;

        res.redirect("https://dev-pulse-frontend-flax.vercel.app/plateforms?twitter=connected");

    } catch (error) {
        console.error("Twitter Callback Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Twitter OAuth Failed" });
    }
};



const twitterLogin = async (req, res) => {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);

    req.session.codeVerifier = codeVerifier;


    const scope = "tweet.read tweet.write users.read offline.access";

    const authUrl =
        "https://twitter.com/i/oauth2/authorize" +
        "?response_type=code" +
        `&client_id=${process.env.TWITTER_CLIENT_ID}` +
        `&redirect_uri=${encodeURIComponent(process.env.TWITTER_REDIRECT_URI)}` +
        `&scope=${encodeURIComponent(scope)}` +
        "&state=twitter_state" +
        `&code_challenge=${codeChallenge}` +
        "&code_challenge_method=S256";


    res.json({ url: authUrl });
};





function generateCodeVerifier() {
    return crypto.randomBytes(32).toString("hex");
}

function generateCodeChallenge(verifier) {
    return crypto
        .createHash("sha256")
        .update(verifier)
        .digest("base64url");
}


module.exports = { twitterLogin, twitterCallback }