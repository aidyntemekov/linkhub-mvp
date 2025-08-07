export type BlockType = 'LINK' | 'TEXT' | 'SOCIAL' | 'EMAIL' | 'PHONE' | 'DIVIDER'

export interface Block {
  id: string
  type: BlockType
  title: string
  url?: string
  content?: any
  position: number
  isActive: boolean
}

export interface Page {
  id: string
  title: string
  description?: string
  avatar?: string
  themeId: string
  isPublic: boolean
  blocks: Block[]
}

export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
  username: string
  language: string
}