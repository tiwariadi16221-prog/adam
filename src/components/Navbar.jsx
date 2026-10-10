"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 pointer-events-none">
      <nav className="h-16 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-7xl mx-auto pointer-events-auto transition-all duration-300">
        <div className="px-6 h-full flex items-center justify-between">
          <Link href="/" className="font-extrabold text-lg md:text-2xl text-orange-600 drop-shadow-sm flex items-center gap-1 md:gap-2">
            <span>🐒</span> <span className="hidden sm:inline">Monkey-wants-Job</span><span className="sm:hidden">MWJ</span>
          </Link>
          <div className="flex gap-3 md:gap-6 items-center">
          {session ? (
            <>
              <Link href="/admin" className="hidden md:inline text-gray-600 hover:text-gray-900 transition-colors font-medium">Admin</Link>
              <Link href="/profile" className="hidden md:inline text-gray-600 hover:text-gray-900 transition-colors font-medium">Profile</Link>
              <Link href="/tests" className="hidden md:inline text-gray-600 hover:text-gray-900 transition-colors font-medium">My Tests</Link>
              <button 
                onClick={() => signOut()}
                className="px-3 py-1.5 md:px-4 md:py-2 bg-white/80 rounded-xl shadow-sm border border-gray-200 text-xs md:text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
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
    </div>
  );
}
