import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, rename, unlink, readdir, stat, readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import crypto from 'crypto'

const UPLOAD_DIR = join(process.cwd(), 'uploads')
const TEMP_DIR = join(UPLOAD_DIR, 'temp')

// Ensure directories exist
async function ensureDirs() {
  if (!existsSync(UPLOAD_DIR)) await mkdir(UPLOAD_DIR, { recursive: true })
  if (!existsSync(TEMP_DIR)) await mkdir(TEMP_DIR, { recursive: true })
}

// Generate safe filename
function safeFilename(originalName: string): string {
  const ext = originalName.split('.').pop() || 'bin'
  const name = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 50)
  return `${name}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`
}

// GET: Check upload status (for resumable uploads)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'fileId is required' }, { status: 400 })
    }

    await ensureDirs()
    const tempDir = join(TEMP_DIR, fileId)
    const metaPath = join(tempDir, 'meta.json')

    if (!existsSync(metaPath)) {
      return NextResponse.json({ exists: false, chunks: [] })
    }

    const meta = JSON.parse(await readFile(metaPath, 'utf-8'))
    const files = await readdir(tempDir)
    const uploadedChunks = files
      .filter(f => f.startsWith('chunk_'))
      .map(f => parseInt(f.replace('chunk_', ''), 10))
      .filter(n => !isNaN(n))

    return NextResponse.json({
      exists: true,
      ...meta,
      uploadedChunks,
      totalChunks: meta.totalChunks,
    })
  } catch (error) {
    console.error('Upload status check error:', error)
    return NextResponse.json({ error: 'Failed to check upload status' }, { status: 500 })
  }
}

// POST: Handle file upload (single or chunked)
export async function POST(req: NextRequest) {
  try {
    await ensureDirs()

    const contentType = req.headers.get('content-type') || ''
    const uploadType = req.headers.get('x-upload-type') || 'single'
    const fileId = req.headers.get('x-file-id')
    const chunkIndex = req.headers.get('x-chunk-index')
    const totalChunks = req.headers.get('x-total-chunks')
    const fileName = req.headers.get('x-file-name') || 'upload'

    // ─── CHUNKED UPLOAD ───
    if (uploadType === 'chunk' && fileId && chunkIndex !== null && totalChunks) {
      const chunkIdx = parseInt(chunkIndex, 10)
      const total = parseInt(totalChunks, 10)

      if (isNaN(chunkIdx) || isNaN(total) || chunkIdx < 0 || total <= 0 || chunkIdx >= total) {
        return NextResponse.json({ error: 'Invalid chunk parameters' }, { status: 400 })
      }

      const tempDir = join(TEMP_DIR, fileId)
      if (!existsSync(tempDir)) await mkdir(tempDir, { recursive: true })

      const chunkPath = join(tempDir, `chunk_${chunkIdx}`)

      // Read body and write chunk
      const buffer = Buffer.from(await req.arrayBuffer())
      await writeFile(chunkPath, buffer)

      // Write/update meta file on first chunk
      const metaPath = join(tempDir, 'meta.json')
      const fileSize = parseInt(req.headers.get('x-file-size') || '0', 10)

      if (chunkIdx === 0) {
        await writeFile(metaPath, JSON.stringify({
          originalName: fileName,
          fileSize,
          totalChunks: total,
          mimeType: contentType.includes('multipart') ? 'application/octet-stream' : req.headers.get('x-file-mime') || 'application/octet-stream',
          uploadType: req.headers.get('x-file-type') || 'video',
          createdAt: new Date().toISOString(),
        }))
      }

      // Check if all chunks received
      const files = await readdir(tempDir)
      const receivedChunks = files.filter(f => f.startsWith('chunk_')).length

      if (receivedChunks >= total) {
        // All chunks received - assemble file
        const meta = JSON.parse(await readFile(metaPath, 'utf-8'))
        const finalName = safeFilename(meta.originalName)
        const finalPath = join(UPLOAD_DIR, finalName)

        // Merge chunks in order
        for (let i = 0; i < total; i++) {
          const chunkPath = join(tempDir, `chunk_${i}`)
          const chunkData = await readFile(chunkPath)
          await writeFile(finalPath, chunkData, i === 0 ? 'w' : 'a')
          await unlink(chunkPath).catch(() => {})
        }

        // Cleanup meta
        await unlink(metaPath).catch(() => {})

        const fileUrl = `/api/serve/${finalName}`
        const fileSizeStat = await stat(finalPath)

        return NextResponse.json({
          success: true,
          message: 'Upload complete',
          url: fileUrl,
          fileUrl,
          fileName: finalName,
          originalName: meta.originalName,
          fileSize: fileSizeStat.size,
          mimeType: meta.mimeType,
        })
      }

      // Chunk received, more to go
      return NextResponse.json({
        success: true,
        message: `Chunk ${chunkIdx + 1}/${total} uploaded`,
        chunkIndex: chunkIdx,
        receivedChunks,
        totalChunks: total,
        progress: Math.round((receivedChunks / total) * 100),
      })
    }

    // ─── SINGLE UPLOAD (FormData) ───
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData()
      const file = formData.get('file') as File | null
      const type = (formData.get('type') as string) || 'video'

      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }

      // Check file size (5GB max)
      if (file.size > 5 * 1024 * 1024 * 1024) {
        return NextResponse.json({
          error: 'File too large. Maximum size is 5GB.',
          code: 'FILE_TOO_LARGE',
        }, { status: 413 })
      }

      const finalName = safeFilename(file.name)
      const finalPath = join(UPLOAD_DIR, finalName)

      // Stream file to disk
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(finalPath, buffer)

      const fileUrl = `/api/serve/${finalName}`

      return NextResponse.json({
        success: true,
        message: 'Upload complete',
        url: fileUrl,
        fileUrl,
        fileName: finalName,
        originalName: file.name,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        type,
      })
    }

    // ─── RAW BINARY UPLOAD ───
    const rawBuffer = Buffer.from(await req.arrayBuffer())
    const finalName = safeFilename(fileName)
    const finalPath = join(UPLOAD_DIR, finalName)
    await writeFile(finalPath, rawBuffer)

    return NextResponse.json({
      success: true,
      message: 'Upload complete',
      url: `/api/serve/${finalName}`,
      fileUrl: `/api/serve/${finalName}`,
      fileName: finalName,
      originalName: fileName,
      fileSize: rawBuffer.length,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed', details: String(error) }, { status: 500 })
  }
}

// DELETE: Remove uploaded file
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const fileName = searchParams.get('file')

    if (!fileName) {
      return NextResponse.json({ error: 'file parameter is required' }, { status: 400 })
    }

    // Security: prevent directory traversal
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = join(UPLOAD_DIR, safeName)

    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    await unlink(filePath)
    return NextResponse.json({ success: true, message: 'File deleted' })
  } catch (error) {
    console.error('Delete upload error:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
