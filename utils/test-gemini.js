require('dotenv').config();

async function testGeminiAPI() {
    const apiKey = process.env.GEMINI_API_KEY;

    console.log("🔍 Checking API Key...");
    console.log("Key exists:", apiKey ? "✅" : "❌");
    console.log("Key length:", apiKey?.length || 0);
    console.log("Key starts with 'AIzaSy':", apiKey?.startsWith('AIzaSy') ? "✅" : "❌");

    if (!apiKey) {
        console.log("\n❌ No API key found! Check your .env file");
        return;
    }

    // Test the API directly
    console.log("\n📡 Testing API...");
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );

        const data = await response.json();

        if (response.ok && data.models) {
            console.log("\n✅ API Key is VALID!");
            console.log("\n📋 Available models:");
            data.models
                .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
                .forEach(model => {
                    const modelName = model.name.replace('models/', '');
                    console.log(`  • ${modelName}`);
                });
        } else {
            console.log("\n❌ API Key is INVALID!");
            console.log("Error:", data.error?.message || JSON.stringify(data));
        }
    } catch (error) {
        console.log("\n❌ Network error:", error.message);
    }
}

testGeminiAPI();