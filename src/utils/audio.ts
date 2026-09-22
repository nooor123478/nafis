// Web Audio API sounds for interactive gamified quizzes

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  try {
    if (!audioCtx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  } catch (e) {
    console.warn('AudioContext not available:', e);
    return null;
  }
}

export function playSuccessSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Arpeggio chime
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.15, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.3);
    });
  } catch (e) {
    // Ignore sound errors
  }
}

export function playErrorSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now); // A3
    osc.frequency.linearRampToValueAtTime(140, now + 0.25);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);
  } catch (e) {
    // Ignore sound errors
  }
}

export function playTimerWarningSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  } catch (e) {
    // Ignore sound errors
  }
}

export function playCelebrationFanfare(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    const notes = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.5, d: 0.4 },
    ];
    let offset = 0;
    notes.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, now + offset);

      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + item.d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + offset);
      osc.stop(now + offset + item.d);
      offset += item.d;
    });
  } catch (e) {
    // Ignore
  }
}

/**
 * Sound effect when a team scores points in live team challenge mode
 * Crisp, ascending chime with harmonic shimmer
 */
export function playTeamPointSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Fast cheerful three-tone chime: D5 (587.33), G5 (783.99), B5 (987.77)
    const tones = [
      { f: 587.33, t: 0, d: 0.12 },
      { f: 783.99, t: 0.07, d: 0.14 },
      { f: 987.77, t: 0.14, d: 0.28 },
    ];

    tones.forEach(({ f, t, d }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now + t);

      // Warm attack and soft exponential release
      gain.gain.setValueAtTime(0.001, now + t);
      gain.gain.linearRampToValueAtTime(0.18, now + t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + t);
      osc.stop(now + t + d);
    });

    // Add a sparkle overtone
    const sparkleOsc = ctx.createOscillator();
    const sparkleGain = ctx.createGain();
    sparkleOsc.type = 'triangle';
    sparkleOsc.frequency.setValueAtTime(1174.66, now + 0.14); // D6
    sparkleGain.gain.setValueAtTime(0.08, now + 0.14);
    sparkleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    sparkleOsc.connect(sparkleGain);
    sparkleGain.connect(ctx.destination);

    sparkleOsc.start(now + 0.14);
    sparkleOsc.stop(now + 0.35);
  } catch (e) {
    // Ignore sound errors
  }
}

/**
 * Sound effect when a team overtakes another and seizes 1st place in team challenge mode!
 * Triumphant brass-style ascending fanfare that rallies the whole classroom!
 */
export function playTeamLeadChangeSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Fanfare pattern: G4 -> C5 -> E5 -> G5 -> High C6 with brassy punch
    const fanfareNotes = [
      { f: 392.00, start: 0.00, dur: 0.11, vol: 0.20 }, // G4
      { f: 523.25, start: 0.10, dur: 0.11, vol: 0.22 }, // C5
      { f: 659.25, start: 0.20, dur: 0.11, vol: 0.24 }, // E5
      { f: 783.99, start: 0.30, dur: 0.16, vol: 0.26 }, // G5
      { f: 1046.50, start: 0.44, dur: 0.55, vol: 0.30 }, // High C6 triumphant hold
    ];

    fanfareNotes.forEach((note) => {
      // Primary brass-like wave (triangle)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, now + note.start);

      gain.gain.setValueAtTime(0.01, now + note.start);
      gain.gain.linearRampToValueAtTime(note.vol, now + note.start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + note.start);
      osc.stop(now + note.start + note.dur);

      // Sub-harmonic warm tone (sine) for extra acoustic fullness on final chord
      if (note.dur > 0.2) {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(note.f / 2, now + note.start);

        subGain.gain.setValueAtTime(0.12, now + note.start);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + note.start + note.dur);

        subOsc.connect(subGain);
        subGain.connect(ctx.destination);

        subOsc.start(now + note.start);
        subOsc.stop(now + note.start + note.dur);
      }
    });
  } catch (e) {
    // Ignore sound errors
  }
}

