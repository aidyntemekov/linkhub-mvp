// src/app/[username]/page.tsx
import { notFound } from 'next/navigation'
import PublicPage from '@/components/public-page'
import { Metadata } from 'next'

interface PublicUserData {
  username: string
  name?: string
  avatar?: string
  page: {
    id: string
    title: string
    description?: string
    avatar?: string
    themeId: string
    blocks: Array<{
      id: string
      type: string
      title: string
      url?: string
      content?: any
      position: number
    }>
  }
}

async function getUserData(username: string): Promise<PublicUserData | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/user/${username}`, {
      cache: 'no-store' // Всегда получаем свежие данные
    })
    
    if (!response.ok) {
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error fetching user data:', error)
    return null
  }
}

// Генерация метаданных для SEO
export async function generateMetadata(
  { params }: { params: Promise<{ username: string }> }
): Promise<Metadata> {
  const { username } = await params
  const userData = await getUserData(username)
  
  if (!userData) {
    return {
      title: 'Страница не найдена | LinkHub',
      description: 'Запрашиваемая страница не существует'
    }
  }

  const title = userData.page.title || `${userData.name || userData.username} | LinkHub`
  const description = userData.page.description || `Все ссылки ${userData.name || userData.username} в одном месте`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://linkhub.kz/${username}`,
      siteName: 'LinkHub',
      images: userData.page.avatar || userData.avatar ? [{
        url: userData.page.avatar || userData.avatar || '',
        width: 400,
        height: 400,
        alt: `${userData.name || userData.username} avatar`,
      }] : [],
      locale: 'ru_RU',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: userData.page.avatar || userData.avatar || undefined,
    }
  }
}

export default async function UsernamePage({
  params
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const userData = await getUserData(username)
  
  if (!userData) {
    notFound()
  }

  return <PublicPage userData={userData} />
}