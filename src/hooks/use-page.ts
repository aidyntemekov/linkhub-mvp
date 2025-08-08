// src/hooks/use-page.ts
import { useState, useEffect } from 'react'
import { Block, Page } from '@/types'

export function usePage() {
  const [page, setPage] = useState<Page | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPage = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const userData = localStorage.getItem('user')
      if (!userData) throw new Error('User not found')
      
      const user = JSON.parse(userData)
      
      const response = await fetch('/api/pages', {
        headers: {
          'x-user-email': user.email
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch page')
      
      const data = await response.json()
      setPage(data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const updatePage = async (updates: Partial<Page>) => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) throw new Error('User not found')
      
      const user = JSON.parse(userData)
      
      const response = await fetch('/api/pages', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update page')
      
      const data = await response.json()
      setPage(prev => prev ? { ...prev, ...updates } : data.page)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const addBlock = async (blockData: Partial<Block>) => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) throw new Error('User not found')
      
      const user = JSON.parse(userData)
      
      const response = await fetch('/api/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify(blockData)
      })
      
      if (!response.ok) throw new Error('Failed to create block')
      
      const data = await response.json()
      setPage(prev => prev ? {
        ...prev,
        blocks: [...(prev.blocks || []), data.block]
      } : null)
      
      return data.block
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      throw err
    }
  }

  const updateBlock = async (blockId: string, updates: Partial<Block>) => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) throw new Error('User not found')
      
      const user = JSON.parse(userData)
      
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': user.email
        },
        body: JSON.stringify(updates)
      })
      
      if (!response.ok) throw new Error('Failed to update block')
      
      const data = await response.json()
      
      // Обновляем локальное состояние
      setPage(prev => prev ? {
        ...prev,
        blocks: (prev.blocks || []).map(block => 
          block.id === blockId ? { ...block, ...updates } : block
        )
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const deleteBlock = async (blockId: string) => {
    try {
      const userData = localStorage.getItem('user')
      if (!userData) throw new Error('User not found')
      
      const user = JSON.parse(userData)
      
      const response = await fetch(`/api/blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': user.email
        }
      })
      
      if (!response.ok) throw new Error('Failed to delete block')
      
      // Удаляем блок из локального состояния
      setPage(prev => prev ? {
        ...prev,
        blocks: (prev.blocks || []).filter(block => block.id !== blockId)
      } : null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  useEffect(() => {
    fetchPage()
  }, [])

  return {
    page,
    isLoading,
    error,
    refetch: fetchPage,
    updatePage,
    addBlock,
    updateBlock,
    deleteBlock
  }
}