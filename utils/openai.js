const OpenAI = require("openai");

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generateLinkedInPost = async (prompt) => {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "You are a professional LinkedIn content writer",
            },
            {
                role: "user",
                content: prompt,
            },
        ],
    });

    return response.choices[0].message.content;
};

module.exports = {
    openai,
    generateLinkedInPost,
};
