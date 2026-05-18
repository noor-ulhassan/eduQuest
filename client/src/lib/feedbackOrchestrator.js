/**
 * Feedback Orchestrator
 *
 * Single source of truth for in-game feedback timing. Coordinates:
 *   1. SOUND  — priority + cooldown + global gap (no more "all at once")
 *   2. VISUAL — a serial banner channel + a non-blocking feed channel
 *
 * Lifecycle of every event:
 *   fire   → enqueue with priority / channel
 *   show   → channel handler picks it up when free, dispatches to subscribers
 *   handle → subscribers render UI / play audio
 *   close  → after lifespan elapses, slot frees up and next event drains
 *
 * All in-game audio + headline banners go through this. The local feedback
 * (own answer correct/wrong) is "OWN" priority and preempts everything.
 */

// ─── Priority levels ──────────────────────────────────────
export const PRIORITY = {
  CRITICAL: 100, // game start/end, victory, defeat
  OWN: 80, // user's own answer correct/wrong (must always play)
  HIGH: 60, // 5x/7x streak, lead change, first blood
  MEDIUM: 40, // 3x streak, other player correct, finished, eliminated
  LOW: 20, // rank shuffle, timer ticks
};

// ─── SOUND GATE ────────────────────────────────────────────
const lastPlayedByKey = new Map(); // sound key → last fire ts
let nextAllowedTime = 0; // global "earliest next play" ts
let currentPriority = 0; // priority of the in-flight sound
let priorityReleaseTimer = null;

/**
 * Returns true if the sound is allowed to play right now.
 *
 * @param {string} key — unique sound identifier (e.g. "correct", "rank-change")
 * @param {number} priority — one of PRIORITY.*
 * @param {object} opts
 *   minGapMs        — global minimum gap before next sound of ANY kind
 *   sameKeyCooldown — minimum gap before the SAME sound key can replay
 */
export function gateSound(key, priority = PRIORITY.MEDIUM, opts = {}) {
  const { minGapMs = 220, sameKeyCooldown = 600 } = opts;
  const now = Date.now();

  const last = lastPlayedByKey.get(key) || 0;
  if (now - last < sameKeyCooldown) return false;

  if (now < nextAllowedTime && priority <= currentPriority) return false;

  lastPlayedByKey.set(key, now);
  nextAllowedTime = now + minGapMs;
  currentPriority = priority;
  if (priorityReleaseTimer) clearTimeout(priorityReleaseTimer);
  priorityReleaseTimer = setTimeout(() => {
    currentPriority = 0;
    priorityReleaseTimer = null;
  }, minGapMs);
  return true;
}

/**
 * Force-clear sound state (e.g. when a new game starts or you transition to
 * a new screen).
 */
export function resetSoundGate() {
  lastPlayedByKey.clear();
  nextAllowedTime = 0;
  currentPriority = 0;
  if (priorityReleaseTimer) {
    clearTimeout(priorityReleaseTimer);
    priorityReleaseTimer = null;
  }
}

// ─── BANNER CHANNEL (serial) ───────────────────────────────
// Only ONE banner shows at a time. Newer high-priority events preempt
// lower-priority ones; same-or-lower priority queue up.

const bannerQueue = [];
let bannerActive = null;
let bannerTimer = null;
const bannerSubscribers = new Set();

function emitBanner() {
  bannerSubscribers.forEach((cb) => {
    try {
      cb(bannerActive);
    } catch {
      /* ignore */
    }
  });
}

function drainBanner() {
  if (bannerActive) return;
  const next = bannerQueue.shift();
  if (!next) {
    emitBanner();
    return;
  }
  bannerActive = next;
  emitBanner();
  bannerTimer = setTimeout(() => {
    bannerActive = null;
    bannerTimer = null;
    drainBanner();
  }, next.duration || 1900);
}

/**
 * Push a banner event. If a higher-priority event preempts, the current
 * banner is closed early.
 */
export function fireBanner(event) {
  const evt = {
    id: event.id || `${Date.now()}-${Math.random()}`,
    priority: event.priority ?? PRIORITY.MEDIUM,
    duration: event.duration ?? 1900,
    minGapBeforeNext: event.minGapBeforeNext ?? 250,
    ...event,
  };

  // Preemption: if the new event is strictly higher priority and an active
  // banner is showing, close the active one and let this take over.
  if (bannerActive && evt.priority > bannerActive.priority + 10) {
    if (bannerTimer) clearTimeout(bannerTimer);
    bannerActive = null;
    bannerTimer = null;
    bannerQueue.unshift(evt);
    drainBanner();
    return;
  }

  bannerQueue.push(evt);
  // Sort queue by priority desc (stable for same priority)
  bannerQueue.sort((a, b) => b.priority - a.priority);
  drainBanner();
}

export function subscribeBanner(cb) {
  bannerSubscribers.add(cb);
  cb(bannerActive); // emit current state on subscribe
  return () => bannerSubscribers.delete(cb);
}

export function resetBanner() {
  bannerQueue.length = 0;
  bannerActive = null;
  if (bannerTimer) {
    clearTimeout(bannerTimer);
    bannerTimer = null;
  }
  emitBanner();
}

// ─── FULL ORCHESTRATOR RESET ───────────────────────────────
// Call between games / when leaving the room
export function resetFeedbackOrchestrator() {
  resetSoundGate();
  resetBanner();
}
