import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Problem from '@/models/Problem';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roundNumber = searchParams.get('roundNumber');
    
    await connectDB();
    
    let query: any = {};
    if (roundNumber) {
      query.roundNumber = parseInt(roundNumber, 10);
    }
    
    const problems = await Problem.find(query).sort({ roundNumber: 1, createdAt: -1 });
    
    return NextResponse.json(problems);
  } catch (error: any) {
    console.error('Error fetching problems for admin:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await connectDB();
    
    const newProblem = await Problem.create(body);
    
    return NextResponse.json(newProblem, { status: 201 });
  } catch (error: any) {
    console.error('Error creating problem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
