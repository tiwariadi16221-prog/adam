import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { script, stdin, language } = await req.json();

    // Map common languages to JDoodle format
    // Defaulting versionIndex to "0" (JDoodle usually falls back to default version)
    const languageMap = {
      javascript: { lang: "nodejs", versionIndex: "4" },
      python: { lang: "python3", versionIndex: "4" },
      java: { lang: "java", versionIndex: "4" },
      cpp: { lang: "cpp17", versionIndex: "1" }
    };

    const config = languageMap[language] || languageMap.javascript;

    const payload = {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
      script: script,
      stdin: stdin || "",
      language: config.lang,
      versionIndex: config.versionIndex
    };

    const response = await fetch("https://api.jdoodle.com/v1/execute", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Code execution error:", error);
    return NextResponse.json({ error: "Failed to execute code" }, { status: 500 });
  }
}
