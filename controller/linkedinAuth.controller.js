const SocialAccount = require("../models/socialAccountModel");

const getAccessToken = async (code) => {
    console.log("🔑 Getting access token with code:", code);

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
        const errText = await response.text();
        console.error("❌ LinkedIn token error:", errText);
        throw new Error(errText);
    }

    const data = await response.json();
    console.log("✅ Token data received:", data);

    return data;
};

const getLinkedInProfile = async (accessToken) => {
    console.log("👤 Fetching LinkedIn profile");

    const response = await fetch("https://api.linkedin.com/v2/userinfo", {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("❌ LinkedIn profile error:", errText);
        throw new Error("Failed to fetch LinkedIn profile");
    }

    const profile = await response.json();
    console.log("✅ LinkedIn profile:", profile);

    return profile;
};

const connectLinkedIn = async (req, res) => {
    try {
        const { code, state } = req.query;

        console.log("➡️ OAuth callback hit");
        console.log("📦 Query params:", { code, state });

        if (!code || !state) {
            throw new Error("Missing OAuth params");
        }

        let userId;

        try {
            const parsedState = JSON.parse(state);
            console.log("🧩 Parsed OAuth state:", parsedState);
            userId = parsedState.userId;
        } catch (e) {
            console.error("❌ State parse failed:", state);
            throw new Error("Invalid OAuth state");
        }

        if (!userId) {
            console.error("❌ userId missing in state");
            throw new Error("UserId missing in OAuth state");
        }

        console.log("✅ OAuth userId:", userId);

        // 🔑 TOKEN
        const tokenData = await getAccessToken(code);

        // 👤 PROFILE
        const profile = await getLinkedInProfile(tokenData.access_token);

        const platformUserId = profile.sub;
        const authorUrn = `urn:li:person:${platformUserId}`;

        console.log("🔗 LinkedIn IDs:", { platformUserId, authorUrn });

        let socialAccount = await SocialAccount.findOne({
            userId,
            platform: "linkedin",
        });

        console.log(
            socialAccount
                ? "♻️ Updating existing SocialAccount"
                : "➕ Creating new SocialAccount"
        );

        if (!socialAccount) {
            socialAccount = new SocialAccount({
                userId,
                platform: "linkedin",
            });
        }

        Object.assign(socialAccount, {
            platformUserId,
            displayName: profile.name,
            profileImage: profile.picture,
            accessToken: tokenData.access_token,
            tokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
            rawProfileData: { ...profile, authorUrn },
            isConnected: true,
        });

        await socialAccount.save();
        console.log("✅ SocialAccount saved successfully");

        res.redirect("http://localhost:5173/platforms");
    } catch (err) {
        console.error("🔥 LinkedIn connect error:", err.message);
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
