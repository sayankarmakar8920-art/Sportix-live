import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { randomUUID } from 'crypto'

// POST /api/streams/go-live
// Admin starts a live stream - updates DB + broadcasts via the chat service
export async function POST(req: NextRequest) {
  try {
    const { title, category, homeTeam, awayTeam, streamKey, description } = await req.json()

    const key = streamKey || `live-${randomUUID().replace(/-/g, '').substring(0, 12)}`
    const rtmpUrl = `rtmp://live.sportix.io/live`

    // Check if stream with this key already exists
    const existing = await db.stream.findFirst({ where: { streamKey: key } })

    let stream
    if (existing) {
      stream = await db.stream.update({
        where: { id: existing.id },
        data: {
          status: 'live',
          title: title || existing.title,
          category: category || existing.category,
          homeTeam: homeTeam || existing.homeTeam,
          awayTeam: awayTeam || existing.awayTeam,
          description: description || existing.description,
          startTime: new Date(),
          viewerCount: 0,
          peakViewers: 0,
          isFeatured: true,
        },
      })
    } else {
      stream = await db.stream.create({
        data: {
          title: title || 'Live Stream',
          description: description || '',
          category: category || 'football',
          homeTeam: homeTeam || 'Team A',
          awayTeam: awayTeam || 'Team B',
          rtmpUrl,
          streamKey: key,
          status: 'live',
          startTime: new Date(),
          viewerCount: 0,
          peakViewers: 0,
          homeScore: 0,
          awayScore: 0,
          matchTime: '0:00',
          isFeatured: true,
        },
      })
    }

    // Notify chat service via internal HTTP
    try {
      await fetch('http://localhost:3005/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'go-live',
          streamId: stream.id,
          title: stream.title,
          category: stream.category,
          homeTeam: stream.homeTeam,
          awayTeam: stream.awayTeam,
        }),
      }).catch(() => {})
    } catch {
      /* ignore */
    }

    return NextResponse.json({
      ok: true,
      stream,
      rtmpUrl,
      streamKey: key,
      hlsUrl: `/api/hls/${key}/index.m3u8`,
      obsSettings: {
        server: rtmpUrl,
        key: key,
        profile: '1080p',
        bitrate: 4500,
        fps: 60,
      },
    })
  } catch (error) {
    console.error('Go-live error:', error)
    return NextResponse.json({ error: 'Failed to start live stream' }, { status: 500 })
  }
}

// GET /api/streams/go-live
// Returns currently active live streams
export async function GET() {
  try {
    const liveStreams = await db.stream.findMany({
      where: { status: 'live' },
      orderBy: { startTime: 'desc' },
    })
    return NextResponse.json({ streams: liveStreams, count: liveStreams.length })
  } catch {
    return NextResponse.json({ error: 'Failed to get live status' }, { status: 500 })
  }
}
