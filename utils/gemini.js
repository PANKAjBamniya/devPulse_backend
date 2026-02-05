const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateLinkedInPost = async (prompt) => {
    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        });

        const result = await model.generateContent(prompt);
        const response = result.response;

        return response.text();
    } catch (error) {
        console.error("❌ Gemini Error:", error.message);
        throw new Error(`Failed to generate content: ${error.message}`);
    }
};

module.exports = { generateLinkedInPost };