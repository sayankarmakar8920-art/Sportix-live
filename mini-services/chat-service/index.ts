import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Room-based streaming
const streamRooms = new Map<string, Set<string>>()
const roomViewers = new Map<string, number>()

// Reaction tracking: streamId -> type -> count
const streamReactions = new Map<string, Map<string, number>>()

// Viewer sessions: streamId -> sessionId -> { userId, joinedAt }
const viewerSessions = new Map<string, Map<string, { userId: string; joinedAt: number }>>()

// Stream health tracking: streamId -> { bitrate, fps, startTime }
const streamHealthData = new Map<string, { bitrate: number; fps: number; startTime: number }>()

function getViewerCount(streamId: string): number {
  return streamRooms.get(streamId)?.size || 0
}

function broadcastViewerCount(streamId: string) {
  const count = getViewerCount(streamId)
  roomViewers.set(streamId, count)
  io.to(streamId).emit('viewer-update', { streamId, count })
}

// Simulate viewer fluctuation for live streams
setInterval(() => {
  streamRooms.forEach((_, streamId) => {
    const baseCount = getViewerCount(streamId)
    const fluctuation = Math.floor(Math.random() * 50) - 25
    const newCount = Math.max(0, baseCount + fluctuation)
    roomViewers.set(streamId, newCount)
    io.to(streamId).emit('viewer-update', { streamId, count: newCount })
  })
}, 5000)

// Emit reaction-update to rooms every 5 seconds
setInterval(() => {
  streamReactions.forEach((reactions, streamId) => {
    const reactionList = Array.from(reactions.entries()).map(([type, count]) => ({ type, count }))
    io.to(streamId).emit('reaction-update', { streamId, reactions: reactionList })
  })
}, 5000)

// Emit stream-health to admin room every 10 seconds
setInterval(() => {
  const streams: Array<{ streamId: string; viewerCount: number; bitrate: number; fps: number; uptime: number }> = []
  streamRooms.forEach((_, streamId) => {
    const health = streamHealthData.get(streamId) || { bitrate: 4500, fps: 60, startTime: Date.now() }
    const uptime = Math.floor((Date.now() - health.startTime) / 1000)
    // Simulate small bitrate/fps fluctuations
    const bitrate = health.bitrate + Math.floor(Math.random() * 200) - 100
    const fps = Math.min(60, Math.max(24, health.fps + Math.floor(Math.random() * 3) - 1))
    streams.push({
      streamId,
      viewerCount: roomViewers.get(streamId) || getViewerCount(streamId),
      bitrate,
      fps,
      uptime,
    })
  })
  if (streams.length > 0) {
    io.to('admin').emit('stream-health', { streams })
  }
}, 10000)

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`)

  socket.on('join-stream', (streamId: string) => {
    if (!streamRooms.has(streamId)) {
      streamRooms.set(streamId, new Set())
    }
    streamRooms.get(streamId)!.add(socket.id)
    socket.join(streamId)
    broadcastViewerCount(streamId)
    console.log(`${socket.id} joined stream ${streamId} (${getViewerCount(streamId)} viewers)`)
  })

  socket.on('leave-stream', (streamId: string) => {
    streamRooms.get(streamId)?.delete(socket.id)
    socket.leave(streamId)
    broadcastViewerCount(streamId)
  })

  socket.on('chat-message', (data: { streamId: string; username: string; message: string; isAdmin?: boolean }) => {
    const msg = {
      id: Math.random().toString(36).substr(2, 9),
      streamId: data.streamId,
      username: data.username,
      message: data.message,
      isAdmin: data.isAdmin || false,
      isHighlighted: false,
      createdAt: new Date().toISOString(),
    }
    io.to(data.streamId).emit('chat-message', msg)
  })

  socket.on('admin-delete-message', (data: { streamId: string; messageId: string }) => {
    io.to(data.streamId).emit('message-deleted', { messageId: data.messageId })
  })

  socket.on('admin-highlight-message', (data: { streamId: string; messageId: string }) => {
    io.to(data.streamId).emit('message-highlighted', { messageId: data.messageId })
  })

  socket.on('stream-status', (data: { streamId: string; status: string }) => {
    io.to(data.streamId).emit('stream-status-update', { streamId: data.streamId, status: data.status })
  })

  // Admin goes live - broadcast to ALL clients
  socket.on('admin-go-live', (data: { streamId: string; title: string; category: string; homeTeam: string; awayTeam: string }) => {
    io.emit('stream-went-live', {
      streamId: data.streamId,
      title: data.title,
      category: data.category,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      status: 'live',
      viewerCount: 0,
      peakViewers: 0,
      homeScore: 0,
      awayScore: 0,
      matchTime: '0:00',
      isFeatured: true,
      timestamp: new Date().toISOString(),
    })
    console.log(`[LIVE] Admin started: ${data.title}`)
  })

  // Admin stops live
  socket.on('admin-stop-live', (data: { streamId: string }) => {
    io.emit('stream-went-offline', {
      streamId: data.streamId,
      timestamp: new Date().toISOString(),
    })
    console.log(`[OFFLINE] Stream stopped: ${data.streamId}`)
  })

  // Admin updates score
  socket.on('admin-update-score', (data: { streamId: string; homeScore: number; awayScore: number; matchTime: string }) => {
    io.emit('score-update', {
      streamId: data.streamId,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      matchTime: data.matchTime,
    })
    console.log(`[SCORE] ${data.homeScore}-${data.awayScore} (${data.matchTime})`)
  })

  // --- reaction-add ---
  socket.on('reaction-add', (data: { streamId: string; type: string; userId: string }) => {
    const { streamId, type, userId } = data
    if (!streamReactions.has(streamId)) {
      streamReactions.set(streamId, new Map())
    }
    const reactions = streamReactions.get(streamId)!
    reactions.set(type, (reactions.get(type) || 0) + 1)
    const count = reactions.get(type) || 0
    // Broadcast to stream room
    io.to(streamId).emit('reaction-add', { streamId, type, count, userId })
    // Global broadcast for viewer count update
    io.emit('reaction-add', { streamId, type, count })
  })

  // --- ad-impression ---
  socket.on('ad-impression', (data: { adId: string; streamId: string; userId: string; sessionId: string }) => {
    console.log(`[AD-IMP] adId=${data.adId} streamId=${data.streamId} userId=${data.userId} sessionId=${data.sessionId}`)
    socket.emit('ad-impression-ack', { adId: data.adId, success: true })
  })

  // --- viewer-join ---
  socket.on('viewer-join', (data: { streamId: string; userId: string; sessionId: string }) => {
    const { streamId, userId, sessionId } = data
    // Track session
    if (!viewerSessions.has(streamId)) {
      viewerSessions.set(streamId, new Map())
    }
    const sessions = viewerSessions.get(streamId)!
    sessions.set(sessionId, { userId, joinedAt: Date.now() })
    // Join the room
    socket.join(streamId)
    // Broadcast updated viewer count
    const viewerCount = sessions.size
    roomViewers.set(streamId, viewerCount)
    io.to(streamId).emit('viewer-join', { streamId, viewerCount, userId })
    console.log(`[VIEWER-JOIN] userId=${userId} streamId=${streamId} (total: ${viewerCount})`)
  })

  // --- viewer-leave ---
  socket.on('viewer-leave', (data: { streamId: string; sessionId: string }) => {
    const { streamId, sessionId } = data
    const sessions = viewerSessions.get(streamId)
    if (sessions) {
      sessions.delete(sessionId)
      const viewerCount = sessions.size
      roomViewers.set(streamId, viewerCount)
      io.to(streamId).emit('viewer-leave', { streamId, viewerCount })
      console.log(`[VIEWER-LEAVE] sessionId=${sessionId} streamId=${streamId} (remaining: ${viewerCount})`)
    }
  })

  socket.on('disconnect', () => {
    streamRooms.forEach((users, streamId) => {
      if (users.delete(socket.id)) {
        broadcastViewerCount(streamId)
      }
    })
    // Note: viewer sessions use sessionId (not socket.id), so cleanup happens via viewer-leave events
    console.log(`Disconnected: ${socket.id}`)
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3005
httpServer.listen(PORT, () => {
  console.log(`Chat service running on port ${PORT}`)
})

process.on('SIGTERM', () => {
  httpServer.close(() => process.exit(0))
})
process.on('SIGINT', () => {
  httpServer.close(() => process.exit(0))
})
