"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, CheckCircle2, Circle, MoreHorizontal, LayoutList, Calendar, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Todo {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('quizzapp-todos')
    if (saved) {
      try {
        setTodos(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse todos", e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('quizzapp-todos', JSON.stringify(todos))
  }, [todos])

  const addTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!inputValue.trim()) return

    const newTodo: Todo = {
      id: Math.random().toString(36).substring(7),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
    }

    setTodos([...todos, newTodo])
    setInputValue('')
  }

  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }

  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id))
  }

  return (
    <div className="min-h-screen bg-transparent dark:bg-transparent transition-colors duration-300 pb-20">
      <div className="max-w-[800px] mx-auto pt-16 px-6 sm:px-12">
        
        {/* Cover/Header Section (Notion Style) */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 group"
        >
          {/* Notion Emoji Icon */}
          <div className="text-7xl mb-6 select-none hover:scale-110 transition-transform cursor-default">
            📝
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-2 tracking-tight group-hover:opacity-90 transition-opacity">
            قائمة المهام اليومية
          </h1>
          <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-sm font-medium border-b border-slate-100 dark:border-slate-800 pb-4">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(), 'MMMM d, yyyy', { locale: ar })}</span>
            <span className="mx-1">•</span>
            <span>{todos.length} مهام متبقية</span>
          </div>
        </motion.div>

        {/* Task List (Notion Table/List Style) */}
        <div className="space-y-[1px] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm">
          <AnimatePresence mode="popLayout">
            {todos.map((todo) => (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="group flex items-center gap-4 py-3 px-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                {/* Drag Handle (Decoration for Notion look) */}
                <GripVertical className="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />

                {/* Checkbox */}
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={cn(
                    "flex-shrink-0 w-5 h-5 rounded flex items-center justify-center transition-all border",
                    todo.completed 
                      ? "bg-blue-500 border-blue-500 text-white" 
                      : "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                  )}
                >
                  {todo.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                {/* Text */}
                <span className={cn(
                  "flex-1 text-[16px] transition-all decoration-slate-400",
                  todo.completed 
                    ? "line-through text-slate-400 font-normal" 
                    : "text-slate-700 dark:text-slate-200 font-medium"
                )}>
                  {todo.text}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="p-1 px-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md text-xs transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Inline Add Item (Notion Style) */}
          <form 
            onSubmit={addTodo}
            className="flex items-center gap-4 py-3 px-12 bg-white dark:bg-slate-900"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="اضغط لإضافة مهمة جديدة..."
              className="flex-1 bg-transparent border-none outline-none text-slate-400 focus:text-slate-700 dark:focus:text-slate-200 text-[16px] placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
          </form>
        </div>

        {/* Empty State */}
        {todos.length === 0 && (
          <div className="py-12 text-center text-slate-300 dark:text-slate-700 select-none">
            <LayoutList className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm font-medium">ليس هناك مهام بعد. ابدأ بإضافة شيء جديد.</p>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-20 border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col gap-4">
          <p className="text-xs text-slate-400 leading-relaxed max-w-[500px]">
            هذا القسم مصمم لمحاكاة تجربة Notion البسيطة والفعالة. 
            استخدمه لترتيب أفكارك ومهامك الدراسية بجانب الكويزات.
          </p>
        </div>
      </div>
    </div>
  )
}
