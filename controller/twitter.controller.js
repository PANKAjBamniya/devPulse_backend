const axios = require("axios")
const crypto = require("crypto");

const twitterCallback = async (req, res) => {
    const { code } = req.query;

    console.log("TWITTER_CLIENT_ID:", process.env.TWITTER_CLIENT_ID);
    console.log("TWITTER_REDIRECT_URI:", process.env.TWITTER_REDIRECT_URI);

    console.log(code)

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

    const { access_token, refresh_token } = tokenRes.data;
    console.log(access_token, refresh_token)

    res.redirect("http://localhost:5173/plateforms?twitter=connected");
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