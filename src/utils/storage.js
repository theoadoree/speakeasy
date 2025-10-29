import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: '@fluentai:userProfile',
  LLM_CONFIG: '@fluentai:llmConfig',
  CONTENT_LIBRARY: '@fluentai:contentLibrary',
  CONVERSATION_HISTORY: '@fluentai:conversationHistory',
  ONBOARDING_COMPLETE: '@fluentai:onboardingComplete',
  AUTH_TOKEN: '@fluentai:authToken',
  USER_DATA: '@fluentai:userData',
  THEME_MODE: '@fluentai:themeMode',
  MUSIC_LIBRARY: '@fluentai:musicLibrary',
  MUSIC_LESSONS: '@fluentai:musicLessons',
  USER_PROGRESS: '@fluentai:userProgress',
  CUSTOM_LESSONS: '@fluentai:customLessons',
  MUSIC_CONFIG: '@fluentai:musicConfig',
  LESSON_PROGRESS: '@fluentai:lessonProgress',
  QUIZ_HISTORY: '@fluentai:quizHistory',
  REMINDER_PREFERENCES: '@fluentai:reminderPreferences',
  LAST_LOGIN: '@fluentai:lastLogin',
  REVIEW_DATA: '@fluentai:reviewData',
  NOTIFICATION_ANALYTICS: '@fluentai:notificationAnalytics'
};

class StorageService {
  async saveUserProfile(profile) {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserProfile() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  async saveLLMConfig(config) {
    try {
      await AsyncStorage.setItem(KEYS.LLM_CONFIG, JSON.stringify(config));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getLLMConfig() {
    try {
      const data = await AsyncStorage.getItem(KEYS.LLM_CONFIG);
      return data ? JSON.parse(data) : { 
        baseURL: 'http://localhost:11434',
        model: 'llama2'
      };
    } catch (error) {
      return { 
        baseURL: 'http://localhost:11434',
        model: 'llama2'
      };
    }
  }

  async saveContent(content) {
    try {
      const library = await this.getContentLibrary();
      const newContent = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...content
      };
      library.push(newContent);
      await AsyncStorage.setItem(KEYS.CONTENT_LIBRARY, JSON.stringify(library));
      return { success: true, content: newContent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getContentLibrary() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CONTENT_LIBRARY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async deleteContent(contentId) {
    try {
      const library = await this.getContentLibrary();
      const filtered = library.filter(item => item.id !== contentId);
      await AsyncStorage.setItem(KEYS.CONTENT_LIBRARY, JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveConversationHistory(history) {
    try {
      await AsyncStorage.setItem(KEYS.CONVERSATION_HISTORY, JSON.stringify(history));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getConversationHistory() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CONVERSATION_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async clearConversationHistory() {
    try {
      await AsyncStorage.setItem(KEYS.CONVERSATION_HISTORY, JSON.stringify([]));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setOnboardingComplete(complete) {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, complete.toString());
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async isOnboardingComplete() {
    try {
      const data = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
      return data === 'true';
    } catch (error) {
      return false;
    }
  }

  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Authentication methods
  async saveAuthToken(token) {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
      return token;
    } catch (error) {
      return null;
    }
  }

  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserData() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  async removeUserData() {
    try {
      await AsyncStorage.removeItem(KEYS.USER_DATA);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.USER_DATA]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Theme methods
  async saveThemeMode(mode) {
    try {
      await AsyncStorage.setItem(KEYS.THEME_MODE, mode);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getThemeMode() {
    try {
      const mode = await AsyncStorage.getItem(KEYS.THEME_MODE);
      return mode || 'system'; // Default to system preference
    } catch (error) {
      return 'system';
    }
  }

  // Music library methods
  async saveMusicLibrary(library) {
    try {
      await AsyncStorage.setItem(KEYS.MUSIC_LIBRARY, JSON.stringify(library));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMusicLibrary() {
    try {
      const data = await AsyncStorage.getItem(KEYS.MUSIC_LIBRARY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async addSongToLibrary(song) {
    try {
      const library = await this.getMusicLibrary();
      const newSong = {
        ...song,
        addedAt: new Date().toISOString()
      };
      library.push(newSong);
      await AsyncStorage.setItem(KEYS.MUSIC_LIBRARY, JSON.stringify(library));
      return { success: true, song: newSong };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async removeSongFromLibrary(songId) {
    try {
      const library = await this.getMusicLibrary();
      const filtered = library.filter(song => song.id !== songId);
      await AsyncStorage.setItem(KEYS.MUSIC_LIBRARY, JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Music lessons methods
  async saveMusicLesson(lesson) {
    try {
      const lessons = await this.getMusicLessons();
      const newLesson = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...lesson
      };
      lessons.push(newLesson);
      await AsyncStorage.setItem(KEYS.MUSIC_LESSONS, JSON.stringify(lessons));
      return { success: true, lesson: newLesson };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMusicLessons() {
    try {
      const data = await AsyncStorage.getItem(KEYS.MUSIC_LESSONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async deleteMusicLesson(lessonId) {
    try {
      const lessons = await this.getMusicLessons();
      const filtered = lessons.filter(lesson => lesson.id !== lessonId);
      await AsyncStorage.setItem(KEYS.MUSIC_LESSONS, JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // User progress methods (for leagues and achievements)
  async saveUserProgress(progress) {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROGRESS, JSON.stringify(progress));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserProgress() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROGRESS);
      return data ? JSON.parse(data) : {
        xp: 0,
        streak: 0,
        achievements: [],
        lessonsCompleted: 0,
        wordsLearned: 0,
        timeSpent: 0
      };
    } catch (error) {
      return {
        xp: 0,
        streak: 0,
        achievements: [],
        lessonsCompleted: 0,
        wordsLearned: 0,
        timeSpent: 0
      };
    }
  }

  async updateUserProgress(updates) {
    try {
      const currentProgress = await this.getUserProgress();
      const updatedProgress = { ...currentProgress, ...updates };
      await AsyncStorage.setItem(KEYS.USER_PROGRESS, JSON.stringify(updatedProgress));
      return { success: true, progress: updatedProgress };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async addXP(amount) {
    try {
      const progress = await this.getUserProgress();
      progress.xp += amount;
      await this.saveUserProgress(progress);
      return { success: true, newXP: progress.xp };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async unlockAchievement(achievementId) {
    try {
      const progress = await this.getUserProgress();
      if (!progress.achievements.includes(achievementId)) {
        progress.achievements.push(achievementId);
        await this.saveUserProgress(progress);
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Custom lessons methods
  async saveCustomLesson(lesson) {
    try {
      const lessons = await this.getCustomLessons();
      const newLesson = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...lesson
      };
      lessons.push(newLesson);
      await AsyncStorage.setItem(KEYS.CUSTOM_LESSONS, JSON.stringify(lessons));
      return { success: true, lesson: newLesson };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getCustomLessons() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CUSTOM_LESSONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async deleteCustomLesson(lessonId) {
    try {
      const lessons = await this.getCustomLessons();
      const filtered = lessons.filter(lesson => lesson.id !== lessonId);
      await AsyncStorage.setItem(KEYS.CUSTOM_LESSONS, JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async updateCustomLessonProgress(lessonId, progress, completed = false) {
    try {
      const lessons = await this.getCustomLessons();
      const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);

      if (lessonIndex !== -1) {
        lessons[lessonIndex] = {
          ...lessons[lessonIndex],
          progress,
          completed,
          lastAccessed: new Date().toISOString()
        };
        await AsyncStorage.setItem(KEYS.CUSTOM_LESSONS, JSON.stringify(lessons));
        return { success: true, lesson: lessons[lessonIndex] };
      }

      return { success: false, error: 'Lesson not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveQuizResult(lessonId, quizData) {
    try {
      const lessons = await this.getCustomLessons();
      const lessonIndex = lessons.findIndex(lesson => lesson.id === lessonId);

      if (lessonIndex !== -1) {
        if (!lessons[lessonIndex].quizResults) {
          lessons[lessonIndex].quizResults = [];
        }

        const quizResult = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          score: quizData.score,
          totalQuestions: quizData.totalQuestions,
          correctAnswers: quizData.correctAnswers,
          answers: quizData.answers
        };

        lessons[lessonIndex].quizResults.push(quizResult);
        lessons[lessonIndex].lastQuizScore = quizData.score;
        lessons[lessonIndex].bestQuizScore = Math.max(
          lessons[lessonIndex].bestQuizScore || 0,
          quizData.score
        );

        await AsyncStorage.setItem(KEYS.CUSTOM_LESSONS, JSON.stringify(lessons));
        return { success: true, quizResult };
      }

      return { success: false, error: 'Lesson not found' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getQuizResults(lessonId) {
    try {
      const lessons = await this.getCustomLessons();
      const lesson = lessons.find(l => l.id === lessonId);
      return lesson?.quizResults || [];
    } catch (error) {
      return [];
    }
  }

  // Music API configuration methods
  async saveMusicConfig(config) {
    try {
      await AsyncStorage.setItem(KEYS.MUSIC_CONFIG, JSON.stringify(config));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getMusicConfig() {
    try {
      const data = await AsyncStorage.getItem(KEYS.MUSIC_CONFIG);
      return data ? JSON.parse(data) : {
        spotifyClientId: null,
        spotifyClientSecret: null,
        appleMusicToken: null
      };
    } catch (error) {
      return {
        spotifyClientId: null,
        spotifyClientSecret: null,
        appleMusicToken: null
      };
    }
  }

  // Language learning lesson progress methods
  async saveLessonProgress(progress) {
    try {
      await AsyncStorage.setItem(KEYS.LESSON_PROGRESS, JSON.stringify(progress));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getLessonProgress() {
    try {
      const data = await AsyncStorage.getItem(KEYS.LESSON_PROGRESS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  async updateLessonProgress(lessonId, lessonData) {
    try {
      const progress = await this.getLessonProgress();
      progress[lessonId] = {
        ...progress[lessonId],
        ...lessonData,
        lastUpdated: new Date().toISOString()
      };
      await AsyncStorage.setItem(KEYS.LESSON_PROGRESS, JSON.stringify(progress));
      return { success: true, progress: progress[lessonId] };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getLessonById(lessonId) {
    try {
      const progress = await this.getLessonProgress();
      return progress[lessonId] || null;
    } catch (error) {
      return null;
    }
  }

  async markLessonComplete(lessonId, quizScore, timeSpent) {
    try {
      const progress = await this.getLessonProgress();
      progress[lessonId] = {
        ...progress[lessonId],
        lessonId,
        completed: true,
        completedAt: new Date().toISOString(),
        quizScore,
        timeSpent,
        quizPassed: quizScore >= 70,
      };
      await AsyncStorage.setItem(KEYS.LESSON_PROGRESS, JSON.stringify(progress));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async resetLessonProgress() {
    try {
      await AsyncStorage.setItem(KEYS.LESSON_PROGRESS, JSON.stringify({}));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Quiz history methods
  async saveQuizAttempt(lessonId, quizData) {
    try {
      const history = await this.getQuizHistory();
      if (!history[lessonId]) {
        history[lessonId] = [];
      }
      history[lessonId].push({
        ...quizData,
        attemptedAt: new Date().toISOString()
      });
      await AsyncStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify(history));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getQuizHistory() {
    try {
      const data = await AsyncStorage.getItem(KEYS.QUIZ_HISTORY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  async getQuizHistoryForLesson(lessonId) {
    try {
      const history = await this.getQuizHistory();
      return history[lessonId] || [];
    } catch (error) {
      return [];
    }
  }

  async getBestQuizScore(lessonId) {
    try {
      const attempts = await this.getQuizHistoryForLesson(lessonId);
      if (attempts.length === 0) return 0;
      return Math.max(...attempts.map(attempt => attempt.score || 0));
    } catch (error) {
      return 0;
    }
  }

  async clearQuizHistory() {
    try {
      await AsyncStorage.setItem(KEYS.QUIZ_HISTORY, JSON.stringify({}));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Reminder and notification methods
  async saveReminderPreferences(preferences) {
    try {
      await AsyncStorage.setItem(KEYS.REMINDER_PREFERENCES, JSON.stringify(preferences));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getReminderPreferences() {
    try {
      const data = await AsyncStorage.getItem(KEYS.REMINDER_PREFERENCES);
      return data ? JSON.parse(data) : {
        enabled: false,
        noonEnabled: true,
        eveningEnabled: true,
        lastScheduled: null
      };
    } catch (error) {
      return {
        enabled: false,
        noonEnabled: true,
        eveningEnabled: true,
        lastScheduled: null
      };
    }
  }

  async saveLastLogin(timestamp = new Date().toISOString()) {
    try {
      await AsyncStorage.setItem(KEYS.LAST_LOGIN, timestamp);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getLastLogin() {
    try {
      const data = await AsyncStorage.getItem(KEYS.LAST_LOGIN);
      return data;
    } catch (error) {
      return null;
    }
  }

  async isFirstLoginToday() {
    try {
      const lastLogin = await this.getLastLogin();
      if (!lastLogin) return true;

      const today = new Date().toDateString();
      const lastLoginDate = new Date(lastLogin).toDateString();

      return today !== lastLoginDate;
    } catch (error) {
      return true;
    }
  }

  // Review data methods
  async saveReviewData(reviewData) {
    try {
      await AsyncStorage.setItem(KEYS.REVIEW_DATA, JSON.stringify(reviewData));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getReviewData() {
    try {
      const data = await AsyncStorage.getItem(KEYS.REVIEW_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  async clearReviewData() {
    try {
      await AsyncStorage.removeItem(KEYS.REVIEW_DATA);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Notification analytics methods
  async saveNotificationAnalytics(analytics) {
    try {
      await AsyncStorage.setItem(KEYS.NOTIFICATION_ANALYTICS, JSON.stringify(analytics));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getNotificationAnalytics() {
    try {
      const data = await AsyncStorage.getItem(KEYS.NOTIFICATION_ANALYTICS);
      return data ? JSON.parse(data) : {
        messages: {},
        totals: {
          sent: 0,
          opened: 0,
          engagementRate: 0
        },
        sessions: []
      };
    } catch (error) {
      return {
        messages: {},
        totals: {
          sent: 0,
          opened: 0,
          engagementRate: 0
        },
        sessions: []
      };
    }
  }

  async clearNotificationAnalytics() {
    try {
      await AsyncStorage.setItem(KEYS.NOTIFICATION_ANALYTICS, JSON.stringify({
        messages: {},
        totals: {
          sent: 0,
          opened: 0,
          engagementRate: 0
        },
        sessions: []
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new StorageService();
