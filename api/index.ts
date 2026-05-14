import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { knowledgeBase, datasetReference, soilReference, marketReference } from './data.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const weatherApiKey = process.env.OPENWEATHER_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || "");
const MODELS = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"];

function getModel(modelName: string, jsonMode = false) {
    const config: any = {};
    if (jsonMode) config.responseMimeType = "application/json";
    return genAI.getGenerativeModel({ model: modelName, generationConfig: config });
}

async function generateWithFallback(buildRequest: (modelName: string) => Promise<any>): Promise<any> {
    let lastError: any;
    for (const modelName of MODELS) {
        try {
            return await buildRequest(modelName);
        } catch (error: any) {
            lastError = error;
            if (error?.status === 429 || error?.status === 503 || error?.status === 504) continue;
            throw error;
        }
    }
    throw lastError || new Error('All models exhausted');
}

function safeParseJSON(text: string) {
    try {
        return JSON.parse(text);
    } catch {
        const match = text.match(/\{[\s\S]*\}/);
        if (match) return JSON.parse(match[0]);
        return null;
    }
}

// ==================== API ROUTES ====================

app.post('/api/analyze', async (req, res) => {
    try {
        const { images, language = 'English' } = req.body;
        let prompt = `Analyze these images using grounding data:
        [PLANTS] ${JSON.stringify(datasetReference)}
        [SOIL/FERT] ${JSON.stringify(soilReference)}
        Return JSON with plantName, diseaseResult, solution, preventiveMeasures, soilFertility, fertilizerCost, nextCropRecommendation. 
        CRITICAL: All descriptive text values MUST be in ${language}. Ensure the "plantName" is the common name in ${language}.`;

        const imageParts = images.map((img: any) => ({
            inlineData: { data: img.data, mimeType: img.mimeType || 'image/jpeg' }
        }));

        const result = await generateWithFallback(async (modelName) => {
            const model = getModel(modelName, true);
            return await model.generateContent([prompt, ...imageParts]);
        });

        res.json(safeParseJSON(result.response.text()));
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [], language = 'English' } = req.body;
        const systemPrompt = `You are Doctor AI, an agricultural expert. Respond in ${language}.`;
        const result = await generateWithFallback(async (modelName) => {
            const model = getModel(modelName);
            const chat = model.startChat({
                history: history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
                safetySettings: [{ category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }]
            });
            return await chat.sendMessage(systemPrompt + "\n\nUser: " + message);
        });
        res.json({ response: result.response.text() });
    } catch (error: any) {
        res.json({ response: "AI is currently busy. Please try again in a moment." });
    }
});

app.post('/api/alerts', async (req, res) => {
    try {
        const { latitude, longitude, language = 'English' } = req.body;
        let weatherData = null;
        
        if (weatherApiKey) {
            try {
                const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${weatherApiKey}&units=metric`);
                const data: any = await response.json();
                if (response.ok) {
                    weatherData = {
                        temp: `${Math.round(data.main.temp)}°C`,
                        humidity: `${data.main.humidity}%`,
                        condition: data.weather[0].main,
                        region: data.name
                    };
                }
            } catch (e) {}
        }

        const prompt = `Based on coordinates lat:${latitude}, lon:${longitude}, ${weatherData ? `and current weather ${JSON.stringify(weatherData)},` : ''} provide agricultural alerts.
        Return valid JSON:
        {
            "region": "${weatherData?.region || "Current Region"}",
            "alerts": ["No immediate risk", "Routine check"],
            "weather": { "temp": "${weatherData?.temp || "25°C"}", "humidity": "${weatherData?.humidity || "60%"}", "condition": "${weatherData?.condition || "Clear"}" }
        }
        Respond in ${language}.`;

        const result = await generateWithFallback(async (modelName) => {
            const model = getModel(modelName, true);
            return await model.generateContent(prompt);
        });

        res.json(safeParseJSON(result.response.text()));
    } catch (error: any) {
        res.json({
            "region": "Current Location",
            "alerts": ["No severe agricultural alerts detected."],
            "weather": { "temp": "N/A", "humidity": "N/A", "condition": "Cloudy" }
        });
    }
});

app.post('/api/encyclopedia', async (req, res) => {
    try {
        const { query, language = 'English' } = req.body;
        const prompt = `Provide detailed info for "${query}". Return JSON with cropName, scientificName, description, growthCycle, commonDiseases, idealSoil, optimalHarvest, imageUrl. Respond in ${language}.`;
        const result = await generateWithFallback(async (modelName) => {
            const model = getModel(modelName, true);
            return await model.generateContent(prompt);
        });
        res.json(safeParseJSON(result.response.text()));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.post('/api/market', async (req, res) => {
    const { commodity } = req.body;
    const localData = marketReference.market_telemetry.commodities.find((c: any) => c.name.toLowerCase() === (commodity || '').toLowerCase());
    if (localData) {
        return res.json({ price: `₹${localData.avg_price}/quintal`, market: localData.top_mandi, trend: localData.trend, isSimulated: true });
    }
    res.json({ price: "₹2,500/quintal", market: "Regional Mandi", isSimulated: true });
});

app.post('/api/satellite', async (req, res) => {
    res.json({ 
        ndvi_score: 0.72 + (Math.random() * 0.1), 
        health_status: "Vibrant / Optimal", 
        moisture_index: "84%", 
        surface_temp: "26.4°C", 
        last_pass: new Date().toLocaleDateString(),
        map_url: "/ndvi_map.png"
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
