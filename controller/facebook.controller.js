const axios = require("axios");
const SocialAccount = require("../models/socialAccount.model");


const facebookCallback = async (req, res) => {
    try {
        const { code } = req.query;

        // Exchange code for token
        const tokenRes = await axios.get(
            "https://graph.facebook.com/v19.0/oauth/access_token",
            {
                params: {
                    client_id: process.env.FACEBOOK_APP_ID,
                    client_secret: process.env.FACEBOOK_APP_SECRET,
                    redirect_uri: process.env.FACEBOOK_REDIRECT_URI,
                    code,
                },
            }
        );

        const accessToken = tokenRes.data.access_token;

        // Get Pages
        const pagesRes = await axios.get(
            "https://graph.facebook.com/v19.0/me/accounts",
            {
                params: { access_token: accessToken },
            }
        );

        const page = pagesRes.data.data[0]; // first page

        await SocialAccount.findOneAndUpdate(
            {
                userId: req.user._id,
                platform: "facebook",
            },
            {
                platformUserId: page.id,
                accessToken: page.access_token,
                displayName: page.name,
                isConnected: true,
            },
            { upsert: true, new: true }
        );

        res.redirect("http://localhost:5173/platforms?connected=facebook");

    } catch (error) {
        console.error(error.response?.data || error.message);
        res.send("Facebook connection failed");
    }
};

module.exports = { facebookCallback }