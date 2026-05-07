import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch footer banner ads (position='footer', isActive=true)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const device = searchParams.get('device')

    const where: Record<string, unknown> = {
      position: 'footer',
      isActive: true,
    }

    // Device targeting via category convention
    if (device === 'mobile') {
      where.OR = [
        { category: { in: ['mobile-only', 'all'] } },
        { category: null },
      ]
    } else if (device === 'desktop') {
      where.OR = [
        { category: { in: ['desktop-only', 'all'] } },
        { category: null },
      ]
    }

    const ads = await db.ad.findMany({
      where,
      orderBy: { priority: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        type: true,
        mediaUrl: true,
        targetUrl: true,
        category: true,
        duration: true,
        position: true,
        priority: true,
        impressions: true,
        clicks: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ ads, count: ads.length })
  } catch (error) {
    console.error('Failed to fetch footer ads:', error)
    return NextResponse.json({ error: 'Failed to fetch footer ads' }, { status: 500 })
  }
}

// POST: Create a new footer ad
// Body: { mediaUrl, targetUrl?, title, description?, type?, category?, deviceTarget?, priority? }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      mediaUrl,
      targetUrl,
      title,
      description,
      type,
      category,
      deviceTarget,
      priority,
    } = body

    if (!mediaUrl) {
      return NextResponse.json({ error: 'mediaUrl is required' }, { status: 400 })
    }

    if (!title) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 })
    }

    // Map deviceTarget to category convention
    let finalCategory = category || null
    if (deviceTarget === 'mobile') {
      finalCategory = 'mobile-only'
    } else if (deviceTarget === 'desktop') {
      finalCategory = 'desktop-only'
    }

    const ad = await db.ad.create({
      data: {
        title,
        description: description || null,
        type: type || 'banner',
        mediaUrl,
        targetUrl: targetUrl || null,
        category: finalCategory,
        position: 'footer',
        priority: typeof priority === 'number' ? priority : 0,
        isActive: true,
      },
    })

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Failed to create footer ad:', error)
    return NextResponse.json({ error: 'Failed to create footer ad' }, { status: 500 })
  }
}
