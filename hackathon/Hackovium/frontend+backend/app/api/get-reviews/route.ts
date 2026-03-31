import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

export async function GET() {
  try {
    await dbConnect();
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(20);
    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}