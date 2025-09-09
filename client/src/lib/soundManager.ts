interface SoundConfig {
  [key: string]: {
    frequency: number;
    duration: number;
    type: 'sine' | 'square' | 'sawtooth' | 'triangle';
    volume?: number;
  };
}

class SoundManager {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.3;

  private sounds: SoundConfig = {
    // UI Sounds
    click: { frequency: 800, duration: 100, type: 'sine', volume: 0.2 },
    iconClick: { frequency: 900, duration: 80, type: 'triangle', volume: 0.18 },
    buttonClick: { frequency: 1200, duration: 60, type: 'square', volume: 0.15 },
    hover: { frequency: 600, duration: 50, type: 'sine', volume: 0.1 },
    open: { frequency: 440, duration: 200, type: 'sine', volume: 0.25 },
    close: { frequency: 330, duration: 150, type: 'sine', volume: 0.2 },
    minimize: { frequency: 880, duration: 100, type: 'triangle', volume: 0.15 },
    maximize: { frequency: 1100, duration: 150, type: 'triangle', volume: 0.2 },
    
    // System Sounds
    startup: { frequency: 523, duration: 500, type: 'sine', volume: 0.3 },
    shutdown: { frequency: 220, duration: 800, type: 'sine', volume: 0.4 },
    login: { frequency: 659, duration: 400, type: 'sine', volume: 0.35 },
    welcome: { frequency: 784, duration: 600, type: 'triangle', volume: 0.3 },
    logout: { frequency: 392, duration: 400, type: 'sine', volume: 0.3 },
    
    // Notification Sounds
    achievement: { frequency: 1000, duration: 300, type: 'square', volume: 0.3 },
    error: { frequency: 150, duration: 200, type: 'sawtooth', volume: 0.25 },
    success: { frequency: 784, duration: 200, type: 'sine', volume: 0.25 },
    warning: { frequency: 523, duration: 250, type: 'triangle', volume: 0.2 },
    
    // App Sounds
    terminal: { frequency: 350, duration: 80, type: 'square', volume: 0.15 },
    typing: { frequency: 400, duration: 30, type: 'square', volume: 0.1 },
    keypress: { frequency: 450, duration: 25, type: 'triangle', volume: 0.08 },
    backspace: { frequency: 300, duration: 40, type: 'square', volume: 0.12 },
    folder: { frequency: 500, duration: 120, type: 'sine', volume: 0.2 },
    delete: { frequency: 200, duration: 180, type: 'sawtooth', volume: 0.2 },
    
    // Game Sounds
    powerup: { frequency: 1200, duration: 250, type: 'square', volume: 0.3 },
    coin: { frequency: 1047, duration: 150, type: 'sine', volume: 0.25 },
    jump: { frequency: 659, duration: 100, type: 'triangle', volume: 0.2 },
    
    // Installation Sounds
    install: { frequency: 740, duration: 200, type: 'sine', volume: 0.25 },
    uninstall: { frequency: 370, duration: 250, type: 'triangle', volume: 0.2 },
    
    // Console Sounds
    beep: { frequency: 1000, duration: 100, type: 'square', volume: 0.2 },
    console: { frequency: 300, duration: 60, type: 'square', volume: 0.15 }
  };

  constructor() {
    this.initAudioContext();
    this.loadSettings();
  }

