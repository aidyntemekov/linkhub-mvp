'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, TrendingUp, MousePointer, Calendar, Star } from 'lucide-react'
import Link from 'next/link'

interface AnalyticsData {
  totalClicks: number
  clicksByDay: Array<{ date: string; clicks: number }>
  topBlocks: Array<{ id: string; title: string; type: string; clicks: number }>
  blockStats: Array<{ id: string; title: string; type: string; clicks: number }>
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) {
        router.push('/login')
        return
      }

      const user = JSON.parse(userData)
      
      const response = await fetch('/api/analytics', {
        headers: {
          'x-user-email': user.email
        }
      })

      if (!response.ok) throw new Error('Failed to fetch analytics')

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  const getBlockTypeColor = (type: string) => {
    switch (type) {
      case 'LINK': return 'bg-blue-100 text-blue-800'
      case 'EMAIL': return 'bg-green-100 text-green-800'
      case 'PHONE': return 'bg-purple-100 text-purple-800'
      case 'SOCIAL': return 'bg-pink-100 text-pink-800'
      case 'TEXT': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка аналитики...</p>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Ошибка: {error}</p>
          <button onClick={fetchAnalytics} className="text-primary hover:underline">
            Попробовать снова
          </button>
        </div>
      </div>
    )
  }

  const maxClicks = Math.max(...analytics.clicksByDay.map(d => d.clicks), 1)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-lg font-semibold text-gray-900">Аналитика</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MousePointer className="h-8 w-8 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Всего кликов</p>
                <p className="text-3xl font-bold text-gray-900">{analytics.totalClicks}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Кликов за неделю</p>
                <p className="text-3xl font-bold text-gray-900">
                  {analytics.clicksByDay.reduce((sum, day) => sum + day.clicks, 0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Среднее в день</p>
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(analytics.clicksByDay.reduce((sum, day) => sum + day.clicks, 0) / 7)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* График кликов по дням */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Клики за последние 7 дней</h3>
            <div className="space-y-3">
              {analytics.clicksByDay.map((day, index) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 w-16">
                    {formatDate(day.date)}
                  </span>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-2 relative">
                      <div
                        className="bg-primary rounded-full h-2 transition-all duration-500"
                        style={{ width: `${(day.clicks / maxClicks) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {day.clicks}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ТОП блоки */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-500" />
              ТОП блоки по кликам
            </h3>
            <div className="space-y-3">
              {analytics.topBlocks.length > 0 ? (
                analytics.topBlocks.map((block, index) => (
                  <div key={block.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">
                          {block.title}
                        </p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBlockTypeColor(block.type)}`}>
                          {block.type}
                        </span>
                      </div>
                    </div>
                    <span className="font-bold text-primary">
                      {block.clicks}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Пока нет кликов по блокам
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}