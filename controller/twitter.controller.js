const axios = require("axios")

const twitterCallback = async (req, res) => {
    const { code } = req.query;

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
    // 

    res.redirect("http://localhost:5173/plateforms?twitter=connected");
};


const twitterLogin = async (req, res) => {
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
};



module.export = { twitterLogin, twitterCallback }