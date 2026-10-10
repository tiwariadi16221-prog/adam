require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    const data = await response.json();
    console.log("Available models:");
    data.models.forEach(m => {
      console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(', ')})`);
    });
  } catch (e) {
    console.error("Failed to list models", e);
  }
}

listModels();
