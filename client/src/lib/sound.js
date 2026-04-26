// Singleton AudioContext — avoids creating many instances and respects autoplay policy
let _ctx = null;

const getCtx = () => {
  if (!_ctx) {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === "suspended") {
    _ctx.resume().catch(() => {});
  }
  return _ctx;
};

// Play a sequence of synthesized tones.
// notes: [{ freq, dur, delay?, type?, gain? }]
const synth = (notes, masterGain = 0.3) => {
  try {
    const ctx = getCtx();
    notes.forEach(({ freq, dur, delay = 0, type = "sine", gain = masterGain }) => {
      const t = ctx.currentTime + delay;
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.connect(vol);
      vol.connect(ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      vol.gain.setValueAtTime(gain, t);
      vol.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    });
  } catch { /* audio unavailable */ }
};

// File-based fallback for ambient/UI sounds
const play = (src, volume = 0.6) => {
  try {
    const audio = new Audio(src);
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.play().catch(() => {});
  } catch { /* audio unavailable */ }
};

// ─── UI / Lobby ────────────────────────────────────────────
export const playNotificationSound = () => play("/notification.mp3", 0.45);
export const playPlayerJoinedSound = () => play("/pop.mp3", 0.5);

// ─── VS Screen ─────────────────────────────────────────────
export const playVSScreenSound = () =>
  synth(
    [
      { freq: 220, dur: 0.18, type: "sawtooth", gain: 0.12 },
      { freq: 330, dur: 0.18, delay: 0.14, type: "sawtooth", gain: 0.14 },
      { freq: 440, dur: 0.28, delay: 0.28, type: "sawtooth", gain: 0.18 },
    ],
    0.16,
  );

// Per-number tick (3, 2, 1)
export const playCountdownTickSound = () =>
  synth([{ freq: 1100, dur: 0.06, type: "sine", gain: 0.28 }]);

// GO!
export const playCountdownGoSound = () =>
  synth(
    [
      { freq: 523.25, dur: 0.1 },
      { freq: 659.25, dur: 0.1, delay: 0.08 },
      { freq: 783.99, dur: 0.1, delay: 0.16 },
      { freq: 1046.5, dur: 0.32, delay: 0.24 },
    ],
    0.38,
  );

// kept for VSScreen backward compat — same as playCountdownGoSound
export const playStartGameSound = playCountdownGoSound;

// ─── In-Game ───────────────────────────────────────────────
export const playCorrectSound = () =>
  synth(
    [
      { freq: 523.25, dur: 0.1 },
      { freq: 659.25, dur: 0.12, delay: 0.09 },
      { freq: 783.99, dur: 0.22, delay: 0.19 },
    ],
    0.3,
  );

export const playWrongSound = () =>
  synth(
    [
      { freq: 280, dur: 0.09, type: "sawtooth", gain: 0.18 },
      { freq: 210, dur: 0.18, delay: 0.08, type: "sawtooth", gain: 0.14 },
    ],
    0.18,
  );

export const playVictorySound = () =>
  synth(
    [
      { freq: 523.25, dur: 0.12 },
      { freq: 659.25, dur: 0.12, delay: 0.1 },
      { freq: 783.99, dur: 0.12, delay: 0.2 },
      { freq: 1046.5, dur: 0.16, delay: 0.3 },
      { freq: 783.99, dur: 0.16, delay: 0.44 },
      { freq: 1046.5, dur: 0.45, delay: 0.58 },
    ],
    0.38,
  );

// Ticked each second when timeRemaining <= 15
export const playTimerWarningSound = () =>
  synth([{ freq: 880, dur: 0.07, type: "sine", gain: 0.18 }]);

// Subtle rank-change whoosh
export const playRankChangeSound = () =>
  synth(
    [
      { freq: 400, dur: 0.08, type: "sine", gain: 0.1 },
      { freq: 560, dur: 0.1, delay: 0.06, type: "sine", gain: 0.08 },
    ],
    0.1,
  );
