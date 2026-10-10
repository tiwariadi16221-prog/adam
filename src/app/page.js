"use client";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [showSyllabus, setShowSyllabus] = useState(false);

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
    <>
      {/* Syllabus Modal */}
      {showSyllabus && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h2 className="text-2xl font-black text-gray-900">Syllabus to prepare for SDE</h2>
              <button onClick={() => setShowSyllabus(false)} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
            </div>
            
            <div className="space-y-6 text-gray-700">
              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-1">1. Data Structures and Algorithms (DSA)</h3>
                <p className="font-medium text-sm leading-relaxed">
                  Arrays, Strings, Linked Lists, Stacks, Queues, Hash Tables, Trees, Binary Search Trees, Tries, Heaps, Priority Queues, Graphs, Breadth-First Search (BFS), Depth-First Search (DFS), Dynamic Programming, Recursion, Memoization, Greedy Algorithms, Divide and Conquer, Sorting Algorithms (Merge Sort, Quick Sort), Searching Algorithms (Binary Search).
                </p>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-1">2. Computer Networks</h3>
                <p className="font-medium text-sm leading-relaxed">
                  OSI Model, TCP/IP Architecture, IP Addressing, IPv4 vs IPv6, Subnetting, CIDR, Routing Protocols (OSPF, BGP), Transport Layer Protocols, TCP vs UDP, Three-way Handshake, Congestion Control, Application Layer Protocols, HTTP/HTTPS, DNS Resolution, FTP, SMTP, WebSockets, Network Security Basics.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-1">3. Operating Systems</h3>
                <p className="font-medium text-sm leading-relaxed">
                  Process Management, Context Switching, CPU Scheduling Algorithms (FCFS, SJF, Round Robin), Threading vs Processes, Concurrency, Synchronization Mechanisms, Mutexes, Semaphores, Deadlock Handling (Prevention, Avoidance, Detection), Memory Management, Paging, Segmentation, Virtual Memory, Page Replacement Algorithms (LRU, FIFO), File Systems, I/O Device Management.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-1">4. Database Management Systems (DBMS)</h3>
                <p className="font-medium text-sm leading-relaxed">
                  Relational Model Concepts, SQL Querying, Joins, Grouping and Aggregation, Database Normalization (1NF, 2NF, 3NF, BCNF), Denormalization, ACID Properties, Transaction Management, Concurrency Control, Two-Phase Locking, Deadlocks in DBs, Indexing (B-Trees, Hash Indexes), Query Optimization, NoSQL vs SQL Concepts, Key-Value Stores, Document Databases.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-1">5. Object-Oriented Programming (OOPs)</h3>
                <p className="font-medium text-sm leading-relaxed">
                  Core Principles (Abstraction, Encapsulation, Inheritance, Polymorphism), Class and Object Concepts, Interfaces vs Abstract Classes, Method Overloading and Overriding, Static vs Instance Members, Constructors, Access Modifiers, SOLID Principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion), DRY Principle, Basic Design Patterns (Singleton, Factory, Observer).
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-orange-600 mb-1">6. System Design</h3>
                <p className="font-medium text-sm leading-relaxed">
                  High-Level Design (HLD), Low-Level Design (LLD), Vertical vs Horizontal Scaling, Load Balancing Strategies, Caching Mechanisms (Redis, Memcached), Content Delivery Networks (CDN), Microservices vs Monolithic Architecture, Database Sharding and Partitioning, CAP Theorem, Event-Driven Architecture, Message Queues (Kafka, RabbitMQ), API Design (REST, GraphQL), Rate Limiting.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

    <div className="absolute inset-0 pt-20 pb-8 md:pb-6 flex flex-col md:flex-row items-center justify-start md:justify-between px-6 md:px-16 overflow-y-auto overflow-x-hidden md:overflow-hidden bg-[#faf9f6] z-0">

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

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {!session ? (
            <button 
              onClick={() => signIn()}
              className="px-8 md:px-10 py-3 md:py-4 bg-orange-500 hover:bg-orange-600 text-white font-black text-lg md:text-xl rounded-2xl shadow-[0_6px_0_rgb(194,65,12)] hover:shadow-[0_3px_0_rgb(194,65,12)] hover:translate-y-[3px] transition-all transform w-full md:w-auto"
            >
              Get Started Now
            </button>
          ) : (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-xl border border-gray-200 w-full max-w-md mb-4 md:mb-0">
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
                  "📝 Generate & Start Test"
                )}
              </button>
            </div>
          )}

          <button 
            onClick={() => setShowSyllabus(true)}
            className="px-8 md:px-10 py-3 md:py-4 bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 font-black text-lg md:text-xl rounded-2xl transition-all transform w-full md:w-auto mt-4 md:mt-0 shadow-sm"
          >
            View Syllabus
          </button>
        </div>

      </div>

      {/* Right Content Area - Monkey Developer GIF with Orbiting Logos */}
      <div className="w-full md:w-1/2 relative z-10 flex justify-center items-center mt-10 md:mt-0 h-[250px] sm:h-[300px] md:h-[400px] lg:h-full">
        
        {/* Orbiting Tech Logos Container */}
        <div className="absolute w-[250px] h-[250px] sm:w-[300px] sm:h-[300px] md:w-[320px] md:h-[320px] lg:w-[400px] lg:h-[400px] rounded-full border-2 border-dashed border-orange-200/60 animate-[spin_40s_linear_infinite]">
          {["cpp.png", "css.png", "html.png", "java.png", "javascript.png", "mongodb.png", "python.png", "react.png"].map((logo, i) => (
            <div 
              key={logo} 
              className="absolute top-0 left-0 w-full h-full"
              style={{ transform: `rotate(${i * 45}deg)` }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-white rounded-full shadow-[0_4px_15px_rgb(0,0,0,0.1)] p-1.5 sm:p-2 lg:p-2.5">
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
          className="relative max-h-[150px] sm:max-h-[200px] md:max-h-[30vh] lg:max-h-[35vh] w-auto max-w-[150px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px] object-contain transform hover:scale-105 transition-transform duration-500 drop-shadow-2xl z-10"
        />
      </div>
      
    </div>
    </>
  );
}
