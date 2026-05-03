import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const ads = await db.ad.findMany({
      orderBy: { impressions: 'desc' },
      take: 50,
    })

    const totalImpressions = await db.ad.aggregate({
      _sum: { impressions: true },
    })

    const totalClicks = await db.ad.aggregate({
      _sum: { clicks: true },
    })

    const recentEvents = await db.adEvent.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Group events by date for chart data
    const eventsByDate: Record<string, { impressions: number; clicks: number }> = {}
    for (const ev of recentEvents) {
      const date = ev.createdAt.toISOString().split('T')[0]
      if (!eventsByDate[date]) {
        eventsByDate[date] = { impressions: 0, clicks: 0 }
      }
      if (ev.event === 'impression') eventsByDate[date].impressions++
      else if (ev.event === 'click') eventsByDate[date].clicks++
    }

    const impressionsSum = totalImpressions._sum.impressions || 0
    const clicksSum = totalClicks._sum.clicks || 0
    const ctr = impressionsSum > 0
      ? ((clicksSum / impressionsSum) * 100).toFixed(2)
      : '0'

    return NextResponse.json({
      ads,
      totalImpressions: impressionsSum,
      totalClicks: clicksSum,
      ctr,
      recentEvents,
      eventsByDate,
    })
  } catch (error) {
    console.error('Failed to fetch ad analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch ad analytics' }, { status: 500 })
  }
}
