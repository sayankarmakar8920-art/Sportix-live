import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ── Activity log types ────────────────────────────────────────────
type ActivityType =
  | 'stream_started'
  | 'stream_ended'
  | 'title_updated'
  | 'quality_changed'
  | 'recording_started'
  | 'recording_stopped'
  | 'chat_cleared'
  | 'slow_mode_toggled'
  | 'user_banned'
  | 'user_unbanned'
  | 'settings_updated'
  | 'peak_viewers'
  | 'moderator_assigned'
  | 'highlight_created'

interface ActivityLog {
  id: string
  type: ActivityType
  title: string
  description: string
  timestamp: string
  streamId: string | null
  username: string | null
  metadata: Record<string, unknown>
}

// ── Generate activity logs from DB data + mock entries ─────────────
function generateActivityLogs(): ActivityLog[] {
  const now = Date.now()
  const logs: ActivityLog[] = []

  logs.push({
    id: 'act-001',
    type: 'stream_started',
    title: 'Stream Started',
    description: 'Live stream broadcast initiated',
    timestamp: new Date(now - 1000 * 60 * 2).toISOString(),
    streamId: null,
    username: 'streamAdmin',
    metadata: { category: 'football' },
  })

  logs.push({
    id: 'act-002',
    type: 'recording_started',
    title: 'Recording Started',
    description: 'Auto-recording started for live stream',
    timestamp: new Date(now - 1000 * 60 * 5).toISOString(),
    streamId: null,
    username: null,
    metadata: { format: 'mp4', quality: '1080p' },
  })

  logs.push({
    id: 'act-003',
    type: 'quality_changed',
    title: 'Quality Changed',
    description: 'Stream quality switched from 720p to 1080p',
    timestamp: new Date(now - 1000 * 60 * 12).toISOString(),
    streamId: null,
    username: 'streamAdmin',
    metadata: { from: '720p', to: '1080p' },
  })

  logs.push({
    id: 'act-004',
    type: 'peak_viewers',
    title: 'Peak Viewers Reached',
    description: 'Concurrent viewers hit a new peak today',
    timestamp: new Date(now - 1000 * 60 * 25).toISOString(),
    streamId: null,
    username: null,
    metadata: { peak: 15420 },
  })

  logs.push({
    id: 'act-005',
    type: 'title_updated',
    title: 'Stream Title Updated',
    description: 'Updated stream title to match current match score',
    timestamp: new Date(now - 1000 * 60 * 30).toISOString(),
    streamId: null,
    username: 'streamAdmin',
    metadata: { oldTitle: 'Live Match', newTitle: 'Live Match - 2-1' },
  })

  logs.push({
    id: 'act-006',
    type: 'chat_cleared',
    title: 'Chat Cleared',
    description: 'All chat messages cleared by moderator',
    timestamp: new Date(now - 1000 * 60 * 45).toISOString(),
    streamId: null,
    username: 'cricketKing',
    metadata: { reason: 'spam', messagesCleared: 34 },
  })

  logs.push({
    id: 'act-007',
    type: 'slow_mode_toggled',
    title: 'Slow Mode Enabled',
    description: 'Chat slow mode enabled (10 seconds between messages)',
    timestamp: new Date(now - 1000 * 60 * 60).toISOString(),
    streamId: null,
    username: 'cricketKing',
    metadata: { enabled: true, interval: 10 },
  })

  logs.push({
    id: 'act-008',
    type: 'user_banned',
    title: 'User Banned',
    description: 'User banned for violating community guidelines',
    timestamp: new Date(now - 1000 * 60 * 90).toISOString(),
    streamId: null,
    username: 'streamAdmin',
    metadata: {
      bannedUser: 'troll_account_99',
      reason: 'Harassment and spam',
      duration: 'permanent',
    },
  })

  logs.push({
    id: 'act-009',
    type: 'moderator_assigned',
    title: 'Moderator Assigned',
    description: 'New moderator assigned to cricket chat',
    timestamp: new Date(now - 1000 * 60 * 120).toISOString(),
    streamId: null,
    username: 'streamAdmin',
    metadata: { newModerator: 'cricketKing', stream: 'Cricket Live' },
  })

  logs.push({
    id: 'act-010',
    type: 'stream_ended',
    title: 'Stream Ended',
    description: 'Previous stream ended and recording saved',
    timestamp: new Date(now - 1000 * 60 * 180).toISOString(),
    streamId: null,
    username: null,
    metadata: {
      duration: '2h 45m',
      totalViewers: 8920,
      peakViewers: 12350,
    },
  })

  logs.push({
    id: 'act-011',
    type: 'recording_stopped',
    title: 'Recording Stopped',
    description: 'Stream recording completed and saved to VOD library',
    timestamp: new Date(now - 1000 * 60 * 180).toISOString(),
    streamId: null,
    username: null,
    metadata: { fileSize: '4.2 GB', duration: '2h 45m' },
  })

  logs.push({
    id: 'act-012',
    type: 'settings_updated',
    title: 'Settings Updated',
    description: 'Max concurrent streams limit changed from 3 to 5',
    timestamp: new Date(now - 1000 * 60 * 300).toISOString(),
    streamId: null,
    username: 'streamAdmin',
    metadata: { setting: 'maxConcurrentStreams', from: 3, to: 5 },
  })

  logs.push({
    id: 'act-013',
    type: 'highlight_created',
    title: 'Highlight Created',
    description: 'Goal clip extracted and published as highlight',
    timestamp: new Date(now - 1000 * 60 * 360).toISOString(),
    streamId: null,
    username: 'streamAdmin',
    metadata: {
      clipDuration: '45s',
      title: 'Amazing goal in the 78th minute',
      views: 2340,
    },
  })

  logs.push({
    id: 'act-014',
    type: 'user_unbanned',
    title: 'User Unbanned',
    description: 'User ban lifted after appeal review',
    timestamp: new Date(now - 1000 * 60 * 420).toISOString(),
    streamId: null,
    username: 'streamAdmin',
    metadata: { unbannedUser: 'reformed_user_42', reason: 'Good behavior' },
  })

  logs.push({
    id: 'act-015',
    type: 'slow_mode_toggled',
    title: 'Slow Mode Disabled',
    description: 'Chat slow mode disabled after chat calmed down',
    timestamp: new Date(now - 1000 * 60 * 480).toISOString(),
    streamId: null,
    username: 'cricketKing',
    metadata: { enabled: false },
  })

  return logs
}

