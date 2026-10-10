"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGenerateTest = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id }),
      });
      const data = await res.json();
      
      if (res.ok) {
        // Redirect to test screen (mocking id for now)
        router.push(`/test/${data.test._id || 'mock-id'}`);
      } else {
        alert(data.error || "Failed to generate test");
      }
    } catch (err) {
      alert("Error connecting to server");
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center">
      <h1 className="text-4xl font-extrabold mb-4 text-gray-900 dark:text-white">Master Your SDE Skills</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mb-8">
        AI-powered mock assessments. Get 30 high-quality questions spanning DSA, LLD, HLD, Core CS, and DevOps every 3 days.
      </p>

      {!session ? (
        <button 
          onClick={() => signIn()}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-blue-700 shadow-lg transition-colors"
        >
          Get Started
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 max-w-md w-full">
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Welcome, {session.user.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Are you ready for your next assessment?</p>
          
          <button 
            onClick={handleGenerateTest}
            disabled={loading}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-indigo-700 shadow-md disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Generating via Gemini AI..." : "Generate & Start Test"}
          </button>
        </div>
      )}
    </div>
  );
}
