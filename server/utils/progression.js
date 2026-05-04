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
 * Returns the total XP required to START a given level.
 * Level 1 = 0 XP. Each level costs exactly 50 more XP than the previous.
 * Formula: 25 * (level - 1) * (level + 2)
 */
export const getXPForLevel = (level) => {
  if (level <= 1) return 0;
  return 25 * (level - 1) * (level + 2);
};

/**
 * Derives the current level from a raw XP total using the quadratic inverse.
 */
export const getLevelFromXP = (xp) => {
  if (!xp || xp <= 0) return 1;
  return Math.max(1, Math.floor((-1 + Math.sqrt(9 + 4 * xp / 25)) / 2));
};

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
 * Standard Library of Platform Achievements.
 * Each entry: { title, icon, rarity: "Common"|"Rare"|"Epic"|"Legendary" }
 */
const ACHIEVEMENTS = {
  // ── Common ────────────────────────────────────────────────
  first_solve:  { title: "First Blood",         icon: "Zap",      rarity: "Common" },
  streak_3:     { title: "On Fire",              icon: "Flame",    rarity: "Common" },
  solve_10:     { title: "Coder",                icon: "Code2",    rarity: "Common" },
  chapter_done: { title: "Chapter Clear",        icon: "BookOpen", rarity: "Common" },

  // ── Rare ──────────────────────────────────────────────────
  streak_7:      { title: "Unstoppable",         icon: "Flame",    rarity: "Rare" },
  solve_50:      { title: "Problem Solver",      icon: "Zap",      rarity: "Rare" },
  first_compwin: { title: "First Victory",       icon: "Trophy",   rarity: "Rare" },
  level_10:      { title: "Rising Star",         icon: "Award",    rarity: "Rare" },
  speed_demon:   { title: "Speed Demon",         icon: "Zap",      rarity: "Rare" },

  // ── Epic ──────────────────────────────────────────────────
  streak_30:  { title: "Eternal Flame",          icon: "Flame",    rarity: "Epic" },
  solve_100:  { title: "Centurion",              icon: "Zap",      rarity: "Epic" },
  compwin_10: { title: "Gladiator",              icon: "Trophy",   rarity: "Epic" },
  level_50:   { title: "Veteran",                icon: "Award",    rarity: "Epic" },
  polyglot_3: { title: "Polyglot",               icon: "Globe",    rarity: "Epic" },

  // ── Legendary ─────────────────────────────────────────────
  streak_100:              { title: "Eternal",              icon: "Flame",    rarity: "Legendary" },
  solve_500:               { title: "Elite",                icon: "Zap",      rarity: "Legendary" },
  compwin_50:              { title: "Champion",             icon: "Trophy",   rarity: "Legendary" },
  level_100:               { title: "Grandmaster",          icon: "Award",    rarity: "Legendary" },
  lang_master_javascript:  { title: "JavaScript Master",    icon: "Code2",    rarity: "Legendary" },
  lang_master_python:      { title: "Python Master",        icon: "Code2",    rarity: "Legendary" },
  lang_master_html:        { title: "HTML Master",          icon: "Code2",    rarity: "Legendary" },
  lang_master_css:         { title: "CSS Master",           icon: "Code2",    rarity: "Legendary" },
  lang_master_react:       { title: "React Master",         icon: "Code2",    rarity: "Legendary" },
  lang_master_dsa:         { title: "DSA Master",           icon: "Code2",    rarity: "Legendary" },
  perfectionist:           { title: "Completionist",        icon: "Star",     rarity: "Legendary" },
};

/**
 * Helper to unlock a specific badge for a user if they don't already have it.
 */
const unlockBadge = (user, badgeKey) => {
  if (!user.badges) user.badges = [];
  const achievement = ACHIEVEMENTS[badgeKey];
  if (!achievement) return false;
  const hasBadge = user.badges.some((b) => b.title === achievement.title);
  if (!hasBadge) {
    user.badges.push({
      title: achievement.title,
      icon: achievement.icon,
      rarity: achievement.rarity || "Common",
      earnedAt: new Date(),
    });
    return true;
  }
  return false;
};

