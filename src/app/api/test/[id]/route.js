import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Test from '@/models/Test';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    await dbConnect();
    
    const test = await Test.findById(id);
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    return NextResponse.json({ test });
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json({ error: 'Failed to fetch test' }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    await dbConnect();
    
    // We can use this to update the test score and status on submit
    const updatedTest = await Test.findByIdAndUpdate(id, body, { new: true });
    
    return NextResponse.json({ test: updatedTest });
  } catch (error) {
    console.error('Error updating test:', error);
    return NextResponse.json({ error: 'Failed to update test' }, { status: 500 });
  }
}
