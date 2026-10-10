"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="font-bold text-xl text-blue-600 dark:text-blue-400">
          SDE Prep AI
        </Link>
        <div className="flex gap-4 items-center">
          {session ? (
            <>
              <Link href="/admin" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Admin</Link>
              <Link href="/profile" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">Profile</Link>
              <Link href="/tests" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">My Tests</Link>
              <button 
                onClick={() => signOut()}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link 
              href="/login"
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
