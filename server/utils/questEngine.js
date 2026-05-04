/**
 * Quest Engine — Daily & Weekly Quest system for EduQuest.
 * Manages quest definitions, period resets, progress tracking, and reward claiming.
 */

import { UserQuestProgress } from "../models/UserQuestProgress.model.js";
import { User } from "../models/user.model.js";
import { addXP } from "./progression.js";

// ─── Quest Catalog ────────────────────────────────────────────────────────────

export const QUEST_CATALOG = {
  // ── Daily ──────────────────────────────────────────────────────────────────
  daily_dose: {
    id: "daily_dose",
    title: "Daily Dose",
    description: "Solve 1 problem today",
    icon: "Zap",
    xpReward: 25,
    period: "daily",
    target: 1,
  },
  double_down: {
    id: "double_down",
    title: "Double Down",
    description: "Solve 2 problems today",
    icon: "TrendingUp",
    xpReward: 60,
    period: "daily",
    target: 2,
  },
  hint_free_hero: {
    id: "hint_free_hero",
    title: "Hint-Free Hero",
    description: "Solve a problem without using any hints",
    icon: "Brain",
    xpReward: 40,
    period: "daily",
    target: 1,
  },

  // ── Weekly ─────────────────────────────────────────────────────────────────
  full_house: {
    id: "full_house",
    title: "Full House",
    description: "Solve at least 1 problem in 4 different languages this week",
    icon: "Globe",
    xpReward: 200,
    period: "weekly",
    target: 4,
  },
  streak_keeper: {
    id: "streak_keeper",
    title: "Streak Keeper",
    description: "Solve at least one problem every day for 7 days straight",
    icon: "Flame",
    xpReward: 150,
    shieldReward: 1,
    period: "weekly",
    target: 7,
  },
  difficulty_climber: {
    id: "difficulty_climber",
    title: "Difficulty Climber",
    description: "Solve 1 Easy, 1 Medium, and 1 Hard problem this week",
    icon: "Mountain",
    xpReward: 250,
    period: "weekly",
    target: 3,
  },
};

export const DAILY_QUEST_IDS = ["daily_dose", "double_down", "hint_free_hero"];
export const WEEKLY_QUEST_IDS = ["full_house", "streak_keeper", "difficulty_climber"];

// ─── Period Helpers ───────────────────────────────────────────────────────────

export const getDayStart = (date = new Date()) => {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  const day = d.getUTCDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // Back to Monday
  d.setUTCDate(d.getUTCDate() + diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

const isSamePeriod = (storedDate, currentDate) =>
  new Date(storedDate).getTime() === currentDate.getTime();

const buildFreshQuests = (ids) =>
  ids.map((id) => ({ id, progress: 0, completed: false, claimed: false, meta: {} }));

// ─── Document Management ──────────────────────────────────────────────────────

/**
 * Gets the quest progress document for the current period, creating or
 * resetting it as needed. Race-condition safe via unique index + error handling.
 */
export const getOrInitQuests = async (userId, type) => {
  const periodStart = type === "daily" ? getDayStart() : getWeekStart();
  const questIds = type === "daily" ? DAILY_QUEST_IDS : WEEKLY_QUEST_IDS;

  let doc;
  try {
    doc = await UserQuestProgress.findOneAndUpdate(
      { userId, type },
      { $setOnInsert: { userId, type, periodStart, quests: buildFreshQuests(questIds) } },
      { upsert: true, new: true }
    );
  } catch (err) {
    if (err.code === 11000) {
      doc = await UserQuestProgress.findOne({ userId, type });
    } else {
      throw err;
    }
  }

  // Period has rolled over — reset quest state in-place
  if (!isSamePeriod(doc.periodStart, periodStart)) {
    doc.periodStart = periodStart;
    doc.quests = buildFreshQuests(questIds);
    await doc.save();
  }

  return doc;
};

/**
 * Merges static catalog metadata (title, description, icon, xpReward) into
 * each stored progress entry before sending to the client.
 */
export const enrichQuestDoc = (doc) => ({
  type: doc.type,
  periodStart: doc.periodStart,
  quests: doc.quests.map((q) => ({
    ...QUEST_CATALOG[q.id],
    progress: q.progress,
    completed: q.completed,
    claimed: q.claimed,
    meta: q.meta,
  })),
});

// ─── Difficulty Normalizer ────────────────────────────────────────────────────

const normalizeDifficulty = (difficulty) => {
  const d = (difficulty || "").toLowerCase();
  if (d === "expert") return "hard"; // expert counts as hard for quest tracking
  if (["easy", "medium", "hard"].includes(d)) return d;
  return null;
};

// ─── Progress Updates ─────────────────────────────────────────────────────────

/**
 * Called after a playground problem is successfully solved.
 * Updates all eligible quest progress for that user. Fire-and-forget safe.
 *
 * @param {string} userId
 * @param {{ language: string, difficulty: string, usedHints: boolean }} event
 */
export const onPlaygroundSolve = async (userId, { language, difficulty, usedHints }) => {
  const [daily, weekly] = await Promise.all([
    getOrInitQuests(userId, "daily"),
    getOrInitQuests(userId, "weekly"),
  ]);

  let dailyChanged = false;
  let weeklyChanged = false;

  // ── Daily Quest Updates ────────────────────────────────────────────────────
  for (const q of daily.quests) {
    if (q.claimed) continue;
    const def = QUEST_CATALOG[q.id];
    if (!def) continue;

    if ((q.id === "daily_dose" || q.id === "double_down") && q.progress < def.target) {
      q.progress = Math.min(def.target, q.progress + 1);
      if (q.progress >= def.target) q.completed = true;
      dailyChanged = true;
    }

    if (q.id === "hint_free_hero" && !usedHints && q.progress < def.target) {
      q.progress = Math.min(def.target, q.progress + 1);
      if (q.progress >= def.target) q.completed = true;
      dailyChanged = true;
    }
  }

  // ── Weekly Quest Updates ───────────────────────────────────────────────────
  for (const q of weekly.quests) {
    if (q.claimed) continue;
    const def = QUEST_CATALOG[q.id];
    if (!def) continue;

    if (q.id === "full_house") {
      const langs = new Set(q.meta.languages || []);
      langs.add(language);
      q.meta = { languages: [...langs] };
      q.progress = langs.size;
      if (q.progress >= def.target) q.completed = true;
      weeklyChanged = true;
    }

    if (q.id === "difficulty_climber") {
      const normalized = normalizeDifficulty(difficulty);
      if (normalized) {
        const solved = { ...(q.meta.solved || {}) };
        if (!solved[normalized]) {
          solved[normalized] = true;
          q.meta = { solved };
          q.progress = Object.keys(solved).length;
          if (q.progress >= def.target) q.completed = true;
          weeklyChanged = true;
        }
      }
    }
  }

  const saves = [];
  if (dailyChanged) { daily.markModified("quests"); saves.push(daily.save()); }
  if (weeklyChanged) { weekly.markModified("quests"); saves.push(weekly.save()); }
  if (saves.length) await Promise.all(saves);
};

/**
 * Syncs streak_keeper weekly quest progress to the user's current day streak.
 * Called after streak is incremented on a playground solve.
 */
export const updateStreakKeeperQuest = async (userId, dayStreak) => {
  const weekly = await getOrInitQuests(userId, "weekly");
  const q = weekly.quests.find((entry) => entry.id === "streak_keeper");
  if (!q || q.claimed) return;

  const def = QUEST_CATALOG["streak_keeper"];
  const newProgress = Math.min(def.target, dayStreak);

  if (newProgress !== q.progress) {
    q.progress = newProgress;
    if (q.progress >= def.target) q.completed = true;
    weekly.markModified("quests");
    await weekly.save();
  }
};

// ─── Claim Reward ─────────────────────────────────────────────────────────────

/**
 * Claims the XP (and optional shield) reward for a completed quest.
 * Throws descriptive errors so the controller can map them to HTTP status codes.
 */
export const claimQuestReward = async (userId, questId, period) => {
  if (!["daily", "weekly"].includes(period)) throw new Error("Invalid period");

  const def = QUEST_CATALOG[questId];
  if (!def || def.period !== period) throw new Error("Quest not found");

  const doc = await getOrInitQuests(userId, period);
  const quest = doc.quests.find((q) => q.id === questId);

  if (!quest) throw new Error("Quest not found");
  if (!quest.completed) throw new Error("Quest not yet completed");
  if (quest.claimed) throw new Error("Reward already claimed");

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Award XP through the central pipeline
  await addXP(user, def.xpReward, {}, { autoSave: false });

  // Award shield if this quest grants one (cap at 2)
  let shieldAwarded = 0;
  if (def.shieldReward) {
    const before = user.streakShields || 0;
    user.streakShields = Math.min(2, before + def.shieldReward);
    shieldAwarded = user.streakShields - before;
  }

  await user.save();

  quest.claimed = true;
  doc.markModified("quests");
  await doc.save();

  return { user, xpAwarded: def.xpReward, shieldAwarded };
};
