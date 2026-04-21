import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ message: 'Personal audit-results endpoint reached' })
}
