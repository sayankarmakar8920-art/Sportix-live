import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const now = new Date()

    // ── Real DB data ──────────────────────────────────────────
    const streams = await db.stream.findMany({
      orderBy: { createdAt: 'desc' },
    })
    const videos = await db.video.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const liveStreams = streams.filter((s) => s.status === 'live')
    const totalViewers = streams.reduce((acc, s) => acc + s.viewerCount, 0)
    const peakViewers = Math.max(...streams.map((s) => s.peakViewers), 0)

    // ── System health (simulated) ─────────────────────────────
    const cpuBase = 30 + liveStreams.length * 12
    const memBase = 40 + liveStreams.length * 8
    const systemHealth = {
      uptime: `12d ${now.getHours()}h ${now.getMinutes()}m`,
      cpu: Math.min(95, cpuBase + Math.round(Math.random() * 10)),
      memory: Math.min(92, memBase + Math.round(Math.random() * 8)),
      disk: 58 + Math.round(streams.length * 1.5 + videos.length * 0.3),
      status: liveStreams.length > 4 ? 'warning' : 'healthy',
    }

    // ── Recent activity (generated from real events + mock) ───
    const recentActivity = [
      {
        id: 'act-1',
        type: 'stream',
        message: `${liveStreams[0]?.homeTeam ?? 'Team A'} vs ${liveStreams[0]?.awayTeam ?? 'Team B'} is now live with ${fmtShort(totalViewers)} viewers`,
        timestamp: new Date(now.getTime() - 2 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-2',
        type: 'peak',
        message: `Peak viewers reached: ${peakViewers.toLocaleString()} concurrent viewers`,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-3',
        type: 'system',
        message: 'Auto-recording started for featured stream',
        timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-4',
        type: 'user',
        message: 'New user registration spike: +47 users in last hour',
        timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-5',
        type: 'alert',
        message: systemHealth.cpu > 70 ? `High CPU usage detected: ${systemHealth.cpu}%` : 'System health check passed',
        timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-6',
        type: 'stream',
        message: `${liveStreams[1]?.homeTeam ?? 'Team C'} vs ${liveStreams[1]?.awayTeam ?? 'Team D'} reached ${fmtShort(liveStreams[1]?.peakViewers ?? 0)} peak viewers`,
        timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-7',
        type: 'content',
        message: `New highlight published: ${videos[0]?.title?.slice(0, 50) ?? 'Highlight video'}...`,
        timestamp: new Date(now.getTime() - 120 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-8',
        type: 'system',
        message: 'CDN cache purged successfully for updated thumbnails',
        timestamp: new Date(now.getTime() - 180 * 60 * 1000).toISOString(),
      },
    ]

    // ── Top performing videos ─────────────────────────────────
    const topPerforming = [...videos]
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((v) => ({ id: v.id, title: v.title, views: v.views }))

    // ── Live users (simulated from viewer counts) ─────────────
    const userNames = [
      'Rahul Sharma', 'Alex Chen', 'Maria Garcia', 'James Wilson', 'Priya Patel',
      'Carlos Silva', 'Yuki Tanaka', 'Sophie Martin', 'David Kim', 'Emma Brown',
      'Marco Rossi', 'Anna Kowalski', 'Omar Hassan', 'Lisa Zhang', 'Thomas Weber',
    ]
    const userStatuses = ['online', 'online', 'online', 'online', 'offline', 'idle', 'online', 'online', 'offline', 'online']
    const liveUsers = userNames.map((name, i) => ({
      id: `user-${i + 1}`,
      username: name,
      status: userStatuses[i % userStatuses.length],
      lastSeen: userStatuses[i % userStatuses.length] === 'online'
        ? 'Now'
        : `${Math.floor(Math.random() * 60) + 5}m ago`,
    }))

    // ── Overview ──────────────────────────────────────────────
    const overview = {
      totalStreams: streams.length,
      liveStreams: liveStreams.length,
      totalVideos: videos.length,
      totalViewers,
      peakViewers,
    }

    // ── Format streams for response ───────────────────────────
    const formattedStreams = streams.map((s) => ({
      id: s.id,
      title: s.title,
      category: s.category,
      status: s.status,
      viewerCount: s.viewerCount + (s.status === 'live' ? Math.round(Math.random() * 200 - 100) : 0),
      peakViewers: s.peakViewers,
      homeTeam: s.homeTeam,
      awayTeam: s.awayTeam,
      homeScore: s.homeScore,
      awayScore: s.awayScore,
      matchTime: s.matchTime ?? '',
      fps: s.fps ?? 60,
      bitrate: s.bitrate ?? 4500,
      isFeatured: s.isFeatured,
      createdAt: s.createdAt.toISOString(),
    }))

    // ── Format videos ─────────────────────────────────────────
    const formattedVideos = videos.map((v) => ({
      id: v.id,
      title: v.title,
      category: v.category,
      views: v.views,
      duration: v.duration,
      isFeatured: v.isFeatured,
      createdAt: v.createdAt.toISOString(),
    }))

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      data: {
        overview,
        streams: formattedStreams,
        videos: formattedVideos,
        systemHealth,
        recentActivity,
        topPerforming,
        liveUsers,
      },
    })
  } catch (error) {
    console.error('[Dashboard API] Error:', error)
    return NextResponse.json(
      { success: false, timestamp: new Date().toISOString(), error: 'Failed to fetch dashboard data' },
      { status: 500 },
    )
  }
}

function fmtShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return n.toString()
}
