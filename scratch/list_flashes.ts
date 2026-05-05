import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function list() {
  try {
    const result = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await result.json();
    if (data.models) {
        const flashes = data.models
            .filter((m: any) => m.name.includes('flash'))
            .map((m: any) => m.name);
        console.log("Flash models:", flashes);
    } else {
        console.log(data);
    }
  } catch (e) {
    console.error(e);
  }
}

list();
