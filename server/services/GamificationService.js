import { addXP } from "../utils/progression.js";

export const XP_EVENTS = Object.freeze({
  PROBLEM_SOLVED: "PROBLEM_SOLVED",
  CHAPTER_COMPLETED: "CHAPTER_COMPLETED",
  LANGUAGE_MASTERED: "LANGUAGE_MASTERED",
  COMPETITION_FINISHED: "COMPETITION_FINISHED",
  QUEST_CLAIMED: "QUEST_CLAIMED",
  WORKSPACE_CHAPTER: "WORKSPACE_CHAPTER",
});

/**

 *
 * @param {string} eventType 
 * @param {Object} payload   
 * @returns {{ xp: number, context: Object }}
 */
function resolveEvent(eventType, payload) {
  switch (eventType) {
    case XP_EVENTS.PROBLEM_SOLVED: {
      const {
        baseXP = 0,
        usedHints = false,
        difficulty = "",
        solveTimeMs = null,
        totalSolved = 0,
      } = payload;
      const penaltyFactor = usedHints ? 0.9 : 1.0;
      const isHardOrExpert = ["hard", "expert"].includes(
        difficulty.toLowerCase(),
      );
      const earnedSpeedBonus =
        isHardOrExpert && solveTimeMs != null && solveTimeMs <= 600_000;
      const speedFactor = earnedSpeedBonus ? 1.25 : 1.0;
      return {
        xp: Math.max(1, Math.round(baseXP * penaltyFactor * speedFactor)),
        context: { totalSolved, earnedSpeedBonus },
      };
    }

    case XP_EVENTS.CHAPTER_COMPLETED:
      return {
        xp: 100,
        context: { chapterCompleted: true },
      };

    case XP_EVENTS.LANGUAGE_MASTERED:
      return {
        xp: 500,
        context: {
          languageCompleted: true,
          language: payload.language ?? null,
        },
      };

    case XP_EVENTS.COMPETITION_FINISHED: {
      const {
        placement = 2,
        score = 0,
        totalPlayers = 2,
        totalWins = 0,
      } = payload;
      const sizeMult = Math.max(1, Math.log2(Math.max(totalPlayers, 2)));
      const baseReward = placement === 0 ? 100 : placement === 1 ? 50 : 25;
      return {
        xp: Math.round((baseReward + Math.floor(score / 10)) * sizeMult),
        context: { totalWins },
      };
    }

    case XP_EVENTS.QUEST_CLAIMED:
      return {
        xp: payload.xpReward ?? 0,
        context: {},
      };

    case XP_EVENTS.WORKSPACE_CHAPTER:
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

/**

 *
 * @param {string} eventType
 * @param {Object} payload
 * @returns {number}
 */
export const computeXP = (eventType, payload = {}) =>
  resolveEvent(eventType, payload).xp;

/**

 *
 * @param {import("mongoose").Document} user 
 * @param {string}  eventType 
 * @param {Object}  payload  
 * @param {Object}  [options] 
 * @returns {Promise<import("mongoose").Document>} 
 */
export const processEvent = async (
  user,
  eventType,
  payload = {},
  options = { autoSave: true },
) => {
  const { xp, context } = resolveEvent(eventType, payload);
  if (!xp || xp <= 0) return user;
  return addXP(user, xp, context, { source: eventType, ...options });
};
