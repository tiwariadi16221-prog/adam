import dbConnect from '@/lib/mongodb';
import GlobalTest from '@/models/GlobalTest';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendLog = (type, message) => {
        const payload = JSON.stringify({ type, message });
        controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
      };

      try {
        sendLog('system', 'Starting AI Test Generation Process...');
        await dbConnect();
        sendLog('system', 'Connected to MongoDB.');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using gemini-3.5-flash-lite
        const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });

        const generateTopicQuestions = async (topic, count, type) => {
          sendLog('ai_start', `Prompting Gemini for ${count} ${type} questions on [${topic}]...`);
          
          const prompt = type === 'MCQ' 
            ? `Generate exactly ${count} multiple-choice questions about ${topic} for a software engineering interview. Return ONLY a JSON array of objects with this exact structure: [{"domain": "${topic}", "type": "MCQ", "questionText": "...", "options": ["A", "B", "C", "D"], "correctAnswer": "exact string from options", "difficulty": "Medium"}]`
            : `Generate exactly ${count} coding problems about ${topic} for a software engineering interview. Return ONLY a JSON array of objects with this exact structure: [{"domain": "${topic}", "type": "CODE", "questionText": "...", "testCases": [{"input": "...", "expectedOutput": "..."}], "difficulty": "Hard"}]`;
          
          try {
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let text = response.text();
            
            // Log a snippet of the AI's raw thought process/output
            sendLog('ai_response', `Received raw response from Gemini (First 100 chars): ${text.substring(0, 100).replace(/\n/g, '')}...`);
            
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(text);
            sendLog('success', `Successfully parsed ${parsed.length} questions for ${topic}.`);
            return parsed;
          } catch (e) {
            sendLog('error', `Gemini API failed for ${topic}: ${e.message}`);
            throw e;
          }
        };

        let allQuestions = [];
        try {
          const coding = await generateTopicQuestions('DSA', 5, 'CODE');
          const cn = await generateTopicQuestions('Computer Networks', 5, 'MCQ');
          const os = await generateTopicQuestions('Operating Systems', 5, 'MCQ');
          const dbms = await generateTopicQuestions('DBMS', 5, 'MCQ');
          const oops = await generateTopicQuestions('OOPs', 5, 'MCQ');
          const sysDesign = await generateTopicQuestions('System Design', 5, 'MCQ');
          
          allQuestions = [...coding, ...cn, ...os, ...dbms, ...oops, ...sysDesign];
        } catch (apiError) {
          sendLog('warning', 'CRITICAL API ERROR. Falling back to Mock Generator to prevent platform crash.');
          
          const mockMcq = (domain) => Array(5).fill(null).map((_, i) => ({
            domain, type: "MCQ", questionText: `Sample ${domain} Question ${i+1}?`,
            options: ["Option A", "Option B", "Option C", "Option D"], correctAnswer: "Option A", difficulty: "Medium"
          }));
          const mockCode = Array(5).fill(null).map((_, i) => ({
            domain: "DSA", type: "CODE", questionText: `Write a function to solve DSA problem ${i+1}.`,
            testCases: [{ input: "1", expectedOutput: "1" }], difficulty: "Hard"
          }));
          
          allQuestions = [...mockCode, ...mockMcq('Computer Networks'), ...mockMcq('Operating Systems'), ...mockMcq('DBMS'), ...mockMcq('OOPs'), ...mockMcq('System Design')];
          sendLog('system', 'Mock generation complete.');
        }

        sendLog('system', `Deactivating old tests...`);
        await GlobalTest.updateMany({ isActive: true }, { isActive: false });

        sendLog('system', `Saving ${allQuestions.length} questions to database...`);
        await GlobalTest.create({
          questions: allQuestions,
          isActive: true
        });

        sendLog('done', 'Test Generation Process Completed Successfully!');
      } catch (err) {
        sendLog('error', `Fatal Error: ${err.message}`);
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });
}
