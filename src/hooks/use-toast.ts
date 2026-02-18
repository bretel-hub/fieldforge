// Toast hook for FieldForge PWA
'use client'

import { useState, useCallback } from 'react'

export interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive'
  duration?: number
}

// Simple toast implementation - can be replaced with more sophisticated solution
let toastQueue: Toast[] = []
let listeners: ((toasts: Toast[]) => void)[] = []

const notify = () => {
  listeners.forEach(listener => listener(toastQueue))
}

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Math.random().toString(36).substr(2, 9)
  const newToast: Toast = {
    id,
    duration: 5000,
    ...toast
  }
  
  toastQueue = [...toastQueue, newToast]
  notify()

  // Auto-remove after duration
  setTimeout(() => {
    removeToast(id)
  }, newToast.duration)
}

const removeToast = (id: string) => {
  toastQueue = toastQueue.filter(toast => toast.id !== id)
  notify()
}

export const toast = (toast: Omit<Toast, 'id'>) => {
  addToast(toast)
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>(toastQueue)

  const subscribe = useCallback((callback: (toasts: Toast[]) => void) => {
    listeners.push(callback)
    return () => {
      listeners = listeners.filter(l => l !== callback)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    removeToast(id)
  }, [])

  return {
    toasts,
    toast: addToast,
    dismiss,
    subscribe
  }
}