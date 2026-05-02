import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const stream = await db.stream.create({
      data: {
        title: body.title,
        description: body.description || '',
        category: body.category || 'cricket',
        homeTeam: body.homeTeam || '',
        awayTeam: body.awayTeam || '',
        status: 'live',
        rtmpUrl: 'rtmp://live.sportixlive.com/live',
        streamKey: `sk-live-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}-${Math.random().toString(36).substr(2, 4)}`,
        viewerCount: 0,
        peakViewers: 0,
        isFeatured: true,
        startTime: new Date(),
        fps: 60,
        bitrate: 4500,
      },
    })
    return NextResponse.json(stream, { status: 201 })
  } catch (error) {
    console.error('Go live error:', error)
    return NextResponse.json({ error: 'Failed to start stream' }, { status: 500 })
  }
}
