// src/components/LinkImageUpload.tsx

'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, X, Move, RotateCcw, Image } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LinkImageUploadProps {
  currentImage?: string
  onImageChange: (imageUrl: string) => void
  onImageRemove: () => void
}

export default function LinkImageUpload({ 
  currentImage, 
  onImageChange, 
  onImageRemove 
}: LinkImageUploadProps) {
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

  // Размеры для Link блоков (квадратные иконки)
  const IMAGE_SIZE = 64 // 64x64px иконка

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Размер файла не должен превышать 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      setSelectedImage(imageUrl)
      setShowCropper(true)
      setCropPosition({ x: 0, y: 0 })
      setImageScale(1)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleImageLoad = useCallback(() => {
    if (!imageRef.current) return
    
    const img = imageRef.current
    const containerSize = 200 // размер контейнера для кроппера
    
    // Вычисляем начальный масштаб для квадратного изображения
    const minDimension = Math.min(img.naturalWidth, img.naturalHeight)
    const initialScale = containerSize / minDimension
    
    setImageScale(initialScale)
    
    // Центрируем изображение
    const scaledWidth = img.naturalWidth * initialScale
    const scaledHeight = img.naturalHeight * initialScale
    setCropPosition({
      x: (containerSize - scaledWidth) / 2,
      y: (containerSize - scaledHeight) / 2
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

      canvas.width = IMAGE_SIZE
      canvas.height = IMAGE_SIZE

      const img = new Image()
      img.onload = async () => {
        const cropperSize = 200
        const scaleFactor = IMAGE_SIZE / cropperSize

        ctx.clearRect(0, 0, IMAGE_SIZE, IMAGE_SIZE)
        
        // Рисуем квадратное изображение
        ctx.drawImage(
          img,
          -cropPosition.x * scaleFactor,
          -cropPosition.y * scaleFactor,
          img.width * imageScale * scaleFactor,
          img.height * imageScale * scaleFactor
        )

        canvas.toBlob(async (blob) => {
          if (!blob) throw new Error('Failed to create blob')

          // В реальном приложении здесь будет загрузка в Cloudinary
          const tempUrl = URL.createObjectURL(blob)
          
          await new Promise(resolve => setTimeout(resolve, 500))
          
          onImageChange(tempUrl)
          setShowCropper(false)
          setSelectedImage(null)
          
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        }, 'image/png', 0.9)
      }
      img.src = selectedImage
    } catch (error) {
      console.error('Error cropping image:', error)
      alert('Ошибка при обработке изображения')
    } finally {
      setIsUploading(false)
    }
  }, [selectedImage, cropPosition, imageScale, onImageChange])

  const handleCancel = useCallback(() => {
    setShowCropper(false)
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [])

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Иконка ссылки
      </label>
      
      {/* Текущее изображение или плейсхолдер */}
      <div className="relative inline-block">
        <div 
          className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {currentImage ? (
            <img 
              src={currentImage} 
              alt="Link icon" 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <Image className="h-6 w-6 text-gray-400 mx-auto" />
            </div>
          )}
        </div>
        
        {currentImage && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              onImageRemove()
            }}
            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
            style={{ width: '20px', height: '20px' }}
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Квадратное изображение 64×64 пикселей
      </p>

      {/* Скрытый input для файлов */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Кроппер - ИСПРАВЛЕННОЕ ПОЗИЦИОНИРОВАНИЕ */}
      {showCropper && selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto">
            <h3 className="text-lg font-semibold mb-4">Настройка иконки</h3>
            
            {/* Область кроппинга - квадратная */}
            <div className="flex justify-center mb-4">
              <div 
                className="relative border-2 border-gray-300 rounded-lg overflow-hidden cursor-move bg-gray-100"
                style={{ width: '200px', height: '200px' }}
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
                
                {/* Сетка */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="w-full h-full border border-white border-opacity-30" 
                       style={{
                         backgroundImage: `
                           linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
                           linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)
                         `,
                         backgroundSize: '66.67px 66.67px'
                       }} 
                  />
                </div>
              </div>
            </div>

            {/* Иконка перемещения */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center text-sm text-gray-500">
                <Move className="h-3 w-3 mr-1" />
                Перетаскивайте изображение для позиционирования
              </div>
            </div>

            {/* Контролы */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Масштаб
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0.5"
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