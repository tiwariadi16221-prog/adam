"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

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
    <div className="absolute inset-0 pt-28 pb-12 md:pb-8 flex flex-col md:flex-row items-center justify-start md:justify-between px-6 md:px-16 overflow-y-auto overflow-x-hidden md:overflow-hidden bg-[#faf9f6] z-0">
      
      {/* Left Content Area */}
      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left z-20 space-y-5 mt-4 md:mt-0">
        <div className="inline-block px-3 py-1.5 bg-orange-100 rounded-xl text-orange-600 font-bold border border-orange-200 shadow-sm text-xs md:text-sm">
          🚀 Level Up Your Career
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Master Your <br className="hidden md:block"/>
          <span className="text-orange-500">SDE Skills</span>
        </h1>
        
        <p className="text-base md:text-lg text-gray-700 max-w-md font-medium">
          Immerse yourself in AI-powered mock assessments. Get 30 high-quality questions spanning DSA, LLD, HLD, Core CS, and DevOps!
        </p>

        {!session ? (
          <button 
            onClick={() => signIn()}
            className="mt-4 px-8 md:px-10 py-3 md:py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg md:text-xl rounded-2xl shadow-[0_6px_0_rgb(194,65,12)] hover:shadow-[0_3px_0_rgb(194,65,12)] hover:translate-y-[3px] transition-all transform w-full md:w-auto"
          >
            Get Started Now
          </button>
        ) : (
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-200 w-full max-w-md">
            <h2 className="text-xl md:text-2xl font-black mb-2 text-gray-900 flex items-center gap-2 justify-center md:justify-start">
              Welcome, <span className="text-orange-500">{session.user.name.split(' ')[0]}</span>! 👋
            </h2>
            <p className="text-sm md:text-base text-gray-600 mb-6 font-medium">Are you ready for your next assessment?</p>
            
            <button 
              onClick={handleGenerateTest}
              disabled={loading}
              className="w-full bg-orange-500 text-white px-6 py-4 rounded-2xl font-black text-base md:text-lg hover:bg-orange-600 shadow-[0_6px_0_rgb(194,65,12)] disabled:shadow-none disabled:translate-y-[6px] hover:shadow-[0_3px_0_rgb(194,65,12)] hover:translate-y-[3px] disabled:bg-gray-400 transition-all transform flex justify-center items-center gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Generating...
                </>
              ) : (
                "🎮 Generate & Start Test"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Right Content Area - Monkey Developer GIF with Orbiting Logos */}
      <div className="w-full md:w-1/2 relative z-10 flex justify-center items-center mt-20 md:mt-0 h-[350px] sm:h-[400px] md:h-full">
        
        {/* Orbiting Tech Logos Container */}
        <div className="absolute w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full border-2 border-dashed border-orange-200/60 animate-[spin_40s_linear_infinite]">
          {["cpp.png", "css.png", "html.png", "java.png", "javascript.png", "mongodb.png", "python.png", "react.png"].map((logo, i) => (
            <div 
              key={logo} 
              className="absolute top-0 left-0 w-full h-full"
              style={{ transform: `rotate(${i * 45}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-white rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.1)] p-1.5 sm:p-2 lg:p-2.5">
                <div className="w-full h-full animate-[spin_40s_linear_infinite_reverse]">
                  <div className="w-full h-full" style={{ transform: `rotate(-${i * 45}deg)` }}>
                    <img src={`/technologies/${logo}`} alt={logo.split('.')[0]} className="w-full h-full object-contain drop-shadow-sm" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Monkey GIF - Reduced Size */}
        <img 
          src="/monkey-developer.gif" 
          alt="Monkey Developer" 
          className="relative max-h-[200px] sm:max-h-[250px] md:max-h-[50vh] lg:max-h-[55vh] w-auto max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md object-contain transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl z-10"
        />
      </div>
      
    </div>
  );
}
