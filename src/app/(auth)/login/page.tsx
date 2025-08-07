'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Временная заглушка - просто перенаправляем в dashboard
    setTimeout(() => {
      localStorage.setItem('user', JSON.stringify({
        email,
        name: email.split('@')[0],
        username: email.split('@')[0] + Math.floor(Math.random() * 1000)
      }))
      router.push('/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 text-center">
            Вход в LinkHub
          </h2>
          <p className="mt-2 text-center text-gray-600">
            Пока что простая версия для тестирования
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="your@email.com"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isLoading ? 'Входим...' : 'Войти'}
          </button>
        </form>
        
        <div className="text-center text-sm text-gray-600 space-y-2">
          <p>
            Нет аккаунта?{' '}
            <Link href="/register" className="text-primary hover:text-primary/90 font-medium">
              Зарегистрироваться
            </Link>
          </p>
          <div>
            <Link href="/" className="text-primary hover:text-primary/90">
              ← Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}