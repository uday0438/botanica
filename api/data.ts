export const knowledgeBase = {
  "fertilizer_logic": [
    { "soil_type": "Sandy", "crop_type": "Maize", "issue": "Nitrogen Deficiency", "recommendation": "Urea (46% N)", "dosage": "120 kg/hectare", "scientific_reason": "Sandy soil leaches nitrogen quickly." },
    { "soil_type": "Loamy", "crop_type": "Tomato", "issue": "Phosphorus Deficiency", "recommendation": "DAP (Diammonium Phosphate)", "dosage": "50 kg/acre", "scientific_reason": "DAP provides immediate P for root development." },
    { "soil_type": "Black", "crop_type": "Cotton", "issue": "Potassium Deficiency", "recommendation": "MOP (Muriate of Potash)", "dosage": "40 kg/acre", "scientific_reason": "Black soil is rich in clay but can lack available K." },
    { "soil_type": "Clayey", "crop_type": "Rice", "issue": "Zinc Deficiency", "recommendation": "Zinc Sulphate", "dosage": "10 kg/acre", "scientific_reason": "Clayey soils often bind micronutrients." }
  ]
};

export const datasetReference = {
  "plant_village": {
    "classes": [
      "Apple: Scab, Black rot, Cedar apple rust, Healthy",
      "Corn (Maize): Gray leaf spot, Common rust, Northern Leaf Blight, Healthy",
      "Grape: Black rot, Esca (Black Measles), Leaf blight, Healthy",
      "Peach: Bacterial spot, Healthy",
      "Potato: Early blight, Late blight, Healthy",
      "Tomato: Bacterial spot, Early blight, Late blight, Leaf Mold, Septoria leaf spot, Yellow Leaf Curl Virus, Healthy"
    ]
  },
  "fruits_360": {
    "classes": [
      "Apple (Crimson Snow, Golden, Red Delicious)", "Banana (Yellow, Red)", "Berries (Blackberry, Blueberry, Strawberry)", "Citrus (Lemon, Lime, Orange)", "Tropical (Mango, Papaya, Pineapple, Pomegranate)", "Vegetables (Cabbage, Carrot, Cucumber, Eggplant, Onion, Potato, Tomato)"
    ]
  }
};

export const soilReference = {
  "crop_nutrients": {
    "profiles": [
      { "crop": "rice", "N": 80, "P": 48, "K": 40, "pH": 6.4, "next_crop": "chickpea" },
      { "crop": "maize", "N": 77, "P": 48, "K": 20, "pH": 6.2, "next_crop": "pigeonpeas" },
      { "crop": "cotton", "N": 117, "P": 46, "K": 20, "pH": 6.9, "next_crop": "maize" },
      { "crop": "banana", "N": 100, "P": 82, "K": 50, "pH": 6.0, "next_crop": "mango" },
      { "crop": "grapes", "N": 23, "P": 132, "K": 200, "pH": 6.0, "next_crop": "orange" }
    ]
  },
  "fertilizer_pricing_inr": {
    "rates_per_kg": { "urea": 6.5, "dap": 27.0, "mop": 34.0, "complex": 24.5 }
  }
};

export const marketReference = {
  "market_telemetry": {
    "commodities": [
      { "name": "Tomato", "avg_price": 2800, "top_mandi": "Kolar (Karnataka)", "trend": "Rising", "demand": "VERY HIGH" },
      { "name": "Onion", "avg_price": 3200, "top_mandi": "Lasalgaon (Maharashtra)", "trend": "Stable", "demand": "HIGH" },
      { "name": "Rice (Basmati)", "avg_price": 6500, "top_mandi": "Karnal (Haryana)", "trend": "Rising", "demand": "CRITICAL" },
      { "name": "Wheat", "avg_price": 2450, "top_mandi": "Khanna (Punjab)", "trend": "Stable", "demand": "MODERATE" },
      { "name": "Chilli (Red)", "avg_price": 18000, "top_mandi": "Guntur (Andhra Pradesh)", "trend": "Rising", "demand": "HIGH" }
    ]
  }
};
