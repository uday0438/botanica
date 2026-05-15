import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyCECVF3ahJ54UmJPlcJKjw9AB0LSWKX8Q8";

async function checkGemini() {
    try {
        console.log(`Checking Gemini key...`);
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Respond with 'OK' if you can read this.");
        console.log('✅ Gemini API Key is VALID');
        console.log('Response:', result.response.text());
    } catch (e) {
        console.log('❌ Gemini API Key is INVALID');
        console.log('Error:', e.message);
    }
}

checkGemini();
