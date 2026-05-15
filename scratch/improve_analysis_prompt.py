import os

file_path = r'c:\Users\UDAYV\OneDrive\Documents\Desktop\BUNNY\PROJECTS\botanica-main\botanica-main\api\index.ts'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Target the analyze route prompt
old_prompt_start = "let prompt = `Analyze these images using grounding data:"
old_prompt_end = "res.json(safeParseJSON(result.response.text()));"

# Construct a much more robust prompt with a strict schema
new_analyze_logic = r"""        let prompt = `You are a world-class agricultural pathologist. Analyze the provided images of plants/soil.
        
        GROUNDING DATA:
        - PLANTS: ${JSON.stringify(datasetReference)}
        - SOIL/FERT: ${JSON.stringify(soilReference)}
        - MARKET: ${JSON.stringify(marketReference)}

        REQUIRED OUTPUT FORMAT (JSON):
        {
          "plantName": "Common name of the plant",
          "diseaseResult": "Specific name of the disease or 'Healthy'",
          "solution": "Immediate treatment or management steps",
          "preventiveMeasures": ["Step 1", "Step 2"],
          "soilFertility": "Current status (e.g., Optimal, Nitrogen Deficient)",
          "fertilizerDetails": {
             "chemical": {
                "urea": { "quantity": "amount", "cost": "price", "effect": "reasoning" },
                "dap": { "quantity": "amount", "cost": "price", "effect": "reasoning" },
                "mop": { "quantity": "amount", "cost": "price", "effect": "reasoning" },
                "totalCost": "total currency string"
             },
             "organic": [
                { "name": "Alternative name", "benefit": "description", "application": "how-to" }
             ]
          },
          "marketInsights": {
             "currentPrice": "value/unit",
             "priceTrend": "Rising/Falling/Stable",
             "marketDemand": "High/Low/Critical"
          },
          "nextCropRecommendation": "Name of best crop to plant next"
        }

        CRITICAL: Respond ONLY in valid JSON. All descriptive text must be in ${language}.`;

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
            console.error("Invalid AI response:", text);
            throw new Error("AI returned invalid JSON structure");
        }

        res.json(parsed);"""

# Replace the logic
import re
pattern = re.compile(re.escape(old_prompt_start) + r".*?" + re.escape(old_prompt_end), re.DOTALL)
new_content = pattern.sub(new_analyze_logic, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Successfully improved Analysis Prompt in api/index.ts")
