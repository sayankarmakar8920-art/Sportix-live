import { NextRequest, NextResponse } from 'next/server'
import { stat, createReadStream } from 'fs'
import { existsSync } from 'fs'
import { join, basename } from 'path'
import { Readable } from 'stream'

const UPLOAD_DIR = join(process.cwd(), 'uploads')

// MIME type map
const MIME_TYPES: Record<string, string> = {
  // Video
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  m4v: 'video/mp4',
  flv: 'video/x-flv',
  wmv: 'video/x-ms-wmv',
  ts: 'video/mp2t',
  m3u8: 'application/vnd.apple.mpegurl',
  // Image
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  // Audio
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  // Document
  pdf: 'application/pdf',
  json: 'application/json',
  txt: 'text/plain',
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return MIME_TYPES[ext] || 'application/octet-stream'
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const filePath = join(UPLOAD_DIR, ...path)

    // Security: prevent directory traversal
    const resolvedPath = join(UPLOAD_DIR, basename(path.join('/')))
    if (!existsSync(resolvedPath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileStat = await stat(resolvedPath)
    if (!fileStat.isFile()) {
      return NextResponse.json({ error: 'Not a file' }, { status: 400 })
    }

    const mimeType = getMimeType(resolvedPath)
    const fileName = basename(resolvedPath)
    const fileSize = fileStat.size

    // Handle range requests for video seeking
    const rangeHeader = req.headers.get('range')

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
      if (!match) {
        return new NextResponse('Invalid range', { status: 400 })
      }

      const start = parseInt(match[1], 10)
      const end = match[2] ? parseInt(match[2], 10) : fileSize - 1
      const chunkSize = end - start + 1

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse('Range Not Satisfiable', {
          status: 416,
          headers: { 'Content-Range': `bytes */${fileSize}` },
        })
      }

      const stream = createReadStream(resolvedPath, { start, end })
      const readableStream = Readable.toWeb(stream) as ReadableStream

      return new NextResponse(readableStream, {
        status: 206,
        headers: {
          'Content-Type': mimeType,
          'Content-Length': String(chunkSize),
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
          'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
        },
      })
    }

    // Full file response
    const stream = createReadStream(resolvedPath)
    const readableStream = Readable.toWeb(stream) as ReadableStream

    return new NextResponse(readableStream, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${encodeURIComponent(fileName)}"`,
      },
    })
  } catch (error) {
    console.error('File serve error:', error)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}

// HEAD for range request support
export async function HEAD(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path } = await params
    const resolvedPath = join(UPLOAD_DIR, basename(path.join('/')))

    if (!existsSync(resolvedPath)) {
      return new NextResponse(null, { status: 404 })
    }

    const fileStat = await stat(resolvedPath)
    if (!fileStat.isFile()) {
      return new NextResponse(null, { status: 400 })
    }

    const mimeType = getMimeType(resolvedPath)

    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(fileStat.size),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch {
    return new NextResponse(null, { status: 500 })
  }
}
