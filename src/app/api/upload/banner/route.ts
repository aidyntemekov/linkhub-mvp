// src/app/api/upload/banner/route.ts - отладочная версия
import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export async function POST(request: NextRequest) {
  try {
    // Проверяем переменные окружения
    console.log('Environment check:')
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET')
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET')
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET')
    
    // Настройка Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    })
    
    console.log('Cloudinary config:', cloudinary.config())

    const formData = await request.formData()
    const file = formData.get('banner') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    })

    // Конвертируем файл в base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64String = `data:${file.type};base64,${buffer.toString('base64')}`

    console.log('Base64 string length:', base64String.length)

    // Простая загрузка без трансформаций
    console.log('Starting Cloudinary upload...')
    const result = await cloudinary.uploader.upload(base64String, {
      folder: 'linkhub/banners',
      resource_type: 'image'
    })

    console.log('Upload successful:', result.secure_url)

    return NextResponse.json({ 
      success: true,
      url: result.secure_url,
      publicId: result.public_id 
    })

  } catch (error) {
    console.error('Detailed error:', error)
    return NextResponse.json(
      { error: `Upload failed: ${error.message}` }, 
      { status: 500 }
    )
  }
}