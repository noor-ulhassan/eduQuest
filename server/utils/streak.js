/**
 * Normalizes a date to start of the day (midnight) in local timezone
 * @param {Date|string|number} date Date input
 * @returns {number} Milliseconds since epoch at midnight
 */
const startOfDay = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**
 * Checks the user's current streak and resets it if they missed a day.
 * Does NOT increment. Used for stale checks (like logging in).
 *
 * @param {import('mongoose').Document} user - Mongoose User document
 * @param {Object} options - Options object
 * @param {boolean} [options.autoSave=true] - Whether to call user.save() automatically
 * @returns {Promise<import('mongoose').Document>} Updated user document
 */
export const checkStreak = async (user, options = { autoSave: true }) => {
  if (!user.lastSolvedDate) return user;

  const today = startOfDay(new Date());
  const lastActiveDay = startOfDay(user.lastSolvedDate);
  const daysDiff = Math.floor((today - lastActiveDay) / MS_PER_DAY);

  // If > 1 day has passed they broke the streak — but shields can save them.
  if (daysDiff > 1 && user.dayStreak > 0) {
    if (daysDiff === 2 && (user.streakShields || 0) > 0) {
      // Exactly 1 missed day + shield available — consume shield, protect streak.
      // Set lastSolvedDate to yesterday so incrementStreak sees daysDiff = 1.
      user.streakShields -= 1;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      user.lastSolvedDate = yesterday;
    } else {
      user.dayStreak = 0;
    }
    if (options.autoSave !== false) {
      await user.save();
    }
  }

  return user;
};

/**
 * Increments a user's streak. Used when they actually solve a problem or complete an activity.
 *
 * @param {import('mongoose').Document} user - Mongoose User document
 * @param {Object} options - Options object
 * @param {boolean} [options.autoSave=true] - Whether to call user.save() automatically
 * @returns {Promise<import('mongoose').Document>} Updated user document
 */
export const incrementStreak = async (user, options = { autoSave: true }) => {
  const today = startOfDay(new Date());

  if (!user.lastSolvedDate) {
    // First time solving ever
    user.dayStreak = 1;
  } else {
    const lastActiveDay = startOfDay(user.lastSolvedDate);
    const daysDiff = Math.floor((today - lastActiveDay) / MS_PER_DAY);

    if (daysDiff === 0) {
      // Solved another problem on the same day.
      // Ensure streak is at least 1 (in case it was somehow 0)
      user.dayStreak = Math.max(user.dayStreak || 1, 1);
    } else if (daysDiff === 1) {
      // Solved yesterday, increment today!
      user.dayStreak = (user.dayStreak || 0) + 1;
    } else if (daysDiff === 2 && (user.streakShields || 0) > 0) {
      // Missed exactly 1 day — shield absorbs it, streak continues
      user.streakShields -= 1;
      user.dayStreak = (user.dayStreak || 0) + 1;
    } else {
      // Missed 2+ days or no shield — streak resets to 1
      user.dayStreak = 1;
    }
  }

  // Update their last solved date to right now
  user.lastSolvedDate = new Date();
  
  if (options.autoSave !== false) {
    await user.save();
  }

  return user;
};
