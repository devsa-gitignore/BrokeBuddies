import { NextResponse } from 'next/server'
export async function POST() {
  return NextResponse.json({ message: 'Git auth endpoint reached' })
}
