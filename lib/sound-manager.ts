"use client";

class SoundManager {
  private static instance: SoundManager;
  private sounds: Record<string, HTMLAudioElement> = {};
  private enabled: boolean = true;

  private constructor() {
    if (typeof window !== "undefined") {
      const soundFiles = {
        click: "/sounds/click.mp3",
        success: "/sounds/success.mp3",
        error: "/sounds/error.mp3",
        popup: "/sounds/popup.mp3",
      };

      Object.entries(soundFiles).forEach(([name, path]) => {
        const audio = new Audio(path);
        audio.volume = 0.2;
        audio.addEventListener("error", () => {
          // Silently handle 404s
          delete this.sounds[name];
        });
        this.sounds[name] = audio;
      });
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public play(soundName: keyof typeof this.sounds) {
    if (!this.enabled || !this.sounds[soundName]) return;

    // Create a clone to allow rapid overlapping plays
    const sound = this.sounds[soundName].cloneNode() as HTMLAudioElement;
    sound.volume = 0.2;
    sound.play().catch((e) => console.warn("Sound play blocked:", e));
  }
}

export const soundManager = SoundManager.getInstance();
