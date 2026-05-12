/**
 * Centralized Gamification and Progression Service for EduQuest
 * Handles XP, Leveling, Leagues, Badges, and Multi-Stage Achievements.
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
 * Standard Library of Platform Badges.
 * Each entry: { title, icon, rarity: "Common"|"Rare"|"Epic"|"Legendary" }
 */
const ACHIEVEMENTS = {
  // ── Common ────────────────────────────────────────────────
  first_solve:  { title: "First Blood",         icon: "Zap",           rarity: "Common"    },
  streak_3:     { title: "On Fire",              icon: "Flame",         rarity: "Common"    },
  solve_10:     { title: "Coder",                icon: "Code2",         rarity: "Common"    },
  chapter_done: { title: "Chapter Clear",        icon: "BookOpen",      rarity: "Common"    },
  learner_1:    { title: "Apprentice",           icon: "BookOpen",      rarity: "Common"    },
  polyglot_2:   { title: "Bilingual",            icon: "Globe",         rarity: "Common"    },
  chapter_5:    { title: "Bookworm",             icon: "BookMarked",    rarity: "Common"    },

  // ── Rare ──────────────────────────────────────────────────
  streak_7:      { title: "Unstoppable",         icon: "Flame",         rarity: "Rare"      },
  solve_50:      { title: "Problem Solver",      icon: "Zap",           rarity: "Rare"      },
  first_compwin: { title: "First Victory",       icon: "Trophy",        rarity: "Rare"      },
  level_10:      { title: "Rising Star",         icon: "Award",         rarity: "Rare"      },
  speed_demon:   { title: "Speed Demon",         icon: "Zap",           rarity: "Rare"      },
  learner_5:     { title: "Scholar",             icon: "BookMarked",    rarity: "Rare"      },
  chapter_25:    { title: "Dedicated",           icon: "Library",       rarity: "Rare"      },

  // ── Epic ──────────────────────────────────────────────────
  streak_30:   { title: "Eternal Flame",         icon: "Flame",         rarity: "Epic"      },
  solve_100:   { title: "Centurion",             icon: "Zap",           rarity: "Epic"      },
  compwin_10:  { title: "Gladiator",             icon: "Trophy",        rarity: "Epic"      },
  level_50:    { title: "Veteran",               icon: "Award",         rarity: "Epic"      },
  polyglot_3:  { title: "Polyglot",              icon: "Globe",         rarity: "Epic"      },
  learner_10:  { title: "Academic",              icon: "GraduationCap", rarity: "Epic"      },
  chapter_50:  { title: "Book Master",           icon: "Library",       rarity: "Epic"      },

  // ── Legendary ─────────────────────────────────────────────
  streak_100:              { title: "Eternal",              icon: "Flame",    rarity: "Legendary" },
  solve_500:               { title: "Elite",                icon: "Zap",      rarity: "Legendary" },
  compwin_50:              { title: "Champion",             icon: "Trophy",   rarity: "Legendary" },
  compwin_100:             { title: "Legend",               icon: "Crown",    rarity: "Legendary" },
  level_100:               { title: "Grandmaster",          icon: "Award",    rarity: "Legendary" },
  lang_master_javascript:  { title: "JavaScript Master",    icon: "Code2",    rarity: "Legendary" },
  lang_master_python:      { title: "Python Master",        icon: "Code2",    rarity: "Legendary" },
  lang_master_html:        { title: "HTML Master",          icon: "Code2",    rarity: "Legendary" },
  lang_master_css:         { title: "CSS Master",           icon: "Code2",    rarity: "Legendary" },
  lang_master_react:       { title: "React Master",         icon: "Code2",    rarity: "Legendary" },
  lang_master_dsa:         { title: "DSA Master",           icon: "Code2",    rarity: "Legendary" },
  polyglot_6:              { title: "Language Wizard",      icon: "Globe",    rarity: "Legendary" },
  perfectionist:           { title: "Completionist",        icon: "Star",     rarity: "Legendary" },
};

/**
 * Multi-stage achievement tracks with progress keys, stage thresholds, badge rewards, and bonus XP.
 * Exported so callers can render progress bars ("47 / 50 toward Stage III").
 *
 * progressKey   — key used in user.achievementProgress Map
 * stages        — ordered array; each stage unlocks a badge + grants bonus XP
 */
export const MULTI_STAGE_ACHIEVEMENTS = Object.freeze({
  solve_master: {
    label: "Solve Master",
    progressKey: "solve_master",
    stages: [
      { threshold: 10,  badgeKey: "solve_10",     xpReward: 50,  name: "Stage I — Coder"          },
      { threshold: 50,  badgeKey: "solve_50",     xpReward: 100, name: "Stage II — Problem Solver" },
      { threshold: 100, badgeKey: "solve_100",    xpReward: 200, name: "Stage III — Centurion"     },
      { threshold: 500, badgeKey: "solve_500",    xpReward: 500, name: "Stage IV — Elite"          },
    ],
  },
  competitor: {
    label: "Competitor",
    progressKey: "competitor",
    stages: [
      { threshold: 1,   badgeKey: "first_compwin", xpReward: 50,  name: "Stage I — First Victory" },
      { threshold: 10,  badgeKey: "compwin_10",    xpReward: 100, name: "Stage II — Gladiator"    },
      { threshold: 50,  badgeKey: "compwin_50",    xpReward: 300, name: "Stage III — Champion"    },
      { threshold: 100, badgeKey: "compwin_100",   xpReward: 500, name: "Stage IV — Legend"       },
    ],
  },
  learner: {
    label: "Learner",
    progressKey: "learner",
    stages: [
      { threshold: 1,  badgeKey: "learner_1",  xpReward: 50,  name: "Stage I — Apprentice" },
      { threshold: 5,  badgeKey: "learner_5",  xpReward: 150, name: "Stage II — Scholar"   },
      { threshold: 10, badgeKey: "learner_10", xpReward: 300, name: "Stage III — Academic" },
    ],
  },
  streak_legend: {
    label: "Streak Legend",
    progressKey: "streak_legend",
    stages: [
      { threshold: 3,   badgeKey: "streak_3",   xpReward: 30,  name: "Stage I — On Fire"       },
      { threshold: 7,   badgeKey: "streak_7",   xpReward: 75,  name: "Stage II — Unstoppable"  },
      { threshold: 30,  badgeKey: "streak_30",  xpReward: 200, name: "Stage III — Eternal Flame"},
      { threshold: 100, badgeKey: "streak_100", xpReward: 500, name: "Stage IV — Eternal"       },
    ],
  },
  polyglot: {
    label: "Polyglot",
    progressKey: "polyglot",
    stages: [
      { threshold: 2, badgeKey: "polyglot_2", xpReward: 100, name: "Stage I — Bilingual"      },
      { threshold: 4, badgeKey: "polyglot_3", xpReward: 250, name: "Stage II — Polyglot"      },
      { threshold: 6, badgeKey: "polyglot_6", xpReward: 500, name: "Stage III — Language Wizard" },
    ],
  },
  chapters: {
    label: "Chapter Master",
    progressKey: "chapters_completed",
    stages: [
      { threshold: 5,  badgeKey: "chapter_5",  xpReward: 50,  name: "Stage I — Bookworm"    },
      { threshold: 25, badgeKey: "chapter_25", xpReward: 100, name: "Stage II — Dedicated"   },
      { threshold: 50, badgeKey: "chapter_50", xpReward: 200, name: "Stage III — Book Master" },
    ],
  },
});

/**
 * Helper to unlock a specific badge for a user if they don't already have it.
 * Returns true if a NEW badge was added, false if already owned.
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
 * Checks all instant badge conditions and unlocks any eligible badges for the user.
 *
 * @param {import('mongoose').Document} user - Mongoose User Document
 * @param {Object} context - Metrics/flags: { totalSolved, totalWins, earnedSpeedBonus,
 *                            chapterCompleted, courseCompleted, languageCompleted, language }
 */
export const evaluateAchievements = (user, context = {}) => {
  let newUnlocks = false;
  const {
    totalSolved = 0,
    totalWins = 0,
    earnedSpeedBonus = false,
    chapterCompleted = false,
    courseCompleted = false,
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
  if (totalWins >= 100) newUnlocks = unlockBadge(user, "compwin_100")  || newUnlocks;

  // Per-solve / chapter bonuses
  if (earnedSpeedBonus) newUnlocks = unlockBadge(user, "speed_demon")  || newUnlocks;
  if (chapterCompleted) newUnlocks = unlockBadge(user, "chapter_done") || newUnlocks;

  // First full course completion (fixes dead "perfectionist" badge)
  if (courseCompleted)  newUnlocks = unlockBadge(user, "perfectionist") || newUnlocks;

  // Language mastery
  if (languageCompleted && language) {
    const masterKey = `lang_master_${language.toLowerCase()}`;
    if (ACHIEVEMENTS[masterKey]) newUnlocks = unlockBadge(user, masterKey) || newUnlocks;
  }

  return newUnlocks;
};

/**
 * Evaluates multi-stage achievement tracks, updates progress counters in
 * user.achievementProgress, unlocks stage badges, and returns the list of
 * newly completed stages (with bonus XP for each).
 *
 * Called from addXP after evaluateAchievements so lang_master badges are
 * already set when we count polyglot progress.
 *
 * @param {import('mongoose').Document} user
 * @param {Object} context
 * @returns {{ xpReward: number, name: string }[]} Newly unlocked stages
 */
export const evaluateMultiStageAchievements = (user, context = {}) => {
  if (!user.achievementProgress) user.achievementProgress = new Map();
  const { totalSolved, totalWins, chapterCompleted, courseCompleted, languageCompleted } = context;
  const unlocks = [];

  // ── Helper: check stages for a numeric progress counter ──────────────────
  const checkStages = (trackKey, newValue) => {
    const track = MULTI_STAGE_ACHIEVEMENTS[trackKey];
    const stored = user.achievementProgress.get(track.progressKey) ?? 0;
    const updated = Math.max(stored, newValue);
    if (updated !== stored) user.achievementProgress.set(track.progressKey, updated);
    for (const stage of track.stages) {
      if (updated >= stage.threshold && unlockBadge(user, stage.badgeKey)) {
        unlocks.push({ xpReward: stage.xpReward, name: stage.name });
      }
    }
  };

  // Solve Master — driven by context.totalSolved
  if (totalSolved != null) checkStages("solve_master", totalSolved);

  // Competitor — driven by context.totalWins
  if (totalWins != null) checkStages("competitor", totalWins);

  // Streak Legend — driven by user.dayStreak (source of truth, no accumulation needed)
  {
    const track = MULTI_STAGE_ACHIEVEMENTS.streak_legend;
    const streak = user.dayStreak ?? 0;
    user.achievementProgress.set(track.progressKey, streak);
    for (const stage of track.stages) {
      if (streak >= stage.threshold && unlockBadge(user, stage.badgeKey)) {
        unlocks.push({ xpReward: stage.xpReward, name: stage.name });
      }
    }
  }

  // Chapter Master — increment once per chapterCompleted event
  if (chapterCompleted) {
    const track = MULTI_STAGE_ACHIEVEMENTS.chapters;
    const updated = (user.achievementProgress.get(track.progressKey) ?? 0) + 1;
    user.achievementProgress.set(track.progressKey, updated);
    for (const stage of track.stages) {
      if (updated >= stage.threshold && unlockBadge(user, stage.badgeKey)) {
        unlocks.push({ xpReward: stage.xpReward, name: stage.name });
      }
    }
  }

  // Learner — increment once per courseCompleted event
  if (courseCompleted) {
    const track = MULTI_STAGE_ACHIEVEMENTS.learner;
    const updated = (user.achievementProgress.get(track.progressKey) ?? 0) + 1;
    user.achievementProgress.set(track.progressKey, updated);
    for (const stage of track.stages) {
      if (updated >= stage.threshold && unlockBadge(user, stage.badgeKey)) {
        unlocks.push({ xpReward: stage.xpReward, name: stage.name });
      }
    }
  }

  // Polyglot — count lang_master_* badges already on the user (idempotent)
  if (languageCompleted) {
    const track = MULTI_STAGE_ACHIEVEMENTS.polyglot;
    const langMasterTitles = new Set(
      Object.entries(ACHIEVEMENTS)
        .filter(([k]) => k.startsWith("lang_master_"))
        .map(([, v]) => v.title),
    );
    const langCount = (user.badges ?? []).filter((b) => langMasterTitles.has(b.title)).length;
    user.achievementProgress.set(track.progressKey, langCount);
    for (const stage of track.stages) {
      if (langCount >= stage.threshold && unlockBadge(user, stage.badgeKey)) {
        unlocks.push({ xpReward: stage.xpReward, name: stage.name });
      }
    }
  }

  return unlocks;
};

/**
 * Central function to safely add XP to a user, recalculate their level and rank,
 * evaluate instant badges, evaluate multi-stage achievements (with bonus XP),
 * and save the document.
 *
 * @param {import('mongoose').Document} user - Mongoose User Document
 * @param {number} amount - Amount of XP to add
 * @param {Object} context - Optional context mapping user metrics to check achievements
 * @param {Object} [options={ autoSave: true }] - Options object; may carry { source }
 * @returns {Promise<import('mongoose').Document>} Updated user document
 */
export const addXP = async (user, amount, context = {}, options = { autoSave: true }) => {
  if (!amount || amount <= 0) return user;

  // Increment XP
  user.xp = (user.xp || 0) + amount;

  // Exponential leveling curve — each level costs 50 more XP than the last
  user.level = getLevelFromXP(user.xp);

  // Update League tier
  user.league = calculateRank(user.level);

  // Append XP log entry (cap at 30)
  if (!user.xpLog) user.xpLog = [];
  user.xpLog.unshift({ source: options?.source ?? "unknown", amount, timestamp: new Date() });
  if (user.xpLog.length > 30) user.xpLog.length = 30;

  // Evaluate instant badges
  evaluateAchievements(user, context);

  // Evaluate multi-stage achievements and apply any stage bonus XP
  const stageUnlocks = evaluateMultiStageAchievements(user, context);
  if (stageUnlocks.length > 0) {
    const bonusXP = stageUnlocks.reduce((sum, s) => sum + s.xpReward, 0);
    if (bonusXP > 0) {
      user.xp += bonusXP;
      user.level = getLevelFromXP(user.xp);
      user.league = calculateRank(user.level);
      user.xpLog.unshift({ source: "achievement_stage", amount: bonusXP, timestamp: new Date() });
      if (user.xpLog.length > 30) user.xpLog.length = 30;
    }
  }

  // Save changes to DB
  if (options.autoSave !== false) {
    await user.save();
  }
  return user;
};
