'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAppStore } from '@/lib/store'
import { Send, Trash2, Star, Shield, Smile } from 'lucide-react'

interface ChatMessage {
  id: string
  streamId: string
  username: string
  message: string
  isAdmin?: boolean
  isHighlighted?: boolean
  createdAt: string
}

export default function LiveChat({ streamId, isAdmin = false }: { streamId: string; isAdmin?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [username, setUsername] = useState(`User_${Math.floor(Math.random() * 9999)}`)
  const [isConnected, setIsConnected] = useState(false)
  const [showUsernameInput, setShowUsernameInput] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const socket = io('/?XTransformPort=3005', {
      transports: ['websocket', 'polling'],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    })

    socketRef.current = socket

    socket.on('connect', () => {
      setIsConnected(true)
      socket.emit('join-stream', streamId)
    })

    socket.on('disconnect', () => setIsConnected(false))

    socket.on('chat-message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-99), msg])
    })

    socket.on('message-deleted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId))
    })

    socket.on('message-highlighted', ({ messageId }: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isHighlighted: true } : m))
      )
    })

    // Load initial messages from DB
    fetch(`/api/chat?streamId=${streamId}`)
      .then((r) => r.json())
      .then((msgs: ChatMessage[]) => setMessages(msgs))
      .catch(() => {})

    return () => {
      socket.emit('leave-stream', streamId)
      socket.disconnect()
    }
  }, [streamId])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = useCallback(() => {
    if (!socketRef.current || !input.trim()) return
    socketRef.current.emit('chat-message', {
      streamId,
      username,
      message: input.trim(),
      isAdmin,
    })
    setInput('')
  }, [streamId, username, input, isAdmin])

  const deleteMessage = (messageId: string) => {
    socketRef.current?.emit('admin-delete-message', { streamId, messageId })
  }

  const highlightMessage = (messageId: string) => {
    socketRef.current?.emit('admin-highlight-message', { streamId, messageId })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-white">Live Chat</h3>
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-[#00ff88]' : 'bg-[#ff3b3b]'}`} />
        </div>
        {isAdmin && (
          <span className="rounded-md bg-[#00ff88]/10 px-2 py-0.5 text-xs font-medium text-[#00ff88] ring-1 ring-[#00ff88]/20">
            Admin
          </span>
        )}
      </div>

      {/* Username input */}
      {showUsernameInput && (
        <div className="border-b border-white/5 p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#00ff88]/30 focus:outline-none"
              autoFocus
            />
            <button
              onClick={() => setShowUsernameInput(false)}
              className="rounded-lg bg-[#00ff88] px-3 py-2 text-sm font-medium text-[#02040a] transition-colors hover:bg-[#00cc6a]"
            >
              Join
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`group relative rounded-lg px-3 py-2 transition-colors ${
              msg.isHighlighted
                ? 'bg-[#00ff88]/5 ring-1 ring-[#00ff88]/10'
                : 'hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-semibold ${
                      msg.isAdmin ? 'text-[#00ff88]' : 'text-white/70'
                    }`}
                  >
                    {msg.isAdmin && <Shield className="inline h-3 w-3 mr-1" />}
                    {msg.username}
                  </span>
                  <span className="text-[10px] text-white/20">{formatTime(msg.createdAt)}</span>
                </div>
                <p className="mt-0.5 text-sm text-white/80 break-words">{msg.message}</p>
              </div>
              {isAdmin && (
                <div className="hidden items-center gap-1 group-hover:flex">
                  <button
                    onClick={() => highlightMessage(msg.id)}
                    className="rounded p-1 text-white/30 hover:text-[#00ff88] transition-colors"
                    title="Highlight"
                  >
                    <Star className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => deleteMessage(msg.id)}
                    className="rounded p-1 text-white/30 hover:text-[#ff3b3b] transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-white/20">
            <Smile className="h-8 w-8 mb-2" />
            <p className="text-sm">No messages yet</p>
          </div>
        )}
      </div>

      {/* Input */}
      {!showUsernameInput && (
        <div className="border-t border-white/5 p-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Send a message..."
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-[#00ff88]/30 focus:outline-none"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || !isConnected}
              className="flex items-center justify-center rounded-lg bg-[#00ff88] p-2 text-[#02040a] transition-all hover:bg-[#00cc6a] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
