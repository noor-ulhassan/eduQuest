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
    notes.forEach(
      ({ freq, dur, delay = 0, type = "sine", gain = masterGain }) => {
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
      },
    );
  } catch {
    /* audio unavailable */
  }
};

// File-based fallback for ambient/UI sounds
const play = (src, volume = 0.6) => {
  try {
    const audio = new Audio(src);
    audio.volume = Math.min(1, Math.max(0, volume));
    audio.play().catch(() => {});
  } catch {
    /* audio unavailable */
  }
};

// ─── UI / Lobby ────────────────────────────────────────────
export const playNotificationSound = () => play("/notification.mp3", 0.45);
export const playPlayerJoinedSound = () => play("/pop.mp3", 0.5);
export const playCompeteClickSound = () => play("/sounds/sword-cut.mp3", 0.9);

// ─── Match Configuration ────────────────────────────────────
export const playSelectSound = () => play("/sounds/game-select.mp3", 0.55);
export const playModeSelectSound = () => play("/sounds/game-select.mp3", 0.55);
export const playMetricSelectSound = () =>
  play("/sounds/mouse-click.mp3", 0.45);
export const playBeginCompetitionSound = () =>
  play("/sounds/mouse-click.mp3", 0.75);

// ─── Lobby Background Music ────────────────────────────────
let _lobbyMusic = null;

export const playLobbyMusic = () => {
  if (_lobbyMusic) return;
  try {
    _lobbyMusic = new Audio("/sounds/be-more-serious.mp3");
    _lobbyMusic.loop = true;
    _lobbyMusic.volume = 0.75;
    _lobbyMusic.play().catch(() => {});
  } catch {
    /* audio unavailable */
  }
};

export const stopLobbyMusic = () => {
  if (!_lobbyMusic) return;
  _lobbyMusic.pause();
  _lobbyMusic.currentTime = 0;
  _lobbyMusic = null;
};

export const muteLobbyMusic = () => { if (_lobbyMusic) _lobbyMusic.muted = true; };
export const unmuteLobbyMusic = () => { if (_lobbyMusic) _lobbyMusic.muted = false; };

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
// All in-game sounds route through the feedback orchestrator's sound gate
// so they cannot stack/play-over-each-other.
import { gateSound, PRIORITY } from "./feedbackOrchestrator";

export const playCorrectSound = () => {
  if (!gateSound("correct", PRIORITY.OWN, { sameKeyCooldown: 400 })) return;
  play("/sounds/correct.mp3", 0.6);
};

export const playWrongSound = () => {
  if (!gateSound("wrong", PRIORITY.OWN, { sameKeyCooldown: 400 })) return;
  play("/sounds/error.mp3", 0.6);
};

export const playVictorySound = () => {
  if (!gateSound("victory", PRIORITY.CRITICAL, { sameKeyCooldown: 2000 }))
    return;
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
};

// Ticked when timeRemaining <= 15 — gated to fire at most every ~1.5s and
// suppressed entirely while higher-priority sounds (own answer, big moment)
// are in flight.
export const playTimerWarningSound = () => {
  if (
    !gateSound("timer-tick", PRIORITY.LOW, {
      sameKeyCooldown: 1500,
      minGapMs: 300,
    })
  )
    return;
  synth([{ freq: 880, dur: 0.07, type: "sine", gain: 0.18 }]);
};

// Rank-change whoosh — only fire when the LOCAL player's rank changed
// (call sites pass forUser=true). Gated to 1s same-key cooldown so it
// doesn't crash into correct/wrong sounds.
export const playRankChangeSound = () => {
  if (
    !gateSound("rank-change", PRIORITY.LOW, {
      sameKeyCooldown: 1200,
      minGapMs: 250,
    })
  )
    return;
  synth(
    [
      { freq: 440, dur: 0.08, type: "sine", gain: 0.18 },
      { freq: 587.33, dur: 0.08, delay: 0.07, type: "sine", gain: 0.18 },
      { freq: 783.99, dur: 0.12, delay: 0.14, type: "sine", gain: 0.2 },
      { freq: 1046.5, dur: 0.28, delay: 0.22, type: "sine", gain: 0.16 },
    ],
    0.2,
  );
};

// Streak milestone (3x/5x/7x) — short bright chime
export const playStreakSound = (level = 3) => {
  if (!gateSound(`streak-${level}`, PRIORITY.HIGH, { sameKeyCooldown: 800 }))
    return;
  const base = level >= 7 ? 880 : level >= 5 ? 783.99 : 659.25;
  synth(
    [
      { freq: base, dur: 0.08, gain: 0.22 },
      { freq: base * 1.5, dur: 0.14, delay: 0.08, gain: 0.2 },
    ],
    0.22,
  );
};

// Lead-change ping — distinct ascending two-tone
export const playLeadChangeSound = () => {
  if (!gateSound("lead-change", PRIORITY.HIGH, { sameKeyCooldown: 1500 }))
    return;
  synth(
    [
      { freq: 659.25, dur: 0.1, gain: 0.22 },
      { freq: 987.77, dur: 0.18, delay: 0.1, gain: 0.22 },
    ],
    0.2,
  );
};

// ─── Gamification ──────────────────────────────────────────
// Level-up fanfare: bass impact → ascending scale → triumphant chord
export const playLevelUpSound = () => play("/sounds/level-up.mp3", 0.7);

// Badge earned — 4 rarity tiers with escalating drama
export const playBadgeEarnedSound = (rarity = "Common") => {
  const configs = {
    Common: [
      { freq: 659.25, dur: 0.12, gain: 0.22 },
      { freq: 880, dur: 0.22, delay: 0.1, gain: 0.2 },
    ],
    Rare: [
      { freq: 523.25, dur: 0.09, gain: 0.24 },
      { freq: 659.25, dur: 0.09, delay: 0.09, gain: 0.24 },
      { freq: 1046.5, dur: 0.32, delay: 0.18, gain: 0.26 },
    ],
    Epic: [
      { freq: 392, dur: 0.08, gain: 0.22 },
      { freq: 523.25, dur: 0.08, delay: 0.08, gain: 0.24 },
      { freq: 659.25, dur: 0.08, delay: 0.16, gain: 0.26 },
      { freq: 1046.5, dur: 0.45, delay: 0.24, gain: 0.3 },
      { freq: 1318.5, dur: 0.35, delay: 0.3, gain: 0.14 },
    ],
    Legendary: [
      { freq: 82.41, dur: 0.22, type: "sine", gain: 0.38 },
      { freq: 329.63, dur: 0.08, gain: 0.26, delay: 0.07 },
      { freq: 440, dur: 0.08, gain: 0.28, delay: 0.15 },
      { freq: 554.37, dur: 0.08, gain: 0.28, delay: 0.23 },
      { freq: 880, dur: 0.08, gain: 0.3, delay: 0.31 },
      { freq: 1174.7, dur: 0.55, gain: 0.32, delay: 0.39 },
      { freq: 587.33, dur: 0.55, gain: 0.14, delay: 0.56 },
      { freq: 880, dur: 0.55, gain: 0.12, delay: 0.56 },
      { freq: 1174.7, dur: 0.55, gain: 0.18, delay: 0.56 },
    ],
  };
  synth(configs[rarity] ?? configs.Common, 0.28);
};

// XP chime — punchy 3-note ascending arpeggio
export const playXPGainSound = () => play("/sounds/level-up-0", 0.5);
