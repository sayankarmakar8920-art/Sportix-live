'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, CloudUpload, Play, Pencil, Trash2, MoreHorizontal, Grid3X3,
  List, ChevronLeft, ChevronRight, Filter, Calendar, Clock, Eye, HardDrive,
  Video, FolderOpen, Plus, X, Check, AlertTriangle,
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN TOKENS (matches AdminPanel)
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#141414',
  card: '#1a1a1a',
  border: 'rgba(255,255,255,0.08)',
  borderHover: 'rgba(255,255,255,0.12)',
  accent: '#E50914',
  accentDim: 'rgba(229,9,20,0.12)',
  accentGlow: 'rgba(229,9,20,0.30)',
  success: '#46d369',
  successDim: 'rgba(70,211,105,0.12)',
  warning: '#f5c518',
  info: '#0071eb',
  infoDim: 'rgba(0,113,235,0.12)',
  purple: '#9b59b6',
  purpleDim: 'rgba(155,89,182,0.12)',
  text: '#ffffff',
  textSec: '#b3b3b3',
  textTer: '#808080',
  textDim: '#555555',
}

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface VideoItem {
  id: string
  title: string
  thumbnail: string
  duration: number // seconds
  category: string
  views: number
  createdAt: string
  fileSize: number
  videoUrl: string
  isFeatured: boolean
  status: 'published' | 'processing' | 'draft'
}

type ViewMode = 'grid' | 'list'

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */
function fmtDuration(sec: number): string {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}
function fmtViews(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}
function fmtBytes(bytes: number): string {
  if (bytes >= 1e9) return (bytes / 1e9).toFixed(1) + ' GB'
  if (bytes >= 1e6) return (bytes / 1e6).toFixed(1) + ' MB'
  if (bytes >= 1e3) return (bytes / 1e3).toFixed(1) + ' KB'
  return bytes + ' B'
}
function fmtDate(d: string): string {
  try {
    const dt = new Date(d)
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch { return d }
}

/* ═══════════════════════════════════════════════════════════════
   GLASS CARD
   ═══════════════════════════════════════════════════════════════ */
function GlassCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={`rounded-2xl ${className}`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {children}
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VIDEO CARD (GRID)
   ═══════════════════════════════════════════════════════════════ */
function VideoGridCard({ video, index, onWatch, onEdit, onDelete }: {
  video: VideoItem; index: number
  onWatch: (v: VideoItem) => void; onEdit: (v: VideoItem) => void; onDelete: (v: VideoItem) => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl overflow-hidden group cursor-pointer"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Thumbnail */}
      <div className="relative aspect-video overflow-hidden" style={{ background: '#0a0a0a' }}>
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="h-10 w-10" style={{ color: C.textDim }} />
          </div>
        )}
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ background: 'rgba(0,0,0,0.8)' }}>
          {fmtDuration(video.duration)}
        </div>
        {/* Play overlay on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={() => onWatch(video)}
            >
              <div className="h-12 w-12 rounded-full flex items-center justify-center" style={{ background: C.accent, boxShadow: `0 4px 20px ${C.accentGlow}` }}>
                <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Status badge */}
        {video.status === 'processing' && (
          <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md px-2 py-0.5 text-[9px] font-bold" style={{ background: C.infoDim, color: C.info }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Clock className="h-3 w-3" />
            </motion.div>
            Processing
          </div>
        )}
        {video.status === 'draft' && (
          <div className="absolute top-2 left-2 rounded-md px-2 py-0.5 text-[9px] font-bold" style={{ background: 'rgba(255,255,255,0.08)', color: C.textTer }}>
            Draft
          </div>
        )}
        {/* Featured badge */}
        {video.isFeatured && (
          <div className="absolute top-2 right-2 rounded-md px-2 py-0.5 text-[9px] font-bold" style={{ background: C.warning + '20', color: C.warning }}>
            ★ Featured
          </div>
        )}
        {/* More button */}
        <button className="absolute top-2 right-2 h-7 w-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <MoreHorizontal className="h-4 w-4 text-white" />
        </button>
      </div>
      {/* Info */}
      <div className="p-3.5 space-y-2">
        <h3 className="text-sm font-semibold text-white truncate">{video.title}</h3>
        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{ background: C.purpleDim, color: C.purple }}>
          {video.category || 'Uncategorized'}
        </span>
        <div className="flex items-center gap-3 text-[10px]" style={{ color: C.textTer }}>
          <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {fmtViews(video.views)} views</span>
          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {fmtDate(video.createdAt)}</span>
          <span className="flex items-center gap-1"><HardDrive className="h-3 w-3" /> {fmtBytes(video.fileSize)}</span>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onWatch(video)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-medium text-white transition-all hover:brightness-125"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <Play className="h-3.5 w-3.5" fill="currentColor" /> Watch
          </button>
          <button
            onClick={() => onEdit(video)}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 text-[11px] font-medium text-white transition-all hover:bg-white/[0.08]"
            style={{ background: 'rgba(255,255,255,0.06)' }}
          >
            <Pencil className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={() => onDelete(video)}
            className="flex items-center justify-center h-8 w-8 rounded-xl transition-all hover:bg-red-500/20"
            style={{ background: 'rgba(229,9,20,0.1)', color: C.accent }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VIDEO ROW (LIST)
   ═══════════════════════════════════════════════════════════════ */
function VideoListRow({ video, onWatch, onEdit, onDelete }: {
  video: VideoItem
  onWatch: (v: VideoItem) => void; onEdit: (v: VideoItem) => void; onDelete: (v: VideoItem) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-4 rounded-xl p-3 transition-all hover:bg-white/[0.02] group"
      style={{ border: '1px solid transparent' }}
      onMouseEnter={e => e.currentTarget.style.borderColor = C.border}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
    >
      {/* Thumbnail */}
      <div className="relative w-36 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer" style={{ background: '#0a0a0a' }} onClick={() => onWatch(video)}>
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="h-6 w-6" style={{ color: C.textDim }} />
          </div>
        )}
        <div className="absolute bottom-1 right-1 rounded px-1 py-0.5 text-[9px] font-bold text-white" style={{ background: 'rgba(0,0,0,0.8)' }}>
          {fmtDuration(video.duration)}
        </div>
      </div>
      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-white truncate">{video.title}</h3>
        <div className="flex items-center gap-3 mt-1 text-[10px]" style={{ color: C.textTer }}>
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-semibold" style={{ background: C.purpleDim, color: C.purple }}>{video.category || 'Uncategorized'}</span>
          <span>{fmtViews(video.views)} views</span>
          <span>{fmtDate(video.createdAt)}</span>
          <span>{fmtBytes(video.fileSize)}</span>
        </div>
      </div>
      {/* Status */}
      <div className="flex-shrink-0">
        <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-semibold" style={{
          background: video.status === 'published' ? C.successDim : video.status === 'processing' ? C.infoDim : 'rgba(255,255,255,0.06)',
          color: video.status === 'published' ? C.success : video.status === 'processing' ? C.info : C.textTer,
        }}>
          {video.status === 'published' && <span className="h-1.5 w-1.5 rounded-full bg-current mr-1" />}
          {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
        </span>
      </div>
      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onWatch(video)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }}>
          <Play className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onEdit(video)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06]" style={{ color: C.textSec }}>
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button onClick={() => onDelete(video)} className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-red-500/15" style={{ color: C.accent }}>
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   DELETE CONFIRMATION MODAL
   ═══════════════════════════════════════════════════════════════ */
function DeleteModal({ video, onConfirm, onCancel }: { video: VideoItem; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md rounded-2xl p-6 space-y-4"
        style={{ background: '#181818', border: '1px solid rgba(255,255,255,0.08)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(229,9,20,0.12)' }}>
            <AlertTriangle className="h-5 w-5" style={{ color: C.accent }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Delete Video</h3>
            <p className="text-xs" style={{ color: C.textTer }}>This action cannot be undone</p>
          </div>
        </div>
        <p className="text-sm" style={{ color: C.textSec }}>
          Are you sure you want to delete <strong className="text-white">"{video.title}"</strong>?
        </p>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={onCancel} className="rounded-xl px-4 py-2 text-xs font-medium transition-all hover:bg-white/[0.04]" style={{ color: C.textSec, border: `1px solid ${C.border}` }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all hover:brightness-110" style={{ background: C.accent }}>
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function VideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState<VideoItem | null>(null)
  const [perPage, setPerPage] = useState(12)
  const fileInputRef = useState<HTMLInputElement | null>(null)[0] as any
  const inputRef = useCallback((node: HTMLInputElement | null) => { (fileInputRef as any) = node }, [])

  /* Fetch videos from API */
  const fetchVideos = useCallback(async () => {
    try {
      const res = await fetch('/api/videos')
      if (res.ok) {
        const data = await res.json()
        const list: VideoItem[] = Array.isArray(data) ? data : data.videos || []
        setVideos(list.map((v: any) => ({
          id: v.id,
          title: v.title || 'Untitled',
          thumbnail: v.thumbnail || '',
          duration: v.duration || 0,
          category: v.category || 'Uncategorized',
          views: v.views || 0,
          createdAt: v.createdAt || new Date().toISOString(),
          fileSize: v.fileSize || 0,
          videoUrl: v.videoUrl || '',
          isFeatured: v.isFeatured || false,
          status: v.status || 'published',
        })))
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchVideos() }, [fetchVideos])

  /* Extract unique categories */
  const categories = useMemo(() => {
    const cats = new Set(videos.map(v => v.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [videos])

  /* Filtered & sorted */
  const filtered = useMemo(() => {
    let result = [...videos]
    if (search) result = result.filter(v => v.title.toLowerCase().includes(search.toLowerCase()))
    if (categoryFilter !== 'all') result = result.filter(v => v.category === categoryFilter)
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    if (sortBy === 'oldest') result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    if (sortBy === 'views') result.sort((a, b) => b.views - a.views)
    if (sortBy === 'name') result.sort((a, b) => a.title.localeCompare(b.title))
    if (sortBy === 'duration') result.sort((a, b) => b.duration - a.duration)
    return result
  }, [videos, search, categoryFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / perPage)
  const paged = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  /* Handlers */
  const handleWatch = useCallback((v: VideoItem) => {
    if (v.videoUrl) window.open(v.videoUrl, '_blank')
  }, [])
  const handleEdit = useCallback((v: VideoItem) => {
    /* Could open edit modal in future */
    alert(`Edit: ${v.title}`)
  }, [])
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return
    try {
      await fetch(`/api/videos?id=${deleteTarget.id}`, { method: 'DELETE' })
      setVideos(prev => prev.filter(v => v.id !== deleteTarget.id))
    } catch { /* silent */ }
    setDeleteTarget(null)
  }, [deleteTarget])
  const handleUpload = useCallback(() => {
    fileInputRef?.click()
  }, [fileInputRef])

  /* Loading state */
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: C.infoDim }}>
            <Video className="h-5 w-5" style={{ color: C.info }} />
          </div>
          <div>
            <div className="h-5 w-40 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <div className="h-3 w-56 mt-1.5 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="aspect-video animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
              <div className="p-3.5 space-y-2">
                <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.06)' }} />
                <div className="h-3 w-1/3 rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="h-3 w-full rounded animate-pulse" style={{ background: 'rgba(255,255,255,0.03)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 min-w-0">
      {/* ═══ Page Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: C.infoDim }}>
            <Video className="h-5 w-5" style={{ color: C.info }} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Videos</h2>
            <p className="text-xs" style={{ color: C.textTer }}>Browse and manage your entire video library</p>
          </div>
        </div>
        <button
          onClick={handleUpload}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white transition-all hover:brightness-110 flex-shrink-0"
          style={{ background: C.accent, boxShadow: `0 4px 20px ${C.accentGlow}` }}
        >
          <CloudUpload className="h-4 w-4" /> Upload Video
        </button>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" />
      </motion.div>

      {/* ═══ Stats Bar ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: 'Total Videos', value: videos.length, icon: Video, color: C.info },
          { label: 'Published', value: videos.filter(v => v.status === 'published').length, icon: Check, color: C.success },
          { label: 'Total Views', value: fmtViews(videos.reduce((s, v) => s + v.views, 0)), icon: Eye, color: C.warning },
          { label: 'Storage Used', value: fmtBytes(videos.reduce((s, v) => s + v.fileSize, 0)), icon: HardDrive, color: C.purple },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}15` }}>
                <Icon className="h-4 w-4" style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-lg font-bold text-white leading-tight">{s.value}</p>
                <p className="text-[10px]" style={{ color: C.textDim }}>{s.label}</p>
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* ═══ Toolbar ═══ */}
      <GlassCard className="!p-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: C.border, background: 'rgba(255,255,255,0.02)' }}>
              <Search className="h-4 w-4 flex-shrink-0" style={{ color: C.textDim }} />
              <input
                type="text"
                placeholder="Search videos..."
                value={search}
                onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/15 focus:outline-none"
              />
            </div>
          </div>
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
            className="rounded-xl border px-3 py-2 text-xs text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
          >
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Sort */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="rounded-xl border px-3 py-2 text-xs text-white focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
          >
            <option value="newest">Sort by: Newest</option>
            <option value="oldest">Sort by: Oldest</option>
            <option value="views">Sort by: Most Views</option>
            <option value="name">Sort by: Name</option>
            <option value="duration">Sort by: Duration</option>
          </select>
          {/* View Toggle */}
          <div className="flex items-center rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
            <button
              onClick={() => setViewMode('grid')}
              className="h-9 w-9 flex items-center justify-center transition-all"
              style={{ background: viewMode === 'grid' ? C.accent : 'transparent', color: viewMode === 'grid' ? '#fff' : C.textTer }}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="h-9 w-9 flex items-center justify-center transition-all"
              style={{ background: viewMode === 'list' ? C.accent : 'transparent', color: viewMode === 'list' ? '#fff' : C.textTer }}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* ═══ Results Count ═══ */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium" style={{ color: C.textTer }}>
          Showing <span className="text-white">{paged.length}</span> of <span className="text-white">{filtered.length}</span> videos
        </p>
      </div>

      {/* ═══ Video Grid / List ═══ */}
      {paged.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paged.map((v, i) => (
              <VideoGridCard key={v.id} video={v} index={i} onWatch={handleWatch} onEdit={handleEdit} onDelete={setDeleteTarget} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {paged.map(v => (
              <VideoListRow key={v.id} video={v} onWatch={handleWatch} onEdit={handleEdit} onDelete={setDeleteTarget} />
            ))}
          </div>
        )
      ) : (
        <GlassCard className="!py-16">
          <div className="flex flex-col items-center gap-3">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)' }}>
              <Video className="h-8 w-8" style={{ color: C.textDim }} />
            </div>
            <p className="text-sm font-medium text-white">No videos found</p>
            <p className="text-xs" style={{ color: C.textTer }}>
              {search || categoryFilter !== 'all' ? 'Try changing your search or filters' : 'Upload your first video to get started'}
            </p>
            {!search && categoryFilter === 'all' && (
              <button
                onClick={handleUpload}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white mt-2 transition-all hover:brightness-110"
                style={{ background: C.accent }}
              >
                <Plus className="h-4 w-4" /> Upload Video
              </button>
            )}
          </div>
        </GlassCard>
      )}

      {/* ═══ Pagination ═══ */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-[10px]" style={{ color: C.textDim }}>
            Page {currentPage} of {totalPages} · {filtered.length} total videos
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/[0.04] disabled:opacity-30"
              style={{ color: C.textSec, border: `1px solid ${C.border}` }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let p: number
              if (totalPages <= 7) { p = i + 1 }
              else if (currentPage <= 4) { p = i + 1 }
              else if (currentPage >= totalPages - 3) { p = totalPages - 6 + i }
              else { p = currentPage - 3 + i }
              return (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className="h-8 w-8 rounded-lg flex items-center justify-center text-[11px] font-medium transition-all"
                  style={{
                    background: currentPage === p ? C.accent : 'transparent',
                    color: currentPage === p ? '#fff' : C.textTer,
                    border: `1px solid ${currentPage === p ? C.accent : C.border}`,
                  }}
                >
                  {p}
                </button>
              )
            })}
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/[0.04] disabled:opacity-30"
              style={{ color: C.textSec, border: `1px solid ${C.border}` }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {/* Per page */}
            <select
              value={perPage}
              onChange={e => { setPerPage(Number(e.target.value)); setCurrentPage(1) }}
              className="ml-2 rounded-lg border px-2 py-1 text-[10px] text-white focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border }}
            >
              <option value={8}>8 / page</option>
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={48}>48 / page</option>
            </select>
          </div>
        </div>
      )}

      {/* ═══ Delete Modal ═══ */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            video={deleteTarget}
            onConfirm={handleDelete}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
