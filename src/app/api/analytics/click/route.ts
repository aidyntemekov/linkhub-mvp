// src/app/api/analytics/click/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { blockId } = await request.json()
    
    if (!blockId) {
      return NextResponse.json(
        { error: 'Block ID is required' }, 
        { status: 400 }
      )
    }

    // Получаем информацию о запросе
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    
    // Простое определение страны по IP (можно улучшить позже)
    const country = getCountryFromIP(ip)

    // Записываем клик
    await prisma.click.create({
      data: {
        blockId,
        userAgent: userAgent.slice(0, 255), // Ограничиваем длину
        country
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error recording click:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

// Простое определение страны (потом можно заменить на более точное)
function getCountryFromIP(ip: string): string {
  // Временная заглушка - в реальности можно использовать GeoIP API
  if (ip.startsWith('127.') || ip === 'unknown') return 'Local'
  
  // Можно добавить базовое определение по IP диапазонам
  return 'Unknown'
}