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

  private loadVoice() {
    if (!this.synth) return
    const setVoice = () => {
      const voices = this.synth!.getVoices()
      // Try to find a "natural" or "google" Arabic voice for better quality
      this.voice = voices.find(v => 
        (v.lang.includes('ar') && (v.name.includes('Natural') || v.name.includes('Google')))
      ) || voices.find(v => v.lang.includes('ar')) || voices[0]
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
    
    // Safety: ensure a voice is selected if it wasn't earlier
    if (!this.voice) {
      this.loadVoice()
    }

    this.synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    if (this.voice) {
      utterance.voice = this.voice
    }
    utterance.lang = 'ar-SA'
    
    utterance.rate = 0.9
    utterance.pitch = 1.0
    utterance.volume = 1.0
    
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
