'use client'

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from 'react'
import Hls from 'hls.js'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Eye,
  Radio,
  MessageCircle,
  Heart,
  Flame,
  ThumbsUp,
  Settings,
  Loader2,
  RefreshCw,
  PictureInPicture2,
  X,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════
   ║                         TYPES                                  ║
   ═══════════════════════════════════════════════════════════════════ */

interface OverlayAd {
  id: string
  mediaUrl: string
  targetUrl?: string
  title: string
}

export interface HLSPlayerProps {
  src: string
  isLive?: boolean
  streamKey?: string
  title?: string
  viewerCount?: number
  onViewerUpdate?: (count: number) => void
  onReaction?: (type: string) => void
  autoPlay?: boolean
  overlayAd?: OverlayAd | null
}

interface QualityLevel {
  index: number
  height: number
  width: number
  bitrate: number
  label: string
}

/* ═══════════════════════════════════════════════════════════════════
   ║                         HELPERS                                ║
   ═══════════════════════════════════════════════════════════════════ */

function formatTime(seconds: number): string {
  if (!seconds || !isFinite(seconds)) return '0:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatViewers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`
  return count.toString()
}

/* ═══════════════════════════════════════════════════════════════════
   ║                     COMPONENT                                   ║
   ═══════════════════════════════════════════════════════════════════ */

export default function HLSPlayer(props: HLSPlayerProps) {
  const {
    src,
    isLive = false,
    streamKey,
    title,
    viewerCount = 0,
    onViewerUpdate,
    onReaction,
    autoPlay = false,
    overlayAd = null,
  } = props

  /* ──────── Refs ──────── */
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animFrameRef = useRef<number>(0)

  /* ──────── Playback State ──────── */
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolume] = useState(0.8)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPip, setIsPip] = useState(false)

  /* ──────── UI State ──────── */
  const [showControls, setShowControls] = useState(true)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [qualityLevels, setQualityLevels] = useState<QualityLevel[]>([])
  const [currentQuality, setCurrentQuality] = useState(-1) // -1 = auto
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [hoverPosition, setHoverPosition] = useState(0)
  const [reactionBursts, setReactionBursts] = useState<
    { id: number; emoji: string; x: number }[]
  >([])

  /* ═══════════════════════════════════════════════════════════════════
     ║                    HLS.JS SETUP                               ║
     ═══════════════════════════════════════════════════════════════════ */

  const initHls = useCallback(() => {
    if (!videoRef.current || !src) return

    // Destroy previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    // Safari native HLS support
    if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = src
      videoRef.current.addEventListener('loadedmetadata', () => setIsLoading(false))
      videoRef.current.addEventListener('error', () => setHasError(true))
      if (autoPlay || isLive) {
        videoRef.current.play().catch(() => {})
      }
      return
    }

    if (!Hls.isSupported()) {
      queueMicrotask(() => setHasError(true))
      return
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: isLive,
      backBufferLength: 90,
      maxBufferLength: 30,
      maxMaxBufferLength: 600,
      startFragPrefetch: true,
      testBandwidth: true,
    })

    hls.loadSource(src)
    hls.attachMedia(videoRef.current)

    hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
      setIsLoading(false)

      // Build quality levels
      const levels: QualityLevel[] = data.levels.map((level, index) => ({
        index,
        height: level.height,
        width: level.width,
        bitrate: level.bitrate,
        label: `${level.height}p`,
      }))
      setQualityLevels(levels)

      // Auto-play live or when requested
      if (autoPlay || isLive) {
        videoRef.current
          ?.play()
          .then(() => {
            setIsPlaying(true)
            if (isLive) setIsMuted(true) // Live streams start muted for autoplay policy
          })
          .catch(() => {
            setIsMuted(true)
            videoRef.current?.play().catch(() => {})
          })
      }
    })

    hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      setCurrentQuality(data.level)
    })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // Try to recover network error
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError()
            break
          default:
            setHasError(true)
            setIsLoading(false)
            break
        }
      }
    })

    hls.on(Hls.Events.FRAG_BUFFERED, () => {
      setIsLoading(false)
    })

    hls.on(Hls.Events.BUFFER_APPENDING, () => {
      setIsLoading(false)
    })

    hlsRef.current = hls
  }, [src, autoPlay, isLive])

  /* ──────── Initialize on mount / src change ──────── */
  useEffect(() => {
    // Reset state asynchronously to satisfy lint rule (set-state-in-effect)
    queueMicrotask(() => {
      setHasError(false)
      setIsLoading(true)
    })
    initHls()
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current)
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [initHls])

  /* ═══════════════════════════════════════════════════════════════════
     ║                  VIDEO EVENT LISTENERS                         ║
     ═══════════════════════════════════════════════════════════════════ */

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onTimeUpdate = () => setCurrentTime(video.currentTime)
    const onDurationChange = () => setDuration(video.duration)
    const onProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1))
      }
    }
    const onWaiting = () => setIsLoading(true)
    const onCanPlay = () => setIsLoading(false)
    const onVolumeChange = () => {
      setIsMuted(video.muted)
      setVolume(video.volume)
    }

    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('timeupdate', onTimeUpdate)
    video.addEventListener('durationchange', onDurationChange)
    video.addEventListener('progress', onProgress)
    video.addEventListener('waiting', onWaiting)
    video.addEventListener('canplay', onCanPlay)
    video.addEventListener('volumechange', onVolumeChange)

    return () => {
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('timeupdate', onTimeUpdate)
      video.removeEventListener('durationchange', onDurationChange)
      video.removeEventListener('progress', onProgress)
      video.removeEventListener('waiting', onWaiting)
      video.removeEventListener('canplay', onCanPlay)
      video.removeEventListener('volumechange', onVolumeChange)
    }
  }, [])

  /* ──────── Progress animation frame (VOD only) ──────── */
  useEffect(() => {
    if (isLive || !isPlaying) return

    const update = () => {
      if (videoRef.current) {
        setCurrentTime(videoRef.current.currentTime)
        if (videoRef.current.buffered.length > 0) {
          setBuffered(
            videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
          )
        }
      }
      animFrameRef.current = requestAnimationFrame(update)
    }
    animFrameRef.current = requestAnimationFrame(update)

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    }
  }, [isLive, isPlaying])

  /* ═══════════════════════════════════════════════════════════════════
     ║                    CONTROLS AUTO-HIDE                          ║
     ═══════════════════════════════════════════════════════════════════ */

  const resetControlsTimer = useCallback(() => {
    setShowControls(true)
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false)
        setShowVolumeSlider(false)
        setShowQualityMenu(false)
      }, 3000)
    }
  }, [isPlaying])

  // Keep controls visible when not playing, auto-hide when playing
  useEffect(() => {
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    if (!isPlaying) {
      queueMicrotask(() => setShowControls(true))
      return
    }
    // Playing: show controls briefly then auto-hide
    queueMicrotask(() => setShowControls(true))
    controlsTimerRef.current = setTimeout(() => {
      setShowControls(false)
      setShowVolumeSlider(false)
      setShowQualityMenu(false)
    }, 3000)
    return () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
    }
  }, [isPlaying])

  /* ═══════════════════════════════════════════════════════════════════
     ║                    FULLSCREEN HANDLING                         ║
     ═══════════════════════════════════════════════════════════════════ */

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  /* ═══════════════════════════════════════════════════════════════════
     ║                    CONTROL HANDLERS                            ║
     ═══════════════════════════════════════════════════════════════════ */

  const togglePlay = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
    resetControlsTimer()
  }, [resetControlsTimer])

  const toggleMute = useCallback(() => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }, [])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current
    if (!video) return
    const vol = parseFloat(e.target.value)
    video.volume = vol
    video.muted = vol === 0
    setVolume(vol)
    setIsMuted(vol === 0)
  }, [])

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  const togglePiP = useCallback(async () => {
    const video = videoRef.current
    if (!video) return
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture()
        setIsPip(false)
      } else {
        await video.requestPictureInPicture()
        setIsPip(true)
      }
    } catch {
      // PiP not supported
    }
  }, [])

  const handleQualityChange = useCallback(
    (index: number) => {
      const hls = hlsRef.current
      if (!hls) return
      hls.currentLevel = index
      setCurrentQuality(index)
      setShowQualityMenu(false)
    },
    []
  )

  const handleSeek = useCallback(
    (e: ReactMouseEvent<HTMLDivElement> | ReactTouchEvent<HTMLDivElement>) => {
      const bar = e.currentTarget
      const rect = bar.getBoundingClientRect()
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      if (videoRef.current && !isLive && duration) {
        videoRef.current.currentTime = percent * duration
      }
    },
    [isLive, duration]
  )

  const handleProgressHover = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      const bar = e.currentTarget
      const rect = bar.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      setHoverTime(percent * duration)
      setHoverPosition(e.clientX - rect.left)
    },
    [duration]
  )

  const handleRetry = useCallback(() => {
    setHasError(false)
    initHls()
  }, [initHls])

  const handleReaction = useCallback(
    (type: string, emoji: string) => {
      onReaction?.(type)
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return
      const id = Date.now() + Math.random()
      const x = rect.width * 0.75 + Math.random() * rect.width * 0.15
      setReactionBursts((prev) => [...prev, { id, emoji, x }])
      setTimeout(() => {
        setReactionBursts((prev) => prev.filter((b) => b.id !== id))
      }, 1500)
    },
    [onReaction]
  )

  /* ═══════════════════════════════════════════════════════════════════
     ║                    MOUSE / TOUCH EVENTS                        ║
     ═══════════════════════════════════════════════════════════════════ */

  const handleMouseMove = useCallback(() => {
    resetControlsTimer()
  }, [resetControlsTimer])

  const handleMouseLeave = useCallback(() => {
    if (isPlaying) {
      controlsTimerRef.current = setTimeout(() => {
        setShowControls(false)
        setShowVolumeSlider(false)
        setShowQualityMenu(false)
      }, 1000)
    }
  }, [isPlaying])

  const handleContainerClick = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      // Don't toggle if clicking on controls
      if ((e.target as HTMLElement).closest('[data-controls]')) return
      togglePlay()
    },
    [togglePlay]
  )

  const handleTouchToggle = useCallback(
    (e: ReactTouchEvent<HTMLDivElement>) => {
      if ((e.target as HTMLElement).closest('[data-controls]')) return
      if (showControls) {
        setShowControls(false)
        setShowVolumeSlider(false)
        setShowQualityMenu(false)
      } else {
        resetControlsTimer()
      }
    },
    [showControls, resetControlsTimer]
  )

  /* ═══════════════════════════════════════════════════════════════════
     ║                       RENDER                                   ║
     ═══════════════════════════════════════════════════════════════════ */

  const progress = duration ? (currentTime / duration) * 100 : 0
  const bufferProgress = duration ? (buffered / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-black select-none"
      style={{ aspectRatio: isLive ? '16/9' : '16/9' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleContainerClick}
      onTouchEnd={handleTouchToggle}
    >
      {/* ──── Video Element ──── */}
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain"
        playsInline
        muted={isMuted}
        preload="auto"
      />

      {/* ──── Loading Spinner ──── */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-[#00ff88]" />
            {isLive && (
              <span className="text-xs font-medium text-white/50">
                Connecting to live stream...
              </span>
            )}
          </div>
        </div>
      )}

      {/* ──── Error State ──── */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="flex flex-col items-center gap-4 text-center px-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ff3b3b]/10 ring-1 ring-[#ff3b3b]/20">
              <Radio className="h-8 w-8 text-[#ff3b3b]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Stream Unavailable
              </p>
              <p className="mt-1 text-xs text-white/40">
                {isLive
                  ? 'The live stream may have ended or is experiencing issues.'
                  : 'Unable to load this video. Please check your connection.'}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRetry()
              }}
              className="mt-2 flex items-center gap-2 rounded-xl bg-[#00ff88] px-5 py-2.5 text-sm font-bold text-[#02040a] transition-all hover:bg-[#00cc6a] active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ──── Overlay Ad Banner ──── */}
      {overlayAd && !hasError && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-3 py-2"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, transparent 100%)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {overlayAd.mediaUrl && (
              <img
                src={overlayAd.mediaUrl}
                alt={overlayAd.title}
                className="h-6 w-auto rounded object-contain"
              />
            )}
            <span className="truncate text-[10px] font-medium text-white/60">
              {overlayAd.title}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (overlayAd.targetUrl) {
                window.open(overlayAd.targetUrl, '_blank', 'noopener')
              }
            }}
            className="flex-shrink-0 rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/70 transition-colors hover:bg-white/20"
          >
            Visit
          </button>
        </div>
      )}

      {/* ──── Live Indicator + Viewer Count (top-left / top-right) ──── */}
      {showControls && !hasError && (
        <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-3 pointer-events-none">
          {/* Left side: Live badge + title */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {isLive && (
              <span className="flex items-center gap-1.5 rounded-lg bg-[#ff3b3b] px-2.5 py-1 text-[10px] font-bold text-white shadow-lg shadow-[#ff3b3b]/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
                </span>
                LIVE
              </span>
            )}
            {title && !isLive && (
              <span className="hidden sm:block max-w-[300px] truncate rounded-lg bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
                {title}
              </span>
            )}
          </div>

          {/* Right side: Viewer count */}
          {isLive && viewerCount > 0 && (
            <div className="flex items-center gap-1.5 rounded-lg bg-black/40 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm pointer-events-auto">
              <Eye className="h-3.5 w-3.5 text-white/60" />
              {formatViewers(viewerCount)}
            </div>
          )}
        </div>
      )}

      {/* ──── Play/Pause center overlay ──── */}
      {!isPlaying && !isLoading && !hasError && showControls && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-md transition-transform"
            style={{
              boxShadow: '0 0 40px rgba(0,0,0,0.5)',
            }}
          >
            <Play className="h-7 w-7 text-white ml-1" fill="white" />
          </div>
        </div>
      )}

      {/* ──── Reaction Buttons (floating, right side) ──── */}
      {showControls && !hasError && (
        <div
          className="absolute right-3 bottom-24 z-10 flex flex-col gap-2 pointer-events-auto"
          data-controls
        >
          {[
            { type: 'like', emoji: '👍', Icon: ThumbsUp },
            { type: 'love', emoji: '❤️', Icon: Heart },
            { type: 'fire', emoji: '🔥', Icon: Flame },
          ].map(({ type, emoji, Icon }) => (
            <button
              key={type}
              onClick={(e) => {
                e.stopPropagation()
                handleReaction(type, emoji)
              }}
              className="group relative flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white/80 backdrop-blur-sm transition-all hover:bg-white/10 hover:scale-110 active:scale-95"
              title={type}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>
      )}

      {/* ──── Reaction Burst Animations ──── */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {reactionBursts.map((burst) => (
          <span
            key={burst.id}
            className="absolute bottom-32 text-2xl animate-bounce"
            style={{
              left: burst.x,
              animation: 'reactionFloat 1.5s ease-out forwards',
            }}
          >
            {burst.emoji}
          </span>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
         ║                  CONTROLS BAR (Bottom)                      ║
         ═══════════════════════════════════════════════════════════════ */}
      {showControls && !hasError && (
        <div
          className="absolute bottom-0 left-0 right-0 z-10 transition-opacity duration-300"
          data-controls
          style={{
            background:
              'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
          }}
        >
          {/* ──── Progress Bar (VOD only) ──── */}
          {!isLive && (
            <div className="relative px-3 pt-8 pb-1">
              {/* Hover time tooltip */}
              {hoverTime !== null && (
                <div
                  className="absolute -top-8 z-20 rounded bg-black/80 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm"
                  style={{
                    left: hoverPosition,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}

              {/* Clickable progress bar */}
              <div
                className="group relative h-1 w-full cursor-pointer rounded-full bg-white/10 transition-all hover:h-1.5"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSeek(e)
                }}
                onMouseMove={handleProgressHover}
                onMouseLeave={() => setHoverTime(null)}
              >
                {/* Buffered */}
                <div
                  className="absolute top-0 left-0 h-full rounded-full bg-white/20 transition-all"
                  style={{ width: `${bufferProgress}%` }}
                />
                {/* Progress */}
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all"
                  style={{
                    width: `${progress}%`,
                    background:
                      'linear-gradient(90deg, #00ff88, #00cc6a)',
                  }}
                />
                {/* Thumb */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-[#00ff88] shadow-lg opacity-0 transition-opacity group-hover:opacity-100"
                  style={{
                    left: `${progress}%`,
                    transform: `translate(-50%, -50%)`,
                    boxShadow: '0 0 10px rgba(0, 255, 136, 0.5)',
                  }}
                />
              </div>
            </div>
          )}

          {/* ──── Live progress bar (thin green line) ──── */}
          {isLive && (
            <div className="h-[2px] w-full bg-white/5">
              <div
                className="h-full bg-[#00ff88]"
                style={{
                  width: '100%',
                  animation: 'livePulse 2s ease-in-out infinite',
                }}
              />
            </div>
          )}

          {/* ──── Control Buttons Row ──── */}
          <div className="flex items-center justify-between px-3 pb-3 pt-1">
            {/* Left controls */}
            <div className="flex items-center gap-1">
              {/* Play / Pause */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlay()
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/90 transition-all hover:bg-white/10 hover:text-white active:scale-95"
              >
                {isPlaying ? (
                  <Pause className="h-5 w-5" />
                ) : (
                  <Play className="h-5 w-5" fill="white" />
                )}
              </button>

              {/* Volume */}
              <div
                className="relative flex items-center"
                onMouseEnter={() => setShowVolumeSlider(true)}
                onMouseLeave={() => setShowVolumeSlider(false)}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleMute()
                  }}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-white/90 transition-all hover:bg-white/10 hover:text-white active:scale-95"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </button>

                {/* Volume slider */}
                <div
                  className={`absolute left-9 top-1/2 -translate-y-1/2 flex items-center px-1 transition-all ${
                    showVolumeSlider
                      ? 'w-24 opacity-100'
                      : 'w-0 overflow-hidden opacity-0'
                  }`}
                >
                  <div className="flex h-1 w-full items-center rounded-full bg-white/20">
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:hover:bg-[#00ff88] [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
                      style={{
                        background: `linear-gradient(to right, #00ff88 ${
                          (isMuted ? 0 : volume) * 100
                        }%, rgba(255,255,255,0.2) ${(isMuted ? 0 : volume) * 100}%)`,
                        height: '4px',
                        borderRadius: '9999px',
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Time display (VOD) */}
              {!isLive && (
                <span className="ml-2 text-[11px] font-medium text-white/50 tabular-nums">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              )}

              {/* Live badge in controls */}
              {isLive && (
                <span className="ml-2 flex items-center gap-1 text-[10px] font-bold text-[#ff3b3b]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ff3b3b] opacity-75" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#ff3b3b]" />
                  </span>
                  LIVE
                </span>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-0.5">
              {/* Chat toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowChat(!showChat)
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all active:scale-95 ${
                  showChat
                    ? 'bg-[#00ff88]/15 text-[#00ff88]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title="Live Chat"
              >
                <MessageCircle className="h-5 w-5" />
              </button>

              {/* Quality selector */}
              {qualityLevels.length > 0 && (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowQualityMenu(!showQualityMenu)
                      setShowVolumeSlider(false)
                    }}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-95"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {currentQuality === -1
                        ? 'Auto'
                        : qualityLevels[currentQuality]?.label || 'Auto'}
                    </span>
                  </button>

                  {/* Quality dropdown */}
                  {showQualityMenu && (
                    <div
                      className="absolute bottom-full right-0 mb-2 w-40 overflow-hidden rounded-xl border border-white/10 bg-[#0b0f14]/95 p-1 shadow-2xl backdrop-blur-xl"
                      data-controls
                    >
                      <p className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-white/30">
                        Quality
                      </p>
                      {/* Auto option */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQualityChange(-1)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                          currentQuality === -1
                            ? 'bg-[#00ff88]/10 text-[#00ff88]'
                            : 'text-white/60 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>Auto</span>
                        {currentQuality === -1 && (
                          <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                        )}
                      </button>
                      {qualityLevels.map((level) => (
                        <button
                          key={level.index}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleQualityChange(level.index)
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                            currentQuality === level.index
                              ? 'bg-[#00ff88]/10 text-[#00ff88]'
                              : 'text-white/60 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span>{level.label}</span>
                          {currentQuality === level.index && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff88]" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PiP */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  togglePiP()
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all active:scale-95 ${
                  isPip
                    ? 'bg-[#00ff88]/15 text-[#00ff88]'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
                title="Picture in Picture"
              >
                <PictureInPicture2 className="h-4 w-4" />
              </button>

              {/* Fullscreen */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFullscreen()
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-all hover:bg-white/10 hover:text-white active:scale-95"
                title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              >
                {isFullscreen ? (
                  <Minimize className="h-5 w-5" />
                ) : (
                  <Maximize className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
         ║                 LIVE CHAT SIDE PANEL                         ═
         ═══════════════════════════════════════════════════════════════ */}
      {showChat && (
        <div
          className="absolute top-0 right-0 bottom-0 z-20 w-72 sm:w-80 border-l border-white/10 bg-[#0b0f14]/95 backdrop-blur-xl flex flex-col"
          data-controls
          onClick={(e) => e.stopPropagation()}
        >
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-[#00ff88]" />
              <span className="text-sm font-semibold text-white">
                Live Chat
              </span>
              {isLive && (
                <span className="flex items-center gap-1 rounded-md bg-[#ff3b3b]/15 px-1.5 py-0.5 text-[9px] font-bold text-[#ff3b3b]">
                  <span className="h-1 w-1 rounded-full bg-[#ff3b3b] animate-pulse" />
                  LIVE
                </span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowChat(false)
              }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/10 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {/* Placeholder messages */}
            {[
              { user: 'SportFan42', msg: 'What a game! 🔥', time: '2m' },
              { user: 'GoalKing', msg: 'That was an incredible play!', time: '1m' },
              { user: 'LiveFan', msg: 'Stream quality is amazing', time: '45s' },
              { user: 'ScoreWatch', msg: 'This is going to be a close match', time: '30s' },
              { user: 'Champion99', msg: '⭐ Let\'s go! ⭐', time: '15s' },
              { user: 'TacticPro', msg: 'Great formation by the coach', time: '5s' },
            ].map((chat, i) => (
              <div
                key={i}
                className="rounded-lg px-3 py-2 transition-colors hover:bg-white/[0.03]"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold text-[#00ff88]">
                    {chat.user}
                  </span>
                  <span className="text-[9px] text-white/20">{chat.time}</span>
                </div>
                <p className="mt-0.5 text-xs text-white/70">{chat.msg}</p>
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="border-t border-white/5 p-3">
            <input
              type="text"
              placeholder="Send a message..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#00ff88]/30 focus:outline-none"
              onClick={(e) => e.stopPropagation()}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
         ║                      CSS ANIMATIONS                           ═
         ═══════════════════════════════════════════════════════════════ */}
      <style jsx>{`
        @keyframes reactionFloat {
          0% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-60px) scale(1.2);
          }
          100% {
            opacity: 0;
            transform: translateY(-120px) scale(0.8);
          }
        }

        @keyframes livePulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  )
}
