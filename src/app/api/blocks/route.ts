import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Создать новый блок
export async function POST(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email')
    const { type, title, url, content } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { page: true }
    })

    if (!user || !user.page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    // Получаем следующую позицию
    const lastBlock = await prisma.block.findFirst({
      where: { pageId: user.page.id },
      orderBy: { position: 'desc' }
    })

    const position = (lastBlock?.position ?? -1) + 1

    const block = await prisma.block.create({
      data: {
        pageId: user.page.id,
        type,
        title,
        url,
        content,
        position
      }
    })

    return NextResponse.json({ block })
  } catch (error) {
    console.error('Error creating block:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}