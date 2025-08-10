// Создайте файл: src/components/BannerUpload.tsx

'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Move, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BannerUploadProps {
  currentBanner?: string
  onBannerChange: (bannerUrl: string) => void
  onBannerRemove: () => void
}

export default function BannerUpload({ 
  currentBanner, 
  onBannerChange, 
  onBannerRemove 
}: BannerUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [imageScale, setImageScale] = useState(1)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Целевые размеры баннера
  const BANNER_WIDTH = 1200
  const BANNER_HEIGHT = 300
  const ASPECT_RATIO = 4 // 4:1

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    // Проверяем размер файла (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setSelectedImage(imageUrl)
      setShowCropper(true)
      
      // Сброс позиции и масштаба
      setCropPosition({ x: 0, y: 0 })
      setImageScale(1)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleImageLoad = useCallback(() => {
    if (!imageRef.current) return
    
    const img = imageRef.current
    const containerWidth = 400 // ширина контейнера для кроппера
    const containerHeight = 100 // высота контейнера (4:1)
    
    // Вычисляем начальный масштаб, чтобы изображение покрывало весь контейнер
    const scaleX = containerWidth / img.naturalWidth
    const scaleY = containerHeight / img.naturalHeight
    const initialScale = Math.max(scaleX, scaleY, 0.1)
    
    setImageScale(initialScale)
    
    // Центрируем изображение
    const scaledWidth = img.naturalWidth * initialScale
    const scaledHeight = img.naturalHeight * initialScale
    setCropPosition({
      x: (containerWidth - scaledWidth) / 2,
      y: (containerHeight - scaledHeight) / 2
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

      // Устанавливаем размеры canvas
      canvas.width = BANNER_WIDTH
      canvas.height = BANNER_HEIGHT

      // Создаем новое изображение для обрезки
      const img = new Image()
      img.onload = async () => {
        // Вычисляем масштабы для финального изображения
        const cropperWidth = 400
        const cropperHeight = 100
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

          // Загрузка в Cloudinary
          const formData = new FormData()
          formData.append('file', blob)
          formData.append('upload_preset', 'your_preset')

          const response = await fetch('https://api.cloudinary.com/v1_1/dk8cgho0k/image/upload', {
            method: 'POST',
            body: formData
          })

          const data = await response.json()
          onBannerChange(data.secure_url)
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

  return (
    <div className="space-y-4">
      {/* Текущий баннер или плейсхолдер */}
      <div className="relative">
        <div 
          className="w-full h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {currentBanner ? (
            <img 
              src={currentBanner} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <Upload className="h-6 w-6 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Нажмите для загрузки баннера
              </p>
              <p className="text-xs text-gray-400">
                Рекомендуемый размер: 1200×300 px
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
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Скрытый input для файлов */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Кроппер */}
      {showCropper && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Настройка баннера</h3>
            
            {/* Область кроппинга */}
            <div className="relative">
              <div 
                className="relative w-full h-25 border-2 border-gray-300 rounded-lg overflow-hidden cursor-move bg-gray-100"
                style={{ aspectRatio: '4/1', width: '400px', height: '100px' }}
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
                
                {/* Сетка для лучшего позиционирования */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full border border-white border-opacity-50" 
                       style={{
                         backgroundImage: `
                           linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)
                         `,
                         backgroundSize: '33.33% 50%'
                       }} 
                  />
                </div>
              </div>
              
              {/* Иконка перемещения */}
              <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white p-1 rounded">
                <Move className="h-3 w-3" />
              </div>
            </div>

            {/* Контролы */}
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Масштаб
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    value={imageScale}
                    onChange={handleScaleChange}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetCrop}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              
              {/* Кнопки действий */}
              <div className="flex justify-end space-x-2">
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
                  {isUploading ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Скрытый canvas для обрезки */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}