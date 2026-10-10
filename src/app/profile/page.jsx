"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  const userData = session?.user;

  if (status === "loading" || !userData) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Global Rating</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{userData.rating || 1200}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Tests Passed</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{userData.testsPassed || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Tests Failed</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{userData.testsFailed || 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Analytics & Progress</h2>
        <div className="h-48 bg-gray-50 rounded-md flex items-center justify-center border border-dashed border-gray-300">
          <p className="text-gray-400">Chart / Analytics will appear here after your first test</p>
        </div>
      </div>
    </div>
  );
}
