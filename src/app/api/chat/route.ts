import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const streamId = req.nextUrl.searchParams.get('streamId')
  try {
    const messages = await db.chatMessage.findMany({
      where: streamId ? { streamId } : undefined,
      orderBy: { createdAt: 'asc' },
      take: 100,
    })
    return NextResponse.json(messages)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = await db.chatMessage.create({
      data: {
        streamId: body.streamId,
        username: body.username,
        message: body.message,
        isAdmin: body.isAdmin || false,
        isHighlighted: body.isHighlighted || false,
      },
    })
    return NextResponse.json(message, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
  }
  try {
    await db.chatMessage.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
