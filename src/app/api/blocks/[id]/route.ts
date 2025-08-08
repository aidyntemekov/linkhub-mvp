// src/app/api/blocks/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Обновить блок
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const email = request.headers.get('x-user-email')
    const { type, title, url, content, isActive } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const block = await prisma.block.update({
      where: { id: params.id },
      data: { type, title, url, content, isActive }
    })

    return NextResponse.json({ block })
  } catch (error) {
    console.error('Error updating block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Удалить блок
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const email = request.headers.get('x-user-email')
    
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.block.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}