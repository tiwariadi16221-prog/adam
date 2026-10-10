require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Generate a technical software engineering test for a final-year student targeting high-paying jobs.
    Return a raw JSON array of question objects (NO markdown wrappers, NO backticks).
    Generate 1 questions from 'DSA' (type CODE) and 1 from 'OS' (type MCQ).
    Structure for MCQ: { "domain": "OS", "type": "MCQ", "questionText": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "difficulty": "Medium" }
    Structure for CODE: { "domain": "DSA", "type": "CODE", "questionText": "Write a function...", "testCases": [{ "input": "...", "expectedOutput": "..." }], "difficulty": "Hard" }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text();
    console.log("Raw Response:");
    console.log(text);
    
    text = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    const json = JSON.parse(text);
    console.log("Successfully parsed JSON array with length:", json.length);
  } catch (error) {
    console.error("Test failed:", error);
  }
}
test();
