import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Single recording
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const recording = await db.recording.findUnique({
      where: { id },
      include: {
        stream: {
          select: { id: true, title: true, category: true },
        },
      },
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    return NextResponse.json({ recording })
  } catch (error) {
    console.error('Failed to fetch recording:', error)
    return NextResponse.json({ error: 'Failed to fetch recording' }, { status: 500 })
  }
}

// PUT: Update recording
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const recording = await db.recording.findUnique({
      where: { id },
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    const { status, views, r2Url, title, description, thumbnail, duration, fileSize, uploadedToR2 } = body

    const updated = await db.recording.update({
      where: { id },
      data: {
        ...(status !== undefined && { status }),
        ...(views !== undefined && { views }),
        ...(r2Url !== undefined && { r2Url }),
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(duration !== undefined && { duration }),
        ...(fileSize !== undefined && { fileSize }),
        ...(uploadedToR2 !== undefined && { uploadedToR2 }),
      },
    })

    return NextResponse.json({ recording: updated })
  } catch (error) {
    console.error('Failed to update recording:', error)
    return NextResponse.json({ error: 'Failed to update recording' }, { status: 500 })
  }
}

// DELETE: Delete recording
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const recording = await db.recording.findUnique({
      where: { id },
    })

    if (!recording) {
      return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
    }

    await db.recording.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to delete recording:', error)
    return NextResponse.json({ error: 'Failed to delete recording' }, { status: 500 })
  }
}
