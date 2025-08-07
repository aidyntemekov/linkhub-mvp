'use client'

import { usePage } from '@/hooks/use-page'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Plus, Settings, Eye, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditorPage() {
  const { page, isLoading, error, addBlock, updatePage } = usePage()
  const [showPreview, setShowPreview] = useState(false)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Загрузка редактора...</p>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Ошибка: {error}</p>
          <Button onClick={() => window.location.reload()}>
            Попробовать снова
          </Button>
        </div>
      </div>
    )
  }

  const handleAddBlock = async (type: string) => {
    try {
      await addBlock({
        type: type as any,
        title: type === 'LINK' ? 'Новая ссылка' : 'Новый блок',
        url: type === 'LINK' ? 'https://example.com' : undefined
      })
    } catch (err) {
      console.error('Failed to add block:', err)
    }
  }

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
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Редактирование страницы
                </h1>
                <p className="text-sm text-gray-500">
                  linkhub.kz/{JSON.parse(localStorage.getItem('user') || '{}').username}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {showPreview ? 'Редактор' : 'Превью'}
              </Button>
              <Button size="sm">
                Опубликовать
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Редактор */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-medium mb-4">Настройки страницы</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Заголовок
                  </label>
                  <input
                    type="text"
                    value={page.title}
                    onChange={(e) => updatePage({ title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Описание
                  </label>
                  <textarea
                    value={page.description || ''}
                    onChange={(e) => updatePage({ description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Расскажите о себе..."
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Блоки</h2>
                <div className="flex space-x-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAddBlock('LINK')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Ссылка
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddBlock('TEXT')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Текст
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {page.blocks.map((block, index) => (
                  <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">
                        {block.type} блок #{index + 1}
                      </span>
                      <button className="text-gray-400 hover:text-red-500">
                        ✕
                      </button>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={block.title}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Заголовок блока"
                      />
                      {block.type === 'LINK' && (
                        <input
                          type="url"
                          value={block.url || ''}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-2"
                          placeholder="https://example.com"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Превью */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 text-center">
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <h1 className="text-xl font-bold text-gray-900">{page.title}</h1>
                {page.description && (
                  <p className="text-gray-600 mt-2">{page.description}</p>
                )}
              </div>
              
              <div className="p-6 space-y-3">
                {page.blocks.filter(block => block.isActive).map((block) => (
                    <div key={block.id}>
                    {block.type === 'LINK' ? (
                        <a
                        href={block.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-primary text-white text-center py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                        {block.title}
                        </a>
                    ) : (
                        <div className="text-center py-2 text-gray-700">
                        {block.title}
                        </div>
                    )}
                    </div>
                ))}
              </div>  
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}