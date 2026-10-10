import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GlobalTest from '@/models/GlobalTest';

export async function PUT(req) {
  try {
    const body = await req.json();
    const { testId, questions } = body;
    
    if (!testId || !questions) {
      return NextResponse.json({ error: 'Missing testId or questions array' }, { status: 400 });
    }

    await dbConnect();
    
    // Update the specific global test with the modified questions
    const updatedTest = await GlobalTest.findByIdAndUpdate(
      testId, 
      { questions }, 
      { new: true }
    );
    
    if (!updatedTest) {
      return NextResponse.json({ error: 'Global test not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, test: updatedTest });
  } catch (error) {
    console.error('Error updating global test:', error);
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 });
  }
}
