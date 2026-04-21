import { NextResponse } from 'next/server'
export async function GET() {
  return NextResponse.json({ message: 'Domain audit-results endpoint reached' })
}
