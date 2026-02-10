const SocialAccount = require("../models/socialAccountModel");

const getAccessToken = async (code) => {
    const params = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
    });

    const response = await fetch(
        "https://www.linkedin.com/oauth/v2/accessToken",
        {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params,
        }
    );

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
};

const getLinkedInProfile = async (accessToken) => {
    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch LinkedIn profile");
    }

    return response.json();
};

const connectLinkedIn = async (req, res) => {
    try {
        const { code } = req.query;

        // 🔐 Logged-in app user
        const userId = req.user.userId;

        if (!code) throw new Error("Authorization code missing");

        const tokenData = await getAccessToken(code);
        const profile = await getLinkedInProfile(tokenData.access_token);

        const platformUserId = profile.sub;
        const authorUrn = `urn:li:person:${platformUserId}`;

        let socialAccount = await SocialAccount.findOne({
            userId,
            platform: "linkedin",
        });

        if (socialAccount) {
            // 🔄 update
            socialAccount.accessToken = tokenData.access_token;
            socialAccount.tokenExpiry = new Date(
                Date.now() + tokenData.expires_in * 1000
            );
            socialAccount.displayName = profile.name;
            socialAccount.profileImage = profile.picture;
            socialAccount.rawProfileData = { ...profile, authorUrn };
            socialAccount.isConnected = true;
        } else {
            // ➕ create
            socialAccount = new SocialAccount({
                userId,
                platform: "linkedin",
                platformUserId,
                displayName: profile.name,
                profileImage: profile.picture,
                accessToken: tokenData.access_token,
                tokenExpiry: new Date(
                    Date.now() + tokenData.expires_in * 1000
                ),
                rawProfileData: { ...profile, authorUrn },
                isConnected: true,
            });
        }

        await socialAccount.save();

        res.redirect("http://localhost:5173/platforms?linkedin=connected");
    } catch (err) {
        res.redirect(
            `http://localhost:5173/platforms?error=${encodeURIComponent(
                err.message
            )}`
        );
    }
};

module.exports = {
    connectLinkedIn,
};