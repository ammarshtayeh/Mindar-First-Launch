"use client"
import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, File, X, Loader2, CheckCircle, ArrowRight, ShieldCheck, Zap, Globe, XCircle, Target } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MotivationalBanner } from "@/components/motivational-banner"
import { useI18n } from "@/lib/i18n"

export default function UploadPage() {
    const { t, language } = useI18n()
    const [files, setFiles] = useState<File[]>([])
    const [isDragging, setIsDragging] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [currentFileIndex, setCurrentFileIndex] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [selectedTypes, setSelectedTypes] = useState<string[]>(['multiple-choice', 'true-false', 'fill-in-the-blanks', 'explanation'])
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium')
    const [numQuestions, setNumQuestions] = useState(20)

    const toggleType = (type: string) => {
        setSelectedTypes(prev => 
            prev.includes(type) 
            ? (prev.length > 1 ? prev.filter(t => t !== type) : prev) 
            : [...prev, type]
        )
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => setIsDragging(false)

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            validateAndAddFiles(Array.from(e.dataTransfer.files))
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            validateAndAddFiles(Array.from(e.target.files))
        }
    }

    const validateAndAddFiles = (newFiles: File[]) => {
        // No strict size limit for client-side functionality, but let's warn for crazy sizes
        const MAX_SIZE = 150 * 1024 * 1024; // 150MB warning
        const validFiles: File[] = []
        let hasError = false

        newFiles.forEach(file => {
             // We can accept larger files comfortably now
            if (file.size > MAX_SIZE) {
                hasError = true
            } else {
                validFiles.push(file)
            }
        })

        if (hasError) {
             // Gentle warning
             console.warn("Some files are very large, browser may lag.");
        }
        
        setError(null)
        setFiles(prev => [...prev, ...validFiles])
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    // --- CLIENT SIDE PARSING LOGIC ---

    const readPdfText = async (file: File): Promise<string> => {
        // Dynamic import to avoid "DOMMatrix is not defined" error during SSR
        const pdfjs = await import('pdfjs-dist');
        // Set worker source dynamically
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
             pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        
        // Limit pages to avoid browser crash on massive books (optional, maybe 100 pages?)
        // For now, let's try reading all but with a safety check or batching
        // Reading page by page
        for (let i = 1; i <= pdf.numPages; i++) {
            try {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += `\n--- Page ${i} ---\n${pageText}`;
            } catch (err) {
                console.warn(`Skipping page ${i} due to error`, err);
            }
        }
        return fullText;
    }

    const handleGenerate = async () => {
        if (files.length === 0) return
        setIsProcessing(true)
        setError(null)
        
        let combinedText = ""
        const failedFiles: string[] = []
        
        try {
            for (let i = 0; i < files.length; i++) {
                setCurrentFileIndex(i + 1)
                const file = files[i]
                let text = ""

                try {
                    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
                        // Client-Side PDF Parse
                        text = await readPdfText(file);
                        if (!text.trim()) {
                             throw new Error("Scanned PDF or empty (OCR not enabled client-side yet).");
                        }
                    } else {
                        // Fallback to Server API for DOCX/PPTX (or implement client-side libraries for them later)
                        // For now, we still use the server API for non-PDFs as they are usually smaller
                        const formData = new FormData()
                        formData.append("file", file)
                        const parseRes = await fetch("/api/parse", { method: "POST", body: formData })
                        if (!parseRes.ok) throw new Error("Server parse failed");
                        const resJson = await parseRes.json()
                        text = resJson.text;
                    }

                    combinedText += `\n\n--- Source: ${file.name} ---\n\n${text}`
                } catch (err: any) {
                    console.error(`Failed to parse ${file.name}:`, err);
                    failedFiles.push(`${file.name} (${err.message})`);
                }
            }

            if (!combinedText.trim()) {
                const errorMsg = failedFiles.length > 0 
                    ? (language === 'ar' ? `فشلنا في قراءة الملفات:\n${failedFiles.join('\n')}` : `Failed to read files:\n${failedFiles.join('\n')}`)
                    : "No text content found.";
                throw new Error(errorMsg)
            }

            const genRes = await fetch("/api/generate", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: combinedText,
                    types: selectedTypes,
                    difficulty,
                    numQuestions
                })
            })

            if (!genRes.ok) {
                const err = await genRes.json()
                throw new Error(err.error || "Failed to generate quiz")
            }

            const quizData = await genRes.json()
            
            if (failedFiles.length > 0) {
                 quizData.metadata = { ...quizData.metadata, uploadWarnings: failedFiles };
            }

            localStorage.setItem("currentQuiz", JSON.stringify(quizData))
            router.push("/hub")

        } catch (error: any) {
            console.error(error)
            setError(error.message || "Something went wrong, please try again.")
        } finally {
            setIsProcessing(false)
            setCurrentFileIndex(0)
        }
    }

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-6 pt-32 relative overflow-hidden">
             {/* Dynamic Background Elements */}
             <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none calm-pulse" />
             <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
             
             <div className="fixed top-24 left-0 right-0 z-40 px-6">
                 <MotivationalBanner context="upload" autoRotate={false} />
             </div>
            
            <div className="z-10 w-full max-w-4xl mt-20">
               <Link href="/" className="inline-flex items-center text-primary/60 hover:text-primary mb-6 transition-all group">
                   <ArrowRight className={`w-5 h-5 ${language === 'en' ? 'rotate-180 mr-2' : 'ml-2'} group-hover:-translate-x-1 transition-transform`} /> 
                   {t('common.back')}
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="border-primary/20 border-2 bg-card/90 backdrop-blur-3xl shadow-2xl rounded-[3.5rem] overflow-hidden">
                        <CardContent className="p-8 sm:p-12">
                            <div className={`${language === 'ar' ? 'text-right' : 'text-left'} mb-10`}>
                                <motion.h1 className="text-4xl font-black text-foreground mb-2">
                                    {t('upload.title')}
                                </motion.h1>
                                <p className="text-muted-foreground font-bold">
                                    {t('upload.subtitle')}
                                </p>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="mb-8"
                                    >
                                        <div className="bg-red-500/10 border-2 border-red-500/20 p-6 rounded-[2rem] flex items-center gap-6 shadow-xl backdrop-blur-xl">
                                            <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-white shrink-0">
                                                <XCircle className="w-8 h-8" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="text-foreground font-black text-lg">{t('upload.errorTitle')}</h4>
                                                <p className="text-red-500 font-bold text-sm leading-tight">{error}</p>
                                            </div>
                                            <button onClick={() => setError(null)} className="p-2 hover:bg-black/5 rounded-lg transition-colors">
                                                <X className="w-5 h-5 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
 
                            <div className="grid grid-cols-1 md:grid-cols-[1fr,0.8fr] gap-10 items-stretch">
                                {/* Left Side: Dropzone */}
                                <div className="space-y-4">
                                    <motion.div 
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`
                                            border-2 border-dashed rounded-[3rem] p-10 flex flex-col items-center justify-center cursor-pointer transition-all duration-500 relative overflow-hidden group min-h-[300px]
                                            ${isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50 hover:bg-primary/5"}
                                        `}
                                    >
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            className="hidden" 
                                            multiple 
                                            accept=".pdf,.pptx,.docx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                            onChange={handleFileSelect} 
                                        />
                                        
                                        <div className="flex flex-col items-center text-center">
                                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform shadow-inner">
                                                <Upload className="w-10 h-10" />
                                            </div>
                                            <p className="text-2xl font-black text-foreground mb-2">{t('upload.dropzone')}</p>
                                            <p className="text-sm text-muted-foreground font-bold mb-6 italic">{t('upload.supported')}</p>
                                            <div className="flex gap-2 justify-center flex-wrap">
                                                {['PDF', 'PPTX', 'DOCX'].map(type => (
                                                    <span key={type} className="px-4 py-1.5 bg-secondary rounded-xl text-[10px] font-black tracking-widest border border-border">
                                                        {type}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Uploaded Files List */}
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar p-1">
                                        <AnimatePresence>
                                            {files.map((f, idx) => (
                                                <motion.div
                                                    key={`${f.name}-${idx}`}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border group hover:border-primary/30 transition-colors"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                        <File className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold truncate">{f.name}</p>
                                                        <p className="text-[10px] text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                                        className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-colors text-muted-foreground"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                        {files.length > 0 && (
                                            <div className="flex justify-end">
                                                <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:underline font-bold px-2">
                                                    {language === 'ar' ? 'حذف الكل' : 'Clear All'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Settings */}
                                <div className="space-y-8 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-foreground font-black text-xl mb-4 flex items-center gap-2">
                                            <Target className="w-5 h-5 text-primary" />
                                            {t('upload.settings')}
                                        </h3>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { id: 'multiple-choice', label: language === 'ar' ? 'اختيار من متعدد' : 'Multiple Choice' },
                                                { id: 'true-false', label: language === 'ar' ? 'صح أو خطأ' : 'True / False' },
                                                { id: 'fill-in-the-blanks', label: language === 'ar' ? 'أكمل الفراغ' : 'Fill in the Blanks' },
                                                { id: 'explanation', label: language === 'ar' ? 'شرح / سؤال مقالي' : 'Explanation / Essay' }
                                            ].map((type) => {
                                                 const isSelected = selectedTypes.includes(type.id);
                                                 return (
                                                     <button
                                                         key={type.id}
                                                         onClick={() => toggleType(type.id)}
                                                         className={`p-4 rounded-2xl border-2 text-left transition-all duration-300 ${isSelected ? 'bg-primary/10 border-primary text-primary' : 'bg-card/50 border-border opacity-50'}`}
                                                     >
                                                         <span className="font-black text-sm">{type.label}</span>
                                                     </button>
                                                 );
                                             })}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-foreground font-black text-xl mb-4 flex items-center gap-2">
                                            <Target className="w-5 h-5 text-primary" />
                                            {t('upload.difficulty')}
                                        </h3>
                                        <div className="grid grid-cols-3 gap-2">
                                            {(['easy', 'medium', 'hard'] as const).map((level) => (
                                                <button
                                                    key={level}
                                                    onClick={() => setDifficulty(level)}
                                                    className={`p-3 rounded-xl border-2 font-black text-xs capitalize transition-all duration-300 ${difficulty === level ? 'bg-primary text-primary-foreground border-primary' : 'bg-card/50 border-border'}`}
                                                >
                                                    {level}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-foreground font-black text-xl mb-2 flex items-center gap-2">
                                            <Target className="w-5 h-5 text-primary" />
                                            {t('upload.questionsCount')}: {numQuestions}
                                        </h3>
                                        <input
                                            type="range" min="10" max="50" step="5"
                                            value={numQuestions}
                                            onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                                            className="w-full h-2 bg-secondary rounded-full appearance-none cursor-pointer accent-primary"
                                        />
                                    </div>
                                </div>
                            </div>
 
                            <div className="mt-12">
                                <Button 
                                    onClick={handleGenerate} 
                                    disabled={files.length === 0 || isProcessing}
                                    className={`w-full h-20 text-2xl font-black rounded-3xl transition-all shadow-xl ${files.length === 0 ? 'opacity-50 grayscale' : 'bg-primary text-primary-foreground hover:scale-[1.02]'}`}
                                >
                                    {isProcessing ? (
                                        <div className="flex items-center gap-4">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <div className="flex flex-col items-start leading-none">
                                                <span>{t('upload.generating')}</span>
                                                <span className="text-xs opacity-70 mt-1">
                                                    {language === 'ar' 
                                                        ? `جاري قراءة الملف (محلياً) ${currentFileIndex} من ${files.length}...` 
                                                        : `Reading file locally ${currentFileIndex} of ${files.length}...`}
                                                </span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {t('upload.generate')} ({files.length})
                                            <ArrowRight className={`w-6 h-6 ${language === 'en' ? 'ml-3' : 'mr-3 rotate-180'}`} />
                                        </>
                                    )}
                                </Button>
                                <p className="text-center text-muted-foreground/60 mt-8 text-xs font-bold tracking-widest uppercase italic">
                                    {t('upload.footerNote')}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </main>
    )
}
