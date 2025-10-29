/**
 * LessonService - Manages lesson progression, content delivery, and quiz integration
 */

import { LESSONS, getLessonContent, getLessonsByPhase, getLessonRequirements } from '../config/lessons.config';
import { getQuizForLesson, calculateQuizScore, didPassQuiz } from '../config/quizzes.config';
import LLMService from './llm';

class LessonService {
  constructor() {
    this.currentLesson = null;
    this.lessonProgress = {};
  }

  /**
   * Initialize lesson service with user progress
   */
  initialize(progressData) {
    this.lessonProgress = progressData || {};
  }

  /**
   * Get lesson by ID with language-specific content
   */
  getLesson(lessonId, targetLanguage) {
    return getLessonContent(lessonId, targetLanguage);
  }

  /**
   * Get all lessons organized by phase
   */
  getLessonCurriculum() {
    return {
      phase1: getLessonsByPhase(1),
      phase2: getLessonsByPhase(2),
      phase3: getLessonsByPhase(3),
      phase4: getLessonsByPhase(4),
    };
  }

  /**
   * Check if a lesson is unlocked for the user
   */
  isLessonUnlocked(lessonId, userProgress) {
    if (lessonId === 1) return true; // First lesson always unlocked

    const requirements = getLessonRequirements(lessonId);
    const prerequisiteLessons = requirements.prerequisiteLessons || [];

    // Check if all prerequisite lessons are completed
    return prerequisiteLessons.every(prereqId => {
      const progress = userProgress[prereqId];
      return progress && progress.completed && progress.quizPassed;
    });
  }

  /**
   * Get user's current lesson (next uncompleted lesson)
   */
  getCurrentLesson(userProgress) {
    for (let i = 1; i <= LESSONS.length; i++) {
      const progress = userProgress[i];
      if (!progress || !progress.completed || !progress.quizPassed) {
        if (this.isLessonUnlocked(i, userProgress)) {
          return i;
        }
        return null; // Lesson exists but is locked
      }
    }
    return null; // All lessons completed!
  }

  /**
   * Calculate overall progress percentage
   */
  calculateProgress(userProgress) {
    const totalLessons = LESSONS.length;
    const completedLessons = Object.values(userProgress).filter(
      p => p.completed && p.quizPassed
    ).length;

    return {
      percentage: Math.round((completedLessons / totalLessons) * 100),
      completed: completedLessons,
      total: totalLessons,
      currentLesson: this.getCurrentLesson(userProgress),
    };
  }

  /**
   * Get progress for a specific phase
   */
  getPhaseProgress(phase, userProgress) {
    const phaseLessons = getLessonsByPhase(phase);
    const completedInPhase = phaseLessons.filter(lesson => {
      const progress = userProgress[lesson.id];
      return progress && progress.completed && progress.quizPassed;
    }).length;

    return {
      phase,
      percentage: Math.round((completedInPhase / phaseLessons.length) * 100),
      completed: completedInPhase,
      total: phaseLessons.length,
    };
  }

  /**
   * Mark lesson as started
   */
  startLesson(lessonId) {
    return {
      lessonId,
      started: true,
      startedAt: new Date().toISOString(),
      completed: false,
      quizPassed: false,
    };
  }

  /**
   * Mark lesson as completed (before quiz)
   */
  completeLesson(lessonId, timeSpent) {
    return {
      lessonId,
      completed: true,
      completedAt: new Date().toISOString(),
      timeSpent,
      quizPassed: false,
    };
  }

  /**
   * Record quiz attempt
   */
  recordQuizAttempt(lessonId, answers, correctAnswers) {
    const quiz = getQuizForLesson(lessonId);
    if (!quiz) {
      throw new Error(`No quiz found for lesson ${lessonId}`);
    }

    const result = calculateQuizScore(answers, correctAnswers);
    const passed = didPassQuiz(lessonId, result.score);

    return {
      attemptedAt: new Date().toISOString(),
      score: result.score,
      earnedPoints: result.earnedPoints,
      totalPoints: result.totalPoints,
      passed,
      answers,
    };
  }

  /**
   * Update lesson progress with quiz results
   */
  updateLessonWithQuiz(lessonProgress, quizAttempt) {
    const attempts = lessonProgress.quizAttempts || [];
    attempts.push(quizAttempt);

    return {
      ...lessonProgress,
      quizAttempts: attempts,
      quizPassed: quizAttempt.passed,
      bestQuizScore: Math.max(
        quizAttempt.score,
        lessonProgress.bestQuizScore || 0
      ),
      quizCompletedAt: quizAttempt.passed ? new Date().toISOString() : lessonProgress.quizCompletedAt,
    };
  }

  /**
   * Generate AI-powered lesson content using LLM
   */
  async generateLessonContent(lessonId, targetLanguage, userLevel) {
    const lesson = this.getLesson(lessonId, targetLanguage);
    if (!lesson) {
      throw new Error(`Lesson ${lessonId} not found`);
    }

    const prompt = `Generate a personalized lesson for "${lesson.title}" in ${targetLanguage} for a ${userLevel} learner.

Lesson Objectives:
${lesson.objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

Topics to cover: ${lesson.topics.join(', ')}

Create:
1. A brief introduction (2-3 sentences)
2. 3 example sentences demonstrating the concepts
3. A short dialogue (4-6 exchanges) using the lesson vocabulary
4. 2 practical exercises

Format as JSON with keys: introduction, examples, dialogue, exercises`;

    try {
      const response = await LLMService.generateText(prompt, targetLanguage, userLevel);
      return this.parseLessonContent(response);
    } catch (error) {
      console.error('Error generating lesson content:', error);
      // Return fallback content
      return this.getFallbackContent(lesson);
    }
  }

  /**
   * Parse AI-generated lesson content
   */
  parseLessonContent(response) {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(response);
      return parsed;
    } catch (e) {
      // If not valid JSON, parse as structured text
      return {
        introduction: this.extractSection(response, 'introduction'),
        examples: this.extractSection(response, 'examples'),
        dialogue: this.extractSection(response, 'dialogue'),
        exercises: this.extractSection(response, 'exercises'),
      };
    }
  }

  /**
   * Extract section from text response
   */
  extractSection(text, sectionName) {
    const regex = new RegExp(`${sectionName}:?\\s*([\\s\\S]*?)(?=\\n\\n|\\d+\\.|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : '';
  }

  /**
   * Get fallback content when AI generation fails
   */
  getFallbackContent(lesson) {
    return {
      introduction: `Welcome to ${lesson.title}! In this lesson, you will learn: ${lesson.objectives.join(', ')}.`,
      examples: lesson.vocabulary?.slice(0, 3).join(', ') || 'Practice examples will be provided.',
      dialogue: 'Interactive dialogue available in the practice section.',
      exercises: 'Complete the exercises to reinforce your learning.',
    };
  }

  /**
   * Generate AI roleplay scenario for lesson
   */
  async generateRoleplayScenario(lessonId, targetLanguage, userLevel) {
    const lesson = this.getLesson(lessonId, targetLanguage);
    if (!lesson || !lesson.aiRoleplay) {
      return null;
    }

    const { scenario, prompts } = lesson.aiRoleplay;

    const systemPrompt = `You are a language learning AI tutor conducting a roleplay scenario: "${scenario}" in ${targetLanguage}.

Your role: ${prompts.join(', ')}

Guidelines:
- Use ${userLevel}-appropriate language
- Encourage the learner to use lesson vocabulary
- Provide gentle corrections
- Keep responses concise (1-2 sentences)
- Be supportive and encouraging

Adapt your language complexity to the user's level.`;

    return {
      scenario,
      systemPrompt,
      suggestedPrompts: this.generateSuggestedPrompts(lesson, targetLanguage),
    };
  }

  /**
   * Generate suggested prompts for user during roleplay
   */
  generateSuggestedPrompts(lesson, targetLanguage) {
    const languageSpecific = lesson.languageSpecificContent;

    if (languageSpecific.phrases) {
      // Extract phrases from language-specific content
      const phrases = Array.isArray(languageSpecific.phrases)
        ? languageSpecific.phrases
        : Object.values(languageSpecific.phrases).flat();

      return phrases.slice(0, 3);
    }

    return ['Try using the new vocabulary', 'Practice the grammar structure', 'Ask a question'];
  }

  /**
   * Generate quiz questions using AI (for dynamic quizzes)
   */
  async generateDynamicQuiz(lessonId, targetLanguage, userLevel) {
    const lesson = this.getLesson(lessonId, targetLanguage);
    const baseQuiz = getQuizForLesson(lessonId);

    if (!lesson || !baseQuiz) {
      throw new Error(`Cannot generate quiz for lesson ${lessonId}`);
    }

    const prompt = `Generate ${baseQuiz.questions.length} quiz questions in ${targetLanguage} for the lesson "${lesson.title}".

Question types needed:
${baseQuiz.questions.map(q => `- ${q.type}: ${q.instruction}`).join('\n')}

Focus areas: ${lesson.topics.join(', ')}
User level: ${userLevel}

Return as JSON array with format:
[
  {
    "id": "q1",
    "type": "multiple_choice",
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "explanation": "..."
  },
  ...
]`;

    try {
      const response = await LLMService.generateText(prompt, targetLanguage, userLevel);
      return JSON.parse(response);
    } catch (error) {
      console.error('Error generating dynamic quiz:', error);
      return null;
    }
  }

  /**
   * Get achievement for completing lesson/phase
   */
  getAchievement(lessonId, userProgress) {
    const lesson = LESSONS.find(l => l.id === lessonId);
    if (!lesson) return null;

    const achievements = [];

    // Lesson completion achievement
    achievements.push({
      type: 'lesson_complete',
      title: `Completed: ${lesson.title}`,
      description: lesson.unlocks,
      icon: '🎯',
    });

    // Phase completion achievement
    const phaseProgress = this.getPhaseProgress(lesson.phase, userProgress);
    if (phaseProgress.percentage === 100) {
      const phaseNames = {
        1: 'Foundation',
        2: 'Daily Life',
        3: 'Communication',
        4: 'Fluency',
      };

      achievements.push({
        type: 'phase_complete',
        title: `Phase ${lesson.phase} Complete!`,
        description: `You've mastered ${phaseNames[lesson.phase]}!`,
        icon: '🏆',
      });
    }

    // Perfect quiz achievement
    const lessonProgress = userProgress[lessonId];
    if (lessonProgress && lessonProgress.bestQuizScore === 100) {
      achievements.push({
        type: 'perfect_quiz',
        title: 'Perfect Score!',
        description: `100% on ${lesson.title} quiz`,
        icon: '⭐',
      });
    }

    // Streak achievements
    if (this.checkStreak(userProgress) >= 7) {
      achievements.push({
        type: 'streak',
        title: '7-Day Streak!',
        description: 'You\'re on fire! Keep it up!',
        icon: '🔥',
      });
    }

    return achievements;
  }

  /**
   * Check user's current learning streak
   */
  checkStreak(userProgress) {
    const completionDates = Object.values(userProgress)
      .filter(p => p.completedAt)
      .map(p => new Date(p.completedAt).toDateString())
      .sort((a, b) => new Date(b) - new Date(a));

    if (completionDates.length === 0) return 0;

    let streak = 1;
    const today = new Date().toDateString();
    let currentDate = new Date(today);

    for (let i = 0; i < completionDates.length - 1; i++) {
      const current = new Date(completionDates[i]);
      const next = new Date(completionDates[i + 1]);
      const diffDays = Math.floor((current - next) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        streak++;
      } else if (diffDays > 1) {
        break;
      }
    }

    return streak;
  }

  /**
   * Get recommended next lesson based on performance
   */
  getRecommendedLesson(userProgress, weakAreas = []) {
    const currentLesson = this.getCurrentLesson(userProgress);

    if (currentLesson) {
      return {
        lessonId: currentLesson,
        reason: 'next_in_sequence',
      };
    }

    // If weak areas identified, recommend review
    if (weakAreas.length > 0) {
      const reviewLesson = LESSONS.find(l =>
        l.topics.some(topic => weakAreas.includes(topic))
      );

      if (reviewLesson) {
        return {
          lessonId: reviewLesson.id,
          reason: 'review_weak_areas',
          weakTopics: weakAreas,
        };
      }
    }

    return null;
  }

  /**
   * Export progress report
   */
  generateProgressReport(userProgress, targetLanguage) {
    const overall = this.calculateProgress(userProgress);
    const phases = [1, 2, 3, 4].map(phase => this.getPhaseProgress(phase, userProgress));

    const completedLessons = Object.entries(userProgress)
      .filter(([_, progress]) => progress.completed && progress.quizPassed)
      .map(([lessonId, progress]) => ({
        lessonId: parseInt(lessonId),
        title: LESSONS.find(l => l.id === parseInt(lessonId))?.title,
        score: progress.bestQuizScore,
        timeSpent: progress.timeSpent,
        completedAt: progress.completedAt,
      }));

    const totalTimeSpent = completedLessons.reduce((sum, lesson) => sum + (lesson.timeSpent || 0), 0);
    const averageScore = completedLessons.length > 0
      ? Math.round(completedLessons.reduce((sum, l) => sum + l.score, 0) / completedLessons.length)
      : 0;

    return {
      targetLanguage,
      overall,
      phases,
      completedLessons,
      statistics: {
        totalTimeSpent,
        averageQuizScore: averageScore,
        streak: this.checkStreak(userProgress),
        lessonsThisWeek: this.getLessonsCompletedThisWeek(userProgress),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Get lessons completed in the last 7 days
   */
  getLessonsCompletedThisWeek(userProgress) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    return Object.values(userProgress).filter(progress => {
      if (!progress.completedAt) return false;
      return new Date(progress.completedAt) >= oneWeekAgo;
    }).length;
  }
}

// Export singleton instance
const lessonService = new LessonService();
export default lessonService;
