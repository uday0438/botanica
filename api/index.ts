import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { knowledgeBase, datasetReference, soilReference, marketReference } from './data.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const apiKey = (process.env.GEMINI_API_KEY || "").trim();
const weatherApiKey = (process.env.OPENWEATHER_API_KEY || "").trim();

// ==================== DIRECT API UTILITY ====================
async function callGeminiDirect(payload: any, model: string) {
    // Use v1beta for newest models if v1 fails, but v1 is preferred for stability
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const data: any = await response.json();
    
    if (!response.ok) {
        throw { status: response.status, message: data.error?.message || `API Error ${response.status}` };
    }

    return data;
}

// Validated models specifically for your API key
const VALID_MODELS = [
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-2.5-flash",
    "gemini-pro-latest"
];

async function generateWithFallback(payload: any) {
    let lastError: any;
    for (const model of VALID_MODELS) {
        try {
            console.log(`🤖 Trying validated model: ${model}`);
            return await callGeminiDirect(payload, model);
        } catch (error: any) {
            console.error(`❌ ${model} failed:`, error.message);
            lastError = error;
            // If it's a 404 or 403, try next. If it's 400 (bad prompt), stop.
            if (error.status === 404 || error.status === 403 || error.status === 429) continue;
            throw error;
        }
    }
    throw lastError || new Error("All authorized models failed.");
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

        const contents = [{
            parts: [
                { text: prompt },
                ...images.map((img: any) => ({
                    inlineData: { data: img.data, mimeType: img.mimeType || 'image/jpeg' }
                }))
            ]
        }];

        const result = await generateWithFallback({ contents });
        const text = result.candidates[0].content.parts[0].text;
        const parsed = safeParseJSON(text);
        
        if (!parsed) throw new Error("AI returned malformed data.");
        res.json(parsed);

    } catch (error: any) {
        console.error("Analysis Failure:", error);
        res.status(500).json({ error: error.message || "Diagnostic engine failed" });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [], language = 'English' } = req.body;
        const contents = [
            ...history.map((h: any) => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            })),
            { role: 'user', parts: [{ text: `You are Doctor AI. Respond in ${language}. User says: ${message}` }] }
        ];

        const result = await generateWithFallback({ contents });
        res.json({ response: result.candidates[0].content.parts[0].text });
    } catch (error: any) {
        res.json({ response: "AI is busy. Please try again." });
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

        const prompt = `Provide agricultural alerts for lat:${latitude}, lon:${longitude}, weather:${JSON.stringify(weatherData)} in JSON: { "region": "name", "alerts": ["a1"], "weather": { "temp": "25C", "humidity": "60%", "condition": "Clear" } }. Respond in ${language}.`;
        const result = await generateWithFallback({ contents: [{ parts: [{ text: prompt }] }] });
        res.json(safeParseJSON(result.candidates[0].content.parts[0].text));
    } catch (error: any) {
        res.json({ "region": "Current Location", "alerts": ["No risk"], "weather": { "temp": "N/A", "humidity": "N/A", "condition": "Cloudy" } });
    }
});

app.post('/api/encyclopedia', async (req, res) => {
    try {
        const { query, language = 'English' } = req.body;
        const prompt = `Info for "${query}" in JSON with cropName, scientificName, description, growthCycle, commonDiseases, idealSoil, optimalHarvest, imageUrl. Respond in ${language}.`;
        const result = await generateWithFallback({ contents: [{ parts: [{ text: prompt }] }] });
        res.json(safeParseJSON(result.candidates[0].content.parts[0].text));
    } catch (error) {
        res.status(500).json({ error: "Data unavailable" });
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;