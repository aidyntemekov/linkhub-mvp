'use client'

import { useState } from 'react'
import { ExternalLink, Mail, Phone, MessageCircle } from 'lucide-react'

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

interface PublicPageProps {
  userData: PublicUserData
}

export default function PublicPage({ userData }: PublicPageProps) {
  const [clickedBlocks, setClickedBlocks] = useState<Set<string>>(new Set())

  const handleBlockClick = async (blockId: string, url?: string) => {
    // Отмечаем блок как кликнутый для анимации
    setClickedBlocks(prev => new Set(prev).add(blockId))
    
    // Записываем клик в аналитику
    try {
      await fetch('/api/analytics/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ blockId }),
      })
    } catch (error) {
      console.error('Error recording click:', error)
    }
    
    // Переходим по ссылке
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
    
    // Убираем анимацию через 200ms
    setTimeout(() => {
      setClickedBlocks(prev => {
        const newSet = new Set(prev)
        newSet.delete(blockId)
        return newSet
      })
    }, 200)
  }

  const renderBlock = (block: any) => {
    const isClicked = clickedBlocks.has(block.id)
    
    switch (block.type) {
      case 'LINK':
        return (
          <button
            key={block.id}
            onClick={() => handleBlockClick(block.id, block.url)}
            className={`
              w-full bg-white border-2 border-gray-200 rounded-xl p-4 
              hover:border-primary hover:shadow-md transition-all duration-200
              flex items-center justify-between group
              ${isClicked ? 'scale-95 bg-primary/5' : 'hover:scale-[1.02]'}
            `}
          >
            <span className="text-gray-900 font-medium text-left flex-1">
              {block.title}
            </span>
            <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-primary transition-colors" />
          </button>
        )
      
      case 'EMAIL':
        return (
          <button
            key={block.id}
            onClick={() => handleBlockClick(block.id, `mailto:${block.url}`)}
            className={`
              w-full bg-white border-2 border-gray-200 rounded-xl p-4 
              hover:border-blue-400 hover:shadow-md transition-all duration-200
              flex items-center justify-between group
              ${isClicked ? 'scale-95 bg-blue-50' : 'hover:scale-[1.02]'}
            `}
          >
            <span className="text-gray-900 font-medium text-left flex-1">
              {block.title}
            </span>
            <Mail className="h-5 w-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
          </button>
        )
      
      case 'PHONE':
        return (
          <button
            key={block.id}
            onClick={() => handleBlockClick(block.id, `tel:${block.url}`)}
            className={`
              w-full bg-white border-2 border-gray-200 rounded-xl p-4 
              hover:border-green-400 hover:shadow-md transition-all duration-200
              flex items-center justify-between group
              ${isClicked ? 'scale-95 bg-green-50' : 'hover:scale-[1.02]'}
            `}
          >
            <span className="text-gray-900 font-medium text-left flex-1">
              {block.title}
            </span>
            <Phone className="h-5 w-5 text-gray-400 group-hover:text-green-500 transition-colors" />
          </button>
        )
      
      case 'TEXT':
        return (
          <div
            key={block.id}
            className="w-full bg-white/50 rounded-xl p-4 text-center"
          >
            <p className="text-gray-700 leading-relaxed">{block.title}</p>
          </div>
        )
      
      case 'SOCIAL':
        return (
          <button
            key={block.id}
            onClick={() => handleBlockClick(block.id, block.url)}
            className={`
              w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white 
              rounded-xl p-4 hover:shadow-lg transition-all duration-200
              flex items-center justify-between group
              ${isClicked ? 'scale-95' : 'hover:scale-[1.02]'}
            `}
          >
            <span className="font-medium text-left flex-1">
              {block.title}
            </span>
            <MessageCircle className="h-5 w-5 opacity-90" />
          </button>
        )
      
      case 'DIVIDER':
        return (
          <div key={block.id} className="w-full flex items-center py-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            {block.title && (
              <>
                <span className="px-4 text-sm text-gray-500">{block.title}</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </>
            )}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-white to-secondary/10">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Avatar */}
          <div className="mb-4">
            {userData.page.avatar || userData.avatar ? (
              <img
                src={userData.page.avatar || userData.avatar}
                alt={userData.name || userData.username}
                className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {(userData.name || userData.username).charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
          
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {userData.page.title}
          </h1>
          
          {/* Description */}
          {userData.page.description && (
            <p className="text-gray-600 text-sm leading-relaxed max-w-xs mx-auto">
              {userData.page.description}
            </p>
          )}
        </div>

        {/* Blocks */}
        <div className="space-y-4">
          {userData.page.blocks.map(renderBlock)}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-400 mb-2">
            Создано с помощью
          </p>
          <a 
            href="/" 
            className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors"
          >
            LinkHub.kz
          </a>
        </div>
      </div>
    </div>
  )
}