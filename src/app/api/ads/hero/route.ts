import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET: Fetch hero banner ads (position='hero', isActive=true, ordered by priority desc)
// Query params: ?device=mobile|desktop
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const device = searchParams.get('device')

    const where: Record<string, unknown> = {
      position: 'hero',
      isActive: true,
    }

    // Device targeting: if device param provided, filter by category convention
    // "mobile-only", "desktop-only" stored in category; null/other means "all devices"
    if (device === 'mobile') {
      // Show mobile-targeted + untargeted ads
      where.OR = [
        { category: { in: ['mobile-only', 'all'] } },
        { category: null },
      ]
    } else if (device === 'desktop') {
      // Show desktop-targeted + untargeted ads
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
    console.error('Failed to fetch hero ads:', error)
    return NextResponse.json({ error: 'Failed to fetch hero ads' }, { status: 500 })
  }
}

// POST: Create a new hero ad
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

    // Map deviceTarget to category convention for storage
    // If category is provided and it's a sport category, keep it
    // deviceTarget is stored as a convention: "mobile-only", "desktop-only"
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
        position: 'hero',
        priority: typeof priority === 'number' ? priority : 0,
        isActive: true,
      },
    })

    return NextResponse.json({ ad }, { status: 201 })
  } catch (error) {
    console.error('Failed to create hero ad:', error)
    return NextResponse.json({ error: 'Failed to create hero ad' }, { status: 500 })
  }
}