/**
 * Checks all conditions and unlocks any eligible achievements for the user.
 *
 * @param {import('mongoose').Document} user - Mongoose User Document
 * @param {Object} context - Metrics/flags to evaluate (totalSolved, totalWins, earnedSpeedBonus, chapterCompleted, languageCompleted, language)
 */
export const evaluateAchievements = (user, context = {}) => {
  let newUnlocks = false;
  const {
    totalSolved = 0,
    totalWins = 0,
    earnedSpeedBonus = false,
    chapterCompleted = false,
    languageCompleted = false,
    language = null,
  } = context;

  // Streak milestones
  if (user.dayStreak >= 3)   newUnlocks = unlockBadge(user, "streak_3")   || newUnlocks;
  if (user.dayStreak >= 7)   newUnlocks = unlockBadge(user, "streak_7")   || newUnlocks;
  if (user.dayStreak >= 30)  newUnlocks = unlockBadge(user, "streak_30")  || newUnlocks;
  if (user.dayStreak >= 100) newUnlocks = unlockBadge(user, "streak_100") || newUnlocks;

  // Level milestones
  if (user.level >= 10)  newUnlocks = unlockBadge(user, "level_10")  || newUnlocks;
  if (user.level >= 50)  newUnlocks = unlockBadge(user, "level_50")  || newUnlocks;
  if (user.level >= 100) newUnlocks = unlockBadge(user, "level_100") || newUnlocks;

  // Playground solve milestones
  if (totalSolved >= 1)   newUnlocks = unlockBadge(user, "first_solve") || newUnlocks;
  if (totalSolved >= 10)  newUnlocks = unlockBadge(user, "solve_10")    || newUnlocks;
  if (totalSolved >= 50)  newUnlocks = unlockBadge(user, "solve_50")    || newUnlocks;
  if (totalSolved >= 100) newUnlocks = unlockBadge(user, "solve_100")   || newUnlocks;
  if (totalSolved >= 500) newUnlocks = unlockBadge(user, "solve_500")   || newUnlocks;

  // Competition milestones
  if (totalWins >= 1)  newUnlocks = unlockBadge(user, "first_compwin") || newUnlocks;
  if (totalWins >= 10) newUnlocks = unlockBadge(user, "compwin_10")    || newUnlocks;
  if (totalWins >= 50) newUnlocks = unlockBadge(user, "compwin_50")    || newUnlocks;

  // Per-solve bonuses
  if (earnedSpeedBonus) newUnlocks = unlockBadge(user, "speed_demon")  || newUnlocks;
  if (chapterCompleted) newUnlocks = unlockBadge(user, "chapter_done") || newUnlocks;

  // Language mastery
  if (languageCompleted && language) {
    const masterKey = `lang_master_${language.toLowerCase()}`;
    if (ACHIEVEMENTS[masterKey]) newUnlocks = unlockBadge(user, masterKey) || newUnlocks;
  }

  return newUnlocks;
};

/**
 * Central function to safely add XP to a user, recalculate their level and rank,
 * and seamlessly save the document.
 *
 * @param {import('mongoose').Document} user - Mongoose User Document
 * @param {number} amount - Amount of XP to add
 * @param {Object} context - Optional context mapping user metrics to check achievements
 * @param {Object} [options={ autoSave: true }] - Options object
 * @returns {Promise<import('mongoose').Document>} Updated user document
 */
export const addXP = async (user, amount, context = {}, options = { autoSave: true }) => {
  if (!amount || amount <= 0) return user;

  // Increment XP
  user.xp = (user.xp || 0) + amount;

  // Exponential leveling curve — each level costs 50 more XP than the last
  user.level = getLevelFromXP(user.xp);

  // Update Rank/League
  user.rank = calculateRank(user.level);

  // Evaluate any achievements that might have been triggered by this action
  evaluateAchievements(user, context);

  // Save changes to DB
  if (options.autoSave !== false) {
    await user.save();
  }
  return user;
};
