import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, description, category, thumbnail, duration, videoUrl, isFeatured } = body
    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    const video = await db.video.create({
      data: {
        title: title.trim(),
        description: description || null,
        category: category || 'highlights',
        thumbnail: thumbnail || null,
        duration: typeof duration === 'string' ? parseDuration(duration) : (duration || 0),
        videoUrl: videoUrl || null,
        isFeatured: isFeatured || false,
      },
    })
    return NextResponse.json(video)
  } catch {
    return NextResponse.json({ error: 'Failed to create video' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    await db.video.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
  }
}

function parseDuration(dur: string): number {
  if (!dur) return 0
  const parts = dur.split(':').map(Number)
  if (parts.length === 3) return (parts[0] * 3600) + (parts[1] * 60) + parts[2]
  if (parts.length === 2) return (parts[0] * 60) + parts[1]
  return parts[0] || 0
}
