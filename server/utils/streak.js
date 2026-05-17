/**

 * @param {Date|string|number} date 
 * @returns {number} 
 */
const startOfDay = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

/**

 *
 * @param {import('mongoose').Document} user 
 * @param {Object} options 
 * @param {boolean} [options.autoSave=true] 
 * @returns {Promise<import('mongoose').Document>} 
 */
export const checkStreak = async (user, options = { autoSave: true }) => {
  if (!user.lastSolvedDate) return user;

  const today = startOfDay(new Date());
  const lastActiveDay = startOfDay(user.lastSolvedDate);
  const daysDiff = Math.floor((today - lastActiveDay) / MS_PER_DAY);

  if (daysDiff > 1 && user.dayStreak > 0) {
    if (daysDiff === 2 && (user.streakShields || 0) > 0) {
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
 
 * @param {import('mongoose').Document} user 
 * @param {Object} options 
 * @param {boolean} [options.autoSave=true]
 * @returns {Promise<import('mongoose').Document>} 
 */
export const incrementStreak = async (user, options = { autoSave: true }) => {
  const today = startOfDay(new Date());

  if (!user.lastSolvedDate) {
    user.dayStreak = 1;
  } else {
    const lastActiveDay = startOfDay(user.lastSolvedDate);
    const daysDiff = Math.floor((today - lastActiveDay) / MS_PER_DAY);

    if (daysDiff === 0) {
      user.dayStreak = Math.max(user.dayStreak || 1, 1);
    } else if (daysDiff === 1) {
      user.dayStreak = (user.dayStreak || 0) + 1;
    } else if (daysDiff === 2 && (user.streakShields || 0) > 0) {
      user.streakShields -= 1;
      user.dayStreak = (user.dayStreak || 0) + 1;
    } else {
      user.dayStreak = 1;
    }
  }

  user.lastSolvedDate = new Date();

  if (options.autoSave !== false) {
    await user.save();
  }

  return user;
};
