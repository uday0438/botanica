# 🌱 Botanica AI: Precision Agriculture Platform

Botanica is a next-generation AI-driven agricultural diagnostic and management system. It bridges the gap between research-grade data and field-level application, providing farmers with scientific plant health diagnostics, soil management advice, and real-time market intelligence.

## 🚀 Key Features

- **🔬 Kaggle-Grounded Identification**: Plant and fruit identification grounded in the *PlantVillage* (38 classes) and *Fruits-360* (131 varieties) datasets for research-grade accuracy.
- **🛰️ Satellite Field Hub**: Real-time NDVI (Normalized Difference Vegetation Index) telemetry using Sentinel-2 patterns to monitor whole-farm health from orbit.
- **🌡️ Hyper-Local Weather Intelligence**: Risk detection for heatwaves, frost, and unseasonal rain with actionable irrigation advice.
- **💰 Mandi Market Telemetry**: Live wholesale price tracking across Indian markets (Agmarknet) with profit potential analysis.
- **🤖 Doctor AI Chat**: A multi-modal, multilingual conversational expert for follow-up diagnostics and treatment tracking.
- **📖 Intelligent Encyclopedia**: A comprehensive agricultural database with automatic spelling correction and visual plant identification.

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
- **Backend**: Node.js, Express, TypeScript.
- **AI Engine**: Google Gemini 1.5 Pro/Flash (Multi-modal).
- **Datasets**: PlantVillage (Kaggle), Fruits-360 (Kaggle), Indian Crop Recommendation (Kaggle).

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/uday0438/Botanica.git
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   Create a `.env` file in the root and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the Application**:
   Starts both the Vite frontend and Express backend simultaneously:
   ```bash
   npm start
   ```

## 🌍 Social Impact

Botanica aims to democratize precision agriculture by providing small-scale farmers with the same data-driven insights used by large industrial farms, ultimately increasing crop yield and reducing chemical waste.

---
Built with ❤️ for the global farming community by Uday.
