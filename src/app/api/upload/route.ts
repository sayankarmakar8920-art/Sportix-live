import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    const type = (formData.get('type') as string) || 'general' // 'ad', 'thumbnail', 'recording', 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const dir = join(process.cwd(), 'public', 'uploads', type)
    await mkdir(dir, { recursive: true })

    const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    const filePath = join(dir, fileName)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      url: `/uploads/${type}/${fileName}`,
      fileName,
    })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
