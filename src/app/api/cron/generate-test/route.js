import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dbConnect from '@/lib/mongodb';
import GlobalTest from '@/models/GlobalTest';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function GET(req) {
  // Cron jobs usually send a GET request
  // You might want to secure this with an Authorization header check in production
  
  try {
    await dbConnect();
    
    // Using gemini-3.5-flash-lite as explicitly recommended by the Google API
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

    // Function to generate questions for a specific topic to avoid token limits
    const generateTopicQuestions = async (topic, count, type) => {
      let codeStyleInstruction = '';
      if (type === 'CODE') {
        codeStyleInstruction = `For CODE questions, YOU MUST phrase them as HackerRank style problems reading from standard input.
      1. Make the first ${count - 1} questions short and direct (like LeetCode 75), but REPHRASED for stdin/stdout.
      2. The last 1 question MUST be a situation-based or story-based DSA question.
      3. The user must read from standard input (stdin) and print to standard output (stdout).
      4. Clearly specify 'Input Format', 'Output Format', and 'Constraints' in the questionText.
      5. CRITICAL: DO NOT use array syntax like \`nums = [1, 2, 3]\` in your testCases or examples. Inputs MUST be raw text, space-separated or newline-separated (e.g., \`3\\n1 2 3\`).
      6. DO NOT mention JSON. DO NOT ask the user to write a specific function.
      7. Add this exact line at the end of every questionText: 'Note: Read inputs from standard input (e.g., std::cin, Scanner, sys.stdin.read) and print to standard output.'
      
      Structure: [{ "domain": "${topic}", "type": "CODE", "questionText": "Problem description... \\n\\nInput Format:\\nThe first line contains N.\\nThe second line contains N space-separated integers.\\n\\nOutput Format:\\nPrint the indices space-separated. \\n\\nNote: Read inputs from standard input...", "testCases": [{ "input": "4\\n2 7 11 15", "expectedOutput": "0 1" }], "difficulty": "Hard" }]`;
      }

      const prompt = `Generate exactly ${count} ${type === 'CODE' ? 'coding questions' : 'multiple-choice questions (MCQ)'} for the topic '${topic}' suitable for a final-year software engineering student targeting high-paying jobs.
      Return a raw JSON array of question objects (NO markdown wrappers, NO backticks).
      ${type === 'CODE' 
        ? codeStyleInstruction
        : `Structure: [{ "domain": "${topic}", "type": "MCQ", "questionText": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "A", "difficulty": "Medium" }]`
      }
      Ensure the output is valid JSON.`;

      const result = await model.generateContent(prompt);
      let text = await result.response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(text);
    };

    // Run generations sequentially to avoid 503 High Demand / Rate Limits on the API
    let allQuestions = [];
    try {
      console.log("Generating DSA...");
      const coding = await generateTopicQuestions('DSA', 5, 'CODE');
      console.log("Generating CN...");
      const cn = await generateTopicQuestions('Computer Networks', 5, 'MCQ');
      console.log("Generating OS...");
      const os = await generateTopicQuestions('Operating Systems', 5, 'MCQ');
      console.log("Generating DBMS...");
      const dbms = await generateTopicQuestions('DBMS', 5, 'MCQ');
      console.log("Generating OOPs...");
      const oops = await generateTopicQuestions('OOPs', 5, 'MCQ');
      console.log("Generating System Design...");
      const sysDesign = await generateTopicQuestions('System Design', 5, 'MCQ');
      
      allQuestions = [...coding, ...cn, ...os, ...dbms, ...oops, ...sysDesign];
    } catch (apiError) {
      console.warn("API Generation failed (likely Quota Limit). Falling back to mock test data.", apiError.message);
      
      // Fallback Mock Data so the platform doesn't stay broken for 15 hours
      const mockMcq = (domain) => Array(5).fill(null).map((_, i) => ({
        domain, type: "MCQ", questionText: `Sample ${domain} Question ${i+1}?`,
        options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: "Option A", difficulty: "Medium"
      }));
      
      const mockCode = Array(5).fill(null).map((_, i) => ({
        domain: "DSA", type: "CODE", questionText: `Sample DSA problem ${i+1}\\n\\nInput Format:\\nA single integer.\\n\\nOutput Format:\\nPrint the integer.`,
        testCases: [{ input: "1", expectedOutput: "1" }], difficulty: "Hard"
      }));
      
      allQuestions = [...mockCode, ...mockMcq('Computer Networks'), ...mockMcq('Operating Systems'), ...mockMcq('DBMS'), ...mockMcq('OOPs'), ...mockMcq('System Design')];
    }

    // Deactivate previous global tests
    await GlobalTest.updateMany({ isActive: true }, { isActive: false });

    // Save new global test
    const newGlobalTest = await GlobalTest.create({
      isActive: true,
      questions: allQuestions
    });

    return NextResponse.json({ success: true, testId: newGlobalTest._id, totalQuestions: allQuestions.length });
  } catch (error) {
    console.error('Error generating global test:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate global test' }, { status: 500 });
  }
}
