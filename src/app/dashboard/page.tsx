'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface User {
  email: string
  name: string
  username: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    } else {
      router.push('/login')
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('user')
    router.push('/')
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Загрузка...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">LinkHub</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Привет, {user.name}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">Ваш профиль</h2>
            <div className="space-y-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Имя:</strong> {user.name}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Ваша ссылка:</strong> 
                <span className="text-primary"> linkhub.kz/{user.username}</span>
              </p>
            </div>
            
            <div className="mt-6 space-x-4">
            <Link href="/editor">
              <button className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90">
                Редактировать страницу
              </button>
            </Link>
            <Link href="/analytics">
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                📊 Аналитика
              </button>
            </Link>
          </div>
          </div>
        </div>
      </main>
    </div>
  )
}