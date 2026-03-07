/**
 * Centralized Gamification and Progression Service for EduQuest
 * Handles XP, Leveling, Leagues, and Achievements tracking globally.
 */

// Define standard League tiers and their level requirements
export const LEAGUES = [
  { rank: "Bronze", minLevel: 1 },
  { rank: "Silver", minLevel: 5 },
  { rank: "Gold", minLevel: 10 },
  { rank: "Platinum", minLevel: 25 },
  { rank: "Diamond", minLevel: 50 },
  { rank: "Master", minLevel: 75 },
  { rank: "Grandmaster", minLevel: 100 },
];

/**
 * Maps a given level to the appropriate League rank.
 */
export const calculateRank = (level) => {
  let currentRank = "Bronze";
  for (const league of LEAGUES) {
    if (level >= league.minLevel) {
      currentRank = league.rank;
    } else {
      break;
    }
  }
  return currentRank;
};

/**
 * Standard Library of Platform Achievements
 * Each has an internal key, user-facing title, and icon name.
 */
const ACHIEVEMENTS = {
  // Streaks
  streak_3: { title: "3 Day Streak", icon: "Flame" },
  streak_7: { title: "7 Day Streak", icon: "Flame" },
  streak_30: { title: "30 Day Streak", icon: "Flame" },

  // Playground Milestones
  first_solve: { title: "First Blood", icon: "Zap" },
  solve_10: { title: "Coder", icon: "Zap" },
  solve_50: { title: "Problem Solver", icon: "Zap" },

  // Competition Milestones
  first_compwin: { title: "First Victory", icon: "Trophy" },
  compwin_10: { title: "Gladiator", icon: "Trophy" },

  // Combined/Level Milestones
  level_10: { title: "Rising Star", icon: "Award" },
  level_50: { title: "Veteran", icon: "Award" },
};

/**
 * Helper to unlock a specific badge for a user if they don't already have it.
 */
const unlockBadge = (user, badgeKey) => {
  if (!user.badges) user.badges = [];

  // Check if they already have this badge title (legacy logic compatibility)
  const hasBadge = user.badges.some(
    (b) => b.title === ACHIEVEMENTS[badgeKey].title,
  );
  if (!hasBadge) {
    user.badges.push({
      title: ACHIEVEMENTS[badgeKey].title,
      icon: ACHIEVEMENTS[badgeKey].icon,
      earnedAt: new Date(),
    });
    return true; // Unlocked something
  }
  return false;
};

/**
 * Checks all conditions and unlocks any eligible achievements for the user.
 *
 * @param {import('mongoose').Document} user - Mongoose User Document
 * @param {Object} context - Context object containing metrics (e.g., total problems solved) to evaluate
 */
export const evaluateAchievements = (user, context = {}) => {
  let newUnlocks = false;
  const { totalSolved = 0, totalWins = 0 } = context;

  // Streak checks
  if (user.dayStreak >= 3)
    newUnlocks = unlockBadge(user, "streak_3") || newUnlocks;
  if (user.dayStreak >= 7)
    newUnlocks = unlockBadge(user, "streak_7") || newUnlocks;
  if (user.dayStreak >= 30)
    newUnlocks = unlockBadge(user, "streak_30") || newUnlocks;

  // Level checks
  if (user.level >= 10)
    newUnlocks = unlockBadge(user, "level_10") || newUnlocks;
  if (user.level >= 50)
    newUnlocks = unlockBadge(user, "level_50") || newUnlocks;

  // Playground metrics
  if (totalSolved >= 1)
    newUnlocks = unlockBadge(user, "first_solve") || newUnlocks;
  if (totalSolved >= 10)
    newUnlocks = unlockBadge(user, "solve_10") || newUnlocks;
  if (totalSolved >= 50)
    newUnlocks = unlockBadge(user, "solve_50") || newUnlocks;

  // Competition metrics
  if (totalWins >= 1)
    newUnlocks = unlockBadge(user, "first_compwin") || newUnlocks;
  if (totalWins >= 10)
    newUnlocks = unlockBadge(user, "compwin_10") || newUnlocks;

  return newUnlocks;
};

/**
 * Central function to safely add XP to a user, recalculate their level and rank,
 * and seamlessly save the document.
 *
 * @param {import('mongoose').Document} user - Mongoose User Document
 * @param {number} amount - Amount of XP to add
 * @param {Object} context - Optional context mapping user metrics to check achievements
 * @returns {Promise<import('mongoose').Document>} Updated user document
 */
export const addXP = async (user, amount, context = {}) => {
  if (!amount || amount <= 0) return user;

  // Increment XP
  user.xp = (user.xp || 0) + amount;

  // Default leveling curve: 1000 XP per level
  const newLevel = Math.floor(user.xp / 1000) + 1;
  user.level = newLevel;

  // Update Rank/League
  user.rank = calculateRank(user.level);

  // Evaluate any achievements that might have been triggered by this action
  evaluateAchievements(user, context);

  // Save changes to DB
  await user.save();
  return user;
};
