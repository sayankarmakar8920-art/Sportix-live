import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const stream = await db.stream.update({
      where: { id: body.streamId },
      data: {
        status: 'offline',
        endedAt: new Date(),
        isFeatured: false,
      },
    })
    return NextResponse.json(stream)
  } catch (error) {
    console.error('Stop live error:', error)
    return NextResponse.json({ error: 'Failed to stop stream' }, { status: 500 })
  }
}
