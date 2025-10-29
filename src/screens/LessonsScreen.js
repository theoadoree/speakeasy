import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import LLMService from '../services/llm';
import StorageService from '../utils/storage';
import UserMenu from '../components/UserMenu';

export default function LessonsScreen({ navigation }) {
  const { userProfile, lessons, addLesson, updateLessonProgress, llmConnected } = useApp();
  const { theme, isDark } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLessonType, setSelectedLessonType] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonModalVisible, setLessonModalVisible] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState(null);

  const lessonTypes = [
    { id: 'vocabulary', icon: '📚', title: 'Vocabulary', description: 'Learn new words and phrases' },
    { id: 'grammar', icon: '✏️', title: 'Grammar', description: 'Master language rules' },
    { id: 'listening', icon: '👂', title: 'Listening', description: 'Improve comprehension' },
    { id: 'speaking', icon: '🗣️', title: 'Speaking', description: 'Practice pronunciation' },
    { id: 'reading', icon: '📖', title: 'Reading', description: 'Read and understand texts' },
    { id: 'writing', icon: '✍️', title: 'Writing', description: 'Write in target language' },
  ];

  const generateLesson = async (lessonType) => {
    if (!llmConnected) {
      Alert.alert('LLM Not Connected', 'Please configure your LLM connection in Settings.');
      return;
    }

    setIsGenerating(true);
    setSelectedLessonType(lessonType);

    try {
      const result = await LLMService.generateLesson(
        userProfile,
        userProfile.targetLanguage,
        lessonType.id
      );

      if (result.success) {
        const lesson = {
          type: lessonType.id,
          title: result.title || `${lessonType.title} Lesson`,
          content: result.content,
          exercises: result.exercises || [],
          language: userProfile.targetLanguage,
          level: userProfile.level,
          completed: false,
          progress: 0,
        };

        await addLesson(lesson);
        setCurrentLesson(lesson);
        setLessonModalVisible(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate lesson');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const openLesson = (lesson) => {
    setCurrentLesson(lesson);
    setSelectedLessonType(lessonTypes.find(t => t.id === lesson.type));
    setLessonModalVisible(true);
    setFeedback(null);
    setUserAnswer('');
  };

  const checkAnswer = async () => {
    if (!userAnswer.trim()) {
      Alert.alert('Error', 'Please enter your answer');
      return;
    }

    setCheckingAnswer(true);
    try {
      const result = await LLMService.checkLessonAnswer(
        currentLesson,
        currentLesson.exercises[0], // Check first exercise for now
        userAnswer,
        userProfile.targetLanguage
      );

      if (result.success) {
        setFeedback({
          correct: result.correct,
          explanation: result.explanation,
          suggestion: result.suggestion,
        });

        // Update progress
        if (result.correct) {
          const updatedProgress = Math.min(100, currentLesson.progress + 20);
          await updateLessonProgress(currentLesson.id, updatedProgress);
          setCurrentLesson({ ...currentLesson, progress: updatedProgress });
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check answer');
    } finally {
      setCheckingAnswer(false);
    }
  };

  const startQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      const result = await LLMService.generateQuiz(
        currentLesson,
        userProfile.targetLanguage,
        userProfile.level
      );

      if (result.success) {
        let quizData;
        try {
          const jsonMatch = result.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            quizData = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          Alert.alert('Error', 'Failed to parse quiz data');
          setGeneratingQuiz(false);
          return;
        }

        setQuiz(quizData);
        setShowQuiz(true);
        setCurrentQuestionIndex(0);
        setQuizAnswers([]);
        setSelectedAnswer('');
        setShowQuizResults(false);
        setQuestionFeedback(null);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate quiz');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong generating quiz');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const submitQuizAnswer = async () => {
    if (!selectedAnswer.trim()) {
      Alert.alert('Error', 'Please select or enter an answer');
      return;
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];

    const result = await LLMService.checkQuizAnswer(
      currentQuestion,
      selectedAnswer,
      userProfile.targetLanguage
    );

    if (result.success) {
      const newAnswer = {
        question: currentQuestion.question,
        userAnswer: selectedAnswer,
        correct: result.correct,
        explanation: result.explanation,
      };

      setQuizAnswers([...quizAnswers, newAnswer]);
      setQuestionFeedback({
        correct: result.correct,
        explanation: result.explanation,
      });

      // Move to next question after showing feedback
      setTimeout(() => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setSelectedAnswer('');
          setQuestionFeedback(null);
        } else {
          // Quiz completed - show results
          finishQuiz([...quizAnswers, newAnswer]);
        }
      }, 2000);
    }
  };

  const finishQuiz = async (allAnswers) => {
    const correctCount = allAnswers.filter(a => a.correct).length;
    const score = Math.round((correctCount / allAnswers.length) * 100);

    setQuizScore(score);
    setShowQuizResults(true);

    // Save quiz result to storage
    const quizData = {
      score,
      totalQuestions: allAnswers.length,
      correctAnswers: correctCount,
      answers: allAnswers
    };

    await StorageService.saveQuizResult(currentLesson.id, quizData);

    // Update lesson progress based on quiz score
    const progressIncrease = Math.floor(score / 2); // Max 50% progress from quiz
    const newProgress = Math.min(100, currentLesson.progress + progressIncrease);
    await updateLessonProgress(currentLesson.id, newProgress, score >= 80);

    setCurrentLesson({ ...currentLesson, progress: newProgress, completed: score >= 80 });
  };

  const resetQuiz = () => {
    setShowQuiz(false);
    setQuiz(null);
    setCurrentQuestionIndex(0);
    setQuizAnswers([]);
    setSelectedAnswer('');
    setShowQuizResults(false);
    setQuizScore(0);
    setQuestionFeedback(null);
  };

  const completeLesson = async () => {
    await updateLessonProgress(currentLesson.id, 100, true);
    setLessonModalVisible(false);
    setCurrentLesson(null);
    setUserAnswer('');
    setFeedback(null);
    resetQuiz();
    Alert.alert('Great Job! 🎉', 'You completed this lesson!');
  };

  if (!userProfile) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <UserMenu navigation={navigation} />
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card }]}>
          <Text style={[styles.greeting, { color: theme.text }]}>Custom Lessons 📝</Text>
          <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
            Personalized for {userProfile.name} • {userProfile.targetLanguage} Level {userProfile.level}
          </Text>
        </View>

        {/* Lesson Type Cards */}
        <View style={styles.lessonTypesContainer}>
          <Text style={styles.sectionTitle}>Choose a Lesson Type</Text>
          <View style={styles.lessonTypesGrid}>
            {lessonTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={styles.lessonTypeCard}
                onPress={() => generateLesson(type)}
                disabled={isGenerating}
              >
                {isGenerating && selectedLessonType?.id === type.id ? (
                  <ActivityIndicator color="#007AFF" />
                ) : (
                  <>
                    <Text style={styles.lessonTypeIcon}>{type.icon}</Text>
                    <Text style={styles.lessonTypeTitle}>{type.title}</Text>
                    <Text style={styles.lessonTypeDescription}>{type.description}</Text>
                  </>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* My Lessons */}
        <View style={styles.myLessonsContainer}>
          <Text style={styles.sectionTitle}>My Lessons 📚</Text>

          {lessons.length === 0 ? (
            <View style={styles.emptyLessons}>
              <Text style={styles.emptyLessonsText}>No lessons yet</Text>
              <Text style={styles.emptyLessonsSubtext}>
                Generate a lesson above to get started!
              </Text>
            </View>
          ) : (
            lessons.map((lesson) => (
              <TouchableOpacity
                key={lesson.id}
                style={styles.lessonCard}
                onPress={() => openLesson(lesson)}
              >
                <View style={styles.lessonCardHeader}>
                  <Text style={styles.lessonIcon}>
                    {lessonTypes.find(t => t.id === lesson.type)?.icon || '📝'}
                  </Text>
                  <View style={styles.lessonInfo}>
                    <Text style={styles.lessonTitle} numberOfLines={1}>
                      {lesson.title}
                    </Text>
                    <Text style={styles.lessonMeta}>
                      {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} • Level {lesson.level}
                    </Text>
                  </View>
                  {lesson.completed && (
                    <Text style={styles.completedBadge}>✓</Text>
                  )}
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${lesson.progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{lesson.progress}% Complete</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Lesson Modal */}
      <Modal
        visible={lessonModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setLessonModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setLessonModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedLessonType?.icon} {currentLesson?.title}
            </Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {currentLesson && (
              <>
                {/* Lesson Content */}
                <View style={styles.contentSection}>
                  <Text style={styles.contentTitle}>Lesson Content</Text>
                  <Text style={styles.contentText}>{currentLesson.content}</Text>
                </View>

                {/* Exercises */}
                {currentLesson.exercises && currentLesson.exercises.length > 0 && (
                  <View style={styles.exerciseSection}>
                    <Text style={styles.contentTitle}>Practice Exercise</Text>
                    <Text style={styles.exerciseQuestion}>
                      {currentLesson.exercises[0].question}
                    </Text>

                    <TextInput
                      style={styles.answerInput}
                      placeholder="Type your answer here..."
                      value={userAnswer}
                      onChangeText={setUserAnswer}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />

                    <TouchableOpacity
                      style={styles.checkButton}
                      onPress={checkAnswer}
                      disabled={checkingAnswer}
                    >
                      {checkingAnswer ? (
                        <ActivityIndicator color="#FFF" />
                      ) : (
                        <Text style={styles.checkButtonText}>Check Answer</Text>
                      )}
                    </TouchableOpacity>

                    {/* Feedback */}
                    {feedback && (
                      <View style={[
                        styles.feedbackContainer,
                        feedback.correct ? styles.feedbackCorrect : styles.feedbackIncorrect
                      ]}>
                        <Text style={styles.feedbackTitle}>
                          {feedback.correct ? '✓ Correct!' : '✗ Not quite'}
                        </Text>
                        <Text style={styles.feedbackText}>{feedback.explanation}</Text>
                        {feedback.suggestion && (
                          <Text style={styles.feedbackSuggestion}>{feedback.suggestion}</Text>
                        )}
                      </View>
                    )}
                  </View>
                )}

                {/* Quiz Button */}
                {!showQuiz && (
                  <TouchableOpacity
                    style={styles.quizButton}
                    onPress={startQuiz}
                    disabled={generatingQuiz}
                  >
                    {generatingQuiz ? (
                      <ActivityIndicator color="#FFF" />
                    ) : (
                      <>
                        <Text style={styles.quizButtonIcon}>🎯</Text>
                        <Text style={styles.quizButtonText}>Take Quiz</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Complete Button */}
                {!currentLesson.completed && (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={completeLesson}
                  >
                    <Text style={styles.completeButtonText}>Mark as Complete</Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Quiz Modal */}
      <Modal
        visible={showQuiz && !showQuizResults}
        animationType="slide"
        transparent={false}
        onRequestClose={resetQuiz}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity style={styles.closeButton} onPress={resetQuiz}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Quiz 🎯</Text>
            <Text style={styles.quizProgress}>
              {currentQuestionIndex + 1} / {quiz?.questions?.length || 0}
            </Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {quiz && quiz.questions && quiz.questions[currentQuestionIndex] && (
              <View style={styles.quizContainer}>
                <Text style={styles.questionNumber}>
                  Question {currentQuestionIndex + 1}
                </Text>
                <Text style={styles.questionText}>
                  {quiz.questions[currentQuestionIndex].question}
                </Text>

                {/* Answer options based on question type */}
                {quiz.questions[currentQuestionIndex].type === 'multiple_choice' && (
                  <View style={styles.optionsContainer}>
                    {quiz.questions[currentQuestionIndex].options?.map((option, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.optionButton,
                          selectedAnswer === option && styles.optionButtonSelected,
                        ]}
                        onPress={() => setSelectedAnswer(option)}
                        disabled={!!questionFeedback}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedAnswer === option && styles.optionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {quiz.questions[currentQuestionIndex].type === 'true_false' && (
                  <View style={styles.optionsContainer}>
                    {['True', 'False'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        style={[
                          styles.optionButton,
                          selectedAnswer === option && styles.optionButtonSelected,
                        ]}
                        onPress={() => setSelectedAnswer(option)}
                        disabled={!!questionFeedback}
                      >
                        <Text
                          style={[
                            styles.optionText,
                            selectedAnswer === option && styles.optionTextSelected,
                          ]}
                        >
                          {option}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {(quiz.questions[currentQuestionIndex].type === 'fill_blank' ||
                  quiz.questions[currentQuestionIndex].type === 'short_answer') && (
                  <TextInput
                    style={styles.quizInput}
                    placeholder="Type your answer..."
                    value={selectedAnswer}
                    onChangeText={setSelectedAnswer}
                    multiline
                    editable={!questionFeedback}
                  />
                )}

                {/* Question Feedback */}
                {questionFeedback && (
                  <View
                    style={[
                      styles.questionFeedbackContainer,
                      questionFeedback.correct
                        ? styles.feedbackCorrect
                        : styles.feedbackIncorrect,
                    ]}
                  >
                    <Text style={styles.feedbackTitle}>
                      {questionFeedback.correct ? '✓ Correct!' : '✗ Incorrect'}
                    </Text>
                    <Text style={styles.feedbackText}>{questionFeedback.explanation}</Text>
                  </View>
                )}

                {/* Submit Button */}
                {!questionFeedback && (
                  <TouchableOpacity
                    style={styles.submitQuizButton}
                    onPress={submitQuizAnswer}
                  >
                    <Text style={styles.submitQuizButtonText}>Submit Answer</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Quiz Results Modal */}
      <Modal
        visible={showQuizResults}
        animationType="slide"
        transparent={false}
        onRequestClose={resetQuiz}
      >
        <View style={styles.modalContainer}>
          <View style={styles.resultsHeader}>
            <Text style={styles.resultsTitle}>Quiz Complete! 🎉</Text>
            <Text style={styles.scoreText}>
              Your Score: {quizScore}%
            </Text>
            <Text style={styles.scoreSubtext}>
              {quizAnswers.filter(a => a.correct).length} out of {quizAnswers.length} correct
            </Text>
          </View>

          <ScrollView style={styles.modalContent}>
            {quizAnswers.map((answer, index) => (
              <View
                key={index}
                style={[
                  styles.resultItem,
                  answer.correct ? styles.resultCorrect : styles.resultIncorrect,
                ]}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultNumber}>Q{index + 1}</Text>
                  <Text style={styles.resultIcon}>
                    {answer.correct ? '✓' : '✗'}
                  </Text>
                </View>
                <Text style={styles.resultQuestion}>{answer.question}</Text>
                <Text style={styles.resultAnswer}>
                  Your answer: {answer.userAnswer}
                </Text>
                <Text style={styles.resultExplanation}>{answer.explanation}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.resultsActions}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => {
                resetQuiz();
                startQuiz();
              }}
            >
              <Text style={styles.retakeButtonText}>Retake Quiz</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={resetQuiz}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
  },
  subGreeting: {
    fontSize: 16,
    color: '#666',
  },
  lessonTypesContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  lessonTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  lessonTypeCard: {
    width: '48%',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  lessonTypeIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  lessonTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  lessonTypeDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  myLessonsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  emptyLessons: {
    padding: 40,
    alignItems: 'center',
  },
  emptyLessonsText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 5,
  },
  emptyLessonsSubtext: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center',
  },
  lessonCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  lessonCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  lessonIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  lessonMeta: {
    fontSize: 12,
    color: '#999',
  },
  completedBadge: {
    fontSize: 24,
    color: '#34C759',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 50,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  contentSection: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  exerciseSection: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  exerciseQuestion: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    lineHeight: 24,
  },
  answerInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 15,
    backgroundColor: '#F8F8F8',
  },
  checkButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  feedbackContainer: {
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
  },
  feedbackCorrect: {
    backgroundColor: '#E8F5E9',
    borderColor: '#34C759',
  },
  feedbackIncorrect: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  feedbackSuggestion: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  completeButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  quizButton: {
    backgroundColor: '#FF9500',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  quizButtonIcon: {
    fontSize: 20,
  },
  quizButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
  },
  quizProgress: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  quizContainer: {
    padding: 20,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
    lineHeight: 26,
  },
  optionsContainer: {
    marginBottom: 20,
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  quizInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
    backgroundColor: '#FFF',
    textAlignVertical: 'top',
  },
  questionFeedbackContainer: {
    marginTop: 15,
    marginBottom: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
  },
  submitQuizButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitQuizButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  resultsHeader: {
    paddingTop: 80,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  scoreSubtext: {
    fontSize: 16,
    color: '#666',
  },
  resultItem: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  resultCorrect: {
    borderColor: '#34C759',
    backgroundColor: '#F0FFF4',
  },
  resultIncorrect: {
    borderColor: '#FF3B30',
    backgroundColor: '#FFF5F5',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  resultIcon: {
    fontSize: 24,
  },
  resultQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  resultAnswer: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  resultExplanation: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  resultsActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  retakeButton: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  doneButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});
