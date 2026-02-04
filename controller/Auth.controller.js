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
    // console.log(accessToken)
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

const linkedInCallback = async (req, res) => {
    try {
        const { code } = req.query
        // console.log(code)

        // get access token 
        const accessToken = await getAccessToken(code)

        // get user data using access token 

        const userData = await getUserData(accessToken.access_token)

        if (!userData) {
            return res.status(500).json({
                success: false,
                error
            })
        }

        // check if user registered 
        let user

        user = await User.findOne({ email: userData.email })

        if (!user) {
            user = new User({
                name: userData.name,
                email: userData.email,
                phone: userData?.phone,
                avatar: userData?.picture
            })
            await user.save()
        }


        const token = jwt.sign({ name: user.name, email: user.email, avatar: user.avatar }, process.env.JWT_SECRET)

        res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        });


        res.redirect('http://localhost:5173')

    } catch (error) {
        res.status(500).json({
            success: false,
            error
        })
    }
}

const getUser = async (req, res) => {
    try {
        const token = req.cookies?.token;

        console.log(req.cookie)

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token found",
            });
        }

        const user = jwt.verify(token, process.env.JWT_SECRET);

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


module.exports = { linkedInCallback, getUser }