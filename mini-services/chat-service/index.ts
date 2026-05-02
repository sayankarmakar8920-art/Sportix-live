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

  socket.on('disconnect', () => {
    streamRooms.forEach((users, streamId) => {
      if (users.delete(socket.id)) {
        broadcastViewerCount(streamId)
      }
    })
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
