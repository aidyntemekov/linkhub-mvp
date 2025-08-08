// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Утилита для генерации username из email
export function generateUsername(email: string): string {
  const baseUsername = email.split('@')[0].toLowerCase()
  const randomSuffix = Math.floor(Math.random() * 1000)
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