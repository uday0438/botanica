import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  CloudRain, Droplets, Thermometer, Wind, 
  Leaf, Info, AlertTriangle, ShieldCheck, 
  Lightbulb, Search, Image as ImageIcon,
  Sprout, IndianRupee, History, Star,
  MessageSquare, ChevronLeft, Send, CheckCircle2, X,
  Share2, MapPin, BookOpen, GitCompare, TrendingUp, Activity, Camera, Mic, Globe, AlertCircle
} from 'lucide-react';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Toaster, toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

// --- Translations Map ---
const TRANSLATIONS: Record<string, any> = {
  English: {
    app_title: "BOTANICA",
    analyze: "Analyze",
    encyclopedia: "Encyclopedia",
    history: "History",
    doctor_ai: "Doctor AI",
    upload_title: "Upload Images",
    upload_desc: "Up to 5 images for batch analysis. Drag or click.",
    btn_analyze: "Analyze Samples",
    btn_detect: "Detect",
    local_trends: "Local Trends",
    fetching: "Fetching...",
    weather_temp: "Temp",
    weather_hum: "Humidity",
    tab_diagnosis: "Diagnosis",
    tab_soil: "Soil",
    tab_fertilizer: "Fertilizer",
    tab_recs: "Recommendations",
    buy_now: "BUY NOW",
    download_report: "Download Report",
    reset_panel: "Reset Panel",
    chat_placeholder: "Ask Doctor AI about plant care...",
    market_outlook: "Market Outlook",
    soil_recovery: "Soil Recovery",
    search_placeholder: "Search crops in encyclopedia...",
    awaiting_specimen: "Awaiting Specimen",
    awaiting_desc: "Upload a clear photo of the affected plant leaf on the left module to receive a detailed AI diagnostic.",
    analyzing: "Analyzing Specimen...",
    analyzing_desc: "Running multi-factor diagnostic including pathogen identification and soil synthesis.",
    prec_rotation: "Precision Rotation Engine",
    rotation_desc: "Scientific pairing based on soil recovery datasets.",
    kaggle_grounded: "KAGGLE-GROUNDED",
    recommended_next: "Recommended Next Crop",
    growth_cycle: "Growth Cycle",
    scientific_name: "Scientific Name",
    ideal_soil: "Ideal Soil",
    optimal_harvest: "Optimal Harvest",
    cost_estimates: "Cost Estimates",
    cost_desc: "Sample pricing in local currency based on required amounts.",
    total_cost: "Estimated Total",
    composition: "Composition Analysis",
    health_score: "Health Score",
    infection_detected: "Infection Detected",
    preventive_measures: "Preventive Measures",
    rate_accuracy: "Rate Accuracy",
    fix_id: "Fix Misidentification",
    doctor_chat_prompt: "How can I help your farm today?",
    active_expert: "Active • Expert Response",
  },
  Hindi: {
    app_title: "बोटानिका",
    analyze: "विश्लेषण",
    encyclopedia: "विश्वकोश",
    history: "इतिहास",
    doctor_ai: "डॉक्टर एआई",
    upload_title: "छवियां अपलोड करें",
    upload_desc: "बैच विश्लेषण के लिए 5 छवियां। खींचें या क्लिक करें।",
    btn_analyze: "नमूनों का विश्लेषण करें",
    btn_detect: "पता लगाएं",
    local_trends: "स्थानीय रुझान",
    fetching: "खोज रहे हैं...",
    weather_temp: "तापमान",
    weather_hum: "नमी",
    tab_diagnosis: "निदान",
    tab_soil: "मिट्टी",
    tab_fertilizer: "उर्वरक",
    tab_recs: "सिफारिशें",
    buy_now: "अभी खरीदें",
    download_report: "रिपोर्ट डाउनलोड करें",
    reset_panel: "पैनल रीसेट करें",
    chat_placeholder: "पौधों की देखभाल के बारे में डॉक्टर एआई से पूछें...",
    market_outlook: "बाजार दृष्टिकोण",
    soil_recovery: "मिट्टी की रिकवरी",
    search_placeholder: "विश्वकोश में फसलें खोजें...",
    awaiting_specimen: "नमूने की प्रतीक्षा है",
    awaiting_desc: "विस्तृत एआई निदान प्राप्त करने के लिए बाएं मॉड्यूल पर प्रभावित पौधे की पत्ती का स्पष्ट फोटो अपलोड करें।",
    analyzing: "नमूने का विश्लेषण कर रहे हैं...",
    analyzing_desc: "रोगजनक पहचान और मिट्टी संश्लेषण सहित बहु-कारक निदान चल रहा है।",
    prec_rotation: "सटीक रोटेशन इंजन",
    rotation_desc: "मिट्टी की रिकवरी डेटासेट पर आधारित वैज्ञानिक जोड़ी।",
    kaggle_grounded: "कैगल-आधारित",
    recommended_next: "अनुशंसित अगली फसल",
    growth_cycle: "विकास चक्र",
    scientific_name: "वैज्ञानिक नाम",
    ideal_soil: "आदर्श मिट्टी",
    optimal_harvest: "इष्टतम फसल",
    cost_estimates: "लागत अनुमान",
    cost_desc: "आवश्यक मात्रा के आधार पर स्थानीय मुद्रा में नमूना मूल्य निर्धारण।",
    total_cost: "अनुमानित कुल",
    composition: "संरचना विश्लेषण",
    health_score: "स्वास्थ्य स्कोर",
    infection_detected: "संक्रमण पाया गया",
    preventive_measures: "निवारक उपाय",
    rate_accuracy: "सटीकता दर दें",
    fix_id: "गलत पहचान ठीक करें",
    doctor_chat_prompt: "आज मैं आपके खेत की क्या मदद कर सकता हूँ?",
    active_expert: "सक्रिय • विशेषज्ञ प्रतिक्रिया",
  },
  Telugu: {
    app_title: "బొటానికా",
    analyze: "విశ్లేషణ",
    encyclopedia: "విజ్ఞాన సర్వస్వం",
    history: "చరిత్ర",
    doctor_ai: "డాక్టర్ AI",
    upload_title: "చిత్రాలను అప్‌లోడ్ చేయండి",
    upload_desc: "బ్యాచ్ విశ్లేషణ కోసం గరిష్టంగా 5 చిత్రాలు.",
    btn_analyze: "నమూనాలను విశ్లేషించండి",
    btn_detect: "గుర్తించు",
    local_trends: "స్థానిక పోకడలు",
    fetching: "శోధిస్తోంది...",
    weather_temp: "ఉష్ణోగ్రత",
    weather_hum: "తేమ",
    tab_diagnosis: "నిర్ధారణ",
    tab_soil: "నేల",
    tab_fertilizer: "ఎరువులు",
    tab_recs: "సిఫార్సులు",
    buy_now: "ఇప్పుడే కొనండి",
    download_report: "నివేదికను డౌన్‌లోడ్ చేయండి",
    reset_panel: "ప్యానెల్ రీసెట్ చేయండి",
    chat_placeholder: "మొక్కల సంరక్షణ గురించి డాక్టర్ AIని అడగండి...",
    market_outlook: "మార్కెట్ దృక్పథం",
    soil_recovery: "నేల రికవరీ",
    search_placeholder: "విజ్ఞాన సర్వస్వంలో పంటలను శోధించండి...",
    awaiting_specimen: "నమూనా కోసం వేచి ఉంది",
    awaiting_desc: "వివరణాత్మక AI విశ్లేషణ కోసం ప్రభావిత మొక్క ఆకు ఫోటోను అప్‌లోడ్ చేయండి.",
    analyzing: "నమూనాను విశ్లేషిస్తోంది...",
    analyzing_desc: "వ్యాధికారక గుర్తింపు మరియు నేల సంశ్లేషణతో కూడిన విశ్లేషణ జరుగుతోంది.",
    prec_rotation: "ప్రెసిషన్ రొటేషన్ ఇంజిన్",
    rotation_desc: "నేల రికవరీ డేటాసెట్ల ఆధారంగా శాస్త్రీయ జత చేయడం.",
    kaggle_grounded: "కాగిల్-ఆధారిత",
    recommended_next: "సిఫార్సు చేయబడిన తదుపరి పంట",
    growth_cycle: "పెరుగుదల చక్రం",
    scientific_name: "శాస్త్రీయ నామం",
    ideal_soil: "ఆదర్శ నేల",
    optimal_harvest: "సరైన పంట కాలం",
    cost_estimates: "ఖర్చు అంచనాలు",
    cost_desc: "అవసరమైన పరిమాణాల ఆధారంగా స్థానిక కరెన్సీలో ధరలు.",
    total_cost: "అంచనా మొత్తం",
    composition: "మిశ్రమ విశ్లేషణ",
    health_score: "ఆరోగ్య స్కోరు",
    infection_detected: "ఇన్ఫెక్షన్ గుర్తించబడింది",
    preventive_measures: "నివారణ చర్యలు",
    rate_accuracy: "ఖచ్చితత్వాన్ని రేట్ చేయండి",
    fix_id: "తప్పుడు గుర్తింపును సరిచేయండి",
    doctor_chat_prompt: "ఈ రోజు నేను మీ పొలానికి ఎలా సహాయం చేయగలను?",
    active_expert: "యాక్టివ్ • నిపుణుల స్పందన",
  },
  Marathi: {
    app_title: "बोटॅनिका",
    analyze: "विश्लेषण",
    encyclopedia: "विश्वकोश",
    history: "इतिहास",
    doctor_ai: "डॉक्टर एआय",
    upload_title: "प्रतिमा अपलोड करा",
    upload_desc: "बॅच विश्लेषणासाठी 5 प्रतिमा.",
    btn_analyze: "नमुन्यांचे विश्लेषण करा",
    btn_detect: "ओळखा",
    local_trends: "स्थानिक ट्रेंड",
    fetching: "शोधत आहे...",
    weather_temp: "तापमान",
    weather_hum: "आद्रता",
    tab_diagnosis: "निदान",
    tab_soil: "माती",
    tab_fertilizer: "खते",
    tab_recs: "शिफारसी",
    buy_now: "आता खरेदी करा",
    download_report: "अहवाल डाउनलोड करा",
    reset_panel: "पॅनेल रिसेट करा",
    chat_placeholder: "रोपांच्या काळजीबद्दल डॉक्टर एआयला विचारा...",
    market_outlook: "बाजारपेठ दृष्टीकोन",
    soil_recovery: "मातीची सुधारणा",
    search_placeholder: "विश्वकोशात पिके शोधा...",
    awaiting_specimen: "नमुन्याची प्रतीक्षा आहे",
    awaiting_desc: "तपशीलवार एआय निदानासाठी बाधित वनस्पतीच्या पानाचा स्पष्ट फोटो अपलोड करा.",
    analyzing: "नमुन्याचे विश्लेषण करत आहे...",
    analyzing_desc: "पॅथोजेन ओळख आणि माती संश्लेषणासह बहु-घटक निदान सुरू आहे.",
    prec_rotation: "प्रिसिजन रोटेशन इंजिन",
    rotation_desc: "माती सुधारणा डेटासेटवर आधारित वैज्ञानिक जोडी.",
    kaggle_grounded: "कॅगल-आधारित",
    recommended_next: "शिफारस केलेले पुढील पीक",
    growth_cycle: "वाढ चक्र",
    scientific_name: "वैज्ञानिक नाव",
    ideal_soil: "आदर्श माती",
    optimal_harvest: "योग्य कापणी वेळ",
    cost_estimates: "लागत अंदाज",
    cost_desc: "आवश्यकतेनुसार स्थानिक चलनात नमुना किंमत.",
    total_cost: "अंदाजे एकूण",
    composition: "रचना विश्लेषण",
    health_score: "आरोग्य स्कोअर",
    infection_detected: "संक्रमण आढळले",
    preventive_measures: "प्रतिबंधात्मक उपाय",
    rate_accuracy: "अचूकता रेटिंग द्या",
    fix_id: "चुकीची ओळख दुरुस्त करा",
    doctor_chat_prompt: "आज मी तुमच्या शेतासाठी कशी मदत करू शकतो?",
    active_expert: "सक्रिय • तज्ञ प्रतिसाद",
  },
  Punjabi: {
    app_title: "ਬੋਟਾਨਿਕਾ",
    analyze: "ਵਿਸ਼ਲੇਸ਼ਣ",
    encyclopedia: "ਵਿਸ਼ਵਕੋਸ਼",
    history: "ਇਤਿਹਾਸ",
    doctor_ai: "ਡਾਕਟਰ AI",
    upload_title: "ਤਸਵੀਰਾਂ ਅਪਲੋਡ ਕਰੋ",
    upload_desc: "ਬੈਚ ਵਿਸ਼ਲੇਸ਼ਣ ਲਈ 5 ਤਸਵੀਰਾਂ।",
    btn_analyze: "ਨਮੂਨਿਆਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
    btn_detect: "ਪਤਾ ਲਗਾਓ",
    local_trends: "ਸਥਾਨਕ ਰੁਝਾਨ",
    fetching: "ਲੱਭ ਰਿਹਾ ਹੈ...",
    weather_temp: "ਤਾਪਮਾਨ",
    weather_hum: "ਨਮੀ",
    tab_diagnosis: "ਨਿਦਾਨ",
    tab_soil: "ਮਿੱਟੀ",
    tab_fertilizer: "ਖਾਦ",
    tab_recs: "ਸਿਫ਼ਾਰਸ਼ਾਂ",
    buy_now: "ਹੁਣੇ ਖਰੀਦੋ",
    download_report: "ਰਿਪੋਰਟ ਡਾਊਨਲੋਡ ਕਰੋ",
    reset_panel: "ਪੈਨਲ ਰੀਸੈਟ ਕਰੋ",
    chat_placeholder: "ਪੌਦਿਆਂ ਦੀ ਦੇਖਭਾਲ ਬਾਰੇ ਡਾਕਟਰ AI ਨੂੰ ਪੁੱਛੋ...",
    market_outlook: "ਬਜ਼ਾਰ ਦਾ ਨਜ਼ਰੀਆ",
    soil_recovery: "ਮਿੱਟੀ ਦੀ ਰਿਕਵਰੀ",
    search_placeholder: "ਵਿਸ਼ਵਕੋਸ਼ ਵਿੱਚ ਫਸਲਾਂ ਦੀ ਖੋਜ ਕਰੋ...",
    awaiting_specimen: "ਨਮੂਨੇ ਦੀ ਉਡੀਕ ਹੈ",
    awaiting_desc: "ਵਿਸਤ੍ਰਿਤ AI ਨਿਦਾਨ ਲਈ ਪ੍ਰਭਾਵਿਤ ਪੌਦੇ ਦੇ ਪੱਤੇ ਦੀ ਸਪੱਸ਼ਟ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ।",
    analyzing: "ਨਮੂਨੇ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
    analyzing_desc: "ਰੋਗਾਣੂਆਂ ਦੀ ਪਛਾਣ ਅਤੇ ਮਿੱਟੀ ਦੇ ਸੰਸਲੇਸ਼ਣ ਸਮੇਤ ਮਲਟੀ-ਫੈਕਟਰ ਨਿਦਾਨ ਜਾਰੀ ਹੈ।",
    prec_rotation: "ਪ੍ਰਿਸਿਜ਼ਨ ਰੋਟੇਸ਼ਨ ਇੰਜਨ",
    rotation_desc: "ਮਿੱਟੀ ਦੀ ਰਿਕਵਰੀ ਡੇਟਾਸੈਟਾਂ 'ਤੇ ਅਧਾਰਤ ਵਿਗਿਆਨਕ ਜੋੜੀ।",
    kaggle_grounded: "ਕੈਗਲ-ਅਧਾਰਿਤ",
    recommended_next: "ਸਿਫਾਰਸ਼ੀ ਅਗਲੀ ਫਸਲ",
    growth_cycle: "ਵਿਕਾਸ ਚੱਕਰ",
    scientific_name: "ਵਿਗਿਆਨਕ ਨਾਮ",
    ideal_soil: "ਆਦਰਸ਼ ਮਿੱਟੀ",
    optimal_harvest: "ਸਰਵੋਤਮ ਵਾਢੀ",
    cost_estimates: "ਲਾਗਤ ਅਨੁਮਾਨ",
    cost_desc: "ਲੋੜੀਂਦੀ ਮਾਤਰਾ ਦੇ ਅਧਾਰ 'ਤੇ ਸਥਾਨਕ ਮੁਦਰਾ ਵਿੱਚ ਨਮੂਨਾ ਕੀਮਤ।",
    total_cost: "ਅੰਦਾਜ਼ਨ ਕੁੱਲ",
    composition: "ਬਣਤਰ ਵਿਸ਼ਲੇਸ਼ਣ",
    health_score: "ਸਿਹਤ ਸਕੋਰ",
    infection_detected: "ਇਨਫੈਕਸ਼ਨ ਦਾ ਪਤਾ ਲੱਗਿਆ",
    preventive_measures: "ਨਿਵਾਰਕ ਉਪਾਅ",
    rate_accuracy: "ਸ਼ੁੱਧਤਾ ਦਰਜਾ ਦਿਓ",
    fix_id: "ਗਲਤ ਪਛਾਣ ਠੀਕ ਕਰੋ",
    doctor_chat_prompt: "ਅੱਜ ਮੈਂ ਤੁਹਾਡੇ ਖੇਤ ਦੀ ਕੀ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?",
    active_expert: "ਸਰਗਰਮ • ਮਾਹਰ ਜਵਾਬ",
  }
};

