import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = await db.category.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(categories)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, description, thumbnail } = body
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    const category = await db.category.create({
      data: {
        name: name.trim(),
        description: description || null,
        thumbnail: thumbnail || null,
      },
    })
    return NextResponse.json(category)
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Category already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id, name, description, thumbnail } = body
    if (!id || !name || !name.trim()) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 })
    }
    const category = await db.category.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description || null,
        thumbnail: thumbnail || undefined,
      },
    })
    return NextResponse.json(category)
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }
    await db.category.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 })
  }
}
