import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Test from '@/models/Test';
import GlobalTest from '@/models/GlobalTest';

export async function GET() {
  try {
    await dbConnect();
    
    // 1. Get all users
    const users = await User.find({}).lean();
    
    // 2. Get all tests to map scores to users
    const tests = await Test.find({}).lean();
    
    const usersWithStats = users.map(user => {
      const userTests = tests.filter(t => t.userId.toString() === user._id.toString());
      const completedTests = userTests.filter(t => t.status === 'COMPLETED');
      
      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        totalTestsTaken: userTests.length,
        completedTests: completedTests.length,
        averageScore: completedTests.length > 0 
          ? (completedTests.reduce((acc, curr) => acc + (curr.score || 0), 0) / completedTests.length).toFixed(1)
          : 0,
        lastTestDate: user.lastTestDate
      };
    });

    // 3. Get AI Model / Global Test Status
    const activeTest = await GlobalTest.findOne({ isActive: true }).lean();
    const allGlobalTestsCount = await GlobalTest.countDocuments();
    
    const aiStatus = {
      isTestActive: !!activeTest,
      totalGlobalTestsGenerated: allGlobalTestsCount,
      lastGeneratedAt: activeTest ? activeTest.generatedAt : null,
      questionCount: activeTest ? activeTest.questions?.length : 0,
    };

    return NextResponse.json({ 
      users: usersWithStats,
      aiStatus,
      activeTest
    });
  } catch (error) {
    console.error('Admin API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 });
  }
}
