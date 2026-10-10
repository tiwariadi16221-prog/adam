"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();
  
  const [lastGenerated, setLastGenerated] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchTestInfo = async () => {
      try {
        const res = await fetch("/api/test-info");
        const data = await res.json();
        if (data.success && data.lastGenerated) {
          setLastGenerated(new Date(data.lastGenerated));
        }
      } catch (err) {
        console.error("Failed to fetch test info", err);
      }
    };
    fetchTestInfo();
  }, []);

  useEffect(() => {
    if (!lastGenerated) return;

    const nextExamDate = new Date(lastGenerated.getTime() + 3 * 24 * 60 * 60 * 1000);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = nextExamDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft("Ready!");
        clearInterval(timer);
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);
        
        // On mobile we might want a shorter format, but this is compact enough.
        setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastGenerated]);

  // Close menu when route changes or user clicks a link (handled via onClick in links)

  return (
    <>
      <div className="fixed top-4 left-0 right-0 z-50 px-4 md:px-8 pointer-events-none">
        <nav className="h-16 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-7xl mx-auto pointer-events-auto transition-all duration-300">
          <div className="px-4 md:px-6 h-full flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <Link href="/" className="font-extrabold text-lg md:text-2xl text-orange-600 drop-shadow-sm flex items-center gap-1 md:gap-2">
                <span>🐒</span> <span className="hidden md:inline">Monkey-wants-Job</span>
              </Link>
              
              {/* Navbar Timer */}
              {lastGenerated && (
                <div className="flex items-center gap-1 md:gap-2 bg-orange-100/80 px-2 md:px-3 py-1 rounded-full border border-orange-200">
                  <span className="hidden md:inline text-orange-600 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">Next Exam:</span>
                  <span className="md:hidden text-orange-600 text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">Next:</span>
                  <span className="text-orange-700 text-xs md:text-sm font-black whitespace-nowrap">{timeLeft}</span>
                </div>
              )}
            </div>
            
            {/* Desktop Links */}
            <div className="hidden md:flex gap-3 md:gap-6 items-center">
              {session ? (
                <>
                  <Link href="/profile" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">Profile</Link>
                  <Link href="/tests" className="text-gray-600 hover:text-gray-900 transition-colors font-medium text-sm">My Tests</Link>
                  <button 
                    onClick={() => signOut()}
                    className="px-4 py-1.5 bg-white/80 rounded-xl shadow-sm border border-gray-200 text-sm font-bold text-gray-800 hover:bg-gray-50 transition-colors"
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

            {/* Mobile Hamburger Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMenuOpen(true)}
                className="p-1.5 text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Slide-out Menu */}
      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[9998] md:hidden backdrop-blur-sm"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 right-0 h-full w-[250px] bg-white shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-4 flex justify-end border-b">
          <button 
            onClick={() => setIsMenuOpen(false)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex flex-col p-6 gap-6">
          {session ? (
            <>
              <div className="pb-4 border-b">
                <p className="text-sm text-gray-500">Signed in as</p>
                <p className="font-bold text-gray-900 truncate">{session.user?.name || session.user?.email}</p>
              </div>
              <Link onClick={() => setIsMenuOpen(false)} href="/profile" className="text-lg font-medium text-gray-700 hover:text-orange-600">Profile</Link>
              <Link onClick={() => setIsMenuOpen(false)} href="/tests" className="text-lg font-medium text-gray-700 hover:text-orange-600">My Tests</Link>
              <button 
                onClick={() => { setIsMenuOpen(false); signOut(); }}
                className="mt-4 px-4 py-3 bg-gray-100 rounded-xl text-gray-800 font-bold hover:bg-gray-200 transition-colors w-full"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link 
              onClick={() => setIsMenuOpen(false)}
              href="/login"
              className="px-4 py-3 bg-blue-600 text-white rounded-xl font-bold text-center hover:bg-blue-700 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
