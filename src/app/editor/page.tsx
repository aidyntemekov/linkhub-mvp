'use client'

import { usePage } from '@/hooks/use-page'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Plus, Settings, Eye, ArrowLeft, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function EditorPage() {
  const { page, isLoading, error, addBlock, updatePage, updateBlock, deleteBlock } = usePage()
  const [showPreview, setShowPreview] = useState(false)
  const [uploadingBanners, setUploadingBanners] = useState<Set<string>>(new Set())

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
      let defaultTitle = 'Новый блок'
      let defaultUrl = undefined
      
      switch (type) {
        case 'LINK':
          defaultTitle = 'Новая ссылка'
          defaultUrl = 'https://example.com'
          break
        case 'EMAIL':
          defaultTitle = 'Мой Email'
          defaultUrl = 'your@email.com'
          break
        case 'PHONE':
          defaultTitle = 'Мой телефон'
          defaultUrl = '+7 777 123 45 67'
          break
        case 'SOCIAL':
          defaultTitle = 'Мой Instagram'
          defaultUrl = 'https://instagram.com/username'
          break
        case 'TEXT':
          defaultTitle = 'Просто текст'
          break
      }
      
      await addBlock({
        type: type as any,
        title: defaultTitle,
        url: defaultUrl
      })
    } catch (err) {
      console.error('Failed to add block:', err)
    }
  }

  const handleUpdateBlock = async (blockId: string, updates: any) => {
    try {
      // Для EMAIL и PHONE блоков, если меняется url, то title тоже меняется
      if (updates.url && page.blocks) {
        const block = page.blocks.find(b => b.id === blockId)
        if (block && (block.type === 'EMAIL' || block.type === 'PHONE')) {
          updates.title = updates.url
        }
      }
      await updateBlock(blockId, updates)
    } catch (err) {
      console.error('Failed to update block:', err)
    }
  }

  const handleDeleteBlock = async (blockId: string) => {
    try {
      await deleteBlock(blockId)
    } catch (err) {
      console.error('Failed to delete block:', err)
    }
  }

  // Функция загрузки баннера
  const handleBannerUpload = async (blockId: string, file: File) => {
    try {
      setUploadingBanners(prev => new Set(prev).add(blockId))
      
      const formData = new FormData()
      formData.append('banner', file)
      
      const response = await fetch('/api/upload/banner', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('Upload failed')
      
      const data = await response.json()
      
      // Обновляем блок с новым URL баннера
      await handleUpdateBlock(blockId, { banner: data.url })
      
    } catch (error) {
      console.error('Banner upload failed:', error)
      alert('Ошибка загрузки изображения')
    } finally {
      setUploadingBanners(prev => {
        const newSet = new Set(prev)
        newSet.delete(blockId)
        return newSet
      })
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
                  linkhub.kz/{page.user?.username || 'username'}
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
                    value={page.title || ''}
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
                <div className="flex flex-wrap gap-2">
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
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddBlock('EMAIL')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddBlock('PHONE')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Телефон
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddBlock('SOCIAL')}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Соцсеть
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {page.blocks?.map((block, index) => (
                  <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-500">
                        {block.type} блок #{index + 1}
                      </span>
                      <button 
                        onClick={() => handleDeleteBlock(block.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(block.type === 'LINK' || block.type === 'SOCIAL' || block.type === 'TEXT') && (
                        <input
                          type="text"
                          value={block.title || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Заголовок блока"
                        />
                      )}
                      {block.type === 'LINK' && (
                        <>
                        <input
                          type="url"
                          value={block.url || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { url: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-2"
                          placeholder="https://example.com"
                        />
                        {/* Загрузка баннера */}
                        <div className="mt-2">
                          <label className="block text-xs text-gray-600 mb-1">
                            Баннер (необязательно)
                          </label>
                          
                          {block.banner ? (
                            <div className="relative">
                              <img 
                                src={block.banner} 
                                alt="Баннер"
                                className="w-full h-20 object-cover rounded border"
                              />
                              <button
                                onClick={() => handleUpdateBlock(block.id, { banner: '' })}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                              >
                                ×
                              </button>
                            </div>
                          ) : (
                            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0]
                                  if (file) handleBannerUpload(block.id, file)
                                }}
                                className="hidden"
                                id={`banner-upload-${block.id}`}
                                disabled={uploadingBanners.has(block.id)}
                              />
                              <label 
                                htmlFor={`banner-upload-${block.id}`}
                                className="cursor-pointer text-sm text-gray-600 hover:text-primary"
                              >
                                {uploadingBanners.has(block.id) ? (
                                  <span>Загружаем...</span>
                                ) : (
                                  <span>📷 Выбрать изображение</span>
                                )}
                              </label>
                            </div>
                          )}
                        </div>
                      </>
                      )}
                      {block.type === 'EMAIL' && (
                        <input
                          type="email"
                          value={block.url || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { url: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-2"
                          placeholder="your@email.com"
                        />
                      )}
                      {block.type === 'PHONE' && (
                        <input
                          type="tel"
                          value={block.url || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { url: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-2"
                          placeholder="+7 777 123 45 67"
                        />
                      )}
                      {block.type === 'SOCIAL' && (
                        <input
                          type="url"
                          value={block.url || ''}
                          onChange={(e) => handleUpdateBlock(block.id, { url: e.target.value })}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm mt-2"
                          placeholder="https://instagram.com/username"
                        />
                      )}
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`active-${block.id}`}
                          checked={block.isActive}
                          onChange={(e) => handleUpdateBlock(block.id, { isActive: e.target.checked })}
                          className="rounded"
                        />
                        <label htmlFor={`active-${block.id}`} className="text-sm text-gray-600">
                          Активный
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(!page.blocks || page.blocks.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">У вас пока нет блоков</p>
                    <p className="text-sm">Добавьте свой первый блок, используя кнопки выше</p>
                  </div>
                )}
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
                {page.blocks
                ?.filter(block => block.isActive)
                ?.map(block => (
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
                    ) : block.type === 'EMAIL' ? (
                      <a
                        href={`mailto:${block.url}`}
                        className="block w-full bg-blue-500 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        {block.title}
                      </a>
                    ) : block.type === 'PHONE' ? (
                      <a
                        href={`tel:${block.url}`}
                        className="block w-full bg-green-500 text-white text-center py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        {block.title}
                      </a>
                    ) : block.type === 'SOCIAL' ? (
                      <a
                        href={block.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center py-3 px-4 rounded-lg hover:shadow-lg transition-all"
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
                {(!page.blocks?.filter(block => block.isActive)?.length) && (
                  <div className="text-center py-8 text-gray-400">
                    <p>Добавьте блоки, чтобы увидеть превью</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}