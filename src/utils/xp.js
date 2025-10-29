/**
 * XP System Utilities
 *
 * Centralized XP calculation and reward system
 */

import StorageService from './storage';

// XP reward amounts for different activities
export const XP_REWARDS = {
  // Accent Tutor
  ACCENT_PRACTICE_COMPLETE: 30,
  ACCENT_HIGH_SCORE: 50, // Score >= 8
  ACCENT_PERFECT_SCORE: 100, // Score = 10

  // Music Lessons
  LYRICS_LESSON_COMPLETE: 50,
  LYRICS_EXERCISE_CORRECT: 10,
  LYRICS_ALL_EXERCISES_PERFECT: 100,
  SONG_ADDED_TO_LIBRARY: 5,

  // Custom Lessons
  CUSTOM_LESSON_CREATED: 50,
  CUSTOM_LESSON_COMPLETED: 40,

  // Reading
  STORY_READ_COMPLETE: 25,
  WORD_LEARNED: 5,
  ADAPTIVE_LAYER_EXPLORED: 10,

  // Practice/Conversation
  CONVERSATION_MESSAGE: 5,
  CONVERSATION_SESSION_COMPLETE: 40, // 10+ messages

  // Story Generation
  STORY_GENERATED: 20,
  STORY_IMPORTED: 15,

  // Daily Bonuses
  DAILY_FIRST_ACTIVITY: 25,
  STREAK_BONUS_PER_DAY: 10, // Multiplied by streak

  // Milestones
  LESSONS_MILESTONE_10: 100,
  LESSONS_MILESTONE_25: 250,
  LESSONS_MILESTONE_50: 500,
  WORDS_MILESTONE_100: 150,
  WORDS_MILESTONE_500: 500,
};

/**
 * Award XP to the user
 * @param {number} amount - Amount of XP to award
 * @param {string} reason - Reason for the XP (for logging/achievements)
 * @returns {Promise<Object>} Updated progress object
 */
export async function awardXP(amount, reason = '') {
  try {
    const result = await StorageService.addXP(amount);

    if (result.success) {
      const progress = await StorageService.getUserProgress();

      // Check for level-up or milestones
      checkMilestones(progress);

      console.log(`[XP] Awarded ${amount} XP: ${reason}`);

      return {
        success: true,
        newXP: result.newXP,
        amount,
        reason,
        progress,
      };
    }

    return { success: false };
  } catch (error) {
    console.error('[XP] Error awarding XP:', error);
    return { success: false, error };
  }
}

/**
 * Award XP for completing an accent tutor session
 * @param {number} score - Score out of 10
 * @returns {Promise<Object>}
 */
export async function awardAccentTutorXP(score) {
  let amount = XP_REWARDS.ACCENT_PRACTICE_COMPLETE;
  let reason = 'Accent practice session';

  if (score === 10) {
    amount = XP_REWARDS.ACCENT_PERFECT_SCORE;
    reason = 'Perfect accent score!';
  } else if (score >= 8) {
    amount = XP_REWARDS.ACCENT_HIGH_SCORE;
    reason = 'Great accent practice!';
  }

  return await awardXP(amount, reason);
}

/**
 * Award XP for completing a lyrics lesson
 * @param {number} correctAnswers - Number of correct answers
 * @param {number} totalQuestions - Total number of questions
 * @returns {Promise<Object>}
 */
export async function awardLyricsLessonXP(correctAnswers, totalQuestions) {
  let amount = XP_REWARDS.LYRICS_LESSON_COMPLETE;
  let reason = 'Lyrics lesson completed';

  // Bonus for perfect score
  if (correctAnswers === totalQuestions && totalQuestions > 0) {
    amount += XP_REWARDS.LYRICS_ALL_EXERCISES_PERFECT;
    reason = 'Perfect lyrics lesson!';

    // Unlock achievement
    await StorageService.unlockAchievement('perfect_lyrics_lesson');
  }

  // Add XP per correct answer
  amount += correctAnswers * XP_REWARDS.LYRICS_EXERCISE_CORRECT;

  return await awardXP(amount, reason);
}

/**
 * Award XP for creating a custom lesson
 * @returns {Promise<Object>}
 */
export async function awardCustomLessonCreatedXP() {
  return await awardXP(
    XP_REWARDS.CUSTOM_LESSON_CREATED,
    'Custom lesson created'
  );
}

/**
 * Award XP for completing a custom lesson
 * @returns {Promise<Object>}
 */
export async function awardCustomLessonCompletedXP() {
  return await awardXP(
    XP_REWARDS.CUSTOM_LESSON_COMPLETED,
    'Custom lesson completed'
  );
}

/**
 * Award XP for reading a story
 * @returns {Promise<Object>}
 */
export async function awardStoryReadXP() {
  return await awardXP(XP_REWARDS.STORY_READ_COMPLETE, 'Story completed');
}

/**
 * Award XP for learning a word
 * @returns {Promise<Object>}
 */
export async function awardWordLearnedXP() {
  const progress = await StorageService.getUserProgress();
  progress.wordsLearned = (progress.wordsLearned || 0) + 1;
  await StorageService.saveUserProgress(progress);

  return await awardXP(XP_REWARDS.WORD_LEARNED, 'New word learned');
}

