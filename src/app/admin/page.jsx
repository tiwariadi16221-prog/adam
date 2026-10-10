"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [logs, setLogs] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editForm, setEditForm] = useState(null);
  
  const logsEndRef = useRef(null);

  async function handleSaveQuestion(idx) {
    if (!data.activeTest) return;
    const updatedQuestions = [...data.activeTest.questions];
    updatedQuestions[idx] = editForm;
    
    // Optimistic UI update
    setData({
      ...data,
      activeTest: { ...data.activeTest, questions: updatedQuestions }
    });
    setEditingIndex(null);

    try {
      await fetch('/api/admin/update-test', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: data.activeTest._id,
          questions: updatedQuestions
        })
      });
    } catch (err) {
      console.error('Failed to update question', err);
      alert('Failed to update question. Please try again.');
    }
  }

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchAdminData();
    }
  }, [status, router]);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  async function fetchAdminData() {
    try {
      const res = await fetch("/api/admin");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  }

  function handleForceGenerate() {
    setIsGenerating(true);
    setLogs([{ type: 'system', message: 'Initializing connection to AI Server...', time: new Date().toLocaleTimeString() }]);
    
    const eventSource = new EventSource('/api/admin/stream-generation');
    
    eventSource.onmessage = (event) => {
      const parsed = JSON.parse(event.data);
      setLogs(prev => [...prev, { ...parsed, time: new Date().toLocaleTimeString() }]);
      
      if (parsed.type === 'done' || parsed.type === 'error') {
        eventSource.close();
        setIsGenerating(false);
        if (parsed.type === 'done') {
          fetchAdminData(); // Refresh stats
        }
      }
    };

    eventSource.onerror = () => {
      setLogs(prev => [...prev, { type: 'error', message: 'Connection to streaming server lost.', time: new Date().toLocaleTimeString() }]);
      eventSource.close();
      setIsGenerating(false);
    };
  };

  if (loading || status === "loading") {
    return <div className="flex justify-center items-center h-screen dark:bg-gray-900 dark:text-white">Loading Admin Dashboard...</div>;
  }

  if (!data) return <div className="p-8 text-red-500">Failed to load data.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

        {/* Top Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* AI Status Card & Terminal */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
            <div className="p-6 pb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">AI Model Status</h2>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${data.aiStatus.isTestActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {data.aiStatus.isTestActive ? 'ONLINE & ACTIVE' : 'NO ACTIVE TEST'}
                </span>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Total Global Tests Generated:</span>
                  <span className="font-semibold dark:text-gray-200">{data.aiStatus.totalGlobalTestsGenerated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Current Question Count:</span>
                  <span className="font-semibold dark:text-gray-200">{data.aiStatus.questionCount}</span>
                </div>
              </div>

              <button 
                onClick={handleForceGenerate}
                disabled={isGenerating}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 flex justify-center items-center gap-2"
              >
                {isGenerating && (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                )}
                {isGenerating ? 'Generating Live...' : 'Force Generate New Test'}
              </button>
            </div>
            
            {/* AI Live Terminal */}
            <div className="flex-1 bg-black border-t-4 border-gray-900 min-h-[250px] max-h-[300px] flex flex-col">
              <div className="bg-gray-900 px-4 py-1 text-xs text-gray-500 font-mono tracking-widest flex justify-between shrink-0">
                <span>AI_GENERATION_TERMINAL</span>
                <span className="text-green-500 animate-pulse">{isGenerating ? '● LIVE' : ''}</span>
              </div>
              <div className="p-4 font-mono text-xs overflow-y-auto flex-1 space-y-1">
                {logs.length === 0 ? (
                  <span className="text-gray-600">Waiting for generation trigger...</span>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex gap-3">
                      <span className="text-gray-600 shrink-0">[{log.time}]</span>
                      <span className={`${
                        log.type === 'error' ? 'text-red-500' :
                        log.type === 'warning' ? 'text-yellow-500' :
                        log.type === 'ai_start' ? 'text-purple-400' :
                        log.type === 'ai_response' ? 'text-blue-400' :
                        log.type === 'success' ? 'text-green-400' :
                        log.type === 'done' ? 'text-green-500 font-bold' :
                        'text-gray-300'
                      }`}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

          {/* Platform Stats Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Platform Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Users</p>
                <p className="text-3xl font-bold text-blue-800 dark:text-blue-300 mt-1">{data.users.length}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Tests Taken</p>
                <p className="text-3xl font-bold text-purple-800 dark:text-purple-300 mt-1">
                  {data.users.reduce((acc, user) => acc + user.completedTests, 0)}
                </p>
              </div>
            </div>
          </div>
          
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">User Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed Tests</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg MCQ Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Active</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                        {user.completedTests} tests
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-semibold">
                      {user.averageScore}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.lastTestDate ? new Date(user.lastTestDate).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
                
                {data.users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      No users found on the platform yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Test Questions Editor */}
        {data.activeTest && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden mt-8">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Active Test Questions</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">{data.activeTest.questions?.length} Questions</span>
            </div>
            
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {data.activeTest.questions?.map((q, idx) => (
                <div key={idx} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {editingIndex === idx ? (
                    <div className="space-y-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-gray-500 mb-1">Question Text</label>
                          <textarea 
                            value={editForm.questionText}
                            onChange={(e) => setEditForm({...editForm, questionText: e.target.value})}
                            className="w-full p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            rows="2"
                          />
                        </div>
                        <div className="w-full md:w-auto">
                          <label className="block text-xs font-bold text-gray-500 mb-1">Difficulty</label>
                          <select 
                            value={editForm.difficulty}
                            onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
                            className="w-full md:w-auto p-2 border rounded dark:bg-gray-900 dark:border-gray-600 dark:text-white h-10"
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      {q.type === 'MCQ' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Options</label>
                            {editForm.options.map((opt, i) => (
                              <input 
                                key={i}
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...editForm.options];
                                  newOpts[i] = e.target.value;
                                  setEditForm({...editForm, options: newOpts});
                                }}
                                className="w-full p-1 border rounded mb-1 text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                              />
                            ))}
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1">Correct Answer</label>
                            <input 
                              value={editForm.correctAnswer}
                              onChange={(e) => setEditForm({...editForm, correctAnswer: e.target.value})}
                              className="w-full p-2 border rounded text-sm dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 pt-2">
                        <button 
                          onClick={() => setEditingIndex(null)}
                          className="px-4 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSaveQuestion(idx)}
                          className="px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded font-medium"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">Q{idx + 1}</span>
                          <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase">{q.domain}</span>
                          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{q.type}</span>
                        </div>
                        <button 
                          onClick={() => {
                            setEditingIndex(idx);
                            setEditForm(JSON.parse(JSON.stringify(q)));
                          }}
                          className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium mb-3">{q.questionText}</p>
                      
                      {q.type === 'MCQ' && (
                        <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Options: {q.options?.join(' | ')}</div>
                          <div className="text-sm font-bold text-green-600 dark:text-green-500">Correct: {q.correctAnswer}</div>
                        </div>
                      )}
                      {q.type === 'CODE' && (
                        <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                          <div className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                            Test Cases: {q.testCases?.length || 0}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
