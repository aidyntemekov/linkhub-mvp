// src/components/LinkBannerUpload.tsx

'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Upload, X, Move, RotateCcw, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LinkBannerUploadProps {
  currentBanner?: string
  onBannerChange: (bannerUrl: string) => void
  onBannerRemove: () => void
}

export default function LinkBannerUpload({ 
  currentBanner, 
  onBannerChange, 
  onBannerRemove 
}: LinkBannerUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [imageScale, setImageScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Проверяем что компонент смонтирован (для SSR)
  useEffect(() => {
    setMounted(true)
    console.log('🟢 Component mounted') // DEBUG
  }, [])

  // Логируем изменения состояния
  useEffect(() => {
    console.log('🟦 State changed:', { 
      mounted, 
      showCropper, 
      hasSelectedImage: !!selectedImage,
      isUploading 
    }) // DEBUG
  }, [mounted, showCropper, selectedImage, isUploading])

  // Блокируем скролл body когда показан кроппер
  useEffect(() => {
    if (showCropper) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [showCropper])

  // Размеры для баннеров LINK блоков (3:1)
  const BANNER_WIDTH = 600  // базовая ширина для кроппера
  const BANNER_HEIGHT = 200 // высота (3:1)
  const ASPECT_RATIO = 3    // 3:1

  // DEBUG: Логируем состояние в каждом рендере
  console.log('🟦 RENDER STATE:', { 
    mounted, 
    showCropper, 
    hasSelectedImage: !!selectedImage,
    selectedImageLength: selectedImage?.length 
  })

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🟢 Step 1: File select triggered') // DEBUG
    
    const file = event.target.files?.[0]
    console.log('🟢 Step 2: File object:', file) // DEBUG
    
    if (!file) {
      console.log('🔴 No file selected') // DEBUG
      return
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      console.log('🔴 Wrong file type:', file.type) // DEBUG
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Проверяем размер файла (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('🔴 File too large:', file.size) // DEBUG
      alert('Размер файла не должен превышать 10MB')
      return
    }

    console.log('🟢 Step 3: Starting FileReader...') // DEBUG
    
    const reader = new FileReader()
    reader.onload = (e) => {
      console.log('🟢 Step 4: FileReader onload triggered') // DEBUG
      
      const imageUrl = e.target?.result as string
      console.log('🟢 Step 5: Image URL created, length:', imageUrl?.length) // DEBUG
      
      console.log('🟢 Step 6: Setting state...') // DEBUG
      setSelectedImage(imageUrl)
      setShowCropper(true)
      setCropPosition({ x: 0, y: 0 })
      setImageScale(1)
      
      console.log('🟢 Step 7: State should be set now') // DEBUG
    }
    
    reader.onerror = (e) => {
      console.error('🔴 FileReader error:', e) // DEBUG
    }
    
    reader.readAsDataURL(file)
    console.log('🟢 Step 8: FileReader.readAsDataURL called') // DEBUG
  }, [])

  const handleImageLoad = useCallback(() => {
    if (!imageRef.current) return
    
    const img = imageRef.current
    const cropperWidth = 450  // ширина кроппера
    const cropperHeight = 150 // высота кроппера (3:1)
    
    // Вычисляем начальный масштаб для покрытия всего контейнера
    const scaleX = cropperWidth / img.naturalWidth
    const scaleY = cropperHeight / img.naturalHeight
    const initialScale = Math.max(scaleX, scaleY, 0.1)
    
    setImageScale(initialScale)
    
    // Центрируем изображение
    const scaledWidth = img.naturalWidth * initialScale
    const scaledHeight = img.naturalHeight * initialScale
    setCropPosition({
      x: (cropperWidth - scaledWidth) / 2,
      y: (cropperHeight - scaledHeight) / 2
    })
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({
      x: e.clientX - cropPosition.x,
      y: e.clientY - cropPosition.y
    })
  }, [cropPosition])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    
    setCropPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleScaleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setImageScale(parseFloat(e.target.value))
  }, [])

  const resetCrop = useCallback(() => {
    handleImageLoad()
  }, [handleImageLoad])

  const cropAndUploadImage = useCallback(async () => {
    if (!imageRef.current || !canvasRef.current || !selectedImage) return

    setIsUploading(true)
    
    try {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Cannot get canvas context')

      // Устанавливаем размеры canvas для финального баннера
      canvas.width = BANNER_WIDTH
      canvas.height = BANNER_HEIGHT

      const img = new Image()
      img.onload = async () => {
        // Вычисляем масштабы для финального изображения
        const cropperWidth = 450
        const cropperHeight = 150
        const scaleFactorX = BANNER_WIDTH / cropperWidth
        const scaleFactorY = BANNER_HEIGHT / cropperHeight

        // Очищаем canvas
        ctx.clearRect(0, 0, BANNER_WIDTH, BANNER_HEIGHT)
        
        // Рисуем обрезанное изображение
        ctx.drawImage(
          img,
          -cropPosition.x * scaleFactorX,
          -cropPosition.y * scaleFactorY,
          img.width * imageScale * scaleFactorX,
          img.height * imageScale * scaleFactorY
        )

        // Конвертируем в blob
        canvas.toBlob(async (blob) => {
          if (!blob) throw new Error('Failed to create blob')

          // В реальном приложении здесь будет загрузка в Cloudinary
          // С трансформациями: ar_3:1, c_fill, g_auto, f_auto, q_auto
          const tempUrl = URL.createObjectURL(blob)
          
          // Имитируем загрузку
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          onBannerChange(tempUrl)
          setShowCropper(false)
          setSelectedImage(null)
          
          // Очищаем input
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }, 'image/jpeg', 0.9)
      }
      img.src = selectedImage
    } catch (error) {
      console.error('Error cropping image:', error)
      alert('Ошибка при обработке изображения')
    } finally {
      setIsUploading(false)
    }
  }, [selectedImage, cropPosition, imageScale, onBannerChange])

  const handleCancel = useCallback(() => {
    setShowCropper(false)
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  // Компонент кроппера для портала - выносим из рендера
  const cropperModal = useMemo(() => {
    console.log('🔧 useMemo recalculating cropperModal, selectedImage:', !!selectedImage)
    
    if (!selectedImage) {
      console.log('🔴 No selectedImage, returning null')
      return null
    }
    
    console.log('🟢 Creating cropper modal JSX')
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4"
        style={{ 
          zIndex: 9999,
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div 
          className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '672px',
            width: '100%',
            maxHeight: '90vh',
            overflowY: 'auto',
            position: 'relative',
            zIndex: 10000
          }}
        >
          <h3 className="text-lg font-semibold mb-4">Настройка баннера</h3>
          
          <div className="flex justify-center mb-4">
            <div 
              className="relative border-2 border-gray-300 rounded-lg overflow-hidden cursor-move bg-gray-100 shadow-inner"
              style={{ width: '450px', height: '150px' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={selectedImage}
                alt="Crop preview"
                className="absolute select-none"
                style={{
                  transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${imageScale})`,
                  transformOrigin: '0 0',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onLoad={handleImageLoad}
                draggable={false}
              />
              
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full border border-white border-opacity-40" 
                     style={{
                       backgroundImage: `
                         linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
                         linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)
                       `,
                       backgroundSize: '150px 50px'  // возвращаем обратно
                     }} 
                />
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="inline-flex items-center text-sm text-gray-500">
              <Move className="h-4 w-4 mr-2" />
              Перетаскивайте изображение для позиционирования
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Масштаб
              </label>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-500">0.1×</span>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={imageScale}
                  onChange={handleScaleChange}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">3×</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetCrop}
                  title="Сбросить позицию"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isUploading}
              >
                Отмена
              </Button>
              <Button
                onClick={cropAndUploadImage}
                disabled={isUploading}
              >
                {isUploading ? 'Сохранение...' : 'Сохранить баннер'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }, [selectedImage, cropPosition, imageScale, isDragging, isUploading, handleMouseDown, handleMouseMove, handleMouseUp, handleImageLoad, handleScaleChange, resetCrop, handleCancel, cropAndUploadImage])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Баннер ссылки
      </label>
      
      {/* Текущий баннер или плейсхолдер */}
      <div className="relative">
        <div 
          className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
          style={{ 
            width: '75%',  // уменьшаем ширину на 25%
            aspectRatio: '3/1'  // сохраняем пропорции 3:1
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {currentBanner ? (
            <img 
              src={currentBanner} 
              alt="Link banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Нажмите для загрузки баннера
              </p>
              <p className="text-xs text-gray-400">
                Соотношение 3:1
              </p>
            </div>
          )}
        </div>
        
        {currentBanner && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onBannerRemove()
            }}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Рекомендуемый размер: 600×200 пикселей (соотношение 3:1)
      </p>

      {/* DEBUG: Кнопка для тестирования состояния */}
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => {
          console.log('🟡 Manual test button clicked')
          console.log('🟡 Current state:', { mounted, showCropper, selectedImage: !!selectedImage })
          setShowCropper(true)
          setSelectedImage('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPjYwMHgyMDA8L3RleHQ+PC9zdmc+')
          console.log('🟡 State should be set now')
        }}
      >
        🧪 Тест кроппера
      </Button>

      {/* Скрытый input для файлов */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Портал для кроппера */}
      {(() => {
        const shouldRender = mounted && showCropper && selectedImage
        console.log('🔍 Portal check:', { 
          mounted, 
          showCropper, 
          hasSelectedImage: !!selectedImage, 
          shouldRender: !!shouldRender,
          documentBody: !!document?.body
        })
        
        if (shouldRender) {
          console.log('🟢 Rendering portal with cropperModal:', !!cropperModal)
          try {
            const portal = createPortal(cropperModal, document.body)
            console.log('🟢 Portal created successfully:', !!portal)
            
            // Проверяем DOM
            setTimeout(() => {
              const modals = document.querySelectorAll('[style*="z-index: 9999"]')
              console.log('🔍 Found modals in DOM:', modals.length)
              modals.forEach((modal, i) => {
                const rect = modal.getBoundingClientRect()
                console.log(`Modal ${i}:`, {
                  visible: modal.offsetParent !== null,
                  rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height },
                  zIndex: getComputedStyle(modal).zIndex,
                  opacity: getComputedStyle(modal).opacity,
                  display: getComputedStyle(modal).display
                })
              })
            }, 100)
            
            return portal
          } catch (error) {
            console.error('🔴 Portal creation error:', error)
            return null
          }
        }
        
        console.log('🔴 Not rendering portal')
        return null
      })()}

      {/* Скрытый canvas для обрезки */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}