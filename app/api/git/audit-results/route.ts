import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ message: 'Git audit-results endpoint reached' })
}
