import { GoogleGenerativeAI } from "@google/generative-ai";

const key = "AIzaSyCECVF3ahJ54UmJPlcJKjw9AB0LSWKX8Q8";

async function listModels() {
    try {
        console.log(`Listing models for key...`);
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ Key is AUTHENTICATED');
            console.log('Available Models:', data.models.map(m => m.name));
        } else {
            console.log('❌ Key AUTHENTICATION FAILED');
            console.log('Error:', data.error.message);
        }
    } catch (e) {
        console.log('❌ Connection error:', e.message);
    }
}

listModels();
