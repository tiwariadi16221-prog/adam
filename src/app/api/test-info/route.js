import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import GlobalTest from '@/models/GlobalTest';

export async function GET() {
  try {
    await dbConnect();
    const globalTest = await GlobalTest.findOne({ isActive: true }).sort({ createdAt: -1 });
    
    if (globalTest) {
      return NextResponse.json({ 
        success: true, 
        lastGenerated: globalTest.createdAt 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'No active test found' 
      });
    }
  } catch (error) {
    console.error('Error fetching test info:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
