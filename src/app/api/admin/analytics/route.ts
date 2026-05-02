import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // ── Real DB data ──────────────────────────────────────────────
    const streams = await db.stream.findMany({
      include: { videos: true, chatMessages: true },
    })
    const videos = await db.video.findMany()

    const liveStreams = streams.filter((s) => s.status === 'live')
    const totalViewers = streams.reduce((acc, s) => acc + s.viewerCount, 0)
    const peakViewers = Math.max(...streams.map((s) => s.peakViewers), 0)

    // ── Viewer history: 24 data points (last 24 hours) ───────────
    const viewerHistory: { hour: string; viewers: number }[] = []
    const now = new Date()
    for (let i = 23; i >= 0; i--) {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000)
      const label = hour.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
      // Simulate realistic viewer curve: peaks during evening hours (17-22), dips at night
      const baseViewers = totalViewers || 12000
      const hourOfDay = hour.getHours()
      let multiplier = 0.3
      if (hourOfDay >= 17 && hourOfDay <= 22) multiplier = 1.0
      else if (hourOfDay >= 12 && hourOfDay <= 16) multiplier = 0.7
      else if (hourOfDay >= 6 && hourOfDay <= 11) multiplier = 0.4
      else multiplier = 0.2
      // Add some randomness
      const jitter = 0.85 + Math.random() * 0.3
      const viewers = Math.round(baseViewers * multiplier * jitter)
      viewerHistory.push({ hour: label, viewers })
    }

    // ── Per-stream analytics ──────────────────────────────────────
    const perStreamAnalytics = streams.map((s) => {
      const watchTimeMinutes = Math.round(
        s.viewerCount * (30 + Math.random() * 60),
      )
      return {
        id: s.id,
        title: `${s.homeTeam} vs ${s.awayTeam}`,
        category: s.category,
        status: s.status,
        viewers: s.viewerCount,
        peakViewers: s.peakViewers,
        watchTimeMinutes,
        chatMessages: s.chatMessages.length,
        videosCount: s.videos.length,
        fps: s.fps ?? null,
        bitrate: s.bitrate ?? null,
        startedAt: s.startTime?.toISOString() ?? null,
      }
    })

    // ── Audience by region ────────────────────────────────────────
    const audienceByRegion = [
      { region: 'India', percentage: 35, flag: '🇮🇳' },
      { region: 'USA', percentage: 20, flag: '🇺🇸' },
      { region: 'UK', percentage: 15, flag: '🇬🇧' },
      { region: 'Brazil', percentage: 10, flag: '🇧🇷' },
      { region: 'Others', percentage: 20, flag: '🌍' },
    ]

    // ── Stream activity timeline ──────────────────────────────────
    const activityTimeline = [
      {
        id: 'evt-1',
        type: 'stream_started' as const,
        title: `${liveStreams[0]?.homeTeam ?? 'Team A'} vs ${liveStreams[0]?.awayTeam ?? 'Team B'} went live`,
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        streamId: liveStreams[0]?.id ?? null,
      },
      {
        id: 'evt-2',
        type: 'peak_viewers' as const,
        title: `Peak viewers reached: ${peakViewers.toLocaleString()}`,
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        streamId: null,
      },
      {
        id: 'evt-3',
        type: 'title_updated' as const,
        title: `Stream title updated for ${streams[1]?.homeTeam ?? 'Team C'} vs ${streams[1]?.awayTeam ?? 'Team D'}`,
        timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
        streamId: streams[1]?.id ?? null,
      },
      {
        id: 'evt-4',
        type: 'quality_changed' as const,
        title: 'Quality switched to 1080p for featured stream',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        streamId: liveStreams[0]?.id ?? null,
      },
      {
        id: 'evt-5',
        type: 'stream_ended' as const,
        title: 'Wimbledon Highlights stream ended',
        timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        streamId: null,
      },
      {
        id: 'evt-6',
        type: 'recording_started' as const,
        title: 'Auto-recording started for live match',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        streamId: liveStreams[0]?.id ?? null,
      },
    ]

    // ── Revenue summary (mock) ────────────────────────────────────
    const revenueSummary = {
      totalRevenue: 48750.0,
      subscriptions: 32100.0,
      adRevenue: 12800.0,
      donations: 3850.0,
      currency: 'USD',
      subscriptionBreakdown: [
        { plan: 'Basic', subscribers: 1240, revenue: 6200.0 },
        { plan: 'Premium', subscribers: 870, revenue: 13050.0 },
        { plan: 'Enterprise', subscribers: 85, revenue: 12850.0 },
      ],
      monthlyTrend: [
        { month: 'Jul', revenue: 32400 },
        { month: 'Aug', revenue: 36800 },
        { month: 'Sep', revenue: 41200 },
        { month: 'Oct', revenue: 38900 },
        { month: 'Nov', revenue: 45600 },
        { month: 'Dec', revenue: 48750 },
      ],
    }

    // ── Growth metrics (mock) ─────────────────────────────────────
    const growthMetrics = {
      totalViews:
        streams.reduce((a, s) => a + s.peakViewers, 0) +
        videos.reduce((a, v) => a + v.views, 0),
      newViewersToday: Math.round((totalViewers || 12000) * 0.15),
      returningViewers: Math.round((totalViewers || 12000) * 0.85),
      avgWatchTimeMinutes: 42,
      chatEngagement: streams.reduce((a, s) => a + s.chatMessages.length, 0),
      avgConcurrentViewers: Math.round((totalViewers || 12000) * 0.72),
      weeklyGrowth: {
        viewers: 12.4,
        streams: 8.2,
        revenue: 15.7,
        engagement: 6.3,
      },
    }

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalViewers,
          peakViewers,
          liveStreamCount: liveStreams.length,
          totalStreamCount: streams.length,
          totalVideoCount: videos.length,
        },
        viewerHistory,
        perStreamAnalytics,
        audienceByRegion,
        activityTimeline,
        revenueSummary,
        growthMetrics,
      },
    })
  } catch (error) {
    console.error('[Analytics API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 },
    )
  }
}
