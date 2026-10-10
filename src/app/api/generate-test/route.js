import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/models/Test';
import User from '@/models/User';
import GlobalTest from '@/models/GlobalTest';

export async function POST(req) {
  try {
    const { userId } = await req.json();
    await dbConnect();
    
    const user = await User.findById(userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check if 3 days have passed since the last test date
    // NOTE: Commented out during development/testing so you can take unlimited tests
    /*
    if (user.lastTestDate) {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      if (user.lastTestDate > threeDaysAgo) {
        return NextResponse.json({ 
          error: 'Next test not available yet. Please wait 3 days.' 
        }, { status: 403 });
      }
    }
    */

    // Fetch the current active global test
    let globalTest = await GlobalTest.findOne({ isActive: true });
    
    if (!globalTest) {
      // Auto-trigger generation for first time if none exists
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      console.log("No active test found, triggering generation...");
      try {
        const cronRes = await fetch(`${baseUrl}/api/cron/generate-test`);
        const cronData = await cronRes.json();
        if (cronData.success) {
          globalTest = await GlobalTest.findOne({ isActive: true });
        }
      } catch (err) {
        console.error("Failed to trigger test generation:", err);
      }
      
      if (!globalTest) {
        return NextResponse.json({ error: 'Generating test for the first time. Please wait 15 seconds and click again.' }, { status: 404 });
      }
    }

    // Create a new user test session using the global test questions
    const newTest = await Test.create({
      userId: user._id,
      questions: globalTest.questions,
      status: 'PENDING',
      availableFrom: new Date(),
    });

    user.lastTestDate = new Date();
    await user.save();

    return NextResponse.json({ test: newTest });
  } catch (error) {
    console.error('Error starting test:', error);
    return NextResponse.json({ error: error.message || 'Failed to start test' }, { status: 500 });
  }
}
