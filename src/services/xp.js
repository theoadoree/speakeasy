/**
 * XP Service - Manages experience points across all app activities
 *
 * This service defines XP rewards for different activities and provides
 * methods to calculate and award XP consistently across the app.
 */

// XP reward values for different activities
export const XP_REWARDS = {
  // Lesson activities
  LESSON_START: 5,
  LESSON_COMPLETE: 50,
  LESSON_PERFECT_SCORE: 25, // Bonus for 100% quiz score

  // Quiz activities
  QUIZ_ATTEMPT: 10,
  QUIZ_PASS: 30,
  QUIZ_PERFECT: 50,
  QUIZ_QUESTION_CORRECT: 5,

  // Reading activities
  READING_START: 5,
  READING_COMPLETE: 20,
  WORD_LOOKUP: 1,

  // Practice/Conversation activities
  CONVERSATION_MESSAGE: 2,
  CONVERSATION_SESSION: 15, // Per 5 minutes
  VOICE_PRACTICE: 10,

  // Music/Lyrics activities
  LYRICS_LESSON_START: 5,
  LYRICS_LESSON_COMPLETE: 30,
  SONG_TRANSLATION: 20,

  // Custom lesson activities
  CUSTOM_LESSON_CREATE: 15,
  CUSTOM_LESSON_COMPLETE: 25,

  // Review activities
  REVIEW_LESSON_GENERATE: 10,
  REVIEW_LESSON_COMPLETE: 35,
  REVIEW_EXERCISE_CORRECT: 5,

  // Accent tutor activities
  PRONUNCIATION_PRACTICE: 10,
  ACCENT_SESSION_COMPLETE: 25,

  // Streak bonuses
  DAILY_LOGIN: 10,
  STREAK_MILESTONE_5: 25,
  STREAK_MILESTONE_10: 50,
  STREAK_MILESTONE_30: 100,
  STREAK_MILESTONE_100: 500,

  // Achievement bonuses
  FIRST_LESSON: 50,
  FIRST_QUIZ: 25,
  FIRST_CONVERSATION: 30,
  LEVEL_UP: 100,

  // Social/competitive
  LEAGUE_PROMOTION: 200,
  TOP_3_FINISH: 150,
  TOP_10_FINISH: 75
};

class XPService {
  /**
   * Award XP for a specific activity
   * @param {string} activityType - Type of activity from XP_REWARDS
   * @param {Object} options - Additional options (multiplier, bonus, etc.)
   * @returns {number} XP amount awarded
   */
  awardXP(activityType, options = {}) {
    let baseXP = XP_REWARDS[activityType] || 0;

    if (baseXP === 0) {
      console.warn(`Unknown activity type: ${activityType}`);
      return 0;
    }

    // Apply multiplier (e.g., for premium users, double XP events)
    const multiplier = options.multiplier || 1;

    // Apply additional bonus (e.g., for perfect scores, speed bonuses)
    const bonus = options.bonus || 0;

    const totalXP = Math.round((baseXP * multiplier) + bonus);

    return totalXP;
  }

  /**
   * Calculate XP for quiz completion based on score
   * @param {number} score - Quiz score (0-100)
   * @param {number} totalQuestions - Total questions in quiz
   * @param {number} correctAnswers - Number of correct answers
   * @returns {Object} XP breakdown
   */
  calculateQuizXP(score, totalQuestions, correctAnswers) {
    let xp = 0;
    const breakdown = [];

    // Base XP for attempting
    xp += this.awardXP('QUIZ_ATTEMPT');
    breakdown.push({ reason: 'Quiz attempt', xp: XP_REWARDS.QUIZ_ATTEMPT });

    // XP per correct answer
    const questionXP = correctAnswers * XP_REWARDS.QUIZ_QUESTION_CORRECT;
    xp += questionXP;
    breakdown.push({ reason: `${correctAnswers} correct answers`, xp: questionXP });

    // Passing bonus (70%+)
    if (score >= 70) {
      xp += this.awardXP('QUIZ_PASS');
      breakdown.push({ reason: 'Quiz passed', xp: XP_REWARDS.QUIZ_PASS });
    }

    // Perfect score bonus
    if (score === 100) {
      xp += this.awardXP('QUIZ_PERFECT');
      breakdown.push({ reason: 'Perfect score!', xp: XP_REWARDS.QUIZ_PERFECT });
    }

    return { total: xp, breakdown };
  }

  /**
   * Calculate XP for lesson completion
   * @param {number} timeSpent - Time spent in seconds
   * @param {number} quizScore - Quiz score if quiz was taken
   * @param {boolean} isFirstTime - First time completing this lesson
   * @returns {Object} XP breakdown
   */
  calculateLessonXP(timeSpent, quizScore = null, isFirstTime = false) {
    let xp = 0;
    const breakdown = [];

    // Base completion XP
    xp += this.awardXP('LESSON_COMPLETE');
    breakdown.push({ reason: 'Lesson completed', xp: XP_REWARDS.LESSON_COMPLETE });

    // First time bonus
    if (isFirstTime) {
      xp += this.awardXP('FIRST_LESSON');
      breakdown.push({ reason: 'First lesson bonus!', xp: XP_REWARDS.FIRST_LESSON });
    }

    // Quiz score bonus
    if (quizScore !== null && quizScore === 100) {
      xp += this.awardXP('LESSON_PERFECT_SCORE');
      breakdown.push({ reason: 'Perfect quiz score', xp: XP_REWARDS.LESSON_PERFECT_SCORE });
    }

    return { total: xp, breakdown };
  }

  /**
   * Calculate XP for conversation practice
   * @param {number} messageCount - Number of messages sent
   * @param {number} durationSeconds - Duration of conversation
   * @returns {Object} XP breakdown
   */
  calculateConversationXP(messageCount, durationSeconds) {
    let xp = 0;
    const breakdown = [];

    // XP per message
    const messageXP = messageCount * XP_REWARDS.CONVERSATION_MESSAGE;
    xp += messageXP;
    breakdown.push({ reason: `${messageCount} messages`, xp: messageXP });

    // Session bonuses (per 5 minutes)
    const sessionBonuses = Math.floor(durationSeconds / 300); // 300 seconds = 5 minutes
    if (sessionBonuses > 0) {
      const sessionXP = sessionBonuses * XP_REWARDS.CONVERSATION_SESSION;
      xp += sessionXP;
      breakdown.push({ reason: `${sessionBonuses}x session bonus`, xp: sessionXP });
    }

    return { total: xp, breakdown };
  }

  /**
   * Calculate streak bonus XP
   * @param {number} streakDays - Current streak in days
   * @returns {Object} XP breakdown
   */
  calculateStreakBonus(streakDays) {
    let xp = 0;
    const breakdown = [];

    // Daily login
    xp += this.awardXP('DAILY_LOGIN');
    breakdown.push({ reason: 'Daily login', xp: XP_REWARDS.DAILY_LOGIN });

    // Milestone bonuses
    const milestones = [
      { days: 5, key: 'STREAK_MILESTONE_5' },
      { days: 10, key: 'STREAK_MILESTONE_10' },
      { days: 30, key: 'STREAK_MILESTONE_30' },
      { days: 100, key: 'STREAK_MILESTONE_100' }
    ];

    for (const milestone of milestones) {
      if (streakDays === milestone.days) {
        const milestoneXP = this.awardXP(milestone.key);
        xp += milestoneXP;
        breakdown.push({
          reason: `${milestone.days}-day streak milestone!`,
          xp: milestoneXP
        });
        break;
      }
    }

    return { total: xp, breakdown };
  }

  /**
   * Calculate review lesson XP
   * @param {number} exerciseCount - Number of exercises
   * @param {number} correctCount - Number correct
   * @param {number} score - Overall score percentage
   * @returns {Object} XP breakdown
   */
  calculateReviewXP(exerciseCount, correctCount, score) {
    let xp = 0;
    const breakdown = [];

    // Base completion XP
    xp += this.awardXP('REVIEW_LESSON_COMPLETE');
    breakdown.push({ reason: 'Review completed', xp: XP_REWARDS.REVIEW_LESSON_COMPLETE });

    // XP per correct answer
    const correctXP = correctCount * XP_REWARDS.REVIEW_EXERCISE_CORRECT;
    xp += correctXP;
    breakdown.push({ reason: `${correctCount} correct`, xp: correctXP });

    // Perfect bonus
    if (score === 100) {
      const bonus = 25;
      xp += bonus;
      breakdown.push({ reason: 'Perfect review!', xp: bonus });
    }

    return { total: xp, breakdown };
  }

  /**
   * Get level from XP amount
   * @param {number} xp - Total XP
   * @returns {Object} Level and progress info
   */
  getLevelFromXP(xp) {
    // XP required doubles every 5 levels, starting at 100
    let level = 1;
    let xpForNextLevel = 100;
    let totalXPRequired = 0;

    while (xp >= totalXPRequired + xpForNextLevel) {
      totalXPRequired += xpForNextLevel;
      level++;

      // Increase XP requirement every 5 levels
      if (level % 5 === 0) {
        xpForNextLevel = Math.floor(xpForNextLevel * 1.5);
      }
    }

    const xpInCurrentLevel = xp - totalXPRequired;
    const progressPercent = Math.round((xpInCurrentLevel / xpForNextLevel) * 100);

    return {
      level,
      xpInCurrentLevel,
      xpForNextLevel,
      totalXP: xp,
      progressPercent,
      xpToNextLevel: xpForNextLevel - xpInCurrentLevel
    };
  }

  /**
   * Format XP amount for display
   * @param {number} xp - XP amount
   * @returns {string} Formatted string
   */
  formatXP(xp) {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M XP`;
    } else if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}K XP`;
    }
    return `${xp} XP`;
  }
}

export default new XPService();
