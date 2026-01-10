// Google Analytics 4 Configuration
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

// Check if GA is enabled
export const isGAEnabled = !!GA_MEASUREMENT_ID && process.env.NODE_ENV === 'production'

// Page view tracking
export const pageview = (url: string) => {
  if (!isGAEnabled) return
  
  window.gtag('config', GA_MEASUREMENT_ID, {
    page_path: url,
  })
}

// Event tracking
interface GAEvent {
  action: string
  category: string
  label?: string
  value?: number
}

export const event = ({ action, category, label, value }: GAEvent) => {
  if (!isGAEnabled) return
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  })
}

// Common events
export const trackQuizStart = (quizTitle: string) => {
  event({
    action: 'quiz_start',
    category: 'Quiz',
    label: quizTitle,
  })
}

export const trackQuizComplete = (quizTitle: string, score: number) => {
  event({
    action: 'quiz_complete',
    category: 'Quiz',
    label: quizTitle,
    value: score,
  })
}

export const trackFileUpload = (fileType: string) => {
  event({
    action: 'file_upload',
    category: 'Upload',
    label: fileType,
  })
}

export const trackFlashcardView = () => {
  event({
    action: 'flashcard_view',
    category: 'Flashcards',
  })
}

export const trackChallengeStart = () => {
  event({
    action: 'challenge_start',
    category: 'Challenge',
  })
}

export const trackSignup = (method: string) => {
  event({
    action: 'sign_up',
    category: 'Auth',
    label: method,
  })
}

export const trackLogin = (method: string) => {
  event({
    action: 'login',
    category: 'Auth',
    label: method,
  })
}

export const trackShare = (platform: string) => {
  event({
    action: 'share',
    category: 'Social',
    label: platform,
  })
}

export const trackPWAInstall = () => {
  event({
    action: 'pwa_install',
    category: 'PWA',
  })
}

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
