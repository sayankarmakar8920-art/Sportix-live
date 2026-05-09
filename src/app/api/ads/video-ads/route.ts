import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch ads grouped by type for video player (pre-roll, mid-roll, post-roll)
// Query params: device, category
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const device = searchParams.get('device') || 'all'
    const category = searchParams.get('category')

    const now = new Date()

    const baseWhere: Record<string, unknown> = {
      isActive: true,
      OR: [
        { deviceTarget: null },
        { deviceTarget: 'all' },
        { deviceTarget: device },
      ],
    }

    if (category) {
      baseWhere.OR = [
        ...(Array.isArray(baseWhere.OR) ? baseWhere.OR : []),
        { category: null },
      ]
      // We need to filter by device AND category, so we use a two-step approach
    }

    const fetchAds = async (type: string) => {
      const where: Record<string, unknown> = {
        type,
        isActive: true,
        OR: [
          { deviceTarget: null },
          { deviceTarget: 'all' },
          { deviceTarget: device },
        ],
      }

      if (category) {
        where.OR = [
          { deviceTarget: null, category },
          { deviceTarget: 'all', category },
          { deviceTarget, category },
          { deviceTarget: null, category: null },
          { deviceTarget: 'all', category: null },
          { deviceTarget, category: null },
        ]
      }

      const ads = await db.ad.findMany({
        where,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        take: 5,
      })

      // Post-filter by schedule
      return ads.filter(ad => {
        if (ad.scheduleStart && ad.scheduleStart > now) return false
        if (ad.scheduleEnd && ad.scheduleEnd < now) return false
        return true
      })
    }

    const [preRoll, midRoll, postRoll] = await Promise.all([
      fetchAds('pre-roll'),
      fetchAds('mid-roll'),
      fetchAds('post-roll'),
    ])

    return NextResponse.json({
      preRoll,
      midRoll,
      postRoll,
    })
  } catch (error) {
    console.error('Failed to fetch video ads:', error)
    return NextResponse.json({ preRoll: [], midRoll: [], postRoll: [] }, { status: 200 })
  }
}
