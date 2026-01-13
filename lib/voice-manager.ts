"use client"

// Motivational phrases in Palestinian dialect for voice feedback
const feedbackPhrases = {
  correct: [
    "يا وحش! كفو عليك، الله يفتح عليك كمان وكمان",
    "عاش يا بطل، إجابة قوية، ربي يبارك في علمك",
    "يسعد قلبك، مركز مية مية، الله يزيدك من فضله",
    "والله إنك شاطر، كمل ربي يوفقك ويسدد خطاك",
    "صح الصح، عيني عليك باردة، الله يحميك"
  ],
  wrong: [
    "بسيطة يا بطل، الجاي أحسن، استعن بالله وجرب تاني",
    "ولا يهمك، ركز أكتر في الجاي، الله يوفقك",
    "يالله معلش، تعلم من غلطك وكمل، إنت قدها"
  ],
  finish: [
    "ما شاء الله عليك، خلصت يا بطل، ربي يتمم عليك بالنجاح",
    "كفو والله، كل الاحترام لهالمستوى، الله يكتبلك أعلى الدرجات",
    "خلصت الكويز، روح ارتاح واشرب شاي، الله يوفقك في دراستك"
  ],
  welcome: [
    "أهلاً بك يا بطل، مستعد للتحدي؟ بسم الله نبلش",
    "يا هلا، خلينا نبلش ونشوف الهمة، الله يفتح عليك فتوح العارفين"
  ],
  hub: [
    "أهلاً بك في فضاء عمار، مادتك جاهزة للدعك يا وحش!",
    "منور يا بطل، رادار الزملاء شغال، الهمة عالية اليوم!",
    "يسعد هالطلة، اختار مادتك وخلينا نشوف الإبداع"
  ]
}

class VoiceManager {
  private synth: SpeechSynthesis | null = null
  private voice: SpeechSynthesisVoice | null = null
  private enabled: boolean = true

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis
      this.enabled = localStorage.getItem('voice_master_enabled') !== 'false'
      this.loadVoice()
      
      // Listen for updates from other components or Redux (via custom event)
      window.addEventListener('voice_settings_update', (e: any) => {
        if (e.detail && typeof e.detail.enabled === 'boolean') {
          this.enabled = e.detail.enabled
        }
      })
    }
  }

  isMasterEnabled() {
    return this.enabled
  }

  toggleMasterEnabled() {
    this.enabled = !this.enabled
    localStorage.setItem('voice_master_enabled', String(this.enabled))
    window.dispatchEvent(new CustomEvent('voice_settings_update', { detail: { enabled: this.enabled } }))
    if (!this.enabled && this.synth) {
      this.synth.cancel()
    }
    return this.enabled
  }

  private arVoice: SpeechSynthesisVoice | null = null
  private enVoice: SpeechSynthesisVoice | null = null

  private loadVoice() {
    if (!this.synth) return
    const setVoice = () => {
      const voices = this.synth!.getVoices()
      
      // 1. Arabic Voice Preference (Google -> Microsoft -> Any)
      this.arVoice = voices.find(v => v.lang.includes('ar') && v.name.includes('Google')) 
                  || voices.find(v => v.lang.includes('ar')) 
                  || null;

      // 2. English Voice Preference (Google US -> Microsoft -> Any English)
      this.enVoice = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) 
                  || voices.find(v => v.lang.includes('en-US')) 
                  || voices.find(v => v.lang.includes('en')) 
                  || null;

      // Default fallback
      this.voice = this.arVoice || this.enVoice || voices[0]
    }
    setVoice()
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = setVoice
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  stopSpeak() {
    if (this.synth) this.synth.cancel()
  }

  speak(text: string) {
    if (!this.enabled || !this.synth) return
    
    // Ensure voices are loaded
    if (!this.arVoice && !this.enVoice) {
        this.loadVoice()
    }

    this.synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    
    // Auto-detect language: Check if text has considerable Arabic characters
    const isArabic = /[\u0600-\u06FF]/.test(text);

    if (isArabic && this.arVoice) {
        utterance.voice = this.arVoice
        utterance.lang = 'ar-SA'
        utterance.rate = 1.0
    } else if (this.enVoice) {
        utterance.voice = this.enVoice
        utterance.lang = 'en-US'
        utterance.rate = 1.0
    } else {
        // Fallback
        utterance.lang = isArabic ? 'ar-SA' : 'en-US'
    }
    
    utterance.volume = 1.0
    utterance.pitch = 1.0
    
    this.synth.speak(utterance)
  }

  speakFeedback(type: keyof typeof feedbackPhrases) {
    const phrases = feedbackPhrases[type]
    const randomIndex = Math.floor(Math.random() * phrases.length)
    const selection = phrases[randomIndex]

    if (typeof selection === 'string') {
      this.speak(selection)
    }
  }

  // New: Speech Recognition
  listen(onResult: (text: string) => void, onEnd?: () => void) {
    if (typeof window === 'undefined') return

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'ar-SA' // Set to Arabic for Palestinian dialect recognition
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript
      onResult(text)
    }

    if (onEnd) {
      recognition.onend = onEnd
    }

    recognition.start()
    return recognition
  }
}

export const voiceManager = new VoiceManager()
