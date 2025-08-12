// src/lib/cloudinary.ts - Конфигурация Cloudinary
import { v2 as cloudinary } from 'cloudinary'

// Настройка Cloudinary (вызывается один раз при инициализации)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

// Проверяем что все переменные установлены
export const isCloudinaryConfigured = () => {
  return !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  )
}

// Типы для результатов загрузки
export interface CloudinaryUploadResult {
  success: boolean
  url?: string
  publicId?: string
  width?: number
  height?: number
  format?: string
  bytes?: number
  error?: string
}

// Вспомогательные функции для загрузки
export const uploadImageToCloudinary = async (
  file: File,
  folder: string = 'linkhub',
  transformations?: any[]
): Promise<CloudinaryUploadResult> => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary not configured')
  }

  try {
    // Конвертируем файл в base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`

    // Загружаем в Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder,
      resource_type: 'image',
      transformation: transformations || [
        {
          quality: 'auto:good',
          fetch_format: 'auto',
          flags: 'progressive',
        }
      ],
      public_id: `${folder.split('/').pop()}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      overwrite: false,
      use_filename: false,
    })

    return {
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes
    }

  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown upload error'
    }
  }
}

// Специализированная функция для баннеров
export const uploadBannerToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
  return uploadImageToCloudinary(file, 'linkhub/banners', [
    {
      quality: 'auto:good',
      fetch_format: 'auto',
      flags: 'progressive',
      crop: 'limit',
      width: 1200,
      height: 400
    }
  ])
}

// Специализированная функция для аватаров
export const uploadAvatarToCloudinary = async (file: File): Promise<CloudinaryUploadResult> => {
  return uploadImageToCloudinary(file, 'linkhub/avatars', [
    {
      quality: 'auto:good',
      fetch_format: 'auto',
      flags: 'progressive',
      width: 200,
      height: 200,
      crop: 'fill',
      gravity: 'face'
    }
  ])
}

// Функция удаления изображения
export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
  if (!isCloudinaryConfigured()) {
    return false
  }

  try {
    await cloudinary.uploader.destroy(publicId)
    return true
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return false
  }
}

export default cloudinary

// src/types/cloudinary.ts - Типы для TypeScript
export interface CloudinaryResource {
  public_id: string
  version: number
  signature: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  bytes: number
  type: string
  url: string
  secure_url: string
}

export interface CloudinaryError {
  message: string
  name: string
  http_code: number
}

// src/lib/validation.ts - Валидация файлов
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  // Проверяем размер файла (максимум 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Файл слишком большой. Максимальный размер: 10MB'
    }
  }

  // Проверяем тип файла
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'Пожалуйста, выберите файл изображения'
    }
  }

  // Проверяем поддерживаемые форматы
  const supportedTypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'image/webp',
    'image/gif'
  ]
  
  if (!supportedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Поддерживаемые форматы: JPEG, PNG, WebP, GIF'
    }
  }

  return { valid: true }
}

// Валидация специально для баннеров
export const validateBannerFile = (file: File): { valid: boolean; error?: string } => {
  const baseValidation = validateImageFile(file)
  if (!baseValidation.valid) {
    return baseValidation
  }

  // Дополнительные проверки для баннеров
  // Можно добавить проверку размеров изображения если нужно
  
  return { valid: true }
}

// Валидация для аватаров
export const validateAvatarFile = (file: File): { valid: boolean; error?: string } => {
  const baseValidation = validateImageFile(file)
  if (!baseValidation.valid) {
    return baseValidation
  }

  // Для аватаров можем быть строже с размером
  if (file.size > 5 * 1024 * 1024) { // 5MB для аватаров
    return {
      valid: false,
      error: 'Для аватара максимальный размер: 5MB'
    }
  }

  return { valid: true }
}