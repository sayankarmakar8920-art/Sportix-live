import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { adId, event, userId, streamId, sessionId } = await req.json()

    if (!adId || !event) {
      return NextResponse.json({ error: 'adId and event are required' }, { status: 400 })
    }

    // Create ad event
    await db.adEvent.create({
      data: { adId, event, userId, streamId, sessionId },
    })

    // Update ad counters
    if (event === 'impression') {
      await db.ad.update({
        where: { id: adId },
        data: { impressions: { increment: 1 } },
      })
    } else if (event === 'click') {
      await db.ad.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to track ad event:', error)
    return NextResponse.json({ error: 'Failed to track ad event' }, { status: 500 })
  }
}
