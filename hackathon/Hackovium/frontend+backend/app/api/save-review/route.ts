import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { repoUrl, rating, chatLogs } = await req.json();

    const review = new Review({
      repoUrl,
      rating,
      chatLogs,
    });

    await review.save();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
