import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const knowledgePath = path.resolve(__dirname, 'knowledge_base.json');
const knowledgeBase = JSON.parse(fs.readFileSync(knowledgePath, 'utf-8'));

const datasetRefPath = path.resolve(__dirname, 'dataset_reference.json');
const datasetReference = JSON.parse(fs.readFileSync(datasetRefPath, 'utf-8'));

const soilRefPath = path.resolve(__dirname, 'soil_fertilizer_reference.json');
const soilReference = JSON.parse(fs.readFileSync(soilRefPath, 'utf-8'));

const marketRefPath = path.resolve(__dirname, 'market_reference.json');
const marketReference = JSON.parse(fs.readFileSync(marketRefPath, 'utf-8'));

const API_BASE_URL = 'http://localhost:3004';
const app = express();
const port = process.env.PORT || 3004;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const apiKey = process.env.GEMINI_API_KEY;
const weatherApiKey = process.env.OPENWEATHER_API_KEY;
const mandiApiKey = process.env.AGMARKNET_API_KEY;
if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not set!');
}
if (!weatherApiKey) {
    console.warn('⚠️ OPENWEATHER_API_KEY is not set. Using AI simulation for weather.');
}
if (!mandiApiKey) {
    console.warn('⚠️ AGMARKNET_API_KEY is not set. Using simulated market data.');
}
const genAI = new GoogleGenerativeAI(apiKey || "");

const MODELS = ["gemini-2.0-flash", "gemini-2.5-flash", "gemini-flash-latest"];

function getModel(modelName: string, jsonMode = false) {
    const config: any = {};
    if (jsonMode) config.responseMimeType = "application/json";
    return genAI.getGenerativeModel({ model: modelName, generationConfig: config });
}

async function generateWithFallback(
    buildRequest: (modelName: string) => Promise<any>,
    maxRetriesPerModel = 2
): Promise<any> {
    let lastError: any;
    for (const modelName of MODELS) {
        for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
            try {
                console.log(`🔄 ${modelName} attempt ${attempt + 1}`);
                return await buildRequest(modelName);
            } catch (error: any) {
                lastError = error;
                if (error?.status === 429 || error?.status === 503 || error?.status === 504) {
                    if (attempt < maxRetriesPerModel) {
                        const wait = (attempt + 1) * 2000 + Math.random() * 1000;
                        console.log(`⏳ Error ${error?.status} on ${modelName}, retrying in ${(wait/1000).toFixed(1)}s...`);
                        await new Promise(r => setTimeout(r, wait));
                        continue;
                    }
                    console.log(`⚠️ ${modelName} failed with ${error?.status}, trying next model...`);
                    break;
                }
                throw error;
            }
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

// ==================== ANALYZE ====================
app.post('/api/analyze', async (req, res) => {
    try {
        const { images, language = 'English', historyContext = null } = req.body;
        if (!images || !Array.isArray(images) || images.length === 0) {
            return res.status(400).json({ error: 'No images provided.' });
        }
        console.log(`📸 Analysis: ${images.length} image(s), lang: ${language}${historyContext ? ' [TRACKING MODE]' : ''}`);

        let prompt = `You are an expert agricultural scientist. Analyze the provided images using these official KAGLE DATASET standards.
        
[GROUNDING DATA: PLANTVILLAGE & FRUITS-360]
${JSON.stringify(datasetReference)}

[GROUNDING DATA: NPK REQUIREMENTS & FERTILIZER PRICING]
${JSON.stringify(soilReference)}

Identify:
1. The plant/fruit/vegetable species - BE SPECIFIC and align with the grounding data provided above.
2. The specific type (Fruit, Vegetable, Leaf, or Crop).
3. Any disease, pest damage, nutrient deficiency, or health issue visible.
4. Provide actionable treatment solutions.
5. Estimate soil fertility parameters.
6. Calculate approximate chemical fertilizer requirements, their costs in Indian Rupees (INR), and their specific effects on soil health.
7. Provide organic fertilizer alternatives and their benefits.
8. Current average market price per unit (kg/quintal) for the identified healthy crop.
9. Recommend the best next crop for soil recovery.

Reference data: ${JSON.stringify(knowledgeBase.fertilizer_logic)}

Return valid JSON:
{
    "plantName": "Common name of the plant",
    "plantType": "Fruit | Vegetable | Leaf | Crop",
    "diseaseResult": "Name of disease or 'Healthy'",
    "solution": "Detailed treatment",
    "preventiveMeasures": ["measure 1", "measure 2"],
    "soilFertility": { "pH": "value", "nitrogen": "Low/Medium/High", "phosphorus": "Low/Medium/High", "potassium": "Low/Medium/High", "soilType": "type" },
    "fertilizerDetails": {
        "chemical": {
            "urea": { "quantity": "kg", "cost": "INR", "effect": "Effect on soil/plant" },
            "dap": { "quantity": "kg", "cost": "INR", "effect": "Effect on soil/plant" },
            "mop": { "quantity": "kg", "cost": "INR", "effect": "Effect on soil/plant" },
            "totalCost": "total INR"
        },
        "organic": [
            { "name": "Fertilizer name", "benefit": "Specific benefit", "application": "How to apply" }
        ]
    },
    "marketInsights": {
        "currentPrice": "INR per unit",
        "priceTrend": "Increasing/Decreasing/Stable",
        "marketDemand": "High/Medium/Low"
    },
    "nextCropRecommendation": "crop with reason"
}`;

        if (historyContext) {
            prompt += `\n\nCRITICAL CONTEXT (Recovery Tracking):
The user is tracking progress for a previously diagnosed issue.
Previous Diagnosis: ${historyContext.previousDisease}
Previous Solution: ${historyContext.previousSolution}
Compare the NEW images with the previous state. In the "diseaseResult" field, include a summary of the progress (e.g., "Healing: 20% improvement" or "Worsening").
Modify the "solution" to account for whether the current treatment is working.`;
        }

        prompt += `\n\nCRITICAL: You MUST respond in the ${language} language. All descriptive text in the JSON fields (solution, preventiveMeasures, etc.) MUST be in ${language}. Ensure the "plantName" field is the common name in ${language}.`;

        const imageParts = images.map((img: any) => ({
            inlineData: { data: img.data, mimeType: img.mimeType || 'image/jpeg' }
        }));

        const result = await generateWithFallback(async (modelName) => {
            const model = getModel(modelName, true);
            return await model.generateContent([prompt, ...imageParts]);
        });

        const textResponse = result.response.text();
        console.log(`📡 AI Response received (${textResponse.length} chars)`);
        
        const parsed = safeParseJSON(textResponse);
        if (parsed) {
            console.log('✅ Analysis complete and parsed successfully');
            res.json(parsed);
        } else {
            console.warn('⚠️ AI returned invalid format, using fallback');
            throw new Error('Invalid JSON format from AI');
        }
    } catch (error: any) {
        console.error('❌ Analysis error:', error.message);
        
        // Comprehensive Fallback to simulated data to prevent frontend errors
        const getLocalizedFallback = (lang: string) => {
            const fallbacks: any = {
                "Hindi": {
                    "plantName": "अज्ञात नमूना",
                    "plantType": "Crop",
                    "diseaseResult": "सिम्युलेटेड विश्लेषण (सेवा व्यस्त)",
                    "solution": "हमारे AI सर्वर पर वर्तमान में बहुत अधिक ट्रैफ़िक है। सामान्य पैटर्न के आधार पर, कृपया सुनिश्चित करें कि पौधे को पर्याप्त पानी मिले, कीटों की जांच करें और यदि आपको संक्रमण का संदेह हो तो पौधे को अलग करें।",
                    "preventiveMeasures": ["मिट्टी की नमी बनाए रखें", "सूरज की रोशनी सुनिश्चित करें", "नियमित निरीक्षण करें", "साफ औजारों का उपयोग करें"],
                    "soilFertility": { "pH": "6.5", "nitrogen": "Medium", "phosphorus": "Low", "potassium": "Medium", "soilType": "दोमट मिट्टी" },
                    "fertilizerDetails": {
                        "chemical": {
                            "urea": { "quantity": "50kg/acre", "cost": "₹450", "effect": "नाइट्रोजन स्तर को तेजी से बढ़ाता है लेकिन अधिक उपयोग से मिट्टी अम्लीय हो सकती है।" },
                            "dap": { "quantity": "100kg/acre", "cost": "₹1,200", "effect": "जड़ों के विकास में मदद करता है।" },
                            "mop": { "quantity": "50kg/acre", "cost": "₹850", "effect": "रोग प्रतिरोधक क्षमता बढ़ाता है।" },
                            "totalCost": "₹2,500"
                        },
                        "organic": [
                            { "name": "वर्मीकम्पोस्ट", "benefit": "मिट्टी की बनावट में सुधार करता है।", "application": "पौधे के आधार के चारों ओर 2-3 किलोग्राम डालें।" },
                            { "name": "नीम का तेल", "benefit": "प्राकृतिक कीट विकर्षक।", "application": "पानी के साथ मिलाकर पत्तियों पर स्प्रे करें।" }
                        ]
                    },
                    "marketInsights": {
                        "currentPrice": "₹2,400/क्विंटल",
                        "priceTrend": "Stable",
                        "marketDemand": "High"
                    },
                    "nextCropRecommendation": "नाइट्रोजन बहाल करने के लिए फलियां (मटर/बीन्स)।"
                },
                "Telugu": {
                    "plantName": "తెలియని నమూనా",
                    "plantType": "Crop",
                    "diseaseResult": "సిమ్యులేటెడ్ విశ్లేషణ (సర్వర్ బిజీ)",
                    "solution": "మా AI సర్వర్‌లలో ప్రస్తుతం రద్దీ ఎక్కువగా ఉంది. సాధారణ పద్ధతుల ఆధారంగా, మొక్కకు తగినంత నీరు అందేలా చూడండి, కీటకాలను గమనించండి.",
                    "preventiveMeasures": ["నేల తేమను నిర్వహించండి", "సూర్యరశ్మిని నిర్ధారించండి", "క్రమం తప్పకుండా తనిఖీ చేయండి"],
                    "soilFertility": { "pH": "6.5", "nitrogen": "Medium", "phosphorus": "Low", "potassium": "Medium", "soilType": "ఒండ్రు నేల" },
                    "fertilizerDetails": {
                        "chemical": {
                            "urea": { "quantity": "50kg/acre", "cost": "₹450", "effect": "నత్రజని స్థాయిని త్వరగా పెంచుతుంది." },
                            "dap": { "quantity": "100kg/acre", "cost": "₹1,200", "effect": "వేర్ల అభివృద్ధికి సహాయపడుతుంది." },
                            "mop": { "quantity": "50kg/acre", "cost": "₹850", "effect": "వ్యాధి నిరోధక శక్తిని పెంచుతుంది." },
                            "totalCost": "₹2,500"
                        },
                        "organic": [
                            { "name": "వర్మీ కంపోస్ట్", "benefit": "నేల సారాన్ని పెంచుతుంది.", "application": "మొక్క మొదట్లో 2-3 కిలోలు వేయాలి." }
                        ]
                    },
                    "marketInsights": {
                        "currentPrice": "₹2,400/క్వింటాల్",
                        "priceTrend": "Stable",
                        "marketDemand": "High"
                    },
                    "nextCropRecommendation": "నత్రజని పెంచడానికి పప్పుధాన్యాలు."
                }
            };
            return fallbacks[lang] || {
                "plantName": "Unknown Specimen",
                "plantType": "Crop",
                "diseaseResult": "Simulated Analysis (Service Busy)",
                "solution": "AI servers are busy. Check hydration, pests, and air circulation.",
                "preventiveMeasures": ["Maintain soil moisture", "Ensure sunlight", "Regular inspection"],
                "soilFertility": { "pH": "6.5", "nitrogen": "Medium", "phosphorus": "Low", "potassium": "Medium", "soilType": "Loamy Soil" },
                "fertilizerDetails": {
                    "chemical": {
                        "urea": { "quantity": "50kg/acre", "cost": "₹450", "effect": "Rapidly increases nitrogen but may acidity soil if overused." },
                        "dap": { "quantity": "100kg/acre", "cost": "₹1,200", "effect": "Promotes strong root development." },
                        "mop": { "quantity": "50kg/acre", "cost": "₹850", "effect": "Increases disease resistance." },
                        "totalCost": "₹2,500"
                    },
                    "organic": [
                        { "name": "Vermicompost", "benefit": "Improves soil texture and microbial activity.", "application": "Apply 2-3kg around the plant base." },
                        { "name": "Neem Oil", "benefit": "Natural pest repellent.", "application": "Spray 5ml/liter on leaves." }
                    ]
                },
                "marketInsights": {
                    "currentPrice": "₹2,400/quintal",
                    "priceTrend": "Stable",
                    "marketDemand": "High"
                },
                "nextCropRecommendation": "Legumes to restore nitrogen."
            };
        };
        
        res.json(getLocalizedFallback(language));
    }
});

// ==================== DOCTOR AI CHAT ====================
app.post('/api/chat', async (req, res) => {
    try {
        const { message, history = [], language = 'English' } = req.body;
        if (!message?.trim()) {
            return res.status(400).json({ error: 'Message is empty.' });
        }

        const safeHistory = history
            .filter((h: any) => h?.content && h?.role)
            .map((h: any) => ({
                role: h.role === 'user' ? 'user' : 'model',
                parts: [{ text: h.content }]
            }));

        const systemPrompt = `You are "Doctor AI", a highly helpful and expert agricultural scientist. 
        Your goal is to answer EVERY question the user asks. 
        While you specialize in farming and plant care, you should also help with gardening, soil health, and general science.
        If a question is completely unrelated to farming, provide a helpful and polite answer anyway while trying to relate it back to the farmer's life if possible.
        CRITICAL: You MUST respond in ${language}. All explanations and advice MUST be in ${language}.`;

        const result = await generateWithFallback(async (modelName) => {
            const model = getModel(modelName);
            const chat = model.startChat({
                history: safeHistory,
                generationConfig: { 
                    maxOutputTokens: 1500,
                    temperature: 0.7 
                },
                safetySettings: [
                    { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
                    { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
                ]
            });
            return await chat.sendMessage(systemPrompt + "\n\nUser Question: " + message);
        });

        res.json({ response: result.response.text() });
    } catch (error: any) {
        console.error('❌ Chat error:', error.message);
        const chatFallbacks: any = {
            "Hindi": "मुझे खेद है, मैं अभी आपकी सहायता करने में असमर्थ हूँ। कृपया कुछ क्षणों में पुनः प्रयास करें।",
            "Telugu": "క్షమించండి, నేను ప్రస్తుతం మీకు సహాయం చేయలేకపోతున్నాను. దయచేసి కొద్ది సేపటి తర్వాత మళ్ళీ ప్రయత్నించండి.",
            "Marathi": "क्षमस्व, मी सध्या तुम्हाला मदत करू शकत नाही. कृपया थोड्या वेळाने पुन्हा प्रयत्न करा."
        };
        res.json({ response: chatFallbacks[language] || "I'm processing your request. As an AI expert, I'm here to help you with your plants and farm. Could you tell me more about what you're working on?" });
    }
});

// ==================== ENCYCLOPEDIA ====================
app.post('/api/encyclopedia', async (req, res) => {
    const { query, language = 'English' } = req.body;
    try {
        if (!query?.trim()) {
            return res.status(400).json({ error: 'Search query is empty.' });
        }

        const prompt = `You are a professional agricultural encyclopedia. 
        Step 1: Carefully check the search query "${query}" for any spelling mistakes. 
        Step 2: Correct it to the most likely scientific or common plant name.
        Step 3: Provide detailed information about that plant based on official agricultural records.

Return valid JSON:
{
    "cropName": "Corrected common name",
    "scientificName": "scientific name",
    "description": "2-3 sentence description",
    "growthCycle": "growth stages and duration",
    "commonDiseases": ["disease 1", "disease 2", "disease 3"],
    "idealSoil": "ideal soil conditions",
    "optimalHarvest": "best harvest time",
    "imageUrl": "https://source.unsplash.com/featured/?plant,crop,[CorrectedName]"
}
Note: Replace [CorrectedName] with the actual name of the crop.
Respond in ${language}. 
CRITICAL: You MUST respond in ${language}. All JSON string values (cropName, scientificName, description, growthCycle, idealSoil, optimalHarvest) MUST be in ${language}.`;

        const result = await generateWithFallback(async (modelName) => {
            const model = getModel(modelName, true);
            return await model.generateContent(prompt);
        });

        const parsed = safeParseJSON(result.response.text());
        if (parsed) {
            res.json(parsed);
        } else {
            res.status(500).json({ error: 'Failed to parse encyclopedia data.' });
        }
    } catch (error: any) {
        console.error('❌ Encyclopedia error:', error.message);
        const encFallbacks: any = {
            "Hindi": {
                "cropName": query + " (सिम्युलेटेड डेटा)",
                "scientificName": "सेवा व्यस्त",
                "description": "विश्वकोश एआई वर्तमान में अधिक ट्रैफ़िक का सामना कर रहा है। कृपया कुछ मिनटों में पुनः प्रयास करें।",
                "growthCycle": "एन/ए", "commonDiseases": ["एन/ए"], "idealSoil": "एन/ए", "optimalHarvest": "एन/ए"
            },
            "Telugu": {
                "cropName": query + " (సిమ్యులేటెడ్ డేటా)",
                "scientificName": "సర్వర్ బిజీ",
                "description": "ఎన్సైక్లోపీడియా AI ప్రస్తుతం రద్దీగా ఉంది. దయచేసి కొన్ని నిమిషాల తర్వాత మళ్ళీ ప్రయత్నించండి.",
                "growthCycle": "N/A", "commonDiseases": ["N/A"], "idealSoil": "N/A", "optimalHarvest": "N/A"
            }
        };
        res.json(encFallbacks[language] || {
            "cropName": query + " (Simulated Data)",
            "scientificName": "Service Overloaded",
            "description": "The encyclopedia AI is currently experiencing high traffic. Please try your search again in a few minutes.",
            "growthCycle": "N/A",
            "commonDiseases": ["N/A"],
            "idealSoil": "N/A",
            "optimalHarvest": "N/A"
        });
    }
});

// ==================== REGIONAL ALERTS ====================
app.post('/api/alerts', async (req, res) => {
    try {
        const { latitude, longitude, language = 'English' } = req.body;
        
        let weatherData = null;
        
        if (weatherApiKey) {
            try {
                console.log(`☁️ Fetching real weather for ${latitude}, ${longitude}`);
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
            } catch (e) {
                console.warn('Weather API failed, falling back to AI:', e);
            }
        }

        const prompt = `Based on coordinates lat:${latitude}, lon:${longitude}, ${weatherData ? `and current weather ${JSON.stringify(weatherData)},` : ''} provide agricultural alerts.
Return valid JSON:
{
    "region": "${weatherData?.region || "region name"}",
    "alerts": ["alert 1", "alert 2"],
    "weather": { "temp": "${weatherData?.temp || "temperature"}", "humidity": "${weatherData?.humidity || "humidity%"}", "condition": "${weatherData?.condition || "condition"}" }
}
Respond in ${language}.`;

        const result = await generateWithFallback(async (modelName) => {
            const model = getModel(modelName, true);
            return await model.generateContent(prompt);
        });

        const parsed = safeParseJSON(result.response.text());
        if (parsed) {
            res.json(parsed);
        } else {
            res.status(500).json({ error: 'Failed to parse alerts.' });
        }
    } catch (error: any) {
        console.error('❌ Alerts error:', error.message);
        res.json({
            "region": "Current Location (Simulated)",
            "alerts": ["No severe agricultural alerts detected at this time."],
            "weather": { "temp": "28°C", "humidity": "65%", "condition": "Partly Cloudy" }
        });
    }
});

// ==================== MARKET PRICES ====================
app.post('/api/market', async (req, res) => {
    try {
        const { commodity } = req.body;
        if (!commodity) return res.status(400).json({ error: 'Commodity name required.' });

        console.log(`💰 Fetching Mandi prices for: ${commodity}`);
        
        if (mandiApiKey) {
            try {
                // AGMARKNET Resource ID
                const resourceId = '9ef2781d-7a1c-4306-8518-4c33f1737751';
                const url = `https://api.data.gov.in/resource/${resourceId}?api-key=${mandiApiKey}&format=json&filters[commodity]=${encodeURIComponent(commodity)}`;
                
                const response = await fetch(url);
                const data: any = await response.json();
                
                if (data.records && data.records.length > 0) {
                    const latest = data.records[0];
                    return res.json({
                        price: `₹${latest.modal_price}/quintal`,
                        market: latest.market,
                        state: latest.state,
                        arrival_date: latest.arrival_date,
                        isSimulated: false
                    });
                }
            } catch (e) {
                console.warn('Mandi API failed, using fallback');
            }
        }

        // Fallback to Market Reference Dataset
        const localData = marketReference.market_telemetry.commodities.find(
            (c: any) => c.name.toLowerCase() === commodity.toLowerCase()
        );

        if (localData) {
            return res.json({
                price: `₹${localData.avg_price}/quintal`,
                market: localData.top_mandi,
                state: "Baseline Data",
                arrival_date: new Date().toLocaleDateString(),
                trend: localData.trend,
                isSimulated: true
            });
        }

        // Generic Fallback
        res.json({
            price: `₹${2500 + Math.floor(Math.random() * 1000)}/quintal`,
            market: "Regional Mandi",
            state: "Local",
            arrival_date: new Date().toLocaleDateString(),
            isSimulated: true
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Market data fetch failed' });
    }
});

// ==================== ROOT ROUTE ====================
app.get('/', (req, res) => {
    res.send('<h1>🌱 Botanica API Server</h1><p>The backend is running successfully. Please use the <a href="http://localhost:3000">Frontend Dashboard</a> to interact with the AI.</p>');
});

// ==================== SATELLITE TELEMETRY ====================
app.post('/api/satellite', async (req, res) => {
    try {
        const { lat, lng } = req.body;
        // Simulated NDVI Data based on real Sentinel-2 patterns
        // In production, this would call Sentinel-Hub API
        res.json({
            ndvi_score: 0.72 + (Math.random() * 0.1),
            health_status: "Vibrant / Optimal",
            moisture_index: "84% (Adequate)",
            surface_temp: "26.4°C",
            nitrogen_level: "High",
            last_pass: new Date().toLocaleDateString(),
            anomalies: ["Stable growth across all sectors. Minor chlorophyll variance in North Sector."],
            map_url: "/ndvi_map.png" 
        });
    } catch (error) {
        res.status(500).json({ error: "Satellite data unavailable" });
    }
});

// ==================== WEATHER ALERTS ====================
app.get('/api/weather', async (req, res) => {
    try {
        // Simulated OpenWeather One Call data
        res.json({
            current_temp: "28°C",
            humidity: "65%",
            risk_level: "Medium",
            alerts: [
                { type: "Heatwave", severity: "High", advice: "Increase irrigation by 20% over the next 48 hours." },
                { type: "Rainfall", severity: "Low", advice: "Scattered showers expected on Thursday." }
            ]
        });
    } catch (error) {
        res.status(500).json({ error: "Weather telemetry unavailable" });
    }
});

// ==================== HEALTH CHECK ====================
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', apiKeySet: !!apiKey, models: MODELS, timestamp: new Date().toISOString() });
});

app.listen(port, () => {
    console.log(`🌱 Botanica Backend running on port ${port}`);
    console.log(`   API Key: ${apiKey ? '✅ Set' : '❌ MISSING'}`);
    console.log(`   Models: ${MODELS.join(' → ')}`);
});