// Backend API Configuration
const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3004';

// --- Type Definitions ---
interface CropAnalysis {
  plantName?: string;
  diseaseResult: string;
  solution: string;
  preventiveMeasures: string[];
  soilFertility: {
    pH: string;
    nitrogen: string;
    phosphorus: string;
    potassium: string;
    soilType: string;
  };
  fertilizerCost: {
    urea: string;
    dap: string;
    mop: string;
    totalCost: string;
  };
  nextCropRecommendation: string;
}

interface HistoryItem {
  id: string;
  timestamp: number;
  image: string; // Base64 data URL
  analysis: CropAnalysis;
  feedback?: { rating: number; comment: string };
  correction?: { correctDisease: string; notes: string };
}

interface EncyclopediaEntry {
  cropName: string;
  scientificName: string;
  growthCycle: string;
  commonDiseases: string[];
  idealSoil: string;
  optimalHarvest: string;
  description: string;
}

interface LocalAlert {
  region: string;
  alerts: string[];
  weather?: {
    temp: string;
    humidity: string;
    condition: string;
  };
}

export default function App() {
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CropAnalysis | null>(null);
  const [progress, setProgress] = useState(0);
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // Navigation & States
  type ViewMode = 'analyze' | 'encyclopedia' | 'history' | 'chat' | 'field';
  const [viewMode, setViewMode] = useState<ViewMode>('analyze');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{latitude: number, longitude: number} | null>(null);
  const [activeTab, setActiveTab] = useState<'Diagnosis' | 'Soil' | 'Fertilizer' | 'Recommendations'>('Diagnosis');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const t = TRANSLATIONS[selectedLanguage] || TRANSLATIONS.English;

  // Chatbot states
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([
    { role: 'ai', content: 'Hello! I am Doctor AI, your personal agricultural expert. How can I help you with your plants today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  // Encyclopedia states
  const [encSearch, setEncSearch] = useState('');
  const [encResult, setEncResult] = useState<EncyclopediaEntry | null>(null);
  const [isEncSearching, setIsEncSearching] = useState(false);

  // Geo Alerts states
  const [localAlerts, setLocalAlerts] = useState<LocalAlert | null>(null);
  const [isFetchingAlerts, setIsFetchingAlerts] = useState(false);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Compare states
  const [showCompare, setShowCompare] = useState(false);
  const [compareId, setCompareId] = useState<string>('');

  // Form states
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [correctionDisease, setCorrectionDisease] = useState('');
  const [correctionNotes, setCorrectionNotes] = useState('');
  const [marketPrice, setMarketPrice] = useState<{price: string, market: string, isSimulated: boolean} | null>(null);
  const [trackingFrom, setTrackingFrom] = useState<HistoryItem | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  // App Initial Load Simulation
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAppLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Load History from Local Storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('botanica_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch (e) {
      console.warn('Could not read history', e);
    }
  }, []);

  const updateHistory = (newHistory: HistoryItem[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('botanica_history', JSON.stringify(newHistory.slice(0, 10)));
    } catch (e) {
      console.warn('Storage quota exceeded, keeping in memory', e);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setImageFiles(acceptedFiles);
      setImagePreviewUrls(acceptedFiles.map(file => URL.createObjectURL(file)));
      setAnalysisResult(null); 
      setShowFeedback(false);
      setShowCorrection(false);
      setCurrentId(null);
      setActiveTab('Diagnosis');
    }
  }, []);

  const dropzoneOptions = {
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
    maxFiles: 5,
    maxSize: 10485760, // 10MB
  };

  // @ts-expect-error react-dropzone types mismatch with React 19
  const { getRootProps, getInputProps, isDragActive } = useDropzone(dropzoneOptions);

  const clearImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setImageFiles([]);
    setImagePreviewUrls([]);
    setAnalysisResult(null);
    setCurrentId(null);
    setProgress(0);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast.error("Could not access camera");
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setImageFiles(prev => [...prev, file].slice(0, 5));
            setImagePreviewUrls(prev => [...prev, URL.createObjectURL(file)].slice(0, 5));
            stopCamera();
          }
        }, 'image/jpeg');
      }
    }
  };

  const handleAnalyze = async () => {
    if (imageFiles.length === 0) {
        toast.error('Please upload an image first.');
        return;
    }
    setIsAnalyzing(true);
    setProgress(0);
    setActiveTab('Diagnosis');
    
    // Simulate Progress updates
    const interval = setInterval(() => {
      setProgress(p => {
        const next = p + Math.random() * 15;
        return next > 95 ? 95 : next;
      });
    }, 400);

    try {
        const imagesData = await Promise.all(imageFiles.map(async (file) => {
            const base64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => {
                    const b64 = reader.result?.toString().split(',')[1];
                    if (b64) resolve(b64);
                    else reject(new Error('Failed to extract base64'));
                };
                reader.onerror = reject;
            });
            return { data: base64, mimeType: file.type };
        }));

        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                images: imagesData, 
                language: selectedLanguage,
                historyContext: trackingFrom ? {
                    previousDisease: trackingFrom.analysis.diseaseResult,
                    previousSolution: trackingFrom.analysis.solution,
                    previousImage: trackingFrom.image
                } : null
            })
        });

        const responseData = await response.json();
        
        const result = responseData as CropAnalysis;
        
        // Basic validation to ensure we have required fields
        if (!result.diseaseResult || !result.solution) {
            throw new Error('Received incomplete data from analysis engine.');
        }

        clearInterval(interval);
        setProgress(100);

        setTimeout(() => {
           setAnalysisResult(result);
           setIsAnalyzing(false);
           
           const id = Date.now().toString();
           setCurrentId(id);
           
           // Store a smaller thumb for history
           const historyThumb = imagePreviewUrls[0];
           
           const newItem: HistoryItem = {
             id,
             timestamp: Date.now(),
             image: historyThumb,
             analysis: result
           };
           updateHistory([newItem, ...history]);
           
           if (result.nextCropRecommendation) {
               fetchMarketData(result.nextCropRecommendation);
           }
           
           if (result.diseaseResult.includes("Simulated")) {
               toast.info('AI is busy. Showing predicted analysis.', { duration: 5000 });
           } else {
               toast.success(trackingFrom ? 'Progress tracking complete!' : 'Analysis complete!');
           }
           setTrackingFrom(null); // Reset tracking
        }, 600);

    } catch (error: any) {
        clearInterval(interval);
        setIsAnalyzing(false);
        console.error('Analysis error:', error);
        toast.error(error.message || 'Failed to analyze the image. Please try again.');
    }
  };

  const handleEncyclopediaSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encSearch.trim()) return;
    setIsEncSearching(true);
    setEncResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/encyclopedia`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            query: encSearch,
            language: selectedLanguage
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Encyclopedia search failed');
      setEncResult(data);
    } catch (err: any) {
      toast.error(err.message || 'Failed to search encyclopedia.');
    } finally {
      setIsEncSearching(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatting) return;

    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatting(true);

    try {
      const history = chatMessages
        .filter((_, i) => i > 0 || chatMessages[0].role === 'user')
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }]
        }));

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          history,
          language: selectedLanguage 
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Chat failed');
      setChatMessages(prev => [...prev, { role: 'ai', content: data.response }]);
    } catch (err: any) {
      toast.error(err.message || 'Doctor AI is unavailable right now.');
    } finally {
      setIsChatting(false);
    }
  };

  const fetchAlertsForCoords = async (latitude: number, longitude: number) => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/alerts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ latitude, longitude, language: selectedLanguage })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Alerts fetch failed');
        setLocalAlerts(data);
        toast.success("Local alerts updated successfully.");
    } catch (e: any) {
        toast.error(e.message || "Failed to fetch local trends.");
    } finally {
        setIsFetchingAlerts(false);
    }
  };

  const fetchMarketData = async (cropName: string) => {
    try {
        // Clean up crop name (remove reason text if present)
        const cleanName = cropName.split('(')[0].trim();
        const response = await fetch(`${API_BASE_URL}/api/market`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commodity: cleanName })
        });
        const data = await response.json();
        if (response.ok) {
            setMarketPrice(data);
        }
    } catch (e) {
        console.warn('Failed to fetch market data', e);
    }
  };

  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
        toast.error("Voice recognition not supported in this browser.");
        return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.lang = selectedLanguage === 'Hindi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = () => setIsRecording(false);
    
    recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        setChatInput(text);
        toast.success("Speech captured!");
    };

    recognition.start();
  };

  const requestLocationAndAlerts = () => {
    setIsFetchingAlerts(true);
    
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported.");
      setIsFetchingAlerts(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        fetchAlertsForCoords(position.coords.latitude, position.coords.longitude);
      }, 
      () => {
        setIsFetchingAlerts(false);
        toast.error("Location access denied.");
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
    );
  };

  const calculateSoilScore = (s: CropAnalysis['soilFertility']) => {
    let score = 0;
    if (s.pH.includes('6') || s.pH.includes('7.0') || s.pH.includes('6.5') || s.pH.includes('7.5')) score += 25; else if (s.pH) score += 15;
    
    const evaluate = (val: string) => {
       const lower = val.toLowerCase();
       if (lower.includes('high')) return 25;
       if (lower.includes('medium') || lower.includes('adequate') || lower.includes('optimal')) return 20;
       if (lower.includes('low')) return 5;
       return 15; 
    }
    score += evaluate(s.nitrogen) || 10;
    score += evaluate(s.phosphorus) || 10;
    score += evaluate(s.potassium) || 10;
    
    return Math.min(100, Math.max(0, score));
  };

  const getSoilScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 border-green-200 bg-green-50';
    if (score >= 50) return 'text-yellow-600 border-yellow-200 bg-yellow-50';
    return 'text-red-500 border-red-200 bg-red-50';
  };

  const submitFeedback = () => {
    if (!currentId) return;
    const itemIndex = history.findIndex(h => h.id === currentId);
    if (itemIndex > -1) {
      const newHistory = [...history];
      newHistory[itemIndex].feedback = { rating, comment };
      updateHistory(newHistory);
      toast.success('Feedback saved! Thank you.');
      setShowFeedback(false);
    }
  };

  const submitCorrection = () => {
    if (!currentId) return;
    const itemIndex = history.findIndex(h => h.id === currentId);
    if (itemIndex > -1) {
      const newHistory = [...history];
      newHistory[itemIndex].correction = { correctDisease: correctionDisease, notes: correctionNotes };
      updateHistory(newHistory);
      toast.success('Correction recorded. We will use this to improve.');
      setShowCorrection(false);
    }
  };

  const handleShare = () => {
    if (!analysisResult) return;
    const shareText = `Botanica Pathogen Analysis\nResult: ${analysisResult.diseaseResult}\nSolution: ${analysisResult.solution}\nNext Crop Rec: ${analysisResult.nextCropRecommendation}\n\nTracked via Botanica Web Dashboard.`;
    navigator.clipboard.writeText(shareText);
    toast.success("Analysis copied to clipboard!");
  };

  const comparisonTarget = compareId ? history.find(h => h.id === compareId) : null;

  return (
    <div className="min-h-screen p-4 sm:p-8 selection:bg-leaf/20 relative">
      {/* Nature Background Layer */}
      <div 
        className="fixed inset-0 z-[-1] bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ 
          backgroundImage: "url('/nature_bg.png')",
          backgroundColor: "#F8F9F5"
        }}
      >
        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]"></div>
      </div>
      
      <Toaster position="top-center" />
      
      {/* Header & Navigation */}
      <header className="flex flex-col items-center justify-center mb-6 sm:mb-8 gap-2 relative max-w-[1600px] mx-auto">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-1 sm:mb-2 text-leaf border border-soft">
          <Sprout className="w-6 h-6 sm:w-8 sm:h-8 text-leaf" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="serif text-2xl sm:text-4xl font-semibold tracking-wide text-leaf">{t.app_title}</motion.h1>
        
        <div className="mt-2 sm:mt-0 sm:absolute sm:top-0 sm:right-0 flex items-center gap-3">
          <select 
            value={selectedLanguage} 
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-white border border-stone-200 text-xs font-bold rounded-full px-3 sm:px-4 py-2 outline-none shadow-sm hover:border-leaf transition-all cursor-pointer appearance-none pr-8 sm:pr-10 relative bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%233A5A40%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C/polyline%3E%3C/svg%3E')] bg-[length:14px_14px] bg-[right_10px_center] bg-no-repeat ring-leaf/20 focus:ring-4"
          >
            <option value="English">English</option>
            <option value="Hindi">हिन्दी (Hindi)</option>
            <option value="Telugu">తెలుగు (Telugu)</option>
            <option value="Marathi">मराठी (Marathi)</option>
            <option value="Punjabi">ਪੰਜਾਬੀ (Punjabi)</option>
          </select>
        </div>

        <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 bg-white/60 p-1 sm:p-1.5 rounded-2xl sm:rounded-full border border-stone-200 shadow-sm backdrop-blur w-full sm:w-auto">
           <button onClick={() => setViewMode('analyze')} className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all ${viewMode === 'analyze' ? 'bg-leaf text-white shadow-md' : 'text-stone-500 hover:bg-white'}`}>
             <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-0.5 sm:mr-1" /> {t.analyze}
           </button>
           <button onClick={() => setViewMode('encyclopedia')} className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all ${viewMode === 'encyclopedia' ? 'bg-leaf text-white shadow-md' : 'text-stone-500 hover:bg-white'}`}>
             <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-0.5 sm:mr-1" /> {t.encyclopedia}
           </button>
           <button onClick={() => setViewMode('history')} className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all ${viewMode === 'history' ? 'bg-leaf text-white shadow-md' : 'text-stone-500 hover:bg-white'}`}>
             <History className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-0.5 sm:mr-1" /> {t.history}
           </button>
           <button onClick={() => setViewMode('chat')} className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all ${viewMode === 'chat' ? 'bg-leaf text-white shadow-md' : 'text-stone-500 hover:bg-white'}`}>
             <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-0.5 sm:mr-1" /> {t.doctor_ai}
           </button>
           <button onClick={() => setViewMode('field')} className={`px-3 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all ${viewMode === 'field' ? 'bg-amber-600 text-white shadow-md' : 'text-stone-500 hover:bg-white'}`}>
             <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline mr-0.5 sm:mr-1" /> Field Hub
           </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        
        {/* ENCYCLOPEDIA VIEW */}
        {viewMode === 'encyclopedia' && (
           <motion.div key="encyclopedia-view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-[1600px] mx-auto flex flex-col gap-6">
              <div className="glass-card p-8 rounded-[2rem] shadow-sm relative overflow-hidden text-center">
                  <h2 className="serif text-3xl font-semibold text-stone-800 mb-2 mt-4">{t.encyclopedia}</h2>
                  <p className="text-stone-500 mb-8 max-w-lg mx-auto">{t.search_placeholder}</p>
                  
                  <form onSubmit={handleEncyclopediaSearch} className="flex gap-2 max-w-xl mx-auto relative z-10">
                    <div className="relative flex-1">
                       <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                       <input 
                          value={encSearch} onChange={e => setEncSearch(e.target.value)}
                          placeholder={t.search_placeholder} 
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-stone-200 shadow-inner outline-none focus:border-leaf font-sans text-lg bg-white bg-opacity-90 transition-colors"
                       />
                    </div>
                    <Button type="submit" disabled={isEncSearching} className="h-auto px-8 rounded-2xl bg-leaf hover:bg-leaf/90 shadow-lg text-lg">
                       {isEncSearching ? <span className="animate-spin w-5 h-5 border-2 border-white/60 border-t-white rounded-full" /> : t.analyze}
                    </Button>
                  </form>
              </div>

              {encResult && !isEncSearching && (
                 <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm flex flex-col gap-6 relative">
                    <div className="flex flex-col lg:flex-row gap-8">
                             {/* Crop Image */}
                             <div className="w-full lg:w-1/3 aspect-square rounded-[2rem] overflow-hidden shadow-lg border-4 border-white">
                                <img 
                                   src={`https://loremflickr.com/800/800/agriculture,${encResult.cropName.replace(/\s+/g, '')}`} 
                                   alt={encResult.cropName} 
                                   className="w-full h-full object-cover"
                                   onError={(e) => {
                                      (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?q=80&w=800&auto=format&fit=crop";
                                   }}
                                />
                             </div>
                       
                       <div className="flex-1">
                          <h3 className="serif text-4xl font-bold text-leaf mb-2">{encResult.cropName}</h3>
                          <p className="font-mono text-sm uppercase tracking-widest text-stone-400 bg-stone-50 inline-block px-3 py-1 rounded w-max mb-4">{encResult.scientificName}</p>
                          <p className="text-stone-700 leading-relaxed text-lg border-l-4 border-leaf/30 pl-4">{encResult.description}</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                          <h4 className="text-[10px] uppercase font-bold text-stone-400 mb-2 tracking-wider"><Lightbulb className="w-3 h-3 inline mr-1"/> {t.growth_cycle}</h4>
                          <p className="text-stone-800 font-medium leading-snug">{encResult.growthCycle}</p>
                       </div>
                       <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                          <h4 className="text-[10px] uppercase font-bold text-stone-400 mb-2 tracking-wider"><AlertTriangle className="w-3 h-3 inline mr-1"/> Common Diseases</h4>
                          <ul className="text-stone-800 font-medium leading-snug list-disc pl-4 space-y-1">
                             {encResult.commonDiseases.map((d, i) => <li key={i}>{d}</li>)}
                          </ul>
                       </div>
                       <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                          <h4 className="text-[10px] uppercase font-bold text-stone-400 mb-2 tracking-wider"><Thermometer className="w-3 h-3 inline mr-1"/> {t.ideal_soil}</h4>
                          <p className="text-stone-800 font-medium leading-snug">{encResult.idealSoil}</p>
                       </div>
                       <div className="bg-stone-50 p-5 rounded-2xl border border-stone-100">
                          <h4 className="text-[10px] uppercase font-bold text-stone-400 mb-2 tracking-wider"><Sprout className="w-3 h-3 inline mr-1"/> {t.optimal_harvest}</h4>
                          <p className="text-stone-800 font-medium leading-snug">{encResult.optimalHarvest}</p>
                       </div>
                    </div>
                 </motion.div>
              )}
           </motion.div>
        )}


        {/* HISTORY VIEW */}
        {viewMode === 'history' && (
          <motion.div key="history-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-[1600px] mx-auto flex flex-col gap-6">
            <h2 className="serif text-3xl font-semibold text-leaf mb-4 border-b border-soft pb-4">{t.history}</h2>
            {history.length === 0 ? (
              <p className="text-stone-500 text-center py-20 italic">No past diagnoses found.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {history.map((item) => (
                  <motion.div 
                    key={item.id} 
                    whileHover={{ y: -4 }}
                    onClick={() => {
                        setAnalysisResult(item.analysis);
                        setImagePreviewUrls([item.image]);
                        setCurrentId(item.id);
                        setImageFiles([]);
                        setActiveTab('Diagnosis');
                        setViewMode('analyze');
                    }}
                    className="glass-card p-4 rounded-2xl cursor-pointer hover:border-leaf/30 transition-colors shadow-sm relative group bg-white/50 hover:bg-white"
                  >
                    <img src={item.image} alt={item.analysis.diseaseResult} className="w-full h-40 object-cover rounded-xl mb-4 border border-stone-200" />
                    <h3 className="serif text-xl font-medium line-clamp-1 text-stone-800">{item.analysis.diseaseResult}</h3>
                    <p className="text-xs text-stone-400 mt-1">{new Date(item.timestamp).toLocaleString()}</p>
                    <div className="flex gap-2 mt-3">
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                setTrackingFrom(item);
                                clearImage();
                                setViewMode('analyze');
                                toast.info(`Ready to track progress for: ${item.analysis.diseaseResult}. Upload a new photo.`);
                            }}
                            className="flex-1 py-2 bg-leaf/10 text-leaf text-[10px] font-bold uppercase rounded-lg hover:bg-leaf hover:text-white transition-all"
                        >
                            Track Progress
                        </button>
                    </div>
                    {item.correction && <Badge className="absolute top-2 right-2 bg-amber-100 text-amber-800 border-none shadow-sm">Corrected</Badge>}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ANALYZE VIEW */}
        {viewMode === 'analyze' && (
          <motion.div key="analyze-view" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="max-w-[1800px] mx-auto flex flex-col gap-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* LEFT COLUMN: Upload, Alerts, Weather */}
              <div className="col-span-1 lg:col-span-4 flex flex-col gap-6">
                
                {/* Geolocation Alerts Panel */}
                <div className="glass-card p-5 rounded-[2rem] shadow-sm border border-stone-200 bg-white/70">
                   <div className="flex justify-between items-center mb-3">
                     <h3 className="text-xs font-bold uppercase tracking-widest text-stone-600 flex items-center gap-1.5"><MapPin className="w-4 h-4 text-leaf"/> {t.local_trends}</h3>
                     {!localAlerts && (
                        <button onClick={requestLocationAndAlerts} disabled={isFetchingAlerts} className="text-[10px] bg-leaf/10 text-leaf hover:bg-leaf hover:text-white transition-colors px-3 py-1 rounded-full font-bold">
                           {isFetchingAlerts ? t.fetching : t.btn_detect}
                        </button>
                     )}
                   </div>
                   {localAlerts ? (
                      <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl">
                         <p className="text-xs text-red-500 font-bold mb-2">Region: <span className="font-medium text-stone-700">{localAlerts.region}</span></p>
                         <ul className="text-xs text-stone-700 max-w-[250px] leading-relaxed space-y-1">
                            {localAlerts.alerts.map((a, i) => <li key={i} className="flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0 text-red-400" /> {a}</li>)}
                         </ul>
                      </div>
                   ) : (
                      <p className="text-[11px] text-stone-400">Share location to receive real-time regional pest & disease outbreak telemetry.</p>
                   )}
                </div>

                {/* Upload panel */}
                <div className="glass-card p-6 rounded-[2rem] shadow-sm relative overflow-hidden border border-stone-200">
                   <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/leaf.png')] opacity-5 pointer-events-none"></div>
                   
                   <div className="flex items-center justify-between mb-6 relative z-10">
                     <h3 className="serif text-2xl font-semibold text-stone-800">{t.upload_title}</h3>
                     <div className="flex gap-2">
                        {trackingFrom && (
                            <Badge className="bg-amber-100 text-amber-800 border-none animate-pulse">
                                Tracking: {trackingFrom.analysis.diseaseResult}
                            </Badge>
                        )}
                        {imagePreviewUrls.length > 0 && !isAnalyzing && (
                            <button onClick={clearImage} className="text-[10px] uppercase font-bold text-stone-400 hover:text-red-500 tracking-wider transition-colors bg-stone-100 px-3 py-1 rounded-full">
                            {t.reset_panel}
                            </button>
                        )}
                      </div>
                   </div>

                    {/* Upload Area inner state */}
                    {imagePreviewUrls.length === 0 ? (
                       <div className="flex flex-col gap-4">
                          <div 
                            {...getRootProps()} 
                            className={`bg-white/50 rounded-2xl border-2 border-dashed relative flex flex-col items-center justify-center py-12 px-4 text-center cursor-pointer transition-colors
                              ${isDragActive ? 'border-leaf/50 bg-leaf/10' : 'border-stone-300 hover:border-leaf/40'}
                            `}
                          >
                            <input {...getInputProps()} />
                            <motion.div whileHover={{ scale: 1.1 }} className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-leaf">
                                <ImageIcon className="w-6 h-6" />
                            </motion.div>
                            <p className="serif text-lg font-medium text-stone-700 mb-1">{t.upload_title}</p>
                            <p className="text-[11px] text-stone-400 leading-relaxed px-2">{t.upload_desc}</p>
                          </div>
                          
                          <div className="flex items-center gap-4">
                             <div className="flex-1 h-px bg-stone-200"></div>
                             <span className="text-[10px] font-bold text-stone-300 uppercase tracking-tighter">OR</span>
                             <div className="flex-1 h-px bg-stone-200"></div>
                          </div>

                          <button 
                            onClick={startCamera}
                            className="w-full py-4 bg-white border border-stone-200 text-stone-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-50 transition-all shadow-sm"
                          >
                             <Camera className="w-5 h-5 text-leaf" /> Capture Live Photo
                          </button>
                       </div>
                    ) : (
                      <div className="flex flex-col gap-4 relative z-10">
                         <div className="grid grid-cols-2 gap-2">
                           {imagePreviewUrls.map((url, idx) => (
                             <div key={idx} className="rounded-xl overflow-hidden border border-stone-200 shadow-sm bg-white relative group">
                               <img src={url} alt={`Specimen ${idx}`} className={`w-full aspect-square object-cover transition-all duration-700 ${isAnalyzing ? 'scale-105 blur-[2px]' : ''}`} />
                               {idx === 0 && <span className="absolute top-1 left-1 bg-leaf text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">Main</span>}
                             </div>
                           ))}
                         </div>
                         
                         {!isAnalyzing && !analysisResult && (
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleAnalyze} 
                              className="w-full py-4 bg-leaf text-white rounded-2xl serif text-lg font-medium shadow-xl shadow-leaf/30 hover:bg-leaf/90 transition-colors flex items-center justify-center gap-2"
                            >
                              <Search className="w-5 h-5" /> {t.btn_analyze}
                            </motion.button>
                         )}
                      </div>
                   )}
                </div>

                {/* Weather Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <WeatherWidget 
                    icon={<Thermometer className="w-4 h-4 text-leaf opacity-80" />} 
                    label={t.weather_temp} 
                    value={localAlerts?.weather?.temp || "32 °C"} 
                  />
                  <WeatherWidget 
                    icon={<Droplets className="w-4 h-4 text-leaf opacity-80" />} 
                    label={t.weather_hum} 
                    value={localAlerts?.weather?.humidity || "73 %"} 
                  />
                </div>
              </div>


              {/* RIGHT COLUMN: Loading / Results */}
              <div className="col-span-1 lg:col-span-8 flex flex-col h-full min-h-[500px]">
                
                 {/* Empty State */}
                 {!isAnalyzing && !analysisResult && (
                    <div className="glass-card flex-1 rounded-[2rem] shadow-sm flex flex-col items-center justify-center p-12 text-center border border-dashed border-stone-300">
                      <Sprout className="w-16 h-16 text-stone-300 mb-4" />
                      <h3 className="serif text-2xl font-medium text-stone-500 mb-2">{t.awaiting_specimen}</h3>
                      <p className="text-sm text-stone-400 max-w-sm">{t.awaiting_desc}</p>
                    </div>
                 )}

                 {/* Analyzing State (Prominent Progress) */}
                 {isAnalyzing && (
                    <div className="glass-card flex-1 rounded-[2rem] shadow-sm flex flex-col items-center justify-center p-12 text-center relative overflow-hidden border border-leaf/20 bg-white/60">
                      <div className="absolute inset-0 bg-leaf/5"></div>
                      <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="relative z-10">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-soft mb-6">
                           <Search className="w-8 h-8 text-leaf animate-pulse" />
                        </div>
                      </motion.div>
                      
                      <h3 className="serif text-2xl font-medium text-leaf mb-2 relative z-10">{t.analyzing}</h3>
                      <p className="text-sm text-stone-500 mb-8 max-w-sm relative z-10">{t.analyzing_desc}</p>
                      
                      <div className="w-full max-w-md bg-stone-200 rounded-full h-3 overflow-hidden shadow-inner relative z-10">
                        <motion.div className="bg-leaf h-full rounded-full" initial={{ width: "0%" }} animate={{ width: `${progress}%` }} transition={{ ease: "easeInOut", duration: 0.5 }}/>
                      </div>
                      <p className="text-xs font-bold text-stone-400 mt-3 relative z-10 tracking-widest">{Math.round(progress)}% COMPLETE</p>
                    </div>
                 )}

                 {/* Results State (Tabbed Interface) */}
                 {!isAnalyzing && analysisResult && (
                    <motion.div key="results-panel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-card flex-1 rounded-[2rem] shadow-sm flex flex-col overflow-hidden bg-white/80 print-report">
                      
                      {/* Compare Image Modal */}
                      <AnimatePresence>
                         {showCompare && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute inset-0 bg-white/95 backdrop-blur-xl z-50 rounded-[2rem] flex flex-col shadow-2xl border border-stone-200 overflow-hidden">
                               <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                                  <h3 className="text-sm font-bold uppercase tracking-widest text-stone-700"><GitCompare className="w-4 h-4 inline mr-2"/> Compare Diagnostics</h3>
                                  <button onClick={() => setShowCompare(false)} className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-500 rounded-full transition-colors"><X className="w-5 h-5"/></button>
                               </div>
                               <div className="p-4 bg-stone-100 flex items-center justify-center border-b border-stone-200">
                                  <select 
                                     value={compareId} onChange={e => setCompareId(e.target.value)}
                                     className="max-w-md w-full p-3 rounded-xl border border-stone-300 shadow-sm outline-none font-medium text-sm text-stone-700 cursor-pointer bg-white"
                                  >
                                     <option value="" disabled>Select a history item to compare with...</option>
                                     {history.filter(h => h.id !== currentId).map(h => (
                                        <option key={h.id} value={h.id}>{new Date(h.timestamp).toLocaleDateString()} - {h.analysis.diseaseResult}</option>
                                     ))}
                                  </select>
                               </div>
                               
                               <div className="flex-1 flex overflow-y-auto">
                                  <div className="w-1/2 p-6 border-r border-stone-200 flex flex-col gap-4">
                                     <h4 className="font-bold text-stone-500 uppercase text-[10px] tracking-widest">Current Analyzed Specimen</h4>
                                     <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm"><img src={imagePreviewUrls[0]} className="w-full aspect-video object-cover"/></div>
                                     <h2 className="serif text-2xl font-bold text-stone-800">{analysisResult.diseaseResult}</h2>
                                     <p className="text-sm text-stone-600 leading-relaxed p-4 bg-leaf/5 rounded-xl border border-leaf/10">{analysisResult.solution}</p>
                                  </div>
                                  <div className="w-1/2 p-6 flex flex-col gap-4 bg-stone-50/50">
                                     <h4 className="font-bold text-stone-500 uppercase text-[10px] tracking-widest">Historical Specimen</h4>
                                     {comparisonTarget ? (
                                        <>
                                          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative grayscale-[20%]"><img src={comparisonTarget.image} className="w-full aspect-video object-cover"/></div>
                                          <h2 className="serif text-2xl font-bold text-stone-800">{comparisonTarget.analysis.diseaseResult}</h2>
                                          <p className="text-sm text-stone-600 leading-relaxed p-4 bg-stone-100 rounded-xl border border-stone-200">{comparisonTarget.analysis.solution}</p>
                                        </>
                                     ) : (
                                        <div className="h-full flex items-center justify-center text-stone-400 text-sm italic">Please select an item from the dropdown to display comparison.</div>
                                     )}
                                  </div>
                               </div>
                            </motion.div>
                         )}
                      </AnimatePresence>

                      <div className="p-8 pb-4">
                        <div className="flex justify-between items-start mb-6">
                           <div>
                             {analysisResult.diseaseResult !== "Healthy Corn" && !analysisResult.diseaseResult.toLowerCase().includes("healthy") && (
                                <span className="inline-block px-3 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2 border border-red-100">{t.infection_detected}</span>
                             )}
                               {analysisResult.plantName && (
                                <div className="flex items-center gap-2 mb-2">
                                    <Badge className="bg-leaf text-white border-none px-4 py-1.5 text-xs font-bold shadow-md uppercase tracking-widest">
                                        CROP: {analysisResult.plantName}
                                    </Badge>
                                    <span className="h-1.5 w-1.5 bg-stone-300 rounded-full"></span>
                                    <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider">Kaggle-Grounded Identification</span>
                                </div>
                              )}
                              <h2 className="serif text-5xl font-bold text-stone-800 tracking-tighter leading-tight mb-2">
                                {analysisResult.plantName ? `${analysisResult.plantName}: ` : ''}{analysisResult.diseaseResult}
                              </h2>
                           </div>
                           <div className="flex gap-2">
                             {history.filter(h => h.id !== currentId).length > 0 && (
                                <button onClick={() => setShowCompare(true)} className="flex items-center gap-1.5 px-3 py-2 bg-stone-100/80 hover:bg-white border border-stone-200 text-xs font-bold text-stone-500 rounded-full shadow-sm transition-all uppercase tracking-wider">
                                  <GitCompare className="w-3.5 h-3.5" /> Compare
                                </button>
                             )}
                             <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 bg-leaf/10 hover:bg-leaf hover:text-white border border-leaf/20 text-xs font-bold text-leaf rounded-full shadow-sm transition-all uppercase tracking-wider">
                                <CloudRain className="w-3.5 h-3.5" /> {t.download_report}
                             </button>
                             <button onClick={handleShare} className="p-2 bg-stone-100/80 border border-stone-200 hover:bg-leaf hover:border-leaf hover:text-white text-stone-500 rounded-full shadow-sm transition-all" title="Share Results">
                               <Share2 className="w-4 h-4" />
                             </button>
                           </div>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-2 border-b border-soft pb-3 overflow-x-auto hide-scrollbar">
                           {(['Diagnosis', 'Soil', 'Fertilizer', 'Recommendations'] as const).map(tab => (
                              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-all duration-300 ${activeTab === tab ? 'bg-leaf text-white shadow-md' : 'text-stone-500 hover:bg-leaf/10'}`}>
                                {t[`tab_${tab.toLowerCase().slice(0,4)}`] || tab}
                              </button>
                           ))}
                        </div>
                      </div>

                      {/* Tab Content Areas */}
                      <div className="p-8 pt-2 flex-1 bg-white/40">
                        <AnimatePresence mode="wait">
                           
                           {/* DIAGNOSIS TAB */}
                           {activeTab === 'Diagnosis' && (
                             <motion.div key="Diagnosis" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="flex flex-col gap-4">
                                <div className="bg-leaf/5 p-5 rounded-2xl border border-leaf/10 relative overflow-hidden">
                                   <div className="absolute top-0 right-0 w-24 h-24 bg-leaf/10 rounded-bl-full -z-10"></div>
                                   <h4 className="text-[10px] uppercase font-bold text-leaf/80 mb-2 tracking-wider flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Recommended Solution</h4>
                                   <p className="text-sm leading-relaxed text-stone-800 font-medium">{analysisResult.solution}</p>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                                   <h4 className="text-[10px] uppercase font-bold text-stone-500 mb-3 tracking-wider">{t.preventive_measures}</h4>
                                   <ul className="text-sm text-stone-600 space-y-3">
                                      {analysisResult.preventiveMeasures.map((measure, idx) => (
                                        <li key={idx} className="flex gap-3 items-start leading-relaxed"><span className="text-leaf mt-1">•</span> {measure}</li>
                                      ))}
                                   </ul>
                                </div>
                                
                                <div className="flex flex-wrap gap-3 mt-2">
                                  <button onClick={() => { setShowFeedback(!showFeedback); setShowCorrection(false); }} className={`text-xs flex items-center gap-2 px-4 py-2 rounded-full transition-colors border shadow-sm font-bold tracking-wide uppercase ${showFeedback ? 'bg-leaf text-white border-leaf' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                                      <Star className="w-3 h-3" /> {t.rate_accuracy}
                                  </button>
                                  <button onClick={() => { setShowCorrection(!showCorrection); setShowFeedback(false); }} className={`text-xs flex items-center gap-2 px-4 py-2 rounded-full transition-colors border shadow-sm font-bold tracking-wide uppercase ${showCorrection ? 'bg-amber-500 text-white border-amber-500' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                                      <AlertTriangle className="w-3 h-3" /> {t.fix_id}
                                  </button>
                                </div>
                                {/* Tool Forms */}
                                <AnimatePresence>
                                  {showFeedback && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm mt-2 space-y-3">
                                          <h5 className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">Provide Feedback</h5>
                                          <div className="flex gap-2">
                                            {[1,2,3,4,5].map(r => (
                                              <button key={r} onClick={() => setRating(r)} className={`p-2 rounded-lg transition-transform hover:scale-110 ${rating >= r ? 'text-yellow-500 bg-yellow-50' : 'text-stone-300 bg-stone-50'}`}>
                                                  <Star className="w-5 h-5 fill-current" />
                                              </button>
                                            ))}
                                          </div>
                                          <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Any comments on the diagnosis?" className="w-full text-sm p-3 rounded-lg border border-stone-200 bg-stone-50 resize-none outline-none focus:border-leaf/50" rows={2}/>
                                          <Button size="sm" onClick={submitFeedback} className="bg-leaf hover:bg-leaf/90 w-full"><CheckCircle2 className="w-4 h-4 mr-2"/> Submit Feedback</Button>
                                        </div>
                                    </motion.div>
                                  )}
                                  {showCorrection && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 shadow-sm mt-2 space-y-3">
                                          <h5 className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Fine-Tune AI Model</h5>
                                          <input value={correctionDisease} onChange={e => setCorrectionDisease(e.target.value)} placeholder="Correct Disease Name..." className="w-full text-sm p-3 rounded-lg border border-amber-200 bg-white outline-none focus:border-amber-400 font-sans" />
                                          <textarea value={correctionNotes} onChange={e => setCorrectionNotes(e.target.value)} placeholder="Why was this incorrect?" className="w-full text-sm p-3 rounded-lg border border-amber-200 bg-white resize-none outline-none focus:border-amber-400 font-sans" rows={2}/>
                                          <Button size="sm" onClick={submitCorrection} className="bg-amber-600 hover:bg-amber-700 w-full"><Send className="w-4 h-4 mr-2"/> Submit Correction</Button>
                                        </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                             </motion.div>
                           )}

                           {/* SOIL TAB */}
                           {activeTab === 'Soil' && (
                             <motion.div key="Soil" initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} className="h-full flex flex-col gap-4">
                                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm relative overflow-hidden">
                                   
                                   {/* Soil Score Indicator */}
                                   <div className="absolute top-6 right-6 flex flex-col items-center justify-center">
                                      <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-2xl border-4 ${getSoilScoreColor(calculateSoilScore(analysisResult.soilFertility))}`}>
                                         {calculateSoilScore(analysisResult.soilFertility)}
                                      </div>
                                      <span className="text-[9px] uppercase font-bold tracking-widest text-stone-400 mt-2">{t.health_score}</span>
                                   </div>

                                   <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100 pr-24">
                                      <div className="p-2 bg-stone-100 rounded-lg"><Thermometer className="w-5 h-5 text-stone-500" /></div>
                                      <div>
                                        <h4 className="text-sm font-bold text-stone-800">{t.composition}</h4>
                                        <p className="text-xs text-stone-400">Estimated ideal state for recovery</p>
                                      </div>
                                   </div>
                                   <div className="space-y-4">
                                      <div className="flex justify-between items-center"><span className="text-sm font-medium text-stone-600 flex items-center">pH Value <InfoTooltip text="Measures soil acidity or alkalinity. Crucial for nutrient availability."/></span> <Badge variant="outline" className="text-leaf bg-leaf/5">{analysisResult.soilFertility.pH}</Badge></div>
                                      <div className="flex justify-between items-center"><span className="text-sm font-medium text-stone-600 flex items-center">Nitrogen (N)</span> <span className="text-sm font-semibold text-stone-800">{analysisResult.soilFertility.nitrogen}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-sm font-medium text-stone-600 flex items-center">Phosphorus (P)</span> <span className="text-sm font-semibold text-stone-800">{analysisResult.soilFertility.phosphorus}</span></div>
                                      <div className="flex justify-between items-center"><span className="text-sm font-medium text-stone-600 flex items-center">Potassium (K)</span> <span className="text-sm font-semibold text-stone-800">{analysisResult.soilFertility.potassium}</span></div>
                                      
                                      <div className="mt-4 pt-4 border-t border-stone-100">
                                         <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-1">Recommended Soil Type</span>
                                         <span className="text-base serif font-medium text-stone-800">{analysisResult.soilFertility.soilType}</span>
                                      </div>
                                   </div>
                                </div>
                             </motion.div>
                           )}

                           {/* FERTILIZER TAB */}
                           {activeTab === 'Fertilizer' && (
                             <motion.div key="Fertilizer" initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} className="h-full flex flex-col gap-4">
                                <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col">
                                   <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100">
                                      <div className="p-2 bg-stone-100 rounded-lg"><IndianRupee className="w-5 h-5 text-stone-500" /></div>
                                      <div>
                                        <h4 className="text-sm font-bold text-stone-800">{t.cost_estimates}</h4>
                                        <p className="text-xs text-stone-400">{t.cost_desc}</p>
                                      </div>
                                   </div>
                                   <div className="space-y-6 flex-1">
                                      <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                                         <div className="flex flex-col">
                                            <span className="text-sm font-medium text-stone-700 flex items-center">Urea</span>
                                            <a href={`https://www.bighaat.com/search?q=Urea`} target="_blank" rel="noreferrer" className="text-[9px] text-leaf font-bold hover:underline">{t.buy_now} →</a>
                                         </div>
                                         <span className="text-sm font-mono font-semibold bg-white border border-stone-200 px-3 py-1 rounded text-stone-800">{analysisResult.fertilizerCost.urea}</span>
                                      </div>
                                      <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                                         <div className="flex flex-col">
                                            <span className="text-sm font-medium text-stone-700 flex items-center">DAP</span>
                                            <a href={`https://www.bighaat.com/search?q=DAP`} target="_blank" rel="noreferrer" className="text-[9px] text-leaf font-bold hover:underline">{t.buy_now} →</a>
                                         </div>
                                         <span className="text-sm font-mono font-semibold bg-white border border-stone-200 px-3 py-1 rounded text-stone-800">{analysisResult.fertilizerCost.dap}</span>
                                      </div>
                                      <div className="flex justify-between items-center bg-stone-50 p-3 rounded-xl border border-stone-100">
                                         <div className="flex flex-col">
                                            <span className="text-sm font-medium text-stone-700 flex items-center">MOP</span>
                                            <a href={`https://www.bighaat.com/search?q=MOP`} target="_blank" rel="noreferrer" className="text-[9px] text-leaf font-bold hover:underline">{t.buy_now} →</a>
                                         </div>
                                         <span className="text-sm font-mono font-semibold bg-white border border-stone-200 px-3 py-1 rounded text-stone-800">{analysisResult.fertilizerCost.mop}</span>
                                      </div>
                                   </div>
                                   <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-end">
                                      <div>
                                         <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">{t.total_cost}</span>
                                         <p className="text-2xl font-bold text-leaf serif">{analysisResult.fertilizerCost.totalCost}</p>
                                      </div>
                                   </div>
                                </div>
                             </motion.div>
                           )}

                           {/* RECOMMENDATIONS TAB */}
                           {activeTab === 'Recommendations' && (
                             <motion.div key="Recommendations" initial={{ opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -5 }} className="flex flex-col gap-6">
                                <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm relative overflow-hidden">
                                   <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100">
                                      <div className="p-2 bg-leaf/10 rounded-lg"><TrendingUp className="w-5 h-5 text-leaf" /></div>
                                      <div>
                                        <h4 className="text-sm font-bold text-stone-800">{t.prec_rotation}</h4>
                                        <p className="text-xs text-stone-400">{t.rotation_desc}</p>
                                      </div>
                                      <Badge className="ml-auto bg-leaf text-white border-none text-[8px] tracking-tighter shadow-sm">{t.kaggle_grounded}</Badge>
                                   </div>
                                   
                                   <div className="flex flex-col gap-6">
                                      <div className="p-5 bg-[#FDFDFD] rounded-2xl border border-stone-100 shadow-inner">
                                         <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block mb-2">{t.recommended_next}</span>
                                         <p className="text-3xl serif font-bold text-leaf">{analysisResult.nextCropRecommendation}</p>
                                         {marketPrice && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex items-center gap-2">
                                                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-100 font-mono">
                                                   LIVE MANDI: {marketPrice.price}
                                                </Badge>
                                                <span className="text-[10px] text-stone-400 italic">at {marketPrice.market}</span>
                                            </motion.div>
                                         )}
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                         <div className="p-5 border border-stone-100 rounded-2xl bg-white shadow-sm">
                                            <h5 className="text-[10px] uppercase font-bold text-stone-500 mb-2 flex items-center gap-1.5"><Activity className="w-3 h-3"/> {t.soil_recovery}</h5>
                                            <p className="text-xs text-stone-600 leading-relaxed">Dataset analysis confirms this crop restores Nitrogen levels depleted by the current pathogen.</p>
                                         </div>
                                         <div className="p-5 border border-leaf/10 rounded-2xl bg-leaf/[0.02] shadow-sm">
                                            <h5 className="text-[10px] uppercase font-bold text-leaf mb-2 flex items-center gap-1.5"><TrendingUp className="w-3 h-3"/> {t.market_outlook}</h5>
                                            <p className="text-xs text-stone-600 leading-relaxed">Mandi trends indicate high demand, offering higher profit margins.</p>
                                         </div>
                                      </div>
                                   </div>
                                </div>
                             </motion.div>
                           )}
                           
                        </AnimatePresence>
                      </div>
                    </motion.div>
                 )}
              </div>
            </div>
          </motion.div>
        )}

        {/* CHAT MODE */}
        {viewMode === 'chat' && (
           <motion.div key="chat-view" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="max-w-[1200px] mx-auto flex flex-col bg-white shadow-2xl rounded-[2rem] border border-stone-200 overflow-hidden h-[75vh] min-h-[500px]">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-white">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-leaf/10 rounded-full flex items-center justify-center text-leaf"><Activity className="w-6 h-6" /></div>
                    <div>
                       <h3 className="serif text-xl font-bold text-stone-800">{t.doctor_ai}</h3>
                       <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">{t.active_expert}</p>
                    </div>
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {chatMessages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-60 py-20">
                       <MessageSquare className="w-16 h-16 mb-4 text-leaf/40" />
                       <p className="serif text-xl font-medium text-stone-500 italic">"{t.doctor_chat_prompt}"</p>
                    </div>
                 )}
                 {chatMessages.map((msg, idx) => (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                       <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-leaf text-white rounded-tr-none' : 'bg-stone-50 text-stone-700 rounded-tl-none border border-stone-100'}`}>
                          {msg.content}
                       </div>
                    </motion.div>
                 ))}
                 {isChatting && (
                    <div className="flex justify-start">
                       <div className="bg-stone-50 px-4 py-3 rounded-2xl border border-stone-100 flex gap-1">
                          <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></div>
                          <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                       </div>
                    </div>
                 )}
              </div>
              
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-stone-100">
                 <div className="relative flex items-center gap-2">
                    <button 
                        type="button"
                        onClick={startSpeechRecognition}
                        className={`p-3 rounded-full transition-all flex-shrink-0 ${isRecording ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-stone-50 text-stone-400 hover:text-leaf hover:bg-stone-100'}`}
                    >
                        <Mic className="w-5 h-5" />
                    </button>
                    <div className="relative flex-1 flex items-center">
                        <input 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder={t.chat_placeholder}
                          className="w-full bg-stone-50 border-none rounded-full py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-leaf/20 outline-none transition-all shadow-inner"
                        />
                        <button type="submit" disabled={isChatting} className="absolute right-2 p-3 bg-leaf text-white rounded-full shadow-lg shadow-leaf/20 hover:scale-105 active:scale-95 transition-all">
                           <Send className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
              </form>
           </motion.div>
        )}

        {/* FIELD HUB MODE */}
        {viewMode === 'field' && (
          <motion.div key="field-view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="max-w-[1400px] mx-auto">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Satellite Overview */}
                <div className="lg:col-span-2 space-y-6">
                   <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/20">
                      <div className="flex items-center justify-between mb-8">
                         <div>
                            <h2 className="serif text-4xl font-bold text-stone-800 tracking-tight">Satellite Field Overview</h2>
                            <p className="text-stone-500 text-sm font-medium">Sentinel-2 NDVI Health Monitoring</p>
                         </div>
                         <div className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-100 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            Live Pass: Today
                         </div>
                      </div>
                      
                      <div className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white">
                         <img 
                            src="/ndvi_map.png" 
                            alt="NDVI Map" 
                            className="w-full h-full object-cover"
                         />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                         <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                            <div className="flex gap-4">
                               <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
                                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Health Index</p>
                                  <p className="text-white text-2xl font-bold">0.72 <span className="text-xs text-green-400 font-medium">Excellent</span></p>
                               </div>
                               <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20">
                                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-wider mb-1">Moisture</p>
                                  <p className="text-white text-2xl font-bold">84% <span className="text-xs text-blue-400 font-medium">Optimal</span></p>
                               </div>
                            </div>
                            <button className="bg-white text-stone-800 px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Download Report</button>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Environmental Alerts */}
                <div className="space-y-6">
                   <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl border border-white/20">
                      <div className="flex items-center gap-3 mb-8">
                         <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600"><AlertCircle className="w-6 h-6" /></div>
                         <div>
                            <h3 className="serif text-xl font-bold text-stone-800">Weather Risk Alerts</h3>
                            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest">Hyper-Local Intelligence</p>
                         </div>
                      </div>

                      <div className="space-y-4">
                         <div className="p-5 bg-red-50 rounded-3xl border border-red-100">
                            <div className="flex items-center justify-between mb-2">
                               <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[8px] font-black uppercase tracking-tighter rounded">High Risk</span>
                               <span className="text-[10px] text-red-400 font-bold">Next 48h</span>
                            </div>
                            <h4 className="font-bold text-stone-800 mb-1">Intense Heatwave Detected</h4>
                            <p className="text-xs text-stone-500 leading-relaxed">Temperature expected to reach 42°C. Increase irrigation frequency for all tomato and chilli plots.</p>
                         </div>

                         <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                               <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[8px] font-black uppercase tracking-tighter rounded">Moderate</span>
                               <span className="text-[10px] text-blue-400 font-bold">Thursday</span>
                            </div>
                            <h4 className="font-bold text-stone-800 mb-1">Unseasonal Rain Forecast</h4>
                            <p className="text-xs text-stone-500 leading-relaxed">Scattered showers expected. Delay any pesticide application until Friday morning.</p>
                         </div>
                      </div>
                      
                      <div className="mt-8 pt-8 border-t border-stone-100">
                         <div className="flex items-center justify-between mb-4">
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Environment Status</span>
                            <span className="text-xs font-bold text-stone-800">28°C / 65% Humidity</span>
                         </div>
                         <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-[60%]"></div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Camera Overlay - Moved outside main AnimatePresence to avoid mode="wait" conflicts */}
      <AnimatePresence>
        {showCamera && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-4">
             <div className="w-full max-w-2xl aspect-[3/4] bg-stone-900 rounded-3xl overflow-hidden relative shadow-2xl">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <div className="absolute inset-0 border-2 border-white/20 pointer-events-none rounded-3xl"></div>
                
                {/* Camera UI */}
                <div className="absolute bottom-8 left-0 right-0 flex items-center justify-around px-8">
                   <button onClick={stopCamera} className="p-4 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all">
                      <X className="w-6 h-6" />
                   </button>
                   <button onClick={capturePhoto} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all">
                      <div className="w-16 h-16 border-4 border-stone-200 rounded-full" />
                   </button>
                   <div className="w-14" /> {/* Spacer */}
                </div>
             </div>
             <p className="text-white/60 text-xs mt-6 uppercase tracking-widest font-bold">Align specimen within the frame</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Splash Screen Loader */}
      <AnimatePresence>
        {isAppLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[1000] bg-[#F8F9F5] flex flex-col items-center justify-center"
          >
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 1, ease: "easeOut" }}
               className="relative"
             >
                <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center border border-leaf/10">
                   <Sprout className="w-16 h-16 text-leaf" />
                </div>
                {/* Orbital Rings */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  className="absolute inset-[-20px] border-2 border-dashed border-leaf/20 rounded-full"
                />
                <motion.div 
                  animate={{ rotate: -360 }}
                  transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                  className="absolute inset-[-40px] border border-dotted border-leaf/10 rounded-full"
                />
             </motion.div>
             
             <motion.h2 
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.5, duration: 0.8 }}
               className="serif text-4xl font-bold text-leaf mt-12 tracking-widest"
             >
                BOTANICA
             </motion.h2>
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: 200 }}
               transition={{ delay: 1, duration: 1.5 }}
               className="h-[2px] bg-leaf/20 mt-4 overflow-hidden rounded-full"
             >
                <motion.div 
                  animate={{ x: [-200, 200] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-1/2 h-full bg-leaf rounded-full shadow-[0_0_10px_rgba(58,90,64,0.5)]"
                />
             </motion.div>
             <p className="text-[10px] font-bold text-stone-400 mt-6 uppercase tracking-[0.3em]">Precision Agriculture AI</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Helper Components ---
function WeatherWidget({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="glass-card flex flex-col items-center justify-center p-4 rounded-2xl shadow-sm border border-stone-200/50 bg-white/50 backdrop-blur-md">
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="text-leaf/60">{icon}</div>
        <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">{label}</span>
      </div>
      <span className="serif text-2xl font-medium text-stone-800">{value}</span>
    </motion.div>
  );
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex items-center ml-1.5 align-middle">
       <Info className="w-4 h-4 text-stone-300 hover:text-leaf cursor-help transition-colors" />
       
       <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-stone-900 text-stone-100 text-[12px] font-normal leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl text-center font-sans tracking-wide">
         {text}
         <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-stone-900"></div>
       </div>
    </div>
  );
}
