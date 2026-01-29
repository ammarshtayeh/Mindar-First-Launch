"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Timer,
  Award,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { updateParticipantScore } from "@/lib/services/roomsService";
import { saveQuizResult } from "@/lib/services/dbService";
import { cn } from "@/lib/utils";

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface ChallengeQuizProps {
  roomId: string;
  userId: string;
  quizData: {
    questions: Question[];
  };
  onFinish: (score: number) => void;
}

export const ChallengeQuiz: React.FC<ChallengeQuizProps> = ({
  roomId,
  userId,
  quizData,
  onFinish,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20); // 20 seconds per question
  const [focusMode, setFocusMode] = useState(false);

  const currentQuestion = quizData.questions[currentIndex];

  // Timer logic
  const handleAnswer = async (selectedOption: string | null) => {
    if (answers[currentIndex] !== undefined) return;

    const isCorrect = selectedOption === currentQuestion.answer;
    const newScore = isCorrect ? score + 10 : score;

    setScore(newScore);
    setAnswers((prev) => ({ ...prev, [currentIndex]: isCorrect }));
    setShowExplanation(true);

    // Sync score to Firebase RTDB
    await updateParticipantScore(roomId, userId, newScore);
  };

  useEffect(() => {
    if (showExplanation) return;

    if (timeLeft <= 0) {
      handleAnswer(null); // Time's up
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showExplanation]);

  const nextQuestion = () => {
    if (currentIndex < quizData.questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setShowExplanation(false);
      setTimeLeft(20);
    } else {
      // Save to Firebase History
      saveQuizResult({
        userId,
        quizTitle: `تحدي: ${roomId}`, // Or use a better title if passed
        score,
        totalQuestions: quizData.questions.length,
        percentage: (score / (quizData.questions.length * 10)) * 100, // 10 XP per question
        quizData: {
          mode: "challenge",
          roomId,
        },
      }).catch((err) => console.error("History sync failed:", err));

      onFinish(score);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <AnimatePresence>
        {!focusMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex justify-between items-center px-4 overflow-hidden"
          >
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <Award className="w-5 h-5 text-yellow-500" />
              <span className="font-black text-xl text-slate-900 dark:text-white">
                {score}
              </span>
            </div>

            <div
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-2xl border transition-all",
                timeLeft < 5
                  ? "bg-red-50 border-red-200 text-red-500 animate-pulse"
                  : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white",
              )}
            >
              <Timer className="w-5 h-5" />
              <span className="font-black text-xl">{timeLeft}s</span>
            </div>

            <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-900 dark:text-white">
              <span className="font-black opacity-40 text-xs ml-2 text-slate-500">
                سؤال
              </span>
              <span className="font-black">
                {currentIndex + 1} / {quizData.questions.length}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!focusMode && (
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${((currentIndex + 1) / quizData.questions.length) * 100}%`,
            }}
            className="h-full bg-red-500"
          />
        </div>
      )}

      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setFocusMode(!focusMode)}
          className={cn(
            "rounded-full px-6 transition-all font-black",
            focusMode
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700",
          )}
        >
          {focusMode ? "إلغاء وضع التركيز 🎯" : "وضع التركيز 🎯"}
        </Button>
      </div>

      <Card className="rounded-[3rem] border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden bg-white dark:bg-slate-900 border-2">
        <CardHeader className="p-8 sm:p-12 text-center pb-4">
          <CardTitle className="text-3xl sm:text-5xl font-black leading-tight text-black dark:text-white break-words text-wrap">
            {currentQuestion.question}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-8 sm:p-12 pt-0 space-y-4">
          {currentQuestion.options.map((option, idx) => {
            const isAnswered = answers[currentIndex] !== undefined;
            const isSelected = isAnswered && currentQuestion.answer === option;

            return (
              <Button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleAnswer(option)}
                variant="outline"
                className={cn(
                  "w-full h-auto p-6 rounded-2xl text-xl font-black transition-all justify-between text-right flex-row-reverse items-center gap-4",
                  "text-black dark:text-slate-50 border-slate-200 dark:border-slate-800 border-2",
                  !isAnswered &&
                    "hover:border-red-500 hover:bg-red-50/50 dark:hover:bg-red-900/10 bg-slate-50 dark:bg-slate-800/40",
                  isAnswered &&
                    option === currentQuestion.answer &&
                    "bg-green-500/10 border-green-500 text-green-700 font-black opacity-100",
                  isAnswered &&
                    option !== currentQuestion.answer &&
                    "opacity-20",
                )}
              >
                <span className="flex-1 break-words text-wrap">{option}</span>
                <span className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black flex-shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
              </Button>
            );
          })}

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 p-6 bg-red-50 dark:bg-red-900/10 border-2 border-red-100 dark:border-red-900/20 rounded-3xl"
              >
                <div className="flex items-center gap-3 mb-2">
                  {answers[currentIndex] ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                  <span className="font-black text-lg text-black dark:text-slate-200">
                    {answers[currentIndex]
                      ? "صح يا وحش! 🔥"
                      : "للأسف غلط.. ركز! 🧐"}
                  </span>
                </div>
                <p className="text-slate-900 dark:text-slate-300 font-bold leading-relaxed break-words text-wrap">
                  {currentQuestion.explanation ||
                    "هذا السؤال يعتمد على فهمك للمادة، تأكد من مراجعته جيداً."}
                </p>

                <Button
                  onClick={nextQuestion}
                  className="w-full mt-6 h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg hover:scale-[1.02] transition-transform"
                >
                  السؤال التالي
                  <ChevronRight className="w-6 h-6 mr-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
};
