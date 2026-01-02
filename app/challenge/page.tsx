"use client"

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Upload, Link as LinkIcon, Copy, Check, Users, ShieldAlert, Sparkles, FileText, X } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function ChallengeCreatePage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedType, setSelectedType] = useState('رأس برأس')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      // Reset input value to allow selecting the same file again if needed
      e.target.value = ''
    }
  }

  const handleGenerate = () => {
    if (!file) return
    setIsGenerating(true)
    setTimeout(() => {
      const roomId = Math.random().toString(36).substring(7)
      const roomLink = `${window.location.origin}/challenge/room-${roomId}`
      
      const quizData = localStorage.getItem("challengeQuiz") || localStorage.getItem("currentQuiz")
      const questionsCount = quizData ? JSON.parse(quizData).questions.length : 15

      localStorage.setItem(`challenge-room-${roomId}`, JSON.stringify({
        title: `تحدي: ${file.name}`,
        creator: "أنا",
        type: selectedType,
        questionsCount: questionsCount,
        participants: selectedType === 'عام للقاعة' ? 42 : 0,
        createdAt: Date.now()
      }))

      setGeneratedLink(roomLink)
      setIsGenerating(false)
    }, 2000)
  }

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const startChallenge = () => {
    if (generatedLink) {
      const url = new URL(generatedLink)
      window.location.href = url.pathname
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-3xl mb-6 shadow-xl text-red-600 dark:text-red-400">
            <Swords className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-red-600 via-orange-500 to-red-600">
            تتحداني؟ (Challenge Me)
          </h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-bold max-w-2xl mx-auto">
            ارفع ملفاتك، اعمل امتحان، وابعث الرابط لصاحبك.. خلينا نشوف مين فيكم "شطّور" ومين "تيرشرش"! 😉
          </p>
        </motion.div>

        {/* Creation Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Step 1: Upload */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              className="hidden" 
              accept=".pdf,.docx,.pptx"
            />
            <Card 
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "h-full border-2 border-dashed bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] overflow-hidden group transition-all cursor-pointer",
                isDragging ? "border-red-500 bg-red-50/50 dark:bg-red-900/20" : "border-slate-200 dark:border-slate-800 hover:border-red-500/50",
                file && "border-green-500/50 bg-green-50/50 dark:bg-green-900/10"
              )}
            >
              <CardContent className="p-8 flex flex-col items-center justify-center h-full min-h-[300px] relative">
                {file && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="absolute top-4 right-4 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full text-red-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all transform group-hover:rotate-12",
                  file 
                    ? "bg-green-500 text-white" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-red-500 group-hover:text-white"
                )}>
                  {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                </div>
                
                <h3 className="text-xl font-black mb-2">
                  {file ? "تم اختيار الملف!" : "1. اختار الملفات"}
                </h3>
                <p className="text-slate-500 text-center font-medium px-4">
                  {file ? file.name : "ارفع PDF أو السلايدات اللي بدك التحدي يكون فيها"}
                </p>
                
                {file && (
                  <div className="mt-4 px-4 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full">
                    جاري التجهيز للتحدي...
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Step 2: Settings */}
          {/* ... (remains same) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-black mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    نوع التحدي
                </h3>
                <div className="flex gap-2">
                    {['رأس برأس', 'عام للقاعة', 'نظام غرف'].map(t => (
                        <button 
                            key={t} 
                            onClick={() => setSelectedType(t)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold border transition-all",
                                selectedType === t 
                                    ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/30" 
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-transparent hover:border-red-500/30"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-[2rem] border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                <h3 className="font-black mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-orange-500" />
                    شروط وقوانين
                </h3>
                <ul className="text-sm space-y-2 text-slate-500 font-medium">
                    <li>• ممنوع تفتح جوجل</li>
                    <li>• وقت محدد لكل سؤال</li>
                    <li>• اللي بخسر بعزم الفريق على شاورما 🥙</li>
                </ul>
            </div>
          </motion.div>
        </div>

        {/* Action Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center"
        >
          {!generatedLink ? (
            <Button
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating || !file}
              className={cn(
                "h-20 px-12 text-2xl font-black rounded-3xl transition-all transform hover:scale-105",
                file 
                  ? "bg-red-600 hover:bg-red-700 shadow-[0_20px_50px_rgba(220,38,38,0.3)]" 
                  : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none"
              )}
            >
              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <Sparkles className="animate-spin w-6 h-6" />
                  <span>جاري تحمية الأجواء...</span>
                </div>
              ) : (
                "إصنع رابط التحدي الآن!"
              )}
            </Button>
          ) : (
            <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-8 bg-green-50 dark:bg-green-900/20 border-2 border-green-500/50 rounded-[3rem] shadow-2xl overflow-hidden relative"
            >
                <h3 className="text-2xl font-black text-green-700 dark:text-green-400 mb-4">التحدي جاهز يا بطل! 🔥</h3>
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-green-200 dark:border-green-800 shadow-inner">
                    <code className="text-slate-600 dark:text-slate-300 font-mono text-xs sm:text-sm break-all flex-1">
                        {generatedLink}
                    </code>
                    <div className="flex gap-2">
                        <Button onClick={copyToClipboard} size="sm" variant="outline" className="rounded-xl border-green-200 gap-2">
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {copied ? 'تم النسخ' : 'نسخ'}
                        </Button>
                        <Button onClick={startChallenge} size="sm" className="bg-green-600 hover:bg-green-700 rounded-xl">
                            ابدأ التحدي
                        </Button>
                    </div>
                </div>
            </motion.div>
          )}
        </motion.div>

      </div>
    </div>
  )
}
