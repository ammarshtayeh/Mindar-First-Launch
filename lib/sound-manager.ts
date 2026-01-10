"use client"

class SoundManager {
  private static instance: SoundManager
  private sounds: Record<string, HTMLAudioElement> = {}
  private enabled: boolean = true

  private constructor() {
    if (typeof window !== 'undefined') {
      this.sounds = {
        click: new Audio('/sounds/click.mp3'),
        success: new Audio('/sounds/success.mp3'),
        error: new Audio('/sounds/error.mp3'),
        popup: new Audio('/sounds/popup.mp3')
      }
      
      // Warm up sounds
      Object.values(this.sounds).forEach(audio => {
        audio.volume = 0.2
        audio.load()
      })
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  public play(soundName: keyof typeof this.sounds) {
    if (!this.enabled || !this.sounds[soundName]) return
    
    // Create a clone to allow rapid overlapping plays
    const sound = this.sounds[soundName].cloneNode() as HTMLAudioElement
    sound.volume = 0.2
    sound.play().catch(e => console.warn('Sound play blocked:', e))
  }
}

export const soundManager = SoundManager.getInstance()
