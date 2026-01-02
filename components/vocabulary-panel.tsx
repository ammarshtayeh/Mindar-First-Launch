"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Book, MessageSquare } from 'lucide-react'

interface Vocabulary {
  word: string;
  definition: string;
  context: string;
}

interface VocabularyPanelProps {
  vocabulary: Vocabulary[];
  isOpen: boolean;
  onClose: () => void;
}

export function VocabularyPanel({ vocabulary, isOpen, onClose }: VocabularyPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-md bg-card border-l border-border shadow-2xl z-[70] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <Book className="w-8 h-8 text-primary" />
                  <h2 className="text-3xl font-black">قاموس الكلمات</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-3 hover:bg-secondary rounded-2xl transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {vocabulary.length === 0 ? (
                  <div className="text-center p-12 text-muted-foreground italic">
                    مساكين، ما لقيت كلمات صعبة هون!
                  </div>
                ) : (
                  vocabulary.map((v, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="bg-secondary/50 p-6 rounded-[2rem] border border-border/50 group hover:border-primary/30 transition-all shadow-sm"
                    >
                      <h3 className="text-2xl font-black text-primary mb-2 flex items-center gap-2">
                        {v.word}
                        <div className="h-1 flex-1 bg-primary/10 rounded-full" />
                      </h3>
                      <p className="text-foreground/80 font-bold mb-4 leading-relaxed">
                        {v.definition}
                      </p>
                      {v.context && (
                        <div className="bg-background/80 p-4 rounded-xl border border-border/30 text-sm flex gap-3 italic text-muted-foreground">
                          <MessageSquare className="w-4 h-4 flex-shrink-0 mt-1" />
                          <span>"{v.context}"</span>
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
