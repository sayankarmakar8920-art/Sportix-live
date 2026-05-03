import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: List recordings ordered by createdAt desc
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }

    const recordings = await db.recording.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        stream: {
          select: { id: true, title: true, category: true },
        },
      },
    })

    return NextResponse.json({ recordings })
  } catch (error) {
    console.error('Failed to fetch recordings:', error)
    return NextResponse.json({ error: 'Failed to fetch recordings' }, { status: 500 })
  }
}

// POST: Create recording entry
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { streamId, title, description, thumbnail, videoUrl, duration, fileSize } = body

    if (!streamId || !title || !videoUrl) {
      return NextResponse.json({ error: 'streamId, title, and videoUrl are required' }, { status: 400 })
    }

    const recording = await db.recording.create({
      data: {
        streamId,
        title,
        description,
        thumbnail,
        videoUrl,
        duration,
        fileSize,
      },
    })

    return NextResponse.json({ recording }, { status: 201 })
  } catch (error) {
    console.error('Failed to create recording:', error)
    return NextResponse.json({ error: 'Failed to create recording' }, { status: 500 })
  }
}
