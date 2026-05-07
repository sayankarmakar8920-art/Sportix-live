import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const VALID_EVENTS = ['impression', 'click', 'close'] as const

// POST: Track ad event (impression, click, close)
// Body: { adId, eventType, device?, sessionId?, userId?, streamId? }
export async function POST(req: NextRequest) {
  try {
    const { adId, eventType, device, sessionId, userId, streamId } = await req.json()

    if (!adId || !eventType) {
      return NextResponse.json({ error: 'adId and eventType are required' }, { status: 400 })
    }

    if (!VALID_EVENTS.includes(eventType)) {
      return NextResponse.json(
        { error: `eventType must be one of: ${VALID_EVENTS.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify ad exists
    const ad = await db.ad.findUnique({
      where: { id: adId },
      select: { id: true },
    })

    if (!ad) {
      return NextResponse.json({ error: 'Ad not found' }, { status: 404 })
    }

    // Build metadata JSON with optional device and session info
    const metadata = JSON.stringify({
      ...(device && { device }),
      ...(sessionId && { sessionId }),
      timestamp: new Date().toISOString(),
    })

    // Create ad event record
    await db.adEvent.create({
      data: {
        adId,
        event: eventType,
        userId: userId || null,
        streamId: streamId || null,
        sessionId: sessionId || null,
        metadata,
      },
    })

    // Update ad counters based on event type
    if (eventType === 'impression') {
      await db.ad.update({
        where: { id: adId },
        data: { impressions: { increment: 1 } },
      })
    } else if (eventType === 'click') {
      await db.ad.update({
        where: { id: adId },
        data: { clicks: { increment: 1 } },
      })
    }
    // 'close' events are recorded but don't update ad counters

    return NextResponse.json({ ok: true, event: eventType })
  } catch (error) {
    console.error('Failed to track ad event:', error)
    return NextResponse.json({ error: 'Failed to track ad event' }, { status: 500 })
  }
}
