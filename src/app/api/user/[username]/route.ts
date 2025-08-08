// src/app/api/user/[username]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> }
) {
  try {
    const params = await context.params
    const { username } = params

    // Находим пользователя по username
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        page: {
          include: {
            blocks: {
              where: { isActive: true }, // Только активные блоки
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    })

    if (!user || !user.page || !user.page.isPublic) {
      return NextResponse.json(
        { error: 'Page not found' }, 
        { status: 404 }
      )
    }

    // Увеличиваем счетчик просмотров
    await recordPageView(user.page.id, request)

    // Возвращаем публичные данные (без email и другой приватной инфы)
    const publicData = {
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      page: {
        id: user.page.id,
        title: user.page.title,
        description: user.page.description,
        avatar: user.page.avatar,
        themeId: user.page.themeId,
        blocks: user.page.blocks.map(block => ({
          id: block.id,
          type: block.type,
          title: block.title,
          url: block.url,
          content: block.content,
          position: block.position
        }))
      }
    }

    return NextResponse.json(publicData)
  } catch (error) {
    console.error('Error fetching public page:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Функция для записи просмотра страницы
async function recordPageView(pageId: string, request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Простая аналитика - записываем в отдельную таблицу или обновляем счетчик
    // Пока что просто логируем, потом добавим модель Analytics
    console.log(`Page view: ${pageId}, IP: ${ip.slice(0, 8)}...`)
    
    // TODO: Добавить запись в таблицу Analytics когда создадим модель
    
  } catch (error) {
    console.error('Error recording page view:', error)
  }
}