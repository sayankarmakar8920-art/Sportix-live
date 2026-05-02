import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const streams = await db.stream.findMany({
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json(streams)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch streams' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const stream = await db.stream.create({
      data: {
        title: body.title,
        description: body.description,
        thumbnail: body.thumbnail,
        category: body.category || 'football',
        homeTeam: body.homeTeam,
        awayTeam: body.awayTeam,
        rtmpUrl: body.rtmpUrl,
        streamKey: body.streamKey,
        isFeatured: body.isFeatured || false,
      },
    })
    return NextResponse.json(stream, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create stream' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...data } = body
    if (!id) {
      return NextResponse.json({ error: 'Stream ID required' }, { status: 400 })
    }
    const stream = await db.stream.update({
      where: { id },
      data,
    })
    return NextResponse.json(stream)
  } catch {
    return NextResponse.json({ error: 'Failed to update stream' }, { status: 500 })
  }
}
