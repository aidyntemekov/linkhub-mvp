import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Получить страницу пользователя
export async function GET(request: NextRequest) {
  try {
    // Пока что используем email из localStorage (в реальности будет сессия)
    const email = request.headers.get('x-user-email')
    
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { email },
      include: {
        page: {
          include: {
            blocks: {
              orderBy: { position: 'asc' }
            }
          }
        }
      }
    })

    // Если пользователя нет, создаём
    if (!user) {
      const username = email.split('@')[0] + Math.floor(Math.random() * 1000)
      user = await prisma.user.create({
        data: {
          email,
          name: email.split('@')[0],
          username,
          page: {
            create: {
              title: `Страница ${email.split('@')[0]}`,
              blocks: {
                create: [
                  {
                    type: 'TEXT',
                    title: 'Добро пожаловать на мою страницу!',
                    position: 0
                  }
                ]
              }
            }
          }
        },
        include: {
          page: {
            include: {
              blocks: true
            }
          }
        }
      })
    }

    // Если у пользователя нет страницы, создаём
    if (!user.page) {
      await prisma.page.create({
        data: {
          userId: user.id,
          title: `Страница ${user.name}`,
          blocks: {
            create: [
              {
                type: 'TEXT',
                title: 'Добро пожаловать на мою страницу!',
                position: 0
              }
            ]
          }
        }
      })
      
      // Перезагружаем пользователя с новой страницей
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          page: {
            include: {
              blocks: {
                orderBy: { position: 'asc' }
              }
            }
          }
        }
      })
    }

    return NextResponse.json({ 
      page: {
        ...user?.page,
        user: {
          username: user?.username,
          name: user?.name,
          email: user?.email
        }
      }
    })
  } catch (error) {
    console.error('Error fetching page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Обновить настройки страницы
export async function PUT(request: NextRequest) {
  try {
    const email = request.headers.get('x-user-email')
    const { title, description } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const page = await prisma.page.update({
      where: { userId: user.id },
      data: { title, description }
    })

    return NextResponse.json({ page })
  } catch (error) {
    console.error('Error updating page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}