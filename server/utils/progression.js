export const LEAGUES = [
  { rank: "Bronze",      minXP: 0 },
  { rank: "Silver",      minXP: 700 },
  { rank: "Gold",        minXP: 2700 },
  { rank: "Platinum",    minXP: 16200 },
  { rank: "Diamond",     minXP: 63700 },
  { rank: "Master",      minXP: 142450 },
  { rank: "Grandmaster", minXP: 252450 },
];

export const getXPForLevel = (level) => {
  if (level <= 1) return 0;
  return 25 * (level - 1) * (level + 2);
};

export const getLevelFromXP = (xp) => {
  if (!xp || xp <= 0) return 1;
  return Math.max(1, Math.floor((-1 + Math.sqrt(9 + (4 * xp) / 25)) / 2));
};

export const calculateRank = (xp) => {
  let currentRank = "Bronze";
  for (const league of LEAGUES) {
    if (xp >= league.minXP) {
      currentRank = league.rank;
    } else {
      break;
    }
  }
  return currentRank;
};

const ACHIEVEMENTS = {
  first_solve: { title: "First Blood", icon: "Zap", rarity: "Common" },
  streak_3: { title: "On Fire", icon: "Flame", rarity: "Common" },
  solve_10: { title: "Coder", icon: "Code2", rarity: "Common" },
  chapter_done: { title: "Chapter Clear", icon: "BookOpen", rarity: "Common" },
  learner_1: { title: "Apprentice", icon: "BookOpen", rarity: "Common" },
  polyglot_2: { title: "Bilingual", icon: "Globe", rarity: "Common" },
  chapter_5: { title: "Bookworm", icon: "BookMarked", rarity: "Common" },

  streak_7: { title: "Unstoppable", icon: "Flame", rarity: "Rare" },
  solve_50: { title: "Problem Solver", icon: "Zap", rarity: "Rare" },
  first_compwin: { title: "First Victory", icon: "Trophy", rarity: "Rare" },
  level_10: { title: "Rising Star", icon: "Award", rarity: "Rare" },
  speed_demon: { title: "Speed Demon", icon: "Zap", rarity: "Rare" },
  learner_5: { title: "Scholar", icon: "BookMarked", rarity: "Rare" },
  chapter_25: { title: "Dedicated", icon: "Library", rarity: "Rare" },

  streak_30: { title: "Eternal Flame", icon: "Flame", rarity: "Epic" },
  solve_100: { title: "Centurion", icon: "Zap", rarity: "Epic" },
  compwin_10: { title: "Gladiator", icon: "Trophy", rarity: "Epic" },
  level_50: { title: "Veteran", icon: "Award", rarity: "Epic" },
  polyglot_3: { title: "Polyglot", icon: "Globe", rarity: "Epic" },
  learner_10: { title: "Academic", icon: "GraduationCap", rarity: "Epic" },
  chapter_50: { title: "Book Master", icon: "Library", rarity: "Epic" },

  streak_100: { title: "Eternal", icon: "Flame", rarity: "Legendary" },
  solve_500: { title: "Elite", icon: "Zap", rarity: "Legendary" },
  compwin_50: { title: "Champion", icon: "Trophy", rarity: "Legendary" },
  compwin_100: { title: "Legend", icon: "Crown", rarity: "Legendary" },
  level_100: { title: "Grandmaster", icon: "Award", rarity: "Legendary" },
  lang_master_javascript: {
    title: "JavaScript Master",
    icon: "Code2",
    rarity: "Legendary",
  },
  lang_master_python: {
    title: "Python Master",
    icon: "Code2",
    rarity: "Legendary",
  },
  lang_master_html: {
    title: "HTML Master",
    icon: "Code2",
    rarity: "Legendary",
  },
  lang_master_css: { title: "CSS Master", icon: "Code2", rarity: "Legendary" },
  lang_master_react: {
    title: "React Master",
    icon: "Code2",
    rarity: "Legendary",
  },
  lang_master_dsa: { title: "DSA Master", icon: "Code2", rarity: "Legendary" },
  polyglot_6: { title: "Language Wizard", icon: "Globe", rarity: "Legendary" },
  perfectionist: { title: "Completionist", icon: "Star", rarity: "Legendary" },
};

export const MULTI_STAGE_ACHIEVEMENTS = Object.freeze({
  solve_master: {
    label: "Solve Master",
    progressKey: "solve_master",
    stages: [
      {
        threshold: 10,
        badgeKey: "solve_10",
        xpReward: 50,
        name: "Stage I — Coder",
      },
      {
        threshold: 50,
        badgeKey: "solve_50",
        xpReward: 100,
        name: "Stage II — Problem Solver",
      },
      {
        threshold: 100,
        badgeKey: "solve_100",
        xpReward: 200,
        name: "Stage III — Centurion",
      },
      {
        threshold: 500,
        badgeKey: "solve_500",
        xpReward: 500,
        name: "Stage IV — Elite",
      },
    ],
  },
  competitor: {
    label: "Competitor",
    progressKey: "competitor",
    stages: [
      {
        threshold: 1,
        badgeKey: "first_compwin",
        xpReward: 50,
        name: "Stage I — First Victory",
      },
      {
        threshold: 10,
        badgeKey: "compwin_10",
        xpReward: 100,
        name: "Stage II — Gladiator",
      },
      {
        threshold: 50,
        badgeKey: "compwin_50",
        xpReward: 300,
        name: "Stage III — Champion",
      },
      {
        threshold: 100,
        badgeKey: "compwin_100",
        xpReward: 500,
        name: "Stage IV — Legend",
      },
    ],
  },
  learner: {
    label: "Learner",
    progressKey: "learner",
    stages: [
      {
        threshold: 1,
        badgeKey: "learner_1",
        xpReward: 50,
        name: "Stage I — Apprentice",
      },
      {
        threshold: 5,
        badgeKey: "learner_5",
        xpReward: 150,
        name: "Stage II — Scholar",
      },
      {
        threshold: 10,
        badgeKey: "learner_10",
        xpReward: 300,
        name: "Stage III — Academic",
      },
    ],
  },
  streak_legend: {
    label: "Streak Legend",
    progressKey: "streak_legend",
    stages: [
      {
        threshold: 3,
        badgeKey: "streak_3",
        xpReward: 30,
        name: "Stage I — On Fire",
      },
      {
        threshold: 7,
        badgeKey: "streak_7",
        xpReward: 75,
        name: "Stage II — Unstoppable",
      },
      {
        threshold: 30,
        badgeKey: "streak_30",
        xpReward: 200,
        name: "Stage III — Eternal Flame",
      },
      {
        threshold: 100,
        badgeKey: "streak_100",
        xpReward: 500,
        name: "Stage IV — Eternal",
      },
    ],
  },
  polyglot: {
    label: "Polyglot",
    progressKey: "polyglot",
    stages: [
      {
        threshold: 2,
        badgeKey: "polyglot_2",
        xpReward: 100,
        name: "Stage I — Bilingual",
      },
      {
        threshold: 4,
        badgeKey: "polyglot_3",
        xpReward: 250,
        name: "Stage II — Polyglot",
      },
      {
        threshold: 6,
        badgeKey: "polyglot_6",
        xpReward: 500,
        name: "Stage III — Language Wizard",
      },
    ],
  },
  chapters: {
    label: "Chapter Master",
    progressKey: "chapters_completed",
    stages: [
      {
        threshold: 5,
        badgeKey: "chapter_5",
        xpReward: 50,
        name: "Stage I — Bookworm",
      },
      {
        threshold: 25,
        badgeKey: "chapter_25",
        xpReward: 100,
        name: "Stage II — Dedicated",
      },
      {
        threshold: 50,
        badgeKey: "chapter_50",
        xpReward: 200,
        name: "Stage III — Book Master",
      },
    ],
  },
});

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

 *
 * @param {import('mongoose').Document} user
 * @param {Object} context 
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
  if (user.dayStreak >= 3)
    newUnlocks = unlockBadge(user, "streak_3") || newUnlocks;
  if (user.dayStreak >= 7)
    newUnlocks = unlockBadge(user, "streak_7") || newUnlocks;
  if (user.dayStreak >= 30)
    newUnlocks = unlockBadge(user, "streak_30") || newUnlocks;
  if (user.dayStreak >= 100)
    newUnlocks = unlockBadge(user, "streak_100") || newUnlocks;

  // Level milestones
  if (user.level >= 10)
    newUnlocks = unlockBadge(user, "level_10") || newUnlocks;
  if (user.level >= 50)
    newUnlocks = unlockBadge(user, "level_50") || newUnlocks;
  if (user.level >= 100)
    newUnlocks = unlockBadge(user, "level_100") || newUnlocks;

  // Playground solve milestones
  if (totalSolved >= 1)
    newUnlocks = unlockBadge(user, "first_solve") || newUnlocks;
  if (totalSolved >= 10)
    newUnlocks = unlockBadge(user, "solve_10") || newUnlocks;
  if (totalSolved >= 50)
    newUnlocks = unlockBadge(user, "solve_50") || newUnlocks;
  if (totalSolved >= 100)
    newUnlocks = unlockBadge(user, "solve_100") || newUnlocks;
  if (totalSolved >= 500)
    newUnlocks = unlockBadge(user, "solve_500") || newUnlocks;

  // Competition milestones
  if (totalWins >= 1)
    newUnlocks = unlockBadge(user, "first_compwin") || newUnlocks;
  if (totalWins >= 10)
    newUnlocks = unlockBadge(user, "compwin_10") || newUnlocks;
  if (totalWins >= 50)
    newUnlocks = unlockBadge(user, "compwin_50") || newUnlocks;
  if (totalWins >= 100)
    newUnlocks = unlockBadge(user, "compwin_100") || newUnlocks;

  // Per-solve / chapter bonuses
  if (earnedSpeedBonus)
    newUnlocks = unlockBadge(user, "speed_demon") || newUnlocks;
  if (chapterCompleted)
    newUnlocks = unlockBadge(user, "chapter_done") || newUnlocks;

  if (courseCompleted)
    newUnlocks = unlockBadge(user, "perfectionist") || newUnlocks;

  if (languageCompleted && language) {
    const masterKey = `lang_master_${language.toLowerCase()}`;
    if (ACHIEVEMENTS[masterKey])
      newUnlocks = unlockBadge(user, masterKey) || newUnlocks;
  }

  return newUnlocks;
};

/**

 *
 * @param {import('mongoose').Document} user
 * @param {Object} context
 * @returns {{ xpReward: number, name: string }[]} Newly unlocked stages
 */
export const evaluateMultiStageAchievements = (user, context = {}) => {
  if (!user.achievementProgress) user.achievementProgress = new Map();
  const {
    totalSolved,
    totalWins,
    chapterCompleted,
    courseCompleted,
    languageCompleted,
  } = context;
  const unlocks = [];

  const checkStages = (trackKey, newValue) => {
    const track = MULTI_STAGE_ACHIEVEMENTS[trackKey];
    const stored = user.achievementProgress.get(track.progressKey) ?? 0;
    const updated = Math.max(stored, newValue);
    if (updated !== stored)
      user.achievementProgress.set(track.progressKey, updated);
    for (const stage of track.stages) {
      if (updated >= stage.threshold && unlockBadge(user, stage.badgeKey)) {
        unlocks.push({ xpReward: stage.xpReward, name: stage.name });
      }
    }
  };

  if (totalSolved != null) checkStages("solve_master", totalSolved);

  if (totalWins != null) checkStages("competitor", totalWins);

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

  if (languageCompleted) {
    const track = MULTI_STAGE_ACHIEVEMENTS.polyglot;
    const langMasterTitles = new Set(
      Object.entries(ACHIEVEMENTS)
        .filter(([k]) => k.startsWith("lang_master_"))
        .map(([, v]) => v.title),
    );
    const langCount = (user.badges ?? []).filter((b) =>
      langMasterTitles.has(b.title),
    ).length;
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

 *
 * @param {import('mongoose').Document} user 
 * @param {number} amount 
 * @param {Object} context 
 * @param {Object} [options={ autoSave: true }] 
 * @returns {Promise<import('mongoose').Document>} 
 */
export const addXP = async (
  user,
  amount,
  context = {},
  options = { autoSave: true },
) => {
  if (!amount || amount <= 0) return user;

  // Increment XP
  user.xp = (user.xp || 0) + amount;

  user.level = getLevelFromXP(user.xp);

  user.league = calculateRank(user.xp);

  if (!user.xpLog) user.xpLog = [];
  user.xpLog.unshift({
    source: options?.source ?? "unknown",
    amount,
    timestamp: new Date(),
  });
  if (user.xpLog.length > 30) user.xpLog.length = 30;

  // Evaluate instant badges
  evaluateAchievements(user, context);

  const stageUnlocks = evaluateMultiStageAchievements(user, context);
  if (stageUnlocks.length > 0) {
    const bonusXP = stageUnlocks.reduce((sum, s) => sum + s.xpReward, 0);
    if (bonusXP > 0) {
      user.xp += bonusXP;
      user.level = getLevelFromXP(user.xp);
      user.league = calculateRank(user.xp);
      user.xpLog.unshift({
        source: "achievement_stage",
        amount: bonusXP,
        timestamp: new Date(),
      });
      if (user.xpLog.length > 30) user.xpLog.length = 30;
    }
  }

  // Save changes to DB
  if (options.autoSave !== false) {
    user.markModified("achievementProgress");
    await user.save();
  }
  return user;
};
