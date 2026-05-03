'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { io, Socket } from 'socket.io-client'
import { Heart, Zap, TrendingUp } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface LiveReactionsProps {
  streamId: string
  initialReactions?: { type: string; count: number }[]
  onReaction?: (type: string) => void
  position?: 'right' | 'bottom'
}

interface ReactionConfig {
  type: string
  emoji: string
  label: string
}

interface FloatingEmoji {
  id: string
  emoji: string
  x: number
  offsetX: number
  createdAt: number
}

interface ReactionSummaryProps {
  reactions: { type: string; count: number }[]
  compact?: boolean
}

// ─── Constants ───────────────────────────────────────────────────────────────

const REACTION_TYPES: ReactionConfig[] = [
  { type: 'like', emoji: '👍', label: 'Like' },
  { type: 'love', emoji: '❤️', label: 'Love' },
  { type: 'fire', emoji: '🔥', label: 'Fire' },
  { type: 'clap', emoji: '👏', label: 'Clap' },
  { type: 'wow', emoji: '😮', label: 'Wow' },
  { type: 'laugh', emoji: '😂', label: 'Laugh' },
]

const REACTION_MAP = Object.fromEntries(REACTION_TYPES.map((r) => [r.type, r]))
const FLOAT_DURATION = 1500
const POLL_INTERVAL = 10000
const MAX_FLOATING = 30

// ─── ReactionSummary (inline sub-component) ─────────────────────────────────

