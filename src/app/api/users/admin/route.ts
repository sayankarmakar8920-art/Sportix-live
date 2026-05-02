import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/users/admin — returns all users with online status (for admin panel)
export async function GET(request: NextRequest) {
  try {
    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        isOnline: true,
        lastSeen: true,
        loginCount: true,
        createdAt: true,
      },
      orderBy: { lastSeen: 'desc' },
    })

    // Mark users offline if lastSeen > 2 minutes ago
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
    const updatedUsers = users.map(u => ({
      ...u,
      isOnline: u.isOnline && new Date(u.lastSeen) > twoMinutesAgo,
    }))

    return NextResponse.json(updatedUsers)
  } catch (error) {
    console.error('Admin users fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
