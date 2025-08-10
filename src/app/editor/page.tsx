// src/app/editor/page.tsx
'use client'

import { usePage } from '@/hooks/use-page'
import { Button } from '@/components/ui/button'
import LinkBannerUpload from '@/components/LinkBannerUpload'
import { useState } from 'react'
import { Plus, Settings, Eye, ArrowLeft, Mail, Phone, Users, Type, Link as LinkIcon, Minus } from 'lucide-react'
import Link from 'next/link'

export default function EditorPage() {
  const { page, isLoading, error, addBlock, updatePage, updateBlock, deleteBlock } = usePage()
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
      const blockData = {
        type: type as any,
        title: getDefaultTitle(type),
        url: type === 'LINK' ? 'https://example.com' : undefined,
        content: type === 'SOCIAL' ? { links: [] } : undefined
      }
      await addBlock(blockData)
    } catch (err) {
      console.error('Failed to add block:', err)
    }
  }

  const getDefaultTitle = (type: string) => {
    switch (type) {
      case 'LINK': return 'Новая ссылка'
      case 'TEXT': return 'Текстовый блок'
      case 'EMAIL': return 'Связаться со мной'
      case 'PHONE': return 'Позвонить мне'
      case 'SOCIAL': return 'Мои соцсети'
      case 'DIVIDER': return 'Разделитель'
      default: return 'Новый блок'
    }
  }

  const handleBlockUpdate = (blockId: string, field: string, value: any) => {
    updateBlock(blockId, { [field]: value })
  }

  const handleBlockBannerChange = (blockId: string, bannerUrl: string) => {
    // Сохраняем баннер в поле content блока
    const block = page.blocks.find(b => b.id === blockId)
    const newContent = { ...block?.content, banner: bannerUrl }
    updateBlock(blockId, { content: newContent })
  }

  const handleBlockBannerRemove = (blockId: string) => {
    const block = page.blocks.find(b => b.id === blockId)
    const newContent = { ...block?.content }
    delete newContent.banner
    updateBlock(blockId, { content: newContent })
  }

  const renderBlockEditor = (block: any) => {
    switch (block.type) {
      case 'LINK':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={block.title}
              onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Заголовок ссылки"
            />
            <input
              type="url"
              value={block.url || ''}
              onChange={(e) => handleBlockUpdate(block.id, 'url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="https://example.com"
            />
            <LinkBannerUpload
              currentBanner={block.content?.banner}
              onBannerChange={(bannerUrl) => handleBlockBannerChange(block.id, bannerUrl)}
              onBannerRemove={() => handleBlockBannerRemove(block.id)}
            />
          </div>
        )

      case 'TEXT':
        return (
          <textarea
            value={block.title}
            onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="Введите текст..."
          />
        )

      case 'EMAIL':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={block.title}
              onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Текст кнопки (например: 'Написать мне')"
            />
            <input
              type="email"
              value={block.url || ''}
              onChange={(e) => handleBlockUpdate(block.id, 'url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="your@email.com"
            />
          </div>
        )

      case 'PHONE':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={block.title}
              onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Текст кнопки (например: 'Позвонить мне')"
            />
            <input
              type="tel"
              value={block.url || ''}
              onChange={(e) => handleBlockUpdate(block.id, 'url', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="+7 (777) 123-45-67"
            />
          </div>
        )

      case 'SOCIAL':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={block.title}
              onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Заголовок (например: 'Мои соцсети')"
            />
            <div className="text-xs text-gray-500">
              Социальные сети настраиваются отдельно (пока в разработке)
            </div>
          </div>
        )

      case 'DIVIDER':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={block.title}
              onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="Текст разделителя (необязательно)"
            />
          </div>
        )

      default:
        return (
          <input
            type="text"
            value={block.title}
            onChange={(e) => handleBlockUpdate(block.id, 'title', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            placeholder="Заголовок блока"
          />
        )
    }
  }

  const renderBlockPreview = (block: any) => {
    switch (block.type) {
      case 'LINK':
        return (
          <div className="w-full bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer overflow-hidden">
            {block.content?.banner ? (
              // Если есть баннер - показываем его
              <div 
                className="w-full bg-cover bg-center relative"
                style={{ 
                  backgroundImage: `url(${block.content.banner})`,
                  aspectRatio: '3/1',
                  minHeight: '80px'
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <span className="text-white font-medium text-lg px-4 py-2 bg-black bg-opacity-50 rounded">
                    {block.title}
                  </span>
                </div>
              </div>
            ) : (
              // Если нет баннера - обычная кнопка
              <div className="w-full text-center py-3 px-4">
                {block.title}
              </div>
            )}
          </div>
        )

      case 'EMAIL':
        return (
          <div className="w-full bg-blue-500 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center">
            <Mail className="h-4 w-4 mr-2" />
            {block.title}
          </div>
        )

      case 'PHONE':
        return (
          <div className="w-full bg-green-500 text-white text-center py-3 px-4 rounded-lg hover:bg-green-600 transition-colors cursor-pointer flex items-center justify-center">
            <Phone className="h-4 w-4 mr-2" />
            {block.title}
          </div>
        )

      case 'SOCIAL':
        return (
          <div className="w-full bg-purple-500 text-white text-center py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors cursor-pointer flex items-center justify-center">
            <Users className="h-4 w-4 mr-2" />
            {block.title}
          </div>
        )

      case 'TEXT':
        return (
          <div className="text-center py-2 text-gray-700 bg-gray-50 rounded-lg px-4">
            {block.title}
          </div>
        )

      case 'DIVIDER':
        return (
          <div className="text-center py-4">
            {block.title && <p className="text-sm text-gray-500 mb-2">{block.title}</p>}
            <hr className="border-gray-300" />
          </div>
        )

      default:
        return (
          <div className="text-center py-2 text-gray-700">
            {block.title}
          </div>
        )
    }
  }

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'LINK': return <LinkIcon className="h-4 w-4" />
      case 'TEXT': return <Type className="h-4 w-4" />
      case 'EMAIL': return <Mail className="h-4 w-4" />
      case 'PHONE': return <Phone className="h-4 w-4" />
      case 'SOCIAL': return <Users className="h-4 w-4" />
      case 'DIVIDER': return <Minus className="h-4 w-4" />
      default: return <Plus className="h-4 w-4" />
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
            {/* Настройки страницы */}
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

            {/* Блоки */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Блоки</h2>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAddBlock('LINK')}
                  >
                    <LinkIcon className="h-4 w-4 mr-1" />
                    Ссылка
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddBlock('TEXT')}
                  >
                    <Type className="h-4 w-4 mr-1" />
                    Текст
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddBlock('EMAIL')}
                  >
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddBlock('PHONE')}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Телефон
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddBlock('SOCIAL')}
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Соцсети
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleAddBlock('DIVIDER')}
                  >
                    <Minus className="h-4 w-4 mr-1" />
                    Разделитель
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {page.blocks.map((block, index) => (
                  <div key={block.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        {getBlockIcon(block.type)}
                        <span className="text-sm font-medium text-gray-700">
                          {block.type} блок #{index + 1}
                        </span>
                      </div>
                      <button 
                        onClick={() => deleteBlock(block.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    {renderBlockEditor(block)}
                  </div>
                ))}
                
                {page.blocks.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>Пока нет блоков. Добавьте первый блок используя кнопки выше!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Превью */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Профиль */}
              <div className="text-center p-6">
                {/* Аватар */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-gray-600">
                      {page.title.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <h1 className="text-xl font-bold text-gray-900">{page.title}</h1>
                {page.description && (
                  <p className="text-gray-600 mt-2 text-sm">{page.description}</p>
                )}
              </div>
              
              {/* Блоки */}
              <div className="px-6 pb-6 space-y-3">
                {page.blocks.filter(block => block.isActive).map((block) => (
                  <div key={block.id}>
                    {renderBlockPreview(block)}
                  </div>
                ))}
                
                {page.blocks.filter(block => block.isActive).length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p>Здесь будут отображаться ваши блоки</p>
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