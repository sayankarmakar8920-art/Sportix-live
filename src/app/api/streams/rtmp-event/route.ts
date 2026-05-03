import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { event, streamKey, streamPath } = await req.json()

    if (!event || !streamKey) {
      return NextResponse.json({ error: 'Missing event or streamKey' }, { status: 400 })
    }

    if (event === 'publish') {
      await db.stream.updateMany({
        where: { streamKey, status: 'offline' },
        data: { status: 'live', viewerCount: 0, startTime: new Date() },
      })
    } else if (event === 'donePublish') {
      await db.stream.updateMany({
        where: { streamKey },
        data: { status: 'offline', endedAt: new Date() },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('RTMP event error:', error)
    return NextResponse.json({ error: 'Failed to process RTMP event' }, { status: 500 })
  }
}
