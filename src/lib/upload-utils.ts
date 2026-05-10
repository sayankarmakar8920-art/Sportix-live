/**
 * Chunked upload utility for large files (up to 5GB).
 * Files ≤ 50MB use FormData single upload.
 * Files > 50MB use chunked upload with progress tracking.
 */

const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB per chunk

export interface UploadProgress {
  /** 0-100 percentage */
  percent: number
  /** Bytes uploaded so far */
  loaded: number
  /** Total file size in bytes */
  total: number
  /** Upload speed in bytes/sec */
  speed: number
  /** Estimated seconds remaining */
  eta: number
  /** Human-readable status message */
  status: 'idle' | 'uploading' | 'processing' | 'done' | 'error'
  /** Error message if status is 'error' */
  error?: string
}

export interface UploadResult {
  success: boolean
  url: string
  fileUrl: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
}

export type UploadCallback = (progress: UploadProgress) => void

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return (bytes / 1_073_741_824).toFixed(2) + ' GB'
  if (bytes >= 1_048_576) return (bytes / 1_048_576).toFixed(1) + ' MB'
  if (bytes >= 1_024) return (bytes / 1_024).toFixed(1) + ' KB'
  return bytes + ' B'
}

function formatSpeed(bytesPerSec: number): string {
  return formatBytes(bytesPerSec) + '/s'
}

function formatEta(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '--'
  if (seconds < 60) return `${Math.ceil(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.ceil(seconds % 60)
  if (m < 60) return `${m}m ${s}s`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

export function getUploadStatusMessage(p: UploadProgress, fileName?: string): string {
  const name = fileName ? ` ${fileName}` : ''
  switch (p.status) {
    case 'idle':
      return `Ready to upload${name}`
    case 'uploading':
      return `${name} · ${formatBytes(p.loaded)} / ${formatBytes(p.total)} · ${p.percent}% · ${formatSpeed(p.speed)} · ETA ${formatEta(p.eta)}`
    case 'processing':
      return `${name} · Processing...`
    case 'done':
      return `${name} · Upload complete!`
    case 'error':
      return `${name} · Error: ${p.error || 'Upload failed'}`
  }
}

/**
 * Upload a file with automatic chunking for large files.
 * For files > 50MB, uses chunked upload via XHR with progress tracking.
 * For files ≤ 50MB, uses FormData single upload with progress.
 */
export function uploadFile(
  file: File,
  onProgress: UploadCallback,
  options?: { type?: string },
): { promise: Promise<UploadResult>; cancel: () => void } {
  let cancelled = false
  let abortControllers: AbortController[] = []

  const initialProgress: UploadProgress = {
    percent: 0,
    loaded: 0,
    total: file.size,
    speed: 0,
    eta: 0,
    status: 'uploading',
  }
  onProgress(initialProgress)

  const cancel = () => {
    cancelled = true
    abortControllers.forEach(c => c.abort())
    abortControllers = []
    onProgress({
      ...initialProgress,
      status: 'error',
      error: 'Upload cancelled',
    })
  }

  const promise = (async (): Promise<UploadResult> => {
    try {
      let result: UploadResult

      if (file.size > CHUNK_SIZE) {
        // ─── CHUNKED UPLOAD ───
        result = await uploadChunked(file, onProgress, () => cancelled, options)
      } else {
        // ─── SINGLE UPLOAD ───
        result = await uploadSingle(file, onProgress, () => cancelled, options)
      }

      if (cancelled) {
        throw new Error('Upload cancelled')
      }

      onProgress({
        percent: 100,
        loaded: file.size,
        total: file.size,
        speed: 0,
        eta: 0,
        status: 'done',
      })

      return result
    } catch (err) {
      if (cancelled) {
        onProgress({
          percent: 0,
          loaded: 0,
          total: file.size,
          speed: 0,
          eta: 0,
          status: 'error',
          error: 'Upload cancelled',
        })
        throw new Error('Upload cancelled')
      }
      const msg = err instanceof Error ? err.message : 'Upload failed'
      onProgress({
        percent: 0,
        loaded: 0,
        total: file.size,
        speed: 0,
        eta: 0,
        status: 'error',
        error: msg,
      })
      throw err
    }
  })()

  return { promise, cancel }
}

async function uploadSingle(
  file: File,
  onProgress: UploadCallback,
  isCancelled: () => boolean,
  options?: { type?: string },
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    const ac = new AbortController()
    const acs: AbortController[] = []
    acs.push(ac)

    const formData = new FormData()
    formData.append('file', file)
    if (options?.type) formData.append('type', options.type)

    const startTime = Date.now()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && !isCancelled()) {
        const loaded = e.loaded
        const elapsed = (Date.now() - startTime) / 1000
        const speed = elapsed > 0 ? loaded / elapsed : 0
        const remaining = speed > 0 ? (file.size - loaded) / speed : 0

        onProgress({
          percent: Math.round((loaded / file.size) * 100),
          loaded,
          total: file.size,
          speed,
          eta: remaining,
          status: 'uploading',
        })
      }
    })

    xhr.addEventListener('load', () => {
      if (isCancelled()) return
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          resolve({
            success: true,
            url: data.url || data.fileUrl || '',
            fileUrl: data.fileUrl || data.url || '',
            fileName: data.fileName || '',
            originalName: data.originalName || file.name,
            fileSize: data.fileSize || file.size,
            mimeType: data.mimeType || file.type || 'application/octet-stream',
          })
        } catch {
          reject(new Error('Invalid response from server'))
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText)
          reject(new Error(data.error || `Server error: ${xhr.status}`))
        } catch {
          reject(new Error(`Server error: ${xhr.status}`))
        }
      }
    })

    xhr.addEventListener('error', () => {
      if (!isCancelled()) reject(new Error('Network error'))
    })

    xhr.addEventListener('abort', () => {
      if (!isCancelled()) reject(new Error('Upload aborted'))
    })

    xhr.open('POST', '/api/upload')
    xhr.send(formData)
  })
}

async function uploadChunked(
  file: File,
  onProgress: UploadCallback,
  isCancelled: () => boolean,
  options?: { type?: string },
): Promise<UploadResult> {
  const fileId = `chunk_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  let totalBytesUploaded = 0
  const startTime = Date.now()

  for (let i = 0; i < totalChunks; i++) {
    if (isCancelled()) {
      throw new Error('Upload cancelled')
    }

    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)

    const chunkResult = await new Promise<{ success: boolean; url?: string; fileUrl?: string; fileName?: string; originalName?: string; fileSize?: number; mimeType?: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && !isCancelled()) {
          const chunkLoaded = e.loaded
          const elapsed = (Date.now() - startTime) / 1000
          const currentTotal = totalBytesUploaded + chunkLoaded
          const speed = elapsed > 0 ? currentTotal / elapsed : 0
          const remaining = speed > 0 ? (file.size - currentTotal) / speed : 0

          onProgress({
            percent: Math.round((currentTotal / file.size) * 100),
            loaded: currentTotal,
            total: file.size,
            speed,
            eta: remaining,
            status: 'uploading',
          })
        }
      })

      xhr.addEventListener('load', () => {
        if (isCancelled()) return
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText))
          } catch {
            reject(new Error('Invalid response from server'))
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText)
            reject(new Error(data.error || `Server error: ${xhr.status}`))
          } catch {
            reject(new Error(`Server error: ${xhr.status}`))
          }
        }
      })

      xhr.addEventListener('error', () => {
        if (!isCancelled()) reject(new Error('Network error'))
      })

      xhr.addEventListener('abort', () => {
        if (!isCancelled()) reject(new Error('Upload aborted'))
      })

      xhr.open('POST', '/api/upload')
      xhr.setRequestHeader('x-upload-type', 'chunk')
      xhr.setRequestHeader('x-file-id', fileId)
      xhr.setRequestHeader('x-chunk-index', String(i))
      xhr.setRequestHeader('x-total-chunks', String(totalChunks))
      xhr.setRequestHeader('x-file-name', file.name)
      xhr.setRequestHeader('x-file-size', String(file.size))
      xhr.setRequestHeader('x-file-mime', file.type || 'application/octet-stream')
      if (options?.type) xhr.setRequestHeader('x-file-type', options.type)
      xhr.send(chunk)
    })

    totalBytesUploaded = end

    // If this was the last chunk and the server assembled the file, we get the final result
    if (chunkResult.url) {
      return {
        success: true,
        url: chunkResult.url,
        fileUrl: chunkResult.fileUrl || chunkResult.url,
        fileName: chunkResult.fileName || '',
        originalName: chunkResult.originalName || file.name,
        fileSize: chunkResult.fileSize || file.size,
        mimeType: chunkResult.mimeType || file.type || 'application/octet-stream',
      }
    }
  }

  // Fallback: if the last chunk didn't return a url, query for the status
  // This shouldn't happen normally since the server assembles on the last chunk
  throw new Error('Upload completed but server did not return file URL')
}
