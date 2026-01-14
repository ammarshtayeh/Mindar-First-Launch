
"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Circle, Plus, Trash2, Calendar, Clock, AlertCircle, Zap } from 'lucide-react'
import { format } from 'date-fns'
import { arEG } from 'date-fns/locale'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { DateTimePicker } from "@/components/date-time-picker"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/hooks/useAuth"
import { addTask, subscribeToTasks, updateTaskStatus, deleteTask, TodoTask } from "@/lib/services/todoService"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CreativeEmptyState } from "@/components/ui/empty-state"
import { Sparkles } from 'lucide-react'
export default function TodoPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<TodoTask[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form State
  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [priority, setPriority] = useState<'low'|'medium'|'high'>('medium')

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeToTasks(user.uid, (data) => {
      setTasks(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  const handleAdd = async () => {
    if (!title.trim() || !user) return
    
    setIsSaving(true)
    try {
      await addTask(user.uid, user.email || "", title, date || null, priority, desc)
      setIsAddOpen(false)
      // Reset form
      setTitle("")
      setDesc("")
      setDate(undefined)
      setPriority('medium')
    } catch (error) {
      console.error(error)
      alert('حدث خطأ أثناء حفظ المهمة')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleTask = async (task: TodoTask) => {
    if (!task.id) return
    await updateTaskStatus(task.id, !task.completed)
  }

  const handleDelete = async (taskId: string) => {
    if (confirm("حذف المهمة؟")) {
      await deleteTask(taskId)
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-2">مهامي الذكية 🚀</h1>
                <p className="text-slate-500 font-medium">رتب وقتك، وخلي الباقي علينا!</p>
            </div>
            
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogTrigger asChild>
                    <Button className="rounded-xl h-12 px-6 font-bold shadow-lg shadow-blue-500/20">
                        <Plus className="w-5 h-5 ml-2" />
                        مهمة جديدة
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-right text-2xl font-black">إضافة مهمة جديدة</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">عنوان المهمة</label>
                            <Input 
                                placeholder="مثلاً: مراجعة الفيزياء للوحدة الأولى" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="text-right"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">الوصف (اختياري)</label>
                            <Textarea 
                                placeholder="تفاصيل إضافية..." 
                                value={desc}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDesc(e.target.value)}
                                className="text-right resize-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">موعد التذكير (لإرسال الإيميل)</label>
                            <DateTimePicker date={date} setDate={setDate} />
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                ستحصل على إيميل تذكير في هذا الموعد بالضبط
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-500">الأهمية</label>
                            <div className="flex gap-2">
                                {(['low', 'medium', 'high'] as const).map((p) => (
                                    <button
                                        key={p}
                                        onClick={() => setPriority(p)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all ${
                                            priority === p 
                                            ? 'border-blue-500 bg-blue-50 text-blue-600' 
                                            : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                        }`}
                                    >
                                        {p === 'high' ? 'عالية 🔥' : p === 'medium' ? 'متوسطة ⚡' : 'عادية ☕'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button 
                            onClick={handleAdd} 
                            disabled={!title.trim() || isSaving}
                            className="w-full h-12 rounded-xl font-bold mt-4"
                        >
                            {isSaving ? 'جاري الحفظ...' : 'حفظ المهمة'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>

        {/* Task List */}
        <div className="space-y-3">
            <AnimatePresence>
                {tasks.map((task) => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        layout
                    >
                        <Card className={`overflow-hidden border-2 transition-all ${
                            task.completed 
                                ? 'opacity-60 bg-slate-50 dark:bg-slate-900/50 border-transparent' 
                                : 'bg-white dark:bg-slate-900 hover:border-blue-200'
                        }`}>
                            <CardContent className="p-4 flex items-center gap-4">
                                <button onClick={() => toggleTask(task)} className="focus:outline-none">
                                    {task.completed ? (
                                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                                    ) : (
                                        <Circle className="w-6 h-6 text-slate-300 hover:text-blue-500" />
                                    )}
                                </button>
                                
                                <div className="flex-1">
                                    <h3 className={`font-bold text-lg ${task.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                        {task.title}
                                    </h3>
                                    {task.scheduledAt && (
                                        <div className="flex items-center gap-4 mt-1 text-xs font-medium text-slate-400">
                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                                <Calendar className="w-3 h-3" />
                                                {format(task.scheduledAt, "PPP", { locale: arEG })}
                                            </span>
                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md">
                                                <Clock className="w-3 h-3" />
                                                {format(task.scheduledAt, "p", { locale: arEG })}
                                            </span>
                                            <span className="flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100">
                                                <span className="relative flex h-2 w-2">
                                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                </span>
                                                تذكير تلقائي
                                            </span>
                                    {task.reminderSent && (
                                                <span className="text-green-500 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    تم الإرسال
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1">
                                    {!task.completed && (
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                            onClick={() => {
                                                window.dispatchEvent(new CustomEvent('start-pomodoro-focus', { 
                                                    detail: { taskName: task.title } 
                                                }))
                                            }}
                                            title="ابدأ التركيز (Pomodoro)"
                                        >
                                            <Zap className="w-5 h-5 fill-current" />
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="text-slate-300 hover:text-red-500 hover:bg-red-50"
                                        onClick={() => task.id && handleDelete(task.id)}
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </AnimatePresence>

            {tasks.length === 0 && !loading && (
                <div className="py-12">
                     <CreativeEmptyState 
                        icon={Sparkles}
                        title="وقت الراحة! 😴"
                        description="ما عندك مهام حالياً.. استمتع بوقتك أو أضف مهمة جديدة لتبدأ الإنجاز."
                        action={
                            <Button onClick={() => setIsAddOpen(true)} variant="outline" className="rounded-xl border-primary text-primary hover:bg-primary hover:text-white">
                                <Plus className="w-4 h-4 ml-2" />
                                أضف مهمة الآن
                            </Button>
                        }
                    />
                </div>
            )}
        </div>

      </div>
    </div>
  )
}