/**
 * Award XP for conversation practice
 * @param {number} messageCount - Number of messages in conversation
 * @returns {Promise<Object>}
 */
export async function awardConversationXP(messageCount) {
  let amount = messageCount * XP_REWARDS.CONVERSATION_MESSAGE;
  let reason = 'Conversation practice';

  // Bonus for completing a full session (10+ messages)
  if (messageCount >= 10) {
    amount += XP_REWARDS.CONVERSATION_SESSION_COMPLETE;
    reason = 'Conversation session completed!';
  }

  return await awardXP(amount, reason);
}

/**
 * Award XP for generating a story
 * @returns {Promise<Object>}
 */
export async function awardStoryGeneratedXP() {
  return await awardXP(XP_REWARDS.STORY_GENERATED, 'Story generated');
}

/**
 * Award XP for adding a song to library
 * @returns {Promise<Object>}
 */
export async function awardSongAddedXP() {
  return await awardXP(XP_REWARDS.SONG_ADDED_TO_LIBRARY, 'Song added');
}

/**
 * Award daily first activity bonus
 * @returns {Promise<Object>}
 */
export async function awardDailyFirstActivityXP() {
  const progress = await StorageService.getUserProgress();
  const today = new Date().toDateString();
  const lastActivity = progress.lastActivityDate;

  // Check if this is the first activity today
  if (lastActivity !== today) {
    progress.lastActivityDate = today;

    // Update streak
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (lastActivity === yesterday) {
      progress.streak = (progress.streak || 0) + 1;
    } else if (lastActivity !== today) {
      progress.streak = 1;
    }

    await StorageService.saveUserProgress(progress);

    // Award streak bonus
    const streakBonus = progress.streak * XP_REWARDS.STREAK_BONUS_PER_DAY;
    const totalXP = XP_REWARDS.DAILY_FIRST_ACTIVITY + streakBonus;

    return await awardXP(
      totalXP,
      `Daily bonus + ${progress.streak} day streak!`
    );
  }

  return { success: false, reason: 'Already claimed today' };
}

/**
 * Check for milestone achievements
 * @param {Object} progress - User progress object
 */
async function checkMilestones(progress) {
  const { lessonsCompleted, wordsLearned, xp } = progress;

  // Lessons milestones
  if (lessonsCompleted === 10) {
    await StorageService.unlockAchievement('lessons_10');
    await awardXP(XP_REWARDS.LESSONS_MILESTONE_10, '10 lessons milestone!');
  } else if (lessonsCompleted === 25) {
    await StorageService.unlockAchievement('lessons_25');
    await awardXP(XP_REWARDS.LESSONS_MILESTONE_25, '25 lessons milestone!');
  } else if (lessonsCompleted === 50) {
    await StorageService.unlockAchievement('lessons_50');
    await awardXP(XP_REWARDS.LESSONS_MILESTONE_50, '50 lessons milestone!');
  }

  // Words milestones
  if (wordsLearned === 100) {
    await StorageService.unlockAchievement('words_100');
    await awardXP(XP_REWARDS.WORDS_MILESTONE_100, '100 words learned!');
  } else if (wordsLearned === 500) {
    await StorageService.unlockAchievement('words_500');
    await awardXP(XP_REWARDS.WORDS_MILESTONE_500, '500 words learned!');
  }
}

/**
 * Increment lessons completed counter
 * @returns {Promise<void>}
 */
export async function incrementLessonsCompleted() {
  const progress = await StorageService.getUserProgress();
  progress.lessonsCompleted = (progress.lessonsCompleted || 0) + 1;
  await StorageService.saveUserProgress(progress);
}

/**
 * Add time spent learning (in seconds)
 * @param {number} seconds - Seconds spent learning
 * @returns {Promise<void>}
 */
export async function addTimeSpent(seconds) {
  const progress = await StorageService.getUserProgress();
  progress.timeSpent = (progress.timeSpent || 0) + seconds;
  await StorageService.saveUserProgress(progress);
}

/**
 * Calculate current level based on XP
 * @param {number} xp - Current XP
 * @returns {Object} Level info
 */
export function calculateLevel(xp) {
  // Level formula: XP needed for level N = N * 100
  // Level 1: 0-99 XP
  // Level 2: 100-299 XP
  // Level 3: 300-599 XP
  // etc.

  let level = 1;
  let xpForCurrentLevel = 0;
  let xpForNextLevel = 100;

  while (xp >= xpForNextLevel) {
    level++;
    xpForCurrentLevel = xpForNextLevel;
    xpForNextLevel += level * 100;
  }

  const xpInCurrentLevel = xp - xpForCurrentLevel;
  const xpNeededForNextLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercent = (xpInCurrentLevel / xpNeededForNextLevel) * 100;

  return {
    level,
    xpInCurrentLevel,
    xpNeededForNextLevel,
    progressPercent,
    totalXP: xp,
  };
}

/**
 * Get XP summary for display
 * @returns {Promise<Object>}
 */
export async function getXPSummary() {
  const progress = await StorageService.getUserProgress();
  const levelInfo = calculateLevel(progress.xp);

  return {
    ...levelInfo,
    streak: progress.streak || 0,
    lessonsCompleted: progress.lessonsCompleted || 0,
    wordsLearned: progress.wordsLearned || 0,
    achievements: progress.achievements || [],
  };
}
