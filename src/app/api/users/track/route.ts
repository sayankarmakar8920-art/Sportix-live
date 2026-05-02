import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/users/track — called on login/logout events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    if (action === 'login') {
      await db.user.update({
        where: { id: userId },
        data: { isOnline: true, lastSeen: new Date() },
      })
    } else if (action === 'logout') {
      await db.user.update({
        where: { id: userId },
        data: { isOnline: false, lastSeen: new Date() },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User track error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// PATCH /api/users/track — heartbeat (user is still active)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId required' }, { status: 400 })
    }

    await db.user.update({
      where: { id: userId },
      data: { isOnline: true, lastSeen: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('User heartbeat error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
