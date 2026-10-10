"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyTests() {
  const { data: session, status } = useSession();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchUserTests();
    }
  }, [status, router]);

  const fetchUserTests = async () => {
    try {
      // In a real app, you would have a GET /api/tests endpoint
      // For now, we'll mock an empty state
      setTests([]); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") {
    return <div className="flex justify-center items-center h-[80vh]">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">My Tests</h1>
      
      {tests.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow text-center border border-gray-100 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't taken any tests yet.</p>
          <Link href="/" className="text-blue-600 font-medium hover:underline">
            Go take your first test
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tests.map(test => (
            <div key={test._id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
              <div>
                <p className="font-bold text-lg">SDE Assessment</p>
                <p className="text-sm text-gray-500">{new Date(test.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600 text-xl">{test.score}</p>
                <p className="text-xs text-gray-400">Score</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