  private initAudioContext() {
    try {
      if (typeof window !== 'undefined' && this.enabled) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioContext = new AudioContextClass();
          
          // Handle autoplay policy restrictions
          if (this.audioContext.state === 'suspended') {
            const resumeContext = () => {
              if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().catch(() => {
                  console.warn('Audio context resume failed');
                });
              }
            };
            
            // Try to resume on first user interaction
            const events = ['click', 'keydown', 'touchstart'];
            events.forEach(event => {
              document.addEventListener(event, resumeContext, { once: true });
            });
          }
        } else {
          throw new Error('AudioContext not available');
        }
      }
    } catch (e) {
      console.warn('Web Audio API initialization failed:', e);
      this.enabled = false;
      this.audioContext = null;
    }
  }

  private loadSettings() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedEnabled = localStorage.getItem('webos-sound-enabled');
        const savedVolume = localStorage.getItem('webos-sound-volume');
        
        this.enabled = savedEnabled !== 'false';
        this.volume = savedVolume ? parseFloat(savedVolume) : 0.3;
      }
    } catch (e) {
      console.warn('Could not load sound settings from localStorage');
      this.enabled = true;
      this.volume = 0.3;
    }
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('webos-sound-enabled', enabled.toString());
      }
    } catch (e) {
      console.warn('Could not save sound enabled setting');
    }
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('webos-sound-volume', this.volume.toString());
      }
    } catch (e) {
      console.warn('Could not save sound volume setting');
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public getVolume(): number {
    return this.volume;
  }

  public play(soundName: string, pitch: number = 1) {
    if (!this.enabled || !this.audioContext || !soundName || typeof soundName !== 'string' || !this.sounds[soundName]) {
      return;
    }

    try {
      // Ensure audio context is running
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {
          console.warn('Failed to resume audio context');
          return;
        });
      }

      const sound = this.sounds[soundName];
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      // Connect nodes
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set oscillator properties
      const frequency = Math.max(20, Math.min(20000, sound.frequency * pitch));
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
      oscillator.type = sound.type;

      // Set volume with smooth fade out
      const volume = Math.max(0, Math.min(1, (sound.volume || 0.3) * this.volume));
      gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime);
      
      const duration = Math.max(10, sound.duration) / 1000;
      const fadeOutTime = Math.min(duration * 0.8, duration - 0.01);
      
      gainNode.gain.exponentialRampToValueAtTime(
        Math.max(0.001, volume * 0.001), 
        this.audioContext.currentTime + fadeOutTime
      );

      // Start and stop oscillator with proper timing
      const startTime = this.audioContext.currentTime;
      const stopTime = startTime + duration;
      
      oscillator.start(startTime);
      oscillator.stop(stopTime);
      
      // Clean up oscillator after it finishes
      oscillator.onended = () => {
        try {
          oscillator.disconnect();
          gainNode.disconnect();
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
      };
      
    } catch (e) {
      console.warn('Sound playback failed for', soundName, ':', e);
    }
  }

  public playSequence(soundNames: string[] | undefined, interval: number = 200) {
    if (!this.enabled || !soundNames || !Array.isArray(soundNames) || soundNames.length === 0) {
      return;
    }
    
    soundNames.forEach((soundName, index) => {
      if (soundName && typeof soundName === 'string' && this.sounds[soundName]) {
        setTimeout(() => this.play(soundName), Math.max(0, index * interval));
      }
    });
  }

  public playStartupSound() {
    this.playSequence(['startup', 'beep'], 300);
  }

  public playShutdownSound() {
    this.playSequence(['shutdown', 'beep'], 500);
  }

  public playAchievementSound() {
    this.playSequence(['achievement', 'powerup'], 150);
  }

  public playTypingSound() {
    // Random pitch variation for more realistic typing
    const pitch = 0.9 + Math.random() * 0.2;
    this.play('typing', pitch);
  }

  public playLoginSequence() {
    // Windows XP-style login sound sequence
    this.playSequence(['login', 'welcome'], 800);
  }

  public playConsoleSequence() {
    // Play a sequence for console operations
    const sequence = ['console', 'beep', 'console'];
    this.playSequence(sequence, 100);
  }

  public initGlobalKeyboardSounds() {
    try {
      if (typeof document !== 'undefined') {
        document.addEventListener('keydown', (event) => {
          try {
            if (!this.isEnabled() || !event || !event.target) return;
            
            // Only play sounds for text input elements
            const target = event.target as HTMLElement;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
              if (event.key === 'Backspace' || event.key === 'Delete') {
                this.play('backspace');
              } else if (event.key && event.key.length === 1) { // Regular character keys
                this.play('keypress', Math.random() * 0.3 + 0.8); // Slight pitch variation
              }
            }
          } catch (e) {
            // Silently ignore keyboard sound errors
          }
        });
      }
    } catch (e) {
      console.warn('Failed to initialize keyboard sounds:', e);
    }
  }
}

// Create singleton instance
export const soundManager = new SoundManager();

// Initialize global keyboard sounds safely
try {
  soundManager.initGlobalKeyboardSounds();
} catch (e) {
  console.warn('Failed to initialize global keyboard sounds:', e);
}

// Utility function for components with error handling
export const playSound = (soundName: string, pitch?: number) => {
  try {
    if (soundName && typeof soundName === 'string') {
      soundManager.play(soundName, pitch);
    }
  } catch (e) {
    console.warn('Failed to play sound:', soundName, e);
  }
};

// Common sound combinations with error handling
export const playSounds = {
  click: () => { try { soundManager.play('click'); } catch (e) {} },
  iconClick: () => { try { soundManager.play('iconClick'); } catch (e) {} },
  buttonClick: () => { try { soundManager.play('buttonClick'); } catch (e) {} },
  hover: () => { try { soundManager.play('hover'); } catch (e) {} },
  windowOpen: () => { try { soundManager.play('open'); } catch (e) {} },
  windowClose: () => { try { soundManager.play('close'); } catch (e) {} },
  windowMinimize: () => { try { soundManager.play('minimize'); } catch (e) {} },
  windowMaximize: () => { try { soundManager.play('maximize'); } catch (e) {} },
  buttonHover: () => { try { soundManager.play('hover'); } catch (e) {} },
  appLaunch: () => { try { soundManager.play('open'); } catch (e) {} },
  folderOpen: () => { try { soundManager.play('folder'); } catch (e) {} },
  fileDelete: () => { try { soundManager.play('delete'); } catch (e) {} },
  notification: () => { try { soundManager.play('success'); } catch (e) {} },
  error: () => { try { soundManager.play('error'); } catch (e) {} },
  achievement: () => { try { soundManager.playAchievementSound(); } catch (e) {} },
  startup: () => { try { soundManager.playStartupSound(); } catch (e) {} },
  shutdown: () => { try { soundManager.playShutdownSound(); } catch (e) {} },
  typing: () => { try { soundManager.playTypingSound(); } catch (e) {} },
  console: () => { try { soundManager.playConsoleSequence(); } catch (e) {} },
  install: () => { try { soundManager.play('install'); } catch (e) {} },
  uninstall: () => { try { soundManager.play('uninstall'); } catch (e) {} }
};