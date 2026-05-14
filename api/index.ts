import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { knowledgeBase, datasetReference, soilReference, marketReference } from './data.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const weatherApiKey = process.env.OPENWEATHER_API_KEY;

const genAI = new GoogleGenerativeAI(apiKey || "");
// Use 1.5 Flash as primary for maximum stability/availability
const MODELS = ["gemini-1.5-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro-latest", "gemini-1.5-pro", "gemini-2.0-flash-exp"];

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
];

function getModel(modelName: string, jsonMode = false) {
    const config: any = {};
    if (jsonMode) config.responseMimeType = "application/json";
    return genAI.getGenerativeModel({ 
        model: modelName, 
        generationConfig: config,
        safetySettings 
    });
}

async function generateWithFallback(buildRequest: (modelName: string) => Promise<any>): Promise<any> {
    let lastError: any;
    for (const modelName of MODELS) {
        try {
            console.log(`🤖 Attempting analysis with ${modelName}`);
            return await buildRequest(modelName);
        } catch (error: any) {
            console.error(`❌ Error with ${modelName}:`, error.message);
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
        if (match) {
            try { return JSON.parse(match[0]); } catch { return null; }
        }
        return null;
    }
}

// ==================== API ROUTES ====================

app.post('/api/analyze', async (req, res) => {
    try {
        const { images, language = 'English' } = req.body;
        if (!images || images.length === 0) {
            return res.status(400).json({ error: "No images provided" });
        }

        const prompt = `Analyze these agricultural images. 
        Grounding: ${JSON.stringify(datasetReference)} ${JSON.stringify(soilReference)}
        
        Return JSON EXACTLY in this format:
        {
          "plantName": "name",
          "diseaseResult": "disease",
          "solution": "steps",
          "preventiveMeasures": ["m1", "m2"],
          "soilFertility": "status",
          "fertilizerDetails": {
             "chemical": {
                "urea": { "quantity": "10kg", "cost": "₹100", "effect": "boost" },
                "dap": { "quantity": "5kg", "cost": "₹200", "effect": "roots" },
                "mop": { "quantity": "2kg", "cost": "₹150", "effect": "health" },
                "totalCost": "₹450"
             },
             "organic": [{ "name": "Compost", "benefit": "nutrients", "application": "mix" }]
          },
          "marketInsights": { "currentPrice": "₹30/kg", "priceTrend": "Stable", "marketDemand": "High" },
          "nextCropRecommendation": "crop"
        }
        
        Respond in ${language}. If unsure, provide best estimate based on symptoms.`;

        const imageParts = images.map((img: any) => ({
            inlineData: { data: img.data, mimeType: img.mimeType || 'image/jpeg' }
        }));

        const result = await generateWithFallback(async (modelName) => {
            const model = getModel(modelName, true);
            return await model.generateContent([prompt, ...imageParts]);
        });

        const text = result.response.text();
        const parsed = safeParseJSON(text);
        
        if (!parsed || !parsed.diseaseResult) {
            throw new Error("AI returned incomplete or malformed diagnostic data.");
        }

        res.json(parsed);
    } catch (error: any) {
        console.error("🔥 Analysis Critical Failure:", error);
        res.status(500).json({ error: error.message || "Diagnostic engine failed" });
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
                safetySettings
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
                    weatherData = { temp: `${Math.round(data.main.temp)}°C`, humidity: `${data.main.humidity}%`, condition: data.weather[0].main, region: data.name };
                }
            } catch (e) {}
        }

        const prompt = `Based on lat:${latitude}, lon:${longitude}, weather:${JSON.stringify(weatherData)}, provide agricultural alerts in JSON: { "region": "name", "alerts": ["a1"], "weather": { "temp": "25C", "humidity": "60%", "condition": "Clear" } }. Respond in ${language}.`;

        const result = await generateWithFallback(async (modelName) => {
            const model = getModel(modelName, true);
            return await model.generateContent(prompt);
        });

        res.json(safeParseJSON(result.response.text()));
    } catch (error: any) {
        res.json({ "region": "Current Location", "alerts": ["No immediate risk"], "weather": { "temp": "N/A", "humidity": "N/A", "condition": "Cloudy" } });
    }
});

app.post('/api/encyclopedia', async (req, res) => {
    try {
        const { query, language = 'English' } = req.body;
        const prompt = `Provide info for "${query}" in JSON with cropName, scientificName, description, growthCycle, commonDiseases, idealSoil, optimalHarvest, imageUrl. Respond in ${language}.`;
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
    res.json({ ndvi_score: 0.72 + (Math.random() * 0.1), health_status: "Vibrant / Optimal", moisture_index: "84%", surface_temp: "26.4°C", last_pass: new Date().toLocaleDateString(), map_url: "/ndvi_map.png" });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;