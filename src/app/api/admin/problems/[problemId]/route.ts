import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Problem from '@/models/Problem';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { problemId } = await params;
    
    await connectDB();
    
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    
    return NextResponse.json(problem);
  } catch (error: any) {
    console.error('Error fetching problem details:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { problemId } = await params;
    const body = await request.json();
    
    await connectDB();
    
    const updatedProblem = await Problem.findByIdAndUpdate(problemId, body, { 
      new: true, 
      runValidators: true 
    });
    
    if (!updatedProblem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedProblem);
  } catch (error: any) {
    console.error('Error updating problem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ problemId: string }> }
) {
  try {
    const { problemId } = await params;
    
    await connectDB();
    
    const deletedProblem = await Problem.findByIdAndDelete(problemId);
    
    if (!deletedProblem) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'Problem deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting problem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