// ── GET /api/admin/activity ───────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const type = searchParams.get('type')
    const page = parseInt(searchParams.get('page') ?? '1', 10)
    const limit = parseInt(searchParams.get('limit') ?? '20', 10)

    let logs = generateActivityLogs()

    // Fetch real stream events from DB to augment
    const recentStreams = await db.stream.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        title: true,
        status: true,
        homeTeam: true,
        awayTeam: true,
        updatedAt: true,
      },
    })

    // Add real stream events as activity entries
    recentStreams.forEach((stream, index) => {
      const existingIndex = logs.findIndex(
        (l) =>
          l.type === 'stream_started' &&
          index === 0,
      )
      if (existingIndex === -1 || index > 0) {
        logs.unshift({
          id: `act-db-${stream.id}`,
          type: stream.status === 'live' ? 'stream_started' : 'stream_ended',
          title: stream.status === 'live' ? 'Stream Started' : 'Stream Offline',
          description: `${stream.homeTeam} vs ${stream.awayTeam} — ${stream.status}`,
          timestamp: stream.updatedAt.toISOString(),
          streamId: stream.id,
          username: null,
          metadata: { title: stream.title },
        })
      } else if (existingIndex >= 0) {
        logs[existingIndex].streamId = stream.id
        logs[existingIndex].description = `${stream.homeTeam} vs ${stream.awayTeam} — ${stream.status}`
      }
    })

    // Re-sort by timestamp (newest first)
    logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )

    // Filter by type
    if (type) {
      logs = logs.filter((l) => l.type === type)
    }

    // Stats
    const stats = {
      totalEvents: logs.length,
      streamEvents: logs.filter((l) =>
        ['stream_started', 'stream_ended'].includes(l.type),
      ).length,
      moderationEvents: logs.filter((l) =>
        ['chat_cleared', 'slow_mode_toggled', 'user_banned', 'user_unbanned'].includes(l.type),
      ).length,
      recordingEvents: logs.filter((l) =>
        ['recording_started', 'recording_stopped'].includes(l.type),
      ).length,
      settingEvents: logs.filter((l) =>
        ['settings_updated', 'quality_changed', 'title_updated'].includes(l.type),
      ).length,
    }

    // Paginate
    const total = logs.length
    const start = (page - 1) * limit
    const paginated = logs.slice(start, start + limit)

    return NextResponse.json({
      success: true,
      data: {
        logs: paginated,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      },
    })
  } catch (error) {
    console.error('[Activity API] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch activity logs' },
      { status: 500 },
    )
  }
}
