// Sound effects, synthesised with WebAudio so the game needs no audio files
// and plays fully offline. Every sound is a short oscillator blip; the mute
// button toggles the whole engine and is honoured by every player.

/** Create the sound engine. Nothing plays until a user gesture creates audio. */
export function createSoundEngine() {
  let context = null;
  let muted = false;

  function ensureContext() {
    if (context) return context;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    context = new AudioContext();
    return context;
  }

  function tone(frequency, duration, type = 'sine', volume = 0.12, when = 0) {
    if (muted) return;
    const ctx = ensureContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    const start = ctx.currentTime + when;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  return {
    isMuted() { return muted; },
    toggleMute() { muted = !muted; return muted; },
    unlock() { ensureContext(); },
    playClick() { tone(660, 0.07, 'triangle', 0.08); },
    playAdd() { tone(520, 0.09, 'sine', 0.1); tone(780, 0.1, 'sine', 0.08, 0.06); },
    playGrill() { tone(220, 0.12, 'sawtooth', 0.05); tone(330, 0.12, 'sawtooth', 0.05, 0.08); },
    playGrillDone() { tone(880, 0.12, 'sine', 0.1); tone(1174, 0.16, 'sine', 0.09, 0.09); },
    playServe() { tone(523, 0.12, 'triangle', 0.11); tone(659, 0.12, 'triangle', 0.11, 0.09); tone(784, 0.2, 'triangle', 0.11, 0.18); },
    playError() { tone(180, 0.18, 'square', 0.07); tone(140, 0.22, 'square', 0.06, 0.1); },
    playTick() { tone(980, 0.05, 'square', 0.04); },
    playLevelUp() { tone(523, 0.1, 'triangle', 0.1); tone(659, 0.1, 'triangle', 0.1, 0.08); tone(784, 0.1, 'triangle', 0.1, 0.16); tone(1046, 0.22, 'triangle', 0.1, 0.24); },
    playFanfare() { [523, 659, 784, 1046, 784, 1046].forEach((frequency, index) => tone(frequency, 0.18, 'triangle', 0.11, index * 0.12)); },
  };
}
