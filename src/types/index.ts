// src/types/index.ts

export type BlockType = 'LINK' | 'TEXT' | 'SOCIAL' | 'EMAIL' | 'PHONE' | 'DIVIDER'

export interface Block {
  id: string
  pageId: string
  type: BlockType
  title: string
  url?: string
  content?: any
  position: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Page {
  id: string
  userId: string
  title: string
  description?: string
  avatar?: string
  themeId: string
  isPublic: boolean
  createdAt: Date
  updatedAt: Date
  blocks: Block[]
  banner?: string | null
  user?: {
    id: string
    email: string
    name?: string
    username: string
  }
}

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  username: string
  language: string
  createdAt: Date
  updatedAt: Date
}