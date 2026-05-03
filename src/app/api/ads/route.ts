import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: List all ads with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }

    if (active !== null) {
      where.isActive = active === 'true'
    }

    const ads = await db.ad.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ads })
  } catch (error) {
    console.error('Failed to fetch ads:', error)
    return NextResponse.json({ error: 'Failed to fetch ads' }, { status: 500 })
  }
}

// POST: Create new ad
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { title, type, mediaUrl, targetUrl, category, duration, position, description, priority, createdBy } = body

    if (!title || !mediaUrl) {
      return NextResponse.json({ error: 'Title and mediaUrl are required' }, { status: 400 })
    }

    const ad = await db.ad.create({
      data: {
        title,
        type: type || 'banner',
        mediaUrl,
        targetUrl,
        category,
        duration,
        position,
        description,
        priority,
        createdBy,
      },
    })

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Failed to create ad:', error)
    return NextResponse.json({ error: 'Failed to create ad' }, { status: 500 })
  }
}

// PUT: Update ad by id
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, ...fields } = body

    if (!id) {
      return NextResponse.json({ error: 'Ad id is required' }, { status: 400 })
    }

    const ad = await db.ad.update({
      where: { id },
      data: fields,
    })

    return NextResponse.json({ ad })
  } catch (error) {
    console.error('Failed to update ad:', error)
    return NextResponse.json({ error: 'Failed to update ad' }, { status: 500 })
  }
}

// DELETE: Delete ad by id
export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json()

    if (!id) {
      return NextResponse.json({ error: 'Ad id is required' }, { status: 400 })
    }

    await db.ad.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Failed to delete ad:', error)
    return NextResponse.json({ error: 'Failed to delete ad' }, { status: 500 })
  }
}
