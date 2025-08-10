// src/app/[username]/page.tsx
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface PublicPageProps {
  params: {
    username: string
  }
}

// Моковые данные для демонстрации
const mockUserData = {
  username: 'johndoe',
  name: 'John Doe',
  title: 'Веб-разработчик и блогер',
  description: 'Делюсь знаниями о программировании, дизайне и стартапах. Подписывайтесь на мои соцсети!',
  avatar: null, // URL аватара
  banner: '/api/placeholder/1200/300', // URL баннера
  themeId: 'default',
  blocks: [
    {
      id: '1',
      type: 'LINK',
      title: 'Мой YouTube канал',
      url: 'https://youtube.com/@johndoe',
      isActive: true,
      position: 0
    },
    {
      id: '2',
      type: 'LINK',
      title: 'Telegram канал',
      url: 'https://t.me/johndoecoding',
      isActive: true,
      position: 1
    },
    {
      id: '3',
      type: 'SOCIAL',
      title: 'Социальные сети',
      content: {
        links: [
          { platform: 'instagram', url: 'https://instagram.com/johndoe' },
          { platform: 'twitter', url: 'https://twitter.com/johndoe' },
          { platform: 'linkedin', url: 'https://linkedin.com/in/johndoe' }
        ]
      },
      isActive: true,
      position: 2
    },
    {
      id: '4',
      type: 'TEXT',
      title: '🚀 Новые курсы по React уже в разработке!',
      isActive: true,
      position: 3
    }
  ]
}

// Функция для получения данных пользователя
async function getUserData(username: string) {
  // В реальном приложении здесь будет запрос к API
  // const response = await fetch(`/api/user/${username}`)
  // if (!response.ok) return null
  // return response.json()
  
  // Пока возвращаем моковые данные
  if (username === mockUserData.username) {
    return mockUserData
  }
  return null
}

// Генерация метаданных для SEO
export async function generateMetadata({ params }: PublicPageProps): Promise<Metadata> {
  const userData = await getUserData(params.username)
  
  if (!userData) {
    return {
      title: 'Пользователь не найден - LinkHub',
    }
  }

  return {
    title: `${userData.name} - LinkHub`,
    description: userData.description || `Все ссылки ${userData.name} в одном месте`,
    openGraph: {
      title: userData.name,
      description: userData.description || `Все ссылки ${userData.name} в одном месте`,
      images: userData.banner ? [userData.banner] : undefined,
      type: 'profile',
    },
    twitter: {
      card: 'summary_large_image',
      title: userData.name,
      description: userData.description || `Все ссылки ${userData.name} в одном месте`,
      images: userData.banner ? [userData.banner] : undefined,
    }
  }
}

// Функция для трекинга просмотра страницы
async function trackPageView(username: string) {
  // В реальном приложении здесь будет отправка аналитики
  console.log(`Page view tracked for user: ${username}`)
}

// Функция для трекинга клика по блоку
function trackBlockClick(blockId: string, url: string) {
  // Отправляем аналитику
  fetch('/api/analytics/click', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      blockId,
      url,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    }),
  }).catch(console.error)
}

// Компонент для отображения иконки социальной сети
function SocialIcon({ platform }: { platform: string }) {
  const icons: Record<string, string> = {
    instagram: '📷',
    twitter: '🐦',
    linkedin: '💼',
    youtube: '📺',
    telegram: '✈️',
    whatsapp: '💬',
    vk: '🔗'
  }
  
  return <span className="text-xl">{icons[platform] || '🔗'}</span>
}

// Компонент блока ссылки
function LinkBlock({ block }: { block: any }) {
  const handleClick = () => {
    trackBlockClick(block.id, block.url)
    window.open(block.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-white border border-gray-200 hover:border-gray-300 text-gray-900 text-center py-4 px-6 rounded-xl font-medium transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
    >
      {block.title}
    </button>
  )
}

// Компонент блока социальных сетей
function SocialBlock({ block }: { block: any }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-center font-medium text-gray-900 mb-3">{block.title}</h3>
      <div className="flex justify-center space-x-4">
        {block.content?.links?.map((link: any, index: number) => (
          <a
            key={index}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-12 h-12 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => trackBlockClick(block.id, link.url)}
          >
            <SocialIcon platform={link.platform} />
          </a>
        ))}
      </div>
    </div>
  )
}

// Компонент текстового блока
function TextBlock({ block }: { block: any }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
      <p className="text-gray-700">{block.title}</p>
    </div>
  )
}

// Основной компонент страницы
export default async function PublicPage({ params }: PublicPageProps) {
  const userData = await getUserData(params.username)
  
  if (!userData) {
    notFound()
  }

  // Трекинг просмотра страницы
  await trackPageView(params.username)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Баннер */}
      {userData.banner && (
        <div className="relative w-full">
          <div 
            className="w-full bg-gray-200 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${userData.banner})`,
              aspectRatio: '4/1',
              maxHeight: '300px'
            }}
          >
            {/* Градиент для лучшей читаемости */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
        </div>
      )}

      {/* Основной контент */}
      <div className="relative">
        {/* Аватар (накладывается на баннер если есть) */}
        <div className={`flex justify-center ${userData.banner ? '-mt-16' : 'pt-8'}`}>
          <div className="relative">
            <div 
              className={`w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden ${
                userData.avatar ? 'bg-white' : 'bg-gradient-to-br from-blue-400 to-purple-500'
              }`}
            >
              {userData.avatar ? (
                <img 
                  src={userData.avatar} 
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-4xl font-bold">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Информация о пользователе */}
        <div className="text-center px-4 mt-4 mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {userData.name}
          </h1>
          {userData.title && (
            <p className="text-lg text-gray-600 mb-3">
              {userData.title}
            </p>
          )}
          {userData.description && (
            <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
              {userData.description}
            </p>
          )}
        </div>

        {/* Блоки ссылок */}
        <div className="max-w-md mx-auto px-4 pb-12">
          <div className="space-y-4">
            {userData.blocks
              .filter(block => block.isActive)
              .sort((a, b) => a.position - b.position)
              .map((block) => {
                switch (block.type) {
                  case 'LINK':
                    return <LinkBlock key={block.id} block={block} />
                  case 'SOCIAL':
                    return <SocialBlock key={block.id} block={block} />
                  case 'TEXT':
                    return <TextBlock key={block.id} block={block} />
                  default:
                    return null
                }
              })}
          </div>
        </div>

        {/* Футер */}
        <div className="text-center pb-8">
          <a 
            href="/" 
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Создано с ❤️ на LinkHub
          </a>
        </div>
      </div>
    </div>
  )
}

// Компонент для страницы 404
export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Пользователь не найден</p>
        <a 
          href="/"
          className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Вернуться на главную
        </a>
      </div>
    </div>
  )
}