import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/streams/stop-live
// Admin stops a live stream
export async function POST(req: NextRequest) {
  try {
    const { streamId } = await req.json()

    if (!streamId) {
      return NextResponse.json({ error: 'Stream ID required' }, { status: 400 })
    }

    const stream = await db.stream.update({
      where: { id: streamId },
      data: {
        status: 'offline',
        endedAt: new Date(),
      },
    })

    if (!stream) {
      return NextResponse.json({ error: 'Stream not found' }, { status: 404 })
    }

    // Notify chat service
    try {
      await fetch('http://localhost:3005/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'stop-live',
          streamId,
        }),
      }).catch(() => {})
    } catch {
      /* ignore */
    }

    return NextResponse.json({ ok: true, stream })
  } catch (error) {
    console.error('Stop-live error:', error)
    return NextResponse.json({ error: 'Failed to stop stream' }, { status: 500 })
  }
}
