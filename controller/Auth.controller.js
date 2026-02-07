const User = require("../models/user.model.js")
const jwt = require('jsonwebtoken')

const getAccessToken = async (code) => {
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri: 'http://localhost:3000/api/linkedin/callback',
    })
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'post',
        headers: {
            'Content-type': 'application/x-www-form-urlencoded'
        },
        body: body.toString()
    })

    if (!response.ok) {
        throw new Error(response.statusText)
    }

    const accessToken = await response.json()
    return accessToken
}


const getUserData = async (accessToken) => {
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
        method: 'get',
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    })

    if (!response.ok) {
        throw new Error(response.statusText)
    }

    const userData = await response.json()
    return userData
}



const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.redirect('/login');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId);

        next();
    } catch (error) {
        res.redirect('/login');
    }
};

const linkedInCallback = async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({
                success: false,
                error: "Authorization code missing",
            });
        }

        // 1️⃣ Get access token
        const tokenData = await getAccessToken(code);

        if (!tokenData?.access_token) {
            return res.status(500).json({
                success: false,
                error: "Failed to get access token",
            });
        }

        console.log('✅ Access token received');

        // 2️⃣ Get LinkedIn user data
        const userData = await getUserData(tokenData.access_token);

        if (!userData?.email) {
            return res.status(500).json({
                success: false,
                error: "Failed to fetch LinkedIn user data",
            });
        }

        console.log('📝 LinkedIn user data:', userData);

        // 🔥 CRITICAL: Extract the LinkedIn ID (sub)
        const linkedInId = userData.sub;

        if (!linkedInId) {
            return res.status(500).json({
                success: false,
                error: "LinkedIn ID (sub) not found in user data",
            });
        }

        // 🔥 CRITICAL: Create the author URN
        const authorUrn = `urn:li:person:${linkedInId}`;

        console.log('🔑 LinkedIn ID:', linkedInId);
        console.log('🎯 Author URN:', authorUrn);

        // 3️⃣ Find or create user
        let user = await User.findOne({ email: userData.email });

        if (!user) {
            user = new User({
                name: userData.name,
                email: userData.email,
                phone: userData?.phone,
                avatar: userData?.picture,
            });
        }

        // 4️⃣ Save LinkedIn credentials INCLUDING authorUrn
        user.linkedin = {
            accessToken: tokenData.access_token,
            expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
            authorUrn: authorUrn,
            linkedInId: linkedInId,
            connectedAt: new Date()
        };

        await user.save();

        // 5️⃣ Generate JWT
        const token = jwt.sign(
            {
                userId: user._id,
                name: user.name,
                email: user.email,
                avatar: user.avatar,
            },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 6️⃣ Set cookie
        res.cookie("token", token, {
            httpOnly: true,
            secure: false, // true in production
            sameSite: "lax",
        });

        // 7️⃣ Redirect to frontend
        res.redirect("http://localhost:5173?linkedin=connected");

    } catch (error) {
        console.error("❌ LinkedIn Callback Error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};


const getUser = async (req, res) => {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token found",
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get full user data from database including LinkedIn info
        const user = await User.findById(decoded.userId).select('-password');

        res.status(200).json({
            success: true,
            user,
        });
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Invalid token",
        });
    }
};


const logout = (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: false,   // localhost
        sameSite: "lax",
    });

    res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};


module.exports = {
    linkedInCallback,
    getUser,
    logout,
};