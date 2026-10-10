"use client";
import { useEffect, useState, useRef, use } from "react";
import Editor from "@monaco-editor/react";
import { useRouter } from "next/navigation";

export default function TestScreen({ params }) {
  const unwrappedParams = use(params);
  const testId = unwrappedParams.id;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [warnings, setWarnings] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1 * 60 * 60); // 1 hour
  const containerRef = useRef(null);
  const router = useRouter();

  // Test Data State
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  
  // Answers state: index -> answer (string for MCQ options, string for Code)
  const [answers, setAnswers] = useState({});

  // Code Execution State
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);

  // Fetch test data on mount
  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`/api/test/${testId}`);
        const data = await res.json();
        if (data.test) {
          setTestData(data.test);
          
          // Initialize empty answers
          const initialAnswers = {};
          data.test.questions.forEach((q, idx) => {
            if (q.type === 'CODE') {
              initialAnswers[idx] = `// Write your ${q.domain} code here...`;
            }
          });
          setAnswers(initialAnswers);
        }
      } catch (err) {
        console.error("Failed to load test", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // Handle Fullscreen
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Tracking visibility and fullscreen exit
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isFullscreen) {
        setWarnings(w => w + 1);
        alert("Warning: Do not switch tabs during the test!");
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setWarnings(w => w + 1);
        setIsFullscreen(false);
        alert("Warning: Do not exit fullscreen during the test!");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [isFullscreen]);

  const handleSubmitTest = async () => {
    let calculatedScore = 0;
    
    // Evaluate MCQs
    testData.questions.forEach((q, idx) => {
      if (q.type === 'MCQ' && answers[idx] === q.correctAnswer) {
        calculatedScore++;
      }
      // Note: Code evaluation is skipped here for auto-scoring, normally done on backend
    });
    
    setScore(calculatedScore);
    setIsSubmitted(true);

    try {
      await fetch(`/api/test/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED", tabSwitches: warnings, score: calculatedScore })
      });
    } catch (err) {
      console.error(err);
    }
    
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
  };

  const handleDownloadKey = () => {
    let text = "SDE Evaluation Test - Answer Key\n\n";
    testData.questions.forEach((q, idx) => {
      text += `Q${idx + 1}: ${q.questionText}\n`;
      text += `Domain: ${q.domain} | Type: ${q.type}\n`;
      if (q.type === 'MCQ') {
        text += `Correct Answer: ${q.correctAnswer}\n`;
        text += `Your Answer: ${answers[idx] || "Not answered"}\n`;
      } else {
        text += `Expected logic: Code should satisfy provided test cases.\n`;
        text += `Your Code:\n${answers[idx] || "Not answered"}\n`;
      }
      text += "\n------------------------------------------------\n\n";
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Answer_Key_${testId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Timer
  useEffect(() => {
    if (!isFullscreen) return; // Only start timer when fullscreen
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(); // Auto submit
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isFullscreen]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleRunCode = async () => {
    setIsExecuting(true);
    setOutput("Running code...");
    
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: answers[currentQuestionIndex] || "",
          language: language,
          // Sending first testcase input as mock stdin
          stdin: currentQuestion.testCases?.[0]?.input || ""
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        setOutput(`Error: ${data.error}`);
      } else {
        setOutput(data.output || "No output");
      }
    } catch (err) {
      setOutput("Failed to connect to the execution server.");
    }
    
    setIsExecuting(false);
  };

  const handleAnswerChange = (val) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: val
    }));
  };


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading test...</div>;
  }

  if (!testData) {
    return <div className="flex justify-center items-center h-screen">Test not found.</div>;
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Test Submitted!</h1>
          <p className="text-gray-600 mb-6">Thank you for completing the evaluation.</p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Your MCQ Score</p>
            <p className="text-4xl font-bold text-blue-600">{score} / {testData.questions.filter(q => q.type === 'MCQ').length}</p>
            <p className="text-xs text-gray-400 mt-2">*Coding questions will be evaluated separately.</p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleDownloadKey}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium hover:bg-blue-700 transition"
            >
              Download Answer Key & Response
            </button>
            <button 
              onClick={() => router.push("/")}
              className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded font-medium hover:bg-gray-200 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isFullscreen) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh]">
        <h1 className="text-2xl font-bold mb-4">SDE Evaluation Test</h1>
        <p className="text-gray-600 mb-2">Total Questions: {testData.questions.length}</p>
        <p className="text-gray-600 mb-6">Duration: 1 Hour. Do not switch tabs or exit fullscreen.</p>
        <button 
          onClick={toggleFullscreen}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
        >
          Start Test (Enter Fullscreen)
        </button>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];

  return (
    <div ref={containerRef} className="bg-white dark:bg-gray-900 h-screen w-full flex flex-col overflow-hidden fixed inset-0 z-50">
      {/* Test Header */}
      <div className="bg-gray-900 dark:bg-black text-white p-4 flex justify-between items-center shrink-0 border-b border-gray-800">
        <div className="font-bold">SDE Test - {testData.questions.length} Questions</div>
        <div className="text-red-400 font-mono text-xl">{formatTime(timeLeft)}</div>
        <div className="flex items-center gap-4">
          <div className="text-sm">Warnings: <span className="text-red-400 font-bold">{warnings}</span></div>
          <button onClick={handleSubmitTest} className="bg-red-600 px-4 py-1 rounded text-sm hover:bg-red-700 font-bold transition-colors">
            Submit Test
          </button>
        </div>
      </div>

      {/* Test Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left pane: Question & Navigation */}
        <div className="w-1/2 p-6 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          
          <div className="flex-1 overflow-y-auto mb-4 pr-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs px-2 py-1 rounded font-bold uppercase">{currentQuestion.domain}</span>
              <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs px-2 py-1 rounded font-bold">{currentQuestion.difficulty || 'Medium'}</span>
              <span className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded font-bold">{currentQuestion.type}</span>
            </div>
            
            <h2 className="text-xl font-bold mt-2 mb-6 text-gray-900 dark:text-white">
              Q{currentQuestionIndex + 1}. {currentQuestion.questionText}
            </h2>

            {/* MCQ Options Rendering */}
            {currentQuestion.type === 'MCQ' && (
              <div className="space-y-3 mt-6">
                {currentQuestion.options?.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-3 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors bg-white dark:bg-gray-800/50">
                    <input 
                      type="radio" 
                      name={`question-${currentQuestionIndex}`}
                      value={opt}
                      checked={answers[currentQuestionIndex] === opt}
                      onChange={() => handleAnswerChange(opt)}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            )}

            {/* Code Question Example Rendering */}
            {currentQuestion.type === 'CODE' && currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Example Test Cases:</h3>
                {currentQuestion.testCases.map((tc, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md font-mono text-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300">
                    <strong className="text-gray-900 dark:text-gray-100">Input:</strong> {tc.input} <br/>
                    <strong className="text-gray-900 dark:text-gray-100">Output:</strong> {tc.expectedOutput}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center shrink-0 pt-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
            <button 
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded disabled:opacity-50 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              {currentQuestionIndex + 1} / {testData.questions.length}
            </span>
            <button 
              disabled={currentQuestionIndex === testData.questions.length - 1}
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50 font-medium hover:bg-blue-700 transition-colors"
            >
              Next Question
            </button>
          </div>
        </div>

        {/* Right pane: Code Editor (Only show for CODE type) */}
        {currentQuestion.type === 'CODE' ? (
          <div className="w-1/2 h-full bg-gray-50 dark:bg-gray-900 flex flex-col">
            <div className="p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shrink-0">
              <select 
                className="text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-3 py-1.5 outline-none focus:ring-1 focus:ring-blue-500"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="javascript">JavaScript (Node.js)</option>
                <option value="cpp">C++ (GCC)</option>
                <option value="java">Java (JDK)</option>
                <option value="python">Python 3</option>
              </select>
              <button 
                onClick={handleRunCode}
                disabled={isExecuting}
                className="bg-green-600 text-white px-6 py-1.5 text-sm font-bold rounded hover:bg-green-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors"
              >
                {isExecuting ? "Running..." : "Run Code"}
              </button>
            </div>
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                language={language === "cpp" ? "cpp" : language}
                theme="vs-dark"
                value={answers[currentQuestionIndex] || ""}
                onChange={(value) => handleAnswerChange(value)}
                options={{ minimap: { enabled: false } }}
              />
            </div>
            
            {/* Output Terminal */}
            <div className="h-48 bg-gray-900 shrink-0 border-t-4 border-gray-800 flex flex-col z-10">
              <div className="px-4 py-1 bg-gray-800 text-gray-300 text-xs font-mono tracking-widest shrink-0">
                TERMINAL
              </div>
              <div className="flex-1 p-4 overflow-y-auto font-mono text-sm text-green-400 whitespace-pre-wrap">
                {output || "Output will appear here..."}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-1/2 h-full bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 p-8 text-center border-l border-gray-200 dark:border-gray-700">
            <svg className="w-20 h-20 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
            <p className="text-xl font-medium text-gray-500 dark:text-gray-400">Multiple Choice Question</p>
            <p className="text-sm mt-2">Select your answer from the options provided on the left.</p>
          </div>
        )}
      </div>
    </div>
  );
}
