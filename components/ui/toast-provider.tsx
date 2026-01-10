"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { soundManager } from '@/lib/sound-manager'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
}

interface ToastContextType {
  toast: (payload: { type: ToastType, message: string, description?: string }) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = ({ type, message, description }: { type: ToastType, message: string, description?: string }) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, type, message, description }])
    
    // Play sound based on type
    if (type === 'error') soundManager.play('error')
    else soundManager.play('popup')

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={cn(
                "pointer-events-auto w-80 p-5 rounded-[2rem] shadow-2xl backdrop-blur-xl border flex items-start gap-4 relative overflow-hidden group",
                t.type === 'success' && "bg-green-500/10 border-green-500/20 text-green-600",
                t.type === 'error' && "bg-red-500/10 border-red-500/20 text-red-600",
                t.type === 'warning' && "bg-yellow-500/10 border-yellow-500/20 text-yellow-600",
                t.type === 'info' && "bg-blue-500/10 border-blue-500/20 text-blue-600"
              )}
            >
              <div className="shrink-0 mt-1">
                {t.type === 'success' && <CheckCircle className="w-6 h-6" />}
                {t.type === 'error' && <XCircle className="w-6 h-6" />}
                {t.type === 'warning' && <AlertTriangle className="w-6 h-6" />}
                {t.type === 'info' && <Info className="w-6 h-6" />}
              </div>
              
              <div className="flex-1 space-y-1">
                <h4 className="font-black text-sm leading-tight">{t.message}</h4>
                {t.description && <p className="text-xs font-bold opacity-70 leading-relaxed">{t.description}</p>}
              </div>

              <button 
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-black/5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <motion.div 
                initial={{ width: "100%" }}
                animate={{ width: 0 }}
                transition={{ duration: 5, ease: "linear" }}
                className={cn(
                    "absolute bottom-0 left-0 h-1",
                    t.type === 'success' && "bg-green-500/50",
                    t.type === 'error' && "bg-red-500/50",
                    t.type === 'warning' && "bg-yellow-500/50",
                    t.type === 'info' && "bg-blue-500/50"
                )}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
