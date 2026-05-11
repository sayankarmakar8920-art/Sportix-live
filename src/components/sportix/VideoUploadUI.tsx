'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  X, Video, Upload, CloudUpload, Trash2, Link as LinkIcon,
  Play, Pause, Volume2, Settings, Maximize, CheckCircle2,
  AlertCircle, ShieldCheck, Clock, ChevronDown, RefreshCw,
  Image as ImageIcon
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: '#0a0a0a',
  card: '#141414',
  border: 'rgba(255, 255, 255, 0.08)',
  accent: '#E50914',
  accentHover: '#c40812',
  text: '#ffffff',
  textSec: 'rgba(255, 255, 255, 0.45)',
  textDim: 'rgba(255, 255, 255, 0.25)',
  success: '#46d369',
  warning: '#f5c518',
  info: '#0071eb',
  glass: 'rgba(255, 255, 255, 0.03)',
  glassHover: 'rgba(255, 255, 255, 0.06)',
  inputBg: 'rgba(255, 255, 255, 0.02)',
}

interface VideoUploadUIProps {
  onClose: () => void
}

const VideoUploadUI = React.memo(function VideoUploadUI({ onClose }: VideoUploadUIProps) {
  const [activeTab, setActiveTab] = useState('video')
  const [title, setTitle] = useState('Nature Cinematic Trailer')
  const [description, setDescription] = useState('A cinematic trailer showcasing the beauty of nature, stunning landscapes, and peaceful moments.')
  const [category, setCategory] = useState('Travel & Nature')
  const [quality, setQuality] = useState('1080p')
  const [duration, setDuration] = useState('01:28')
  const [isFeatured, setIsFeatured] = useState(false)
  const [isTrending, setIsTrending] = useState(false)
  const [isLive, setIsLive] = useState(false)
  
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const [thumbnails, setThumbnails] = useState<string[]>([
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=300',
    'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=300',
  ])
  const [selectedThumbnail, setSelectedThumbnail] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
      setTitle(selectedFile.name.split('.').slice(0, -1).join('.'))
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setIsUploading(true)
    setUploadStatus('Initializing...')
    setUploadProgress(0)

    try {
      const CHUNK_SIZE = 10 * 1024 * 1024 // 10MB
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
      
      // 1. Initialize multipart upload
      const initRes = await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({
          action: 'init',
          filename: file.name,
          contentType: file.type,
        }),
      })
      const { uploadId, key } = await initRes.json()

      const parts: { ETag: string; PartNumber: number }[] = []
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE
        const end = Math.min(start + CHUNK_SIZE, file.size)
        const chunk = file.slice(start, end)
        
        setUploadStatus(`Uploading part ${i + 1}/${totalChunks}...`)
        
        const formData = new FormData()
        formData.append('action', 'uploadPart')
        formData.append('uploadId', uploadId)
        formData.append('key', key)
        formData.append('partNumber', (i + 1).toString())
        formData.append('chunk', chunk)

        const partRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })
        const { etag } = await partRes.json()
        parts.push({ ETag: etag, PartNumber: i + 1 })
        
        setUploadProgress(Math.round(((i + 1) / totalChunks) * 90))
      }

      // 2. Complete upload
      setUploadStatus('Finalizing...')
      await fetch('/api/upload', {
        method: 'POST',
        body: JSON.stringify({
          action: 'complete',
          uploadId,
          key,
          parts,
          metadata: {
            title,
            description,
            category,
            quality,
            duration,
            isFeatured,
            isTrending,
            isLive,
          }
        }),
      })

      setUploadProgress(100)
      setUploadStatus('Upload Complete!')
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      console.error('Upload failed:', err)
      setUploadStatus('Upload Failed')
    } finally {
      setIsUploading(false)
    }
  }

  const clearForm = () => {
    setTitle('')
    setDescription('')
    setFile(null)
    setPreviewUrl(null)
  }

  /* ──────────────────────── Custom Dropdown Component ──────────────────────── */
  function CustomDropdown({ value, options, onChange, label }: { value: string; options: string[]; onChange: (v: string) => void; label: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false)
      }
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
      <div className="space-y-1.5 relative" ref={dropdownRef}>
        <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textSec }}>{label}</label>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-3 rounded-xl border text-sm text-white transition-all hover:bg-white/[0.02]"
          style={{ background: C.inputBg, borderColor: C.border }}
        >
          <span className="truncate">{value}</span>
          <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{ color: C.textDim }} />
        </button>

        {isOpen && (
          <div 
            className="absolute z-[110] left-0 right-0 mt-2 rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
            style={{ background: '#111111', borderColor: C.border, backdropFilter: 'blur(10px)' }}
          >
            <div className="max-h-[240px] overflow-y-auto custom-scrollbar">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt)
                    setIsOpen(false)
                  }}
                  className="w-full text-left px-4 py-3 text-xs font-medium transition-colors hover:bg-red-500/10 hover:text-red-500 flex items-center justify-between group"
                  style={{ color: value === opt ? '#E50914' : 'rgba(255,255,255,0.7)' }}
                >
                  {opt}
                  {value === opt && <div className="h-1.5 w-1.5 rounded-full bg-red-500" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-5xl h-fit max-h-[90vh] overflow-y-auto rounded-3xl border shadow-2xl flex flex-col"
        style={{ background: C.card, borderColor: C.border }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Upload Video</h1>
            <p className="text-[11px] mt-1" style={{ color: C.textSec }}>Upload a video — preview is auto-generated</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl transition-colors hover:bg-white/5"
            style={{ color: C.textSec }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 mt-6">
          <div className="flex items-center border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <button 
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold relative transition-colors"
              style={{ color: activeTab === 'video' ? C.accent : C.textSec }}
              onClick={() => setActiveTab('video')}
            >
              <Video size={16} />
              Video
              {activeTab === 'video' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: C.accent }} />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 p-6">
          {/* Left Panel: Upload & Preview */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudUpload size={18} style={{ color: C.accent }} />
                <h3 className="text-sm font-bold text-white">1. Upload Video</h3>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  className="text-xs font-semibold hover:underline" 
                  style={{ color: C.accent }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change File
                </button>
                <button 
                  className="p-1 rounded-lg hover:bg-red-500/10 transition-colors"
                  style={{ color: C.textSec }}
                  onClick={() => setFile(null)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* File Info Card */}
            {file && (
              <div 
                className="flex items-center gap-4 p-3 rounded-2xl border"
                style={{ background: 'rgba(255,255,255,0.02)', borderColor: C.border }}
              >
                <div className="h-10 w-16 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                  {previewUrl && <video src={previewUrl} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-white truncate">{file.name}</p>
                    <CheckCircle2 size={14} style={{ color: C.success }} />
                  </div>
                  <p className="text-[10px]" style={{ color: C.textDim }}>1920 × 1080 • {(file.size / (1024 * 1024)).toFixed(1)} MB • {duration}</p>
                </div>
              </div>
            )}

            {/* Video Player Preview */}
            <div 
              className="relative aspect-video rounded-2xl overflow-hidden bg-black/40 border group"
              style={{ borderColor: C.border }}
            >
              {previewUrl ? (
                <>
                  <video src={previewUrl} className="w-full h-full object-cover" />
                  {/* Custom Controls Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <button className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                        <Play size={16} fill="white" className="ml-0.5" />
                      </button>
                      <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full w-1/3 rounded-full" style={{ background: C.accent }} />
                      </div>
                      <span className="text-[10px] font-bold text-white/70 tabular-nums">0:00 / {duration}</span>
                      <button className="text-white/70 hover:text-white transition-colors"><Volume2 size={16} /></button>
                      <button className="text-white/70 hover:text-white transition-colors"><Maximize size={16} /></button>
                    </div>
                  </div>
                </>
              ) : (
                <div 
                  className="absolute inset-0 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-16 w-16 rounded-[2rem] bg-red-500/10 flex items-center justify-center animate-pulse">
                    <CloudUpload size={32} style={{ color: C.accent }} />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-bold text-white">Drag & drop your cinematic highlight</p>
                    <p className="text-xs mt-1" style={{ color: C.textSec }}>MP4, MOV or WEBM up to <span className="font-bold text-white">2GB</span></p>
                  </div>
                  <button 
                    className="mt-2 px-6 py-2.5 rounded-xl border text-xs font-bold transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.03)', borderColor: C.border, color: 'rgba(255,255,255,0.9)' }}
                  >
                    Browse Files
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/5" />
              <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">OR</span>
              <div className="flex-1 h-px bg-white/5" />
            </div>

            {/* Paste URL */}
            <div className="flex justify-center">
              <button 
                className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl border text-xs font-semibold transition-all hover:bg-white/5"
                style={{ background: 'transparent', borderColor: C.border, color: 'rgba(255,255,255,0.7)' }}
              >
                <LinkIcon size={14} />
                Paste video URL
              </button>
            </div>

            {/* Thumbnail Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-white">Thumbnail</h4>
                <button className="text-[10px] font-bold" style={{ color: C.accent }}>Upload Manually</button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {thumbnails.map((thumb, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedThumbnail(i)}
                    className="relative aspect-video rounded-lg overflow-hidden border-2 transition-all"
                    style={{ 
                      borderColor: selectedThumbnail === i ? C.accent : 'transparent',
                      background: C.glass
                    }}
                  >
                    <img src={thumb} alt={`Thumb ${i}`} className="w-full h-full object-cover" />
                    {selectedThumbnail === i && (
                      <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                        <CheckCircle2 size={16} className="text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/5">
                <AlertCircle size={14} className="mt-0.5" style={{ color: C.accent }} />
                <p className="text-[10px] leading-relaxed" style={{ color: C.textSec }}>
                  Video thumbnail and duration are auto-generated after upload.
                </p>
              </div>
            </div>
          </div>

          {/* Right Panel: Details */}
          <div className="w-full lg:w-[400px] space-y-6">
            <div className="flex items-center gap-2">
              <Settings size={18} style={{ color: C.accent }} />
              <h3 className="text-sm font-bold text-white">2. Video Details</h3>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textSec }}>Title *</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors"
                    style={{ background: C.inputBg, borderColor: C.border }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px]" style={{ color: C.textDim }}>{title.length}/100</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textSec }}>Description</label>
                <div className="relative">
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full p-3 rounded-xl border text-sm text-white focus:outline-none focus:border-red-500/50 transition-colors resize-none"
                    style={{ background: C.inputBg, borderColor: C.border }}
                  />
                  <span className="absolute right-3 bottom-3 text-[10px]" style={{ color: C.textDim }}>{description.length}/500</span>
                </div>
              </div>

              {/* Category & Quality Row */}
              <div className="grid grid-cols-2 gap-4">
                <CustomDropdown 
                  label="Category"
                  value={category}
                  onChange={setCategory}
                  options={[
                    'Football Highlights', 'Cricket Specials', 'NBA / Basketball', 
                    'Tennis Highlights', 'Motorsports / F1', 'Travel & Nature', 
                    'Sports News', 'Gaming / eSports', 'Entertainment', 
                    'Full Match Replays', 'Interviews'
                  ]}
                />
                <CustomDropdown 
                  label="Quality"
                  value={quality}
                  onChange={setQuality}
                  options={[
                    '8K (Ultra HD)', '4K (UHD)', '1440p (QHD)', 
                    '1080p (FHD)', '720p (HD)', '480p (SD)', '360p (SD)'
                  ]}
                />
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider" style={{ color: C.textSec }}>Duration</label>
                <div className="relative">
                  <input 
                    type="text"
                    value={duration}
                    readOnly
                    className="w-full p-3 rounded-xl border text-sm text-white bg-transparent"
                    style={{ borderColor: C.border }}
                  />
                  <Clock size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: C.textDim }} />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex items-center gap-8 pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${isFeatured ? 'bg-red-500 border-red-500' : 'border-white/20 group-hover:border-white/40'}`}>
                    {isFeatured && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={isFeatured} onChange={() => setIsFeatured(!isFeatured)} />
                  <span className="text-[11px] font-medium text-white/50 group-hover:text-white transition-colors">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${isTrending ? 'bg-red-500 border-red-500' : 'border-white/20 group-hover:border-white/40'}`}>
                    {isTrending && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={isTrending} onChange={() => setIsTrending(!isTrending)} />
                  <span className="text-[11px] font-medium text-white/50 group-hover:text-white transition-colors">Trending</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`h-4 w-4 rounded border flex items-center justify-center transition-all ${isLive ? 'bg-red-500 border-red-500' : 'border-white/20 group-hover:border-white/40'}`}>
                    {isLive && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                  </div>
                  <input type="checkbox" className="hidden" checked={isLive} onChange={() => setIsLive(!isLive)} />
                  <span className="text-[11px] font-medium text-white/50 group-hover:text-white transition-colors">Live</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 pt-6">
                <button 
                  onClick={clearForm}
                  disabled={isUploading}
                  className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl border text-xs font-bold transition-all hover:bg-white/5 disabled:opacity-50"
                  style={{ background: 'transparent', borderColor: C.border, color: 'white' }}
                >
                  <RefreshCw size={14} />
                  Clear
                </button>
                <button 
                  onClick={handleUpload}
                  disabled={isUploading || !file}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white shadow-lg shadow-red-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                  style={{ background: C.accent }}
                >
                  {isUploading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    <>
                      <Upload size={14} />
                      Upload Video
                    </>
                  )}
                </button>
              </div>

              {/* Progress Feedback */}
              {isUploading && (
                <div className="pt-4 space-y-3 animate-fadeIn">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Status</p>
                      <p className="text-xs font-bold text-white">{uploadStatus}</p>
                    </div>
                    <span className="text-lg font-black text-white tabular-nums">{uploadProgress}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-white/5 border border-white/5 p-[1px]">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_15px_rgba(229,9,20,0.3)]" 
                      style={{ 
                        width: `${uploadProgress}%`, 
                        background: `linear-gradient(90deg, ${C.accent}, #ff4d58, #ff8c94)` 
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 mt-auto">
          <div 
            className="flex items-center gap-4 p-4 rounded-3xl border transition-colors hover:bg-white/[0.02]"
            style={{ background: 'rgba(255,255,255,0.01)', borderColor: C.border }}
          >
            <div className="h-10 w-10 rounded-[1.25rem] bg-red-500/10 flex items-center justify-center flex-shrink-0 border border-red-500/20">
              <ShieldCheck size={20} style={{ color: C.accent }} />
            </div>
            <p className="text-[11px] leading-relaxed font-medium" style={{ color: C.textSec }}>
              Secure Multipart Upload active. By uploading, you confirm that you own the rights to this content and agree to our 
              <span className="mx-1 font-bold transition-colors hover:text-white cursor-pointer" style={{ color: C.accent }}>Terms</span> and 
              <span className="ml-1 font-bold transition-colors hover:text-white cursor-pointer" style={{ color: C.accent }}>Guidelines</span>.
            </p>
          </div>
        </div>

        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          accept="video/*"
          onChange={handleFileChange}
        />
      </div>
    </div>
  )
})

export default VideoUploadUI
