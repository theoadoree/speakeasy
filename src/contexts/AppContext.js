import React, { createContext, useState, useContext, useEffect } from 'react';
import StorageService from '../utils/storage';
import LLMService from '../services/llm';
import LessonService from '../services/lesson';
import ReviewService from '../services/review';
import { useSubscription } from './SubscriptionContext';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [llmConfig, setLLMConfig] = useState(null);
  const [contentLibrary, setContentLibrary] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [lessonProgress, setLessonProgress] = useState({});
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [llmConnected, setLLMConnected] = useState(false);
  const [reviewAnalysis, setReviewAnalysis] = useState(null);

  // Get subscription context
  const subscriptionContext = useSubscription();

  // Set subscription context in LLMService
  useEffect(() => {
    if (subscriptionContext) {
      LLMService.setSubscriptionContext(subscriptionContext);
    }
  }, [subscriptionContext]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      const config = await StorageService.getLLMConfig();
      const library = await StorageService.getContentLibrary();
      const customLessons = await StorageService.getCustomLessons();
      const progress = await StorageService.getLessonProgress();
      const reviewData = await StorageService.getReviewData();

      setUserProfile(profile);
      setLLMConfig(config);
      setContentLibrary(library);
      setLessons(customLessons);
      setLessonProgress(progress);

      // Initialize LessonService with progress
      LessonService.initialize(progress);

      // Set current lesson
      const current = LessonService.getCurrentLesson(progress);
      setCurrentLessonId(current);

      // Initialize ReviewService with stored data
      if (reviewData) {
        ReviewService.loadData(reviewData);
      }

      // Get initial review analysis
      const analysis = ReviewService.analyzeStruggles();
      setReviewAnalysis(analysis);

      if (config) {
        LLMService.setConfig(config.baseURL, config.model);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (profile) => {
    await StorageService.saveUserProfile(profile);
    setUserProfile(profile);
  };

  const updateLLMConfig = async (config) => {
    await StorageService.saveLLMConfig(config);
    setLLMConfig(config);
    LLMService.setConfig(config.baseURL, config.model);
  };

  const testLLMConnection = async () => {
    const result = await LLMService.testConnection();
    setLLMConnected(result.success);
    return result;
  };

  const addContent = async (content) => {
    const result = await StorageService.saveContent(content);
    if (result.success) {
      setContentLibrary([...contentLibrary, result.content]);
    }
    return result;
  };

  const deleteContent = async (contentId) => {
    const result = await StorageService.deleteContent(contentId);
    if (result.success) {
      setContentLibrary(contentLibrary.filter(item => item.id !== contentId));
    }
    return result;
  };

  const refreshContentLibrary = async () => {
    const library = await StorageService.getContentLibrary();
    setContentLibrary(library);
  };

  const addLesson = async (lesson) => {
    const result = await StorageService.saveCustomLesson(lesson);
    if (result.success) {
      setLessons([...lessons, result.lesson]);
    }
    return result;
  };

  const deleteLesson = async (lessonId) => {
    const result = await StorageService.deleteCustomLesson(lessonId);
    if (result.success) {
      setLessons(lessons.filter(item => item.id !== lessonId));
    }
    return result;
  };

  const updateLessonProgress = async (lessonId, progress, completed = false) => {
    const result = await StorageService.updateCustomLessonProgress(lessonId, progress, completed);
    if (result.success) {
      setLessons(lessons.map(lesson =>
        lesson.id === lessonId ? result.lesson : lesson
      ));
    }
    return result;
  };

  const refreshLessons = async () => {
    const customLessons = await StorageService.getCustomLessons();
    setLessons(customLessons);
  };

  // Language learning curriculum lesson methods
  const startCurriculumLesson = async (lessonId) => {
    const lessonData = LessonService.startLesson(lessonId);
    const result = await StorageService.updateLessonProgress(lessonId, lessonData);
    if (result.success) {
      setLessonProgress({ ...lessonProgress, [lessonId]: result.progress });
    }
    return result;
  };

  const completeCurriculumLesson = async (lessonId, timeSpent) => {
    const lessonData = LessonService.completeLesson(lessonId, timeSpent);
    const result = await StorageService.updateLessonProgress(lessonId, lessonData);
    if (result.success) {
      setLessonProgress({ ...lessonProgress, [lessonId]: result.progress });
    }
    return result;
  };

  const submitQuiz = async (lessonId, answers, correctAnswers) => {
    try {
      const quizAttempt = LessonService.recordQuizAttempt(lessonId, answers, correctAnswers);

      // Save quiz attempt to history
      await StorageService.saveQuizAttempt(lessonId, quizAttempt);

      // Update lesson progress with quiz results
      const currentProgress = lessonProgress[lessonId] || {};
      const updatedProgress = LessonService.updateLessonWithQuiz(currentProgress, quizAttempt);

      const result = await StorageService.updateLessonProgress(lessonId, updatedProgress);

      if (result.success) {
        setLessonProgress({ ...lessonProgress, [lessonId]: result.progress });

        // Update current lesson if quiz passed
        if (quizAttempt.passed) {
          const newCurrentLesson = LessonService.getCurrentLesson({ ...lessonProgress, [lessonId]: result.progress });
          setCurrentLessonId(newCurrentLesson);
        }
      }

      return { success: true, quizAttempt, progress: result.progress };
    } catch (error) {
      console.error('Error submitting quiz:', error);
      return { success: false, error: error.message };
    }
  };

  const getCurriculumProgress = () => {
    return LessonService.calculateProgress(lessonProgress);
  };

  const getPhaseProgress = (phase) => {
    return LessonService.getPhaseProgress(phase, lessonProgress);
  };

  const isLessonUnlocked = (lessonId) => {
    return LessonService.isLessonUnlocked(lessonId, lessonProgress);
  };

  const getLessonCurriculum = () => {
    return LessonService.getLessonCurriculum();
  };

  const generateLessonContent = async (lessonId) => {
    if (!userProfile || !userProfile.targetLanguage) {
      return { success: false, error: 'No target language set' };
    }

    try {
      const content = await LessonService.generateLessonContent(
        lessonId,
        userProfile.targetLanguage,
        userProfile.level || 'beginner'
      );
      return { success: true, content };
    } catch (error) {
      console.error('Error generating lesson content:', error);
      return { success: false, error: error.message };
    }
  };

  const generateRoleplay = async (lessonId) => {
    if (!userProfile || !userProfile.targetLanguage) {
      return { success: false, error: 'No target language set' };
    }

    try {
      const roleplay = await LessonService.generateRoleplayScenario(
        lessonId,
        userProfile.targetLanguage,
        userProfile.level || 'beginner'
      );
      return { success: true, roleplay };
    } catch (error) {
      console.error('Error generating roleplay:', error);
      return { success: false, error: error.message };
    }
  };

  const getLessonAchievements = (lessonId) => {
    return LessonService.getAchievement(lessonId, lessonProgress);
  };

  const getProgressReport = () => {
    return LessonService.generateProgressReport(
      lessonProgress,
      userProfile?.targetLanguage || 'unknown'
    );
  };

  const resetCurriculumProgress = async () => {
    await StorageService.resetLessonProgress();
    await StorageService.clearQuizHistory();
    setLessonProgress({});
    setCurrentLessonId(null);
  };

  // Review tracking methods
  const recordStruggle = async (struggle) => {
    const entry = ReviewService.recordStruggle(struggle);

    // Persist to storage
    await StorageService.saveReviewData(ReviewService.exportData());

    // Update analysis
    const analysis = ReviewService.analyzeStruggles();
    setReviewAnalysis(analysis);

    return entry;
  };

  const generateReviewLesson = async (focusType = null) => {
    if (!userProfile || !userProfile.targetLanguage) {
      return { success: false, message: 'Please complete your profile first' };
    }

    const result = await ReviewService.generateReviewLesson(
      userProfile,
      userProfile.targetLanguage,
      { focusType }
    );

    if (result.success) {
      // Persist to storage
      await StorageService.saveReviewData(ReviewService.exportData());
    }

    return result;
  };

  const markReviewLessonComplete = async (lesson) => {
    ReviewService.markLessonComplete(lesson);

    // Persist to storage
    await StorageService.saveReviewData(ReviewService.exportData());

    // Update analysis
    const analysis = ReviewService.analyzeStruggles();
    setReviewAnalysis(analysis);
  };

  const refreshReviewAnalysis = async () => {
    const analysis = ReviewService.analyzeStruggles();
    setReviewAnalysis(analysis);
  };

  const getReviewLessons = (limit = 10) => {
    return ReviewService.getReviewLessons(limit);
  };

  const clearReviewData = async () => {
    ReviewService.clearAll();
    await StorageService.saveReviewData(ReviewService.exportData());
    setReviewAnalysis(null);
  };

  const value = {
    userProfile,
    setUserProfile: updateUserProfile,
    llmConfig,
    setLLMConfig: updateLLMConfig,
    contentLibrary,
    addContent,
    deleteContent,
    refreshContentLibrary,
    lessons,
    addLesson,
    deleteLesson,
    updateLessonProgress,
    refreshLessons,
    // Language learning curriculum methods
    lessonProgress,
    currentLessonId,
    startCurriculumLesson,
    completeCurriculumLesson,
    submitQuiz,
    getCurriculumProgress,
    getPhaseProgress,
    isLessonUnlocked,
    getLessonCurriculum,
    generateLessonContent,
    generateRoleplay,
    getLessonAchievements,
    getProgressReport,
    resetCurriculumProgress,
    // Review methods
    reviewAnalysis,
    recordStruggle,
    generateReviewLesson,
    markReviewLessonComplete,
    refreshReviewAnalysis,
    getReviewLessons,
    clearReviewData,
    isLoading,
    llmConnected,
    setLLMConnected,
    testLLMConnection
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
