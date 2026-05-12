/**
 * GamificationService — the single source of truth for all XP events.
 *
 * Every feature that awards XP calls processEvent() with a named event type
 * and a typed payload. All formulas live here; callers own no XP math.
 *
 * Usage:
 *   import { processEvent, computeXP, XP_EVENTS } from "../services/GamificationService.js";
 *
 *   const user = await processEvent(user, XP_EVENTS.PROBLEM_SOLVED, { baseXP, usedHints, difficulty, solveTimeMs, totalSolved });
 *   const preview = computeXP(XP_EVENTS.PROBLEM_SOLVED, { baseXP, usedHints, difficulty, solveTimeMs });
 */

import { addXP } from "../utils/progression.js";

// ─── Event Type Registry ──────────────────────────────────────────────────────

export const XP_EVENTS = Object.freeze({
  PROBLEM_SOLVED:          "PROBLEM_SOLVED",
  CHAPTER_COMPLETED:       "CHAPTER_COMPLETED",
  LANGUAGE_MASTERED:       "LANGUAGE_MASTERED",
  COMPETITION_FINISHED:    "COMPETITION_FINISHED",
  QUEST_CLAIMED:           "QUEST_CLAIMED",
  WORKSPACE_CHAPTER:       "WORKSPACE_CHAPTER",
});

// ─── XP Formulas ─────────────────────────────────────────────────────────────

/**
 * Resolves an event into { xp, context } using the canonical formula for that
 * event type. Returns { xp: 0, context: {} } for unknown events so callers
 * are always safe to destructure.
 *
 * @param {string} eventType - One of XP_EVENTS
 * @param {Object} payload   - Event-specific data (see cases below)
 * @returns {{ xp: number, context: Object }}
 */
function resolveEvent(eventType, payload) {
  switch (eventType) {

    case XP_EVENTS.PROBLEM_SOLVED: {
      // Payload: { baseXP, usedHints, difficulty, solveTimeMs, totalSolved }
      const { baseXP = 0, usedHints = false, difficulty = "", solveTimeMs = null, totalSolved = 0 } = payload;
      const penaltyFactor = usedHints ? 0.9 : 1.0;
      const isHardOrExpert = ["hard", "expert"].includes(difficulty.toLowerCase());
      const earnedSpeedBonus = isHardOrExpert && solveTimeMs != null && solveTimeMs <= 600_000;
      const speedFactor = earnedSpeedBonus ? 1.25 : 1.0;
      return {
        xp: Math.max(1, Math.round(baseXP * penaltyFactor * speedFactor)),
        context: { totalSolved, earnedSpeedBonus },
      };
    }

    case XP_EVENTS.CHAPTER_COMPLETED:
      // Payload: (none required)
      return {
        xp: 100,
        context: { chapterCompleted: true },
      };

    case XP_EVENTS.LANGUAGE_MASTERED:
      // Payload: { language }
      return {
        xp: 500,
        context: { languageCompleted: true, language: payload.language ?? null },
      };

    case XP_EVENTS.COMPETITION_FINISHED: {
      // Payload: { placement, score, totalPlayers, totalWins }
      // placement is 0-indexed (0 = 1st place)
      const { placement = 2, score = 0, totalPlayers = 2, totalWins = 0 } = payload;
      const sizeMult = Math.max(1, Math.log2(Math.max(totalPlayers, 2)));
      const baseReward = placement === 0 ? 100 : placement === 1 ? 50 : 25;
      return {
        xp: Math.round((baseReward + Math.floor(score / 10)) * sizeMult),
        context: { totalWins },
      };
    }

    case XP_EVENTS.QUEST_CLAIMED:
      // Payload: { xpReward }
      return {
        xp: payload.xpReward ?? 0,
        context: {},
      };

    case XP_EVENTS.WORKSPACE_CHAPTER:
      // Payload: { courseCompleted? } — workspace chapter completion; 300 XP on full course
      return {
        xp: payload.courseCompleted ? 300 : 150,
        context: {
          chapterCompleted: true,
          courseCompleted: payload.courseCompleted ?? false,
        },
      };

    default:
      return { xp: 0, context: {} };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the XP that would be awarded for an event without touching the DB.
 * Useful when the XP amount is needed before (or instead of) granting it,
 * e.g. for progress updates or response messages.
 *
 * @param {string} eventType
 * @param {Object} payload
 * @returns {number}
 */
export const computeXP = (eventType, payload = {}) => resolveEvent(eventType, payload).xp;

/**
 * Awards XP to a user for a named event and saves the result.
 * Delegates to addXP (which handles level recalc, rank update, achievement eval).
 *
 * @param {import("mongoose").Document} user - Mongoose User document
 * @param {string}  eventType - One of XP_EVENTS
 * @param {Object}  payload   - Event-specific data
 * @param {Object}  [options] - Forwarded to addXP ({ autoSave: true })
 * @returns {Promise<import("mongoose").Document>} Updated user document
 */
export const processEvent = async (user, eventType, payload = {}, options = { autoSave: true }) => {
  const { xp, context } = resolveEvent(eventType, payload);
  if (!xp || xp <= 0) return user;
  return addXP(user, xp, context, { source: eventType, ...options });
};
