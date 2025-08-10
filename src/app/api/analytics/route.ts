// src/app/api/analytics/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email')
    
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Находим пользователя и его страницу
    const user = await prisma.user.findUnique({
      where: { email },
      include: { page: true }
    })

    if (!user || !user.page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    const pageId = user.page.id

    // Получаем статистику кликов по блокам
    const blockStats = await prisma.block.findMany({
      where: { pageId },
      include: {
        clicks: {
          where: {
            timestamp: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Последние 30 дней
            }
          }
        },
        _count: {
          select: { clicks: true }
        }
      }
    })

    // Статистика кликов по дням (последние 7 дней)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const clicksByDay = await Promise.all(
      last7Days.map(async (date) => {
        const startOfDay = new Date(date + 'T00:00:00.000Z')
        const endOfDay = new Date(date + 'T23:59:59.999Z')
        
        const clicks = await prisma.click.count({
          where: {
            block: { pageId },
            timestamp: {
              gte: startOfDay,
              lte: endOfDay
            }
          }
        })
        
        return { date, clicks }
      })
    )

    // Общая статистика
    const totalClicks = await prisma.click.count({
      where: { block: { pageId } }
    })

    // ТОП блоки по кликам
    const topBlocks = blockStats
      .map(block => ({
        id: block.id,
        title: block.title,
        type: block.type,
        clicks: block._count.clicks
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)

    return NextResponse.json({
      totalClicks,
      clicksByDay,
      topBlocks,
      blockStats: blockStats.map(block => ({
        id: block.id,
        title: block.title,
        type: block.type,
        clicks: block._count.clicks
      }))
    })

  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}