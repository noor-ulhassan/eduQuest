/**
 * Shared level progression utilities — mirrors server/utils/progression.js.
 * Formula: XP to start level N = 25 * (N-1) * (N+2)
 * Each level costs exactly 50 XP more than the previous one.
 */

export const getXPForLevel = (level) => {
  if (level <= 1) return 0;
  return 25 * (level - 1) * (level + 2);
};

export const getLevelFromXP = (xp) => {
  if (!xp || xp <= 0) return 1;
  return Math.max(1, Math.floor((-1 + Math.sqrt(9 + 4 * xp / 25)) / 2));
};

/**
 * Returns progress breakdown for displaying level progress bars.
 * Use this everywhere "X XP to next level" or a progress bar is shown.
 */
export const getLevelProgress = (xp, level) => {
  const currentLevelXP = getXPForLevel(level);
  const nextLevelXP = getXPForLevel(level + 1);
  const xpInLevel = Math.max(0, xp - currentLevelXP);
  const xpNeeded = nextLevelXP - currentLevelXP;
  return {
    xpInLevel,
    xpNeeded,
    xpToNextLevel: Math.max(0, xpNeeded - xpInLevel),
    progressPercent: Math.min(100, (xpInLevel / xpNeeded) * 100),
  };
};
