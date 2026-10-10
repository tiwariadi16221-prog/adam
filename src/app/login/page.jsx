"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="absolute inset-0 pt-20 pb-4 flex justify-center items-center overflow-y-auto bg-[#faf9f6] z-0 px-4 text-gray-900">
      <div className="bg-white p-5 md:p-6 rounded-2xl shadow-lg border border-gray-200 max-w-[320px] w-full relative overflow-hidden">
        
        {/* Playful decoration */}
        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500"></div>

        <div className="text-center mb-5">
          <div className="inline-block px-2 py-0.5 bg-orange-100 rounded text-orange-600 font-bold border border-orange-200 shadow-sm text-[10px] mb-2">
            🐒 Welcome Back!
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">
            Sign In to <span className="text-orange-500">ADA</span>
          </h2>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-2 rounded text-[11px] mb-4 text-center border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="monkey@job.com"
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition-all font-medium text-gray-900 text-xs"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-2.5 py-2 bg-gray-50 border border-gray-200 rounded-md focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-200 outline-none transition-all font-medium text-gray-900 text-xs"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-orange-500 text-white font-black text-xs py-2 rounded-md shadow-[0_3px_0_rgb(194,65,12)] hover:shadow-[0_1px_0_rgb(194,65,12)] hover:translate-y-[2px] transition-all transform disabled:opacity-50 mt-1"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-center space-x-2">
          <span className="h-px w-full bg-gray-200"></span>
          <span className="text-gray-400 font-bold text-[10px]">OR</span>
          <span className="h-px w-full bg-gray-200"></span>
        </div>

        <button 
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full mt-5 bg-white border border-gray-200 text-gray-700 font-bold text-xs py-2 rounded-md hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <p className="text-center mt-5 text-[11px] text-gray-600 font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-orange-600 hover:text-orange-700 hover:underline font-bold transition-colors">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
