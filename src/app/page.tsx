import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Одна ссылка для всех ваших профилей
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Создайте красивую страницу со всеми важными ссылками. 
            Идеально для Instagram, TikTok, Telegram и других соцсетей.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/register" 
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Создать бесплатно
            </Link>
            <Link 
              href="/example" 
              className="border border-gray-300 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Посмотреть пример
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}