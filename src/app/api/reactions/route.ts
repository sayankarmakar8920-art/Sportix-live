import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Get reactions for a stream
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const streamId = searchParams.get('streamId')

    if (!streamId) {
      return NextResponse.json({ error: 'streamId is required' }, { status: 400 })
    }

    const reactions = await db.reaction.findMany({
      where: { streamId },
      orderBy: { count: 'desc' },
    })

    return NextResponse.json({ reactions })
  } catch (error) {
    console.error('Failed to fetch reactions:', error)
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 })
  }
}

// POST: Add/update reaction
export async function POST(req: NextRequest) {
  try {
    const { streamId, type, increment } = await req.json()

    if (!streamId || !type) {
      return NextResponse.json({ error: 'streamId and type are required' }, { status: 400 })
    }

    // Check if reaction exists for this stream + type
    const existing = await db.reaction.findFirst({
      where: {
        streamId,
        type,
      },
    })

    if (existing) {
      const change = increment === false ? -1 : 1
      const newCount = Math.max(0, existing.count + change)

      if (newCount === 0) {
        // Remove reaction entry if count drops to 0
        await db.reaction.delete({
          where: { id: existing.id },
        })
        return NextResponse.json({ reaction: null, deleted: true })
      }

      const reaction = await db.reaction.update({
        where: { id: existing.id },
        data: { count: newCount },
      })

      return NextResponse.json({ reaction })
    }

    // Create new reaction with count 1
    const reaction = await db.reaction.create({
      data: {
        streamId,
        type,
        count: 1,
      },
    })

    return NextResponse.json({ reaction }, { status: 201 })
  } catch (error) {
    console.error('Failed to update reaction:', error)
    return NextResponse.json({ error: 'Failed to update reaction' }, { status: 500 })
  }
}
