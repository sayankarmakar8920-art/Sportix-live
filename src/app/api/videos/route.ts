import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const videos = await db.video.findMany({
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(videos)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch videos' }, { status: 500 })
  }
}
