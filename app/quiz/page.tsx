"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { CheckCircle, XCircle, ArrowLeft, RotateCcw, Loader2, Award, ChevronRight, ChevronLeft, Book, Mic, MicOff, Volume2, VolumeX } from "lucide-react"
import Link from "next/link"
import { voiceManager } from "@/lib/voice-manager"
import { VocabularyPanel } from "@/components/vocabulary-panel"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useSelector } from "react-redux"
import { RootState } from "@/redux/store"
import { saveQuizResult, logActivity } from "@/lib/services/dbService"
import { auth } from "@/lib/firebase"

interface Question {
    id: number;
    type: 'multiple-choice' | 'true-false' | 'fill-in-the-blanks' | 'explanation';
    question: string;
    options?: string[];
    answer: string;
    explanation?: string;
}

interface Vocabulary {
    word: string;
    definition: string;
    context: string;
}

interface QuizData {
    title: string;
    questions: Question[];
    vocabulary?: Vocabulary[];
}

export default function QuizPage() {
    const { t, language } = useI18n()
    const { currentQuiz } = useSelector((state: RootState) => state.quiz)
    const [quiz, setQuiz] = useState<QuizData | null>(null)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<number, { selectedOption?: string, textAnswer?: string, isCorrect?: boolean }>>({})
    const [showResult, setShowResult] = useState(false)
    const [isVocabOpen, setIsVocabOpen] = useState(false)
    const [isListening, setIsListening] = useState(false)
    const [isAutoReadEnabled, setIsAutoReadEnabled] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (currentQuiz) {
            setQuiz(currentQuiz)
            if (!quiz) { // Only speak on first load
                 voiceManager.speakFeedback('welcome')
            }
        } else {
             // Redux not populated yet or empty? Check localstorage as fallback or redirect
             const stored = localStorage.getItem("currentQuiz")
             if (stored) {
                 // Dispatch to Redux to sync? 
                 // For now just set state locally to avoid redirect loop if hydration is slow
                 try {
                     setQuiz(JSON.parse(stored))
                 } catch(e) { router.push("/upload") }
             } else {
                 router.push("/upload")
             }
        }
    }, [currentQuiz, router])
 
    // Auto-read question on change
    useEffect(() => {
        if (quiz && quiz.questions && quiz.questions[currentQuestionIndex] && !showResult && isAutoReadEnabled) {
            const q = quiz.questions[currentQuestionIndex]
            voiceManager.speak(q.question)
        }
    }, [currentQuestionIndex, quiz, showResult, isAutoReadEnabled])

    useEffect(() => {
        if (quiz && showResult && typeof window !== 'undefined') {
            const score = Object.values(answers).filter(a => a.isCorrect).length
            const total = quiz.questions.length
            
            const results = {
              title: quiz.title,
              score,
              total,
              answers,
              questions: quiz.questions,
              timestamp: new Date().toISOString()
            }
            
            // Save to Firebase if user is logged in
            if (auth.currentUser) {
                saveQuizResult({
                    userId: auth.currentUser.uid,
                    quizTitle: quiz.title,
                    score,
                    totalQuestions: total,
                    percentage: (score / total) * 100,
                    quizData: {
                        questionsCount: total,
                        correctAnswers: score
                    }
                }).catch(err => console.error("Failed to save to Firebase:", err));

                logActivity(
                    auth.currentUser.uid, 
                    auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || "Student", 
                    'action_completed_quiz'
                );
            }

            voiceManager.stopSpeak()
            localStorage.setItem('lastQuizResults', JSON.stringify(results))
            router.push('/quiz/results')
        }
    }, [showResult, router, answers, quiz])

    if (!quiz) return (
        <div className="min-h-screen flex flex-col items-center justify-center text-foreground bg-background font-cairo">
            <Loader2 className="animate-spin w-20 h-20 text-primary mb-8 calm-pulse" /> 
            <p className="text-4xl font-black animate-pulse text-primary text-glow">{t('quiz.processing')}</p>
        </div>
    )

    const currentQuestion = quiz.questions[currentQuestionIndex]
    const currentAnswer = answers[currentQuestionIndex]
    const isAnswered = !!currentAnswer
    const progress = ((currentQuestionIndex + (showResult ? 1 : 0)) / quiz.questions.length) * 100

    // Enhanced robust type checking
    const qType = currentQuestion.type?.toLowerCase().trim() || 'multiple-choice';
    const isMC = ['multiple-choice', 'multiple_choice', 'mcq'].includes(qType);
    const isTF = ['true-false', 'true_false', 'boolean'].includes(qType);
    const isFill = ['fill-in-the-blanks', 'fill-in-the-blank', 'fill_in_the_blanks', 'clean_text', 'cloze'].includes(qType);
    const isExplain = ['explanation', 'essay', 'short-answer', 'short_answer', 'open-ended', 'descriptive'].includes(qType);

    const handleOptionSelect = (option: string) => {
        if (isAnswered) return
        
        const isCorrect = option === currentQuestion.answer
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: { selectedOption: option, isCorrect }
        }))
        
        if (isCorrect) {
          voiceManager.speakFeedback('correct')
        } else {
          voiceManager.speakFeedback('wrong')
        }
    }

    const handleTextSubmit = (text: string) => {
        if (isAnswered) return
        if (!text.trim()) return

        let isCorrect = false
        if (isFill) {
            // Normalize: remove extra spaces, quotes, and punctuation for better matching
            const normalize = (s: string) => (s || "").toLowerCase()
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"")
                .replace(/\s{2,}/g," ")
                .trim();
            
            const clientAnswer = normalize(text);
            const serverAnswer = normalize(currentQuestion.answer || ""); // Safe fallback if answer is missing
            
            isCorrect = clientAnswer === serverAnswer && serverAnswer.length > 0;
        } else {
            // For descriptive/explanation, we mark it as "evaluated" neutrally
            // Use'null' for isCorrect or just a special flag if we had one. 
            // In our current system, we'll keep it true for progress but the UI will handle it differently.
            isCorrect = true 
        }

        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: { textAnswer: text, isCorrect }
        }))
        
        if (isFill) {
            if (isCorrect) {
              voiceManager.speakFeedback('correct')
            } else {
              voiceManager.speakFeedback('wrong')
            }
        } else {
            voiceManager.speakFeedback('welcome') // neutral or informative
        }
    }

    const handleVoiceAnswer = () => {
        if (isAnswered || isListening) return
        
        voiceManager.stopSpeak()
        setIsListening(true)
        voiceManager.listen((text) => {
            const lowerText = text.toLowerCase().trim()
            console.log("Processing voice input:", lowerText)

            if (isMC || isTF) {
                const options = (currentQuestion.options || (isTF ? (language === 'ar' ? ['صح', 'خطأ'] : ['True', 'False']) : []))
                
                // Define matchers for indices 0-3
                const matchers: Record<number, string[]> = {
                    0: ['first', 'one', 'number one', 'الاولى', 'الأولى', 'الاجابة الاولى', 'الاجابة الأولى', 'رقم واحد', 'أ', 'واحد', 'الأول', 'الاول'],
                    1: ['second', 'two', 'number two', 'الثانية', 'الثانيه', 'الاجابة الثانية', 'رقم اثنين', 'ب', 'اثنين', 'الثاني'],
                    2: ['third', 'three', 'number three', 'الثالثة', 'الثالثه', 'الاجابة الثالثة', 'رقم ثلاثة', 'رقم تلاتة', 'ج', 'تلاتة', 'ثلاثة', 'الثالث'],
                    3: ['fourth', 'four', 'number four', 'الرابعة', 'الرابعه', 'الاجابة الرابعة', 'رقم اربعة', 'د', 'اربعة', 'الرابع']
                }

                let matchedIdx = -1
                
                // Check exact matches or inclusions
                for (const [idxStr, phrases] of Object.entries(matchers)) {
                    const idx = parseInt(idxStr)
                    if (phrases.some(phrase => lowerText.includes(phrase) || lowerText === phrase)) {
                        matchedIdx = idx
                        break
                    }
                }

                if (matchedIdx !== -1 && options[matchedIdx]) {
                    handleOptionSelect(options[matchedIdx])
                    return
                }
                
                // 2. Direct match or partial match (Fallback)
                let matchedOption = options.find(opt => 
                    lowerText.includes(opt.toLowerCase()) || 
                    opt.toLowerCase().includes(lowerText)
                )

                // 3. Fuzzy match for True/False (Common Arabic variations)
                if (!matchedOption && isTF) {
                    if (lowerText.includes('صح') || lowerText.includes('صحيح') || lowerText.includes('true') || lowerText.includes('يس')) {
                        matchedOption = language === 'ar' ? 'صح' : 'True'
                    } else if (lowerText.includes('خطأ') || lowerText.includes('غلط') || lowerText.includes('خاطئ') || lowerText.includes('false') || lowerText.includes('نو')) {
                        matchedOption = language === 'ar' ? 'خطأ' : 'False'
                    }
                }

                if (matchedOption) {
                    handleOptionSelect(matchedOption)
                }
            } else {
                // For text inputs, submit the whole transcript
                handleTextSubmit(text)
            }
        }, () => setIsListening(false))
    }

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1)
        } else {
            setShowResult(true)
            voiceManager.speakFeedback('finish')
        }
    }

    const jumpToQuestion = (index: number) => {
        setCurrentQuestionIndex(index)
    }



    if (showResult) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <main className="min-h-screen pt-40 px-6 pb-20 relative overflow-hidden bg-background font-cairo transition-colors duration-500">
            {/* Background elements */}
            <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none calm-pulse" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Vocabulary Trigger */}
            {quiz.vocabulary && quiz.vocabulary.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsVocabOpen(true)}
                className="fixed bottom-6 right-24 z-50 w-16 h-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center shadow-2xl border-2 border-primary/20"
                title={t('quiz.vocabTitle')}
              >
                <Book className="w-8 h-8" />
              </motion.button>
            )}

            <VocabularyPanel 
              vocabulary={quiz.vocabulary || []}
              isOpen={isVocabOpen}
              onClose={() => setIsVocabOpen(false)}
            />

            <div className="z-10 w-full max-w-5xl mx-auto mt-16">
                <div className="flex justify-between items-center mb-6 px-4">
                    <Link href="/hub">
                        <Button 
                            variant="ghost" 
                            onClick={() => voiceManager.stopSpeak()}
                            className="rounded-2xl font-black gap-2 hover:bg-primary/10 text-primary"
                        >
                            <ArrowLeft className={`w-5 h-5 ${language === 'en' ? 'rotate-180' : ''}`} />
                            {language === 'ar' ? 'العودة للمركز' : 'Return to Hub'}
                        </Button>
                    </Link>
                </div>
                {/* Question Navigation Bubbles */}
                <div className="flex flex-wrap justify-center gap-3 mb-10">
                    {quiz.questions.map((_, idx) => {
                        const status = answers[idx] ? 'answered' : (idx === currentQuestionIndex ? 'current' : 'pending')
                        return (
                            <button
                                key={idx}
                                onClick={() => jumpToQuestion(idx)}
                                className={`
                                    w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all duration-300 transform
                                    ${status === 'current' ? 'bg-primary text-primary-foreground scale-110 shadow-lg ring-4 ring-primary/20' : 
                                      status === 'answered' ? 'bg-green-500/20 text-green-500 border-2 border-green-500/30' : 
                                      'bg-card/50 text-muted-foreground border-2 border-border hover:border-primary/50'}
                                `}
                            >
                                {idx + 1}
                            </button>
                        )
                    })}
                </div>

                <Card className="bg-card/50 backdrop-blur-xl border-border/50 shadow-2xl rounded-[3rem] overflow-hidden">
                    <CardHeader className="p-6 sm:p-10 md:p-16 pb-6 md:pb-8">
                        <div className="flex justify-between items-center mb-10">
                            <span className="bg-primary/10 text-primary px-6 py-2 rounded-2xl text-lg font-black border border-primary/20 flex items-center gap-2">
                                <span className="opacity-60">{t('common.question')}</span>
                                <span>{currentQuestionIndex + 1} / {quiz.questions.length}</span>
                            </span>
 
                            <div className="flex items-center gap-3">
                                {/* Auto-read Toggle */}
                                <div className="flex flex-col items-center gap-1">
                                    <span className="text-[10px] font-black uppercase opacity-60 text-center leading-none">
                                        {language === 'ar' ? 'القراءة التلقائية' : 'Auto Read'}
                                    </span>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setIsAutoReadEnabled(!isAutoReadEnabled)}
                                        disabled={!voiceManager.isMasterEnabled()}
                                        className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all",
                                            isAutoReadEnabled && voiceManager.isMasterEnabled() 
                                                ? "bg-primary/20 border-primary text-primary" 
                                                : "bg-muted border-border text-muted-foreground",
                                            !voiceManager.isMasterEnabled() && "opacity-30 cursor-not-allowed"
                                        )}
                                        title={isAutoReadEnabled ? "Disable Auto-read" : "Enable Auto-read"}
                                    >
                                        {isAutoReadEnabled && voiceManager.isMasterEnabled() ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
                                    </motion.button>
                                </div>

                                {/* Voice Answer Button */}
                                {!isAnswered && (
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-black uppercase opacity-60 text-center leading-none">
                                            {language === 'ar' ? 'إجابة صوتية' : 'Voice Input'}
                                        </span>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={handleVoiceAnswer}
                                            className={cn(
                                                "w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all border-4",
                                                isListening ? "bg-red-500 text-white animate-pulse border-red-200" : "bg-primary text-primary-foreground border-primary/10"
                                            )}
                                            title={t('quiz.speakAnswer')}
                                        >
                                            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                                        </motion.button>
                                    </div>
                                )}
                            </div>
 
                            <div className="text-primary font-black text-2xl tracking-tighter flex items-center gap-2">
                                <Award className="w-6 h-6" />
                                <span>{t('common.correct')}: {Object.values(answers).filter(a => a.isCorrect).length}</span>
                            </div>
                        </div>
                        
                        <div className="w-full bg-border/20 h-3 rounded-full overflow-hidden mb-8">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary glow-primary"
                            />
                        </div>

                        {/* Question Tracker Dots */}
                        <div className="flex flex-wrap justify-center gap-2 mb-8">
                            {quiz.questions.map((_, idx) => {
                                const isCurrent = idx === currentQuestionIndex
                                const isAnswered = !!answers[idx]
                                const isCorrect = answers[idx]?.isCorrect
                                
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQuestionIndex(idx)}
                                        className={`
                                            w-10 h-10 rounded-xl font-black text-sm transition-all duration-300
                                            ${isCurrent ? 'ring-2 ring-primary ring-offset-2 scale-110 bg-primary text-primary-foreground shadow-lg' : 
                                                isAnswered ? (
                                                  quiz.questions[idx].type === 'explanation' || ['explanation', 'essay', 'short-answer'].includes(quiz.questions[idx].type) ? 'bg-primary text-white' :
                                                  (isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white')
                                                ) : 
                                                'bg-secondary/50 text-muted-foreground hover:bg-secondary'}
                                        `}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>

                        <CardTitle className="text-2xl sm:text-3xl md:text-5xl font-black text-foreground leading-[1.3] text-center" dir="auto">
                            {currentQuestion.question}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="p-6 sm:p-10 md:p-16 pt-0">
                        <div className="grid grid-cols-1 gap-5">
                            {(isMC || isTF) && 
                                (currentQuestion.options && currentQuestion.options.length > 0 ? currentQuestion.options : (isTF ? (language === 'ar' ? ['صح', 'خطأ'] : ['True', 'False']) : [])).map((option, idx) => {
                                    const isSelected = currentAnswer?.selectedOption === option
                                    const isCorrect = option === currentQuestion.answer
                                    
                                    let btnClass = "bg-card border-border text-foreground hover:border-primary/50"
                                    if (isAnswered) {
                                        if (isCorrect) btnClass = "bg-green-500/20 border-green-500 text-green-600 shadow-sm"
                                        else if (isSelected) btnClass = "bg-red-500/20 border-red-500 text-red-600 shadow-sm"
                                        else btnClass = "bg-card border-border/30 text-foreground/30 opacity-60"
                                    } else if (isSelected) {
                                        btnClass = "bg-primary/10 border-primary text-primary"
                                    }
 
                                    return (
                                        <motion.button
                                            key={idx}
                                            whileHover={!isAnswered ? { scale: 1.01, x: -5 } : {}}
                                            whileTap={!isAnswered ? { scale: 0.99 } : {}}
                                            onClick={() => handleOptionSelect(option)}
                                            disabled={isAnswered}
                                            className={`
                                                p-4 sm:p-6 rounded-[1.8rem] text-left text-lg sm:text-xl font-bold transition-all duration-300 border-2
                                                ${btnClass}
                                            `}
                                        >
                                            <div className="flex justify-between items-center group">
                                                {isAnswered && isCorrect && <CheckCircle className="w-7 h-7 text-green-500 animate-bounce" />}
                                                {isAnswered && isSelected && !isCorrect && <XCircle className="w-7 h-7 text-red-500 animate-shake" />}
                                                <span className="flex-1 px-4 text-glow-sm">{option}</span>
                                                <div className="flex flex-col items-center">
                                                    <span className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black shadow-xl border-2 transition-all duration-500 ${
                                                        isSelected 
                                                            ? 'bg-primary text-primary-foreground border-white/20 scale-110 rotate-3' 
                                                            : 'bg-primary/10 text-primary border-primary/20 group-hover:bg-primary/20 group-hover:scale-110'
                                                    }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </span>
                                                    <span className="text-[10px] font-black opacity-40 mt-1 uppercase tracking-widest hidden sm:block">
                                                        {language === 'ar' ? (idx === 0 ? 'أ' : idx === 1 ? 'ب' : idx === 2 ? 'ج' : 'د') : String.fromCharCode(65 + idx)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.button>
                                    )
                                })
                            }
 
                            {/* Fill in the Blanks */}
                            {isFill && (
                                <div className="space-y-4">
                                    <input 
                                        type="text"
                                        placeholder={t('quiz.typeAnswer')}
                                        disabled={isAnswered}
                                        defaultValue={currentAnswer?.textAnswer || ''}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleTextSubmit((e.target as HTMLInputElement).value)
                                        }}
                                        className={cn(
                                            "w-full p-8 rounded-[2rem] text-2xl font-black bg-card border-4 transition-all outline-none",
                                            isAnswered 
                                                ? (currentAnswer.isCorrect ? "border-green-500 bg-green-500/10 text-green-600" : "border-red-500 bg-red-500/10 text-red-600")
                                                : "border-border focus:border-primary text-foreground"
                                        )}
                                    />
                                    {!isAnswered && (
                                        <Button 
                                            onClick={() => {
                                                const input = document.querySelector('input') as HTMLInputElement
                                                handleTextSubmit(input.value)
                                            }}
                                            className="w-full h-16 rounded-2xl text-xl font-black"
                                        >
                                            {t('common.submit')}
                                        </Button>
                                    )}
                                </div>
                            )}
 
                            {/* Explanation / Descriptive */}
                            {isExplain && (
                                <div className="space-y-4">
                                    <textarea 
                                        placeholder={t('quiz.typeExplanation')}
                                        disabled={isAnswered}
                                        rows={4}
                                        defaultValue={currentAnswer?.textAnswer || ''}
                                        className={cn(
                                            "w-full p-8 rounded-[2.5rem] text-xl font-bold bg-card border-4 transition-all outline-none resize-none",
                                            isAnswered 
                                                ? "border-primary/50 bg-primary/5 text-foreground/80"
                                                : "border-border focus:border-primary text-foreground"
                                        )}
                                    />
                                    {!isAnswered && (
                                        <Button 
                                            onClick={() => {
                                                const area = document.querySelector('textarea') as HTMLTextAreaElement
                                                handleTextSubmit(area.value)
                                            }}
                                            className="w-full h-16 rounded-2xl text-xl font-black"
                                        >
                                            {t('common.submit')}
                                        </Button>
                                    )}
                                </div>
                            )}

                            {/* Explanation / Model Answer Box */}
                            <AnimatePresence>
                                {isAnswered && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className="mt-10"
                                    >
                                        <div className="p-10 rounded-[2.5rem] bg-primary/5 border-2 border-primary/20 relative shadow-xl">
                                            <div className="absolute top-0 left-8 translate-y-[-50%] bg-primary text-primary-foreground px-6 py-1.5 rounded-full text-base font-black shadow-lg">
                                                {t('quiz.whyTitle')}
                                            </div>
                                            <p className="text-foreground/80 text-xl leading-relaxed font-bold text-center mt-3">
                                                {currentQuestion.explanation || t('quiz.defaultExplanation')}
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </CardContent>

                    <CardFooter className="p-6 sm:p-10 md:p-16 pt-0 flex justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="h-16 px-8 rounded-2xl border-border text-foreground hover:bg-accent flex items-center gap-2"
                        >
                            {language === 'ar' ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                            {t('common.prev')}
                        </Button>

                        {!isAnswered ? (
                            <div className="hidden sm:block text-muted-foreground font-black text-sm italic">
                                {t('quiz.answerToContinue')}
                            </div>
                        ) : (
                            <Button 
                                onClick={handleNext}
                                size="lg"
                                className="h-16 px-12 text-xl font-black rounded-2xl bg-primary text-primary-foreground hover:scale-105 transition-transform shadow-xl flex items-center gap-2"
                            >
                                {currentQuestionIndex === quiz.questions.length - 1 ? t('common.finish') : t('common.next')}
                                {language === 'ar' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </main>
    )
}
