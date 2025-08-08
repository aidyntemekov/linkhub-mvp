// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Утилита для генерации username из email
// Обновите функцию generateUsername в src/lib/utils.ts

export function generateUsername(email: string): string {
  let baseUsername = email.split('@')[0].toLowerCase()
  
  // Убираем цифры и знаки подчеркивания в конце
  baseUsername = baseUsername.replace(/[_\d]+$/, '')
  
  // Если получилось слишком коротко, оставляем исходный вариант
  if (baseUsername.length < 3) {
    baseUsername = email.split('@')[0].toLowerCase()
  }
  
  // Добавляем случайное короткое число
  const randomSuffix = Math.floor(Math.random() * 99) + 1
  
  return `${baseUsername}${randomSuffix}`
}

// Валидация URL
export function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

// Форматирование даты
export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}