export function ReactionSummary({ reactions, compact = false }: ReactionSummaryProps) {
  const totalCount = reactions.reduce((sum, r) => sum + r.count, 0)
  const mostPopular = reactions.reduce(
    (best, r) => (r.count > best.count ? r : best),
    { type: '', count: 0 }
  )
  const topEmoji = REACTION_MAP[mostPopular.type]?.emoji ?? ''
  const displayReactions = reactions
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, compact ? 3 : 6)

  if (totalCount === 0) return null

  return (
    <div className={`flex items-center gap-2 ${compact ? '' : 'gap-3'}`}>
      {/* Total count */}
      <div className="flex items-center gap-1.5">
        {topEmoji && <span className="text-base">{topEmoji}</span>}
        {!topEmoji && <Heart className="h-4 w-4 text-[#00ff88]" />}
        <span className={`font-semibold text-white ${compact ? 'text-xs' : 'text-sm'}`}>
          {totalCount >= 1000 ? `${(totalCount / 1000).toFixed(1)}k` : totalCount}
        </span>
      </div>

      {/* Individual reaction badges */}
      <div className="flex items-center gap-1">
        {displayReactions.map((r) => {
          const config = REACTION_MAP[r.type]
          if (!config) return null
          return (
            <span
              key={r.type}
              className={`inline-flex items-center gap-0.5 rounded-full bg-white/5 px-1.5 ${
                compact ? 'py-0.5 text-[10px]' : 'py-1 text-xs'
              } text-white/60 tabular-nums`}
            >
              <span className="leading-none">{config.emoji}</span>
              <span>
                {r.count >= 1000 ? `${(r.count / 1000).toFixed(1)}k` : r.count}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

// ─── FloatingEmojis layer ───────────────────────────────────────────────────

function FloatingEmojis({ emojis }: { emojis: FloatingEmoji[] }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <AnimatePresence>
        {emojis.map((item) => (
          <motion.div
            key={item.id}
            className="absolute text-2xl select-none"
            style={{ left: item.x + item.offsetX, bottom: 8 }}
            initial={{ opacity: 1, scale: 1, y: 0 }}
            animate={{ opacity: 0, scale: 1.5, y: -200 }}
            exit={{ opacity: 0 }}
            transition={{ duration: FLOAT_DURATION / 1000, ease: 'easeOut' }}
          >
            {item.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ─── Main LiveReactions component ───────────────────────────────────────────

export default function LiveReactions({
  streamId,
  initialReactions = [],
  onReaction,
  position = 'right',
}: LiveReactionsProps) {
  // Reaction counts keyed by type
  const [counts, setCounts] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {}
    for (const r of REACTION_TYPES) init[r.type] = 0
    for (const r of initialReactions) init[r.type] = r.count
    return init
  })

  // Floating emoji animations
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([])
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // ── Socket.io for real-time updates ──────────────────────────────────────
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
      socket.emit('join-stream', streamId)
    })

    socket.on('reaction-update', (data: { type: string; count: number }) => {
      if (REACTION_MAP[data.type]) {
        setCounts((prev) => ({ ...prev, [data.type]: data.count }))
      }
    })

    // Fetch initial reactions from API
    fetch(`/api/reactions?streamId=${encodeURIComponent(streamId)}`)
      .then((r) => r.json())
      .then((data: { type: string; count: number }[] | null) => {
        if (Array.isArray(data)) {
          const fetched: Record<string, number> = {}
          for (const r of REACTION_TYPES) fetched[r.type] = 0
          for (const r of data) {
            if (REACTION_MAP[r.type]) fetched[r.type] = r.count
          }
          setCounts(fetched)
        }
      })
      .catch(() => {
        // Silently fail – initial counts from props will be used
      })

    return () => {
      socket.emit('leave-stream', streamId)
      socket.disconnect()
    }
  }, [streamId])

  // ── Poll for updated counts every 10 seconds ────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/reactions?streamId=${encodeURIComponent(streamId)}`)
        .then((r) => r.json())
        .then((data: { type: string; count: number }[] | null) => {
          if (Array.isArray(data)) {
            setCounts((prev) => {
              const next = { ...prev }
              for (const r of data) {
                if (REACTION_MAP[r.type]) next[r.type] = r.count
              }
              return next
            })
          }
        })
        .catch(() => {})
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [streamId])

  // ── Clean up expired floating emojis ────────────────────────────────────
  useEffect(() => {
    if (floatingEmojis.length === 0) return
    const timer = setTimeout(() => {
      setFloatingEmojis((prev) =>
        prev.filter((e) => Date.now() - e.createdAt < FLOAT_DURATION + 200)
      )
    }, FLOAT_DURATION + 300)
    return () => clearTimeout(timer)
  }, [floatingEmojis])

  // ── Handle reaction click ───────────────────────────────────────────────
  const handleReaction = useCallback(
    (config: ReactionConfig) => {
      // 1. Send to API
      fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId, type: config.type, increment: true }),
      }).catch(() => {
        // Fail silently
      })

      // 2. Optimistic increment
      setCounts((prev) => ({
        ...prev,
        [config.type]: prev[config.type] + 1,
      }))

      // 3. Trigger floating emoji
      const btnEl = buttonRefs.current.get(config.type)
      const parentEl = btnEl?.closest('[data-reaction-container]')
      let x = 0
      if (btnEl && parentEl) {
        const btnRect = btnEl.getBoundingClientRect()
        const parentRect = parentEl.getBoundingClientRect()
        x = btnRect.left - parentRect.left + btnRect.width / 2 - 16
      }

      setFloatingEmojis((prev) => {
        const next = [
          ...prev.slice(-(MAX_FLOATING - 1)),
          {
            id: `${config.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            emoji: config.emoji,
            x,
            offsetX: (Math.random() - 0.5) * 40, // ±20px
            createdAt: Date.now(),
          },
        ]
        return next
      })

      // 4. Callback
      onReaction?.(config.type)
    },
    [streamId, onReaction]
  )

  // ── Aggregate data ──────────────────────────────────────────────────────
  const totalCount = Object.values(counts).reduce((s, c) => s + c, 0)
  const topReaction = REACTION_TYPES.reduce(
    (best, r) => (counts[r.type] > counts[best.type] ? r : best),
    REACTION_TYPES[0]
  )

  // ── Position classes ────────────────────────────────────────────────────
  const containerClasses =
    position === 'right'
      ? 'absolute right-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2'
      : 'absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-row items-center gap-2'

  const buttonClasses =
    'w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-xl hover:scale-110 active:scale-95 transition-all cursor-pointer'

  return (
    <>
      {/* ── Aggregated count summary ───────────────────────────────────── */}
      {totalCount > 0 && position === 'right' && (
        <div
          className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm"
        >
          <Zap className="h-3.5 w-3.5 text-[#00ff88]" />
          <span className="text-xs font-semibold text-white tabular-nums">
            {totalCount >= 1000 ? `${(totalCount / 1000).toFixed(1)}k` : totalCount} reactions
          </span>
          <span className="text-sm">{topReaction.emoji}</span>
        </div>
      )}

      {totalCount > 0 && position === 'bottom' && (
        <div
          className="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm"
        >
          <TrendingUp className="h-3.5 w-3.5 text-[#00ff88]" />
          <span className="text-xs font-semibold text-white tabular-nums">
            {totalCount >= 1000 ? `${(totalCount / 1000).toFixed(1)}k` : totalCount}
          </span>
          <span className="text-sm">{topReaction.emoji}</span>
        </div>
      )}

      {/* ── Floating emojis layer ──────────────────────────────────────── */}
      <div data-reaction-container className="absolute inset-0 pointer-events-none z-20">
        <FloatingEmojis emojis={floatingEmojis} />
      </div>

      {/* ── Reaction buttons ───────────────────────────────────────────── */}
      <div className={`z-30 ${containerClasses}`} data-reaction-container="buttons">
        {REACTION_TYPES.map((config) => {
          const count = counts[config.type] ?? 0
          return (
            <div key={config.type} className="flex flex-col items-center gap-0.5">
              <button
                ref={(el) => {
                  if (el) buttonRefs.current.set(config.type, el)
                }}
                className={buttonClasses}
                onClick={() => handleReaction(config)}
                aria-label={`${config.label} reaction. Current count: ${count}`}
                title={`${config.label} (${count})`}
              >
                {config.emoji}
              </button>
              {count > 0 && (
                <span
                  className={`text-[10px] font-medium tabular-nums leading-none ${
                    position === 'right' ? 'text-[#00ff88]/80' : 'text-[#00ff88]/80'
                  }`}
                >
                  {count >= 1000 ? `${(count / 1000).toFixed(1)}k` : count}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
