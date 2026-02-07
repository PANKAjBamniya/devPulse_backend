const axios = require("axios");

const postToLinkedIn = async ({ text, accessToken, authorUrn }) => {
    try {
        const response = await axios.post(
            "https://api.linkedin.com/v2/ugcPosts",
            {
                author: authorUrn,
                lifecycleState: "PUBLISHED",
                specificContent: {
                    "com.linkedin.ugc.ShareContent": {
                        shareCommentary: { text },
                        shareMediaCategory: "NONE",
                    },
                },
                visibility: {
                    "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                    "X-Restli-Protocol-Version": "2.0.0",
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("LinkedIn API Error:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || "Failed to post to LinkedIn");
    }
};

module.exports = { postToLinkedIn };