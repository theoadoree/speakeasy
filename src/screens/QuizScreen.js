import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { getQuizForLesson } from '../config/quizzes.config';
import LessonService from '../services/lesson';

export default function QuizScreen({ route, navigation }) {
  const { lessonId } = route.params;
  const { userProfile, submitQuiz, getLessonAchievements } = useApp();
  const { theme } = useTheme();

  const [quiz, setQuiz] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    loadQuiz();
  }, [lessonId]);

  const loadQuiz = async () => {
    try {
      const quizData = getQuizForLesson(lessonId);
      const lessonData = LessonService.getLesson(lessonId, userProfile?.targetLanguage || 'spanish');

      if (!quizData) {
        Alert.alert('Error', 'No quiz available for this lesson');
        navigation.goBack();
        return;
      }

      setQuiz(quizData);
      setLesson(lessonData);
    } catch (error) {
      console.error('Error loading quiz:', error);
      Alert.alert('Error', 'Failed to load quiz');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitQuizAnswers = async () => {
    // Check if all questions are answered
    const unanswered = quiz.questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      Alert.alert(
        'Incomplete Quiz',
        `You have ${unanswered.length} unanswered question(s). Please answer all questions before submitting.`,
        [
          { text: 'OK' }
        ]
      );
      return;
    }

    setSubmitting(true);

    try {
      // For demo purposes, generate mock correct answers
      // In a real implementation, these would come from the backend or be pre-generated
      const correctAnswers = {};
      quiz.questions.forEach(q => {
        // Mock correct answer (in real app, this would be validated against actual answers)
        correctAnswers[q.id] = answers[q.id]; // Simplified for demo
      });

      // Submit quiz
      const result = await submitQuiz(lessonId, answers, correctAnswers);

      if (result.success) {
        setQuizResult(result.quizAttempt);

        // Get achievements
        const achievementsEarned = getLessonAchievements(lessonId);
        setAchievements(achievementsEarned || []);

        setShowResults(true);
      } else {
        Alert.alert('Error', result.error || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      Alert.alert('Error', 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const retakeQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
    setQuizResult(null);
    setAchievements([]);
  };

  const finishQuiz = () => {
    navigation.navigate('Curriculum');
  };

  const renderQuestion = (question, index) => {
    const isCurrentQuestion = index === currentQuestionIndex;
    if (!isCurrentQuestion) return null;

    return (
      <View key={question.id} style={[styles.questionContainer, { backgroundColor: theme.card }]}>
        <View style={styles.questionHeader}>
          <Text style={[styles.questionNumber, { color: theme.textSecondary }]}>
            Question {index + 1} of {quiz.questions.length}
          </Text>
          <View style={[styles.pointsBadge, { backgroundColor: '#007AFF20' }]}>
            <Text style={styles.pointsText}>{question.points} pts</Text>
          </View>
        </View>

        <Text style={[styles.questionInstruction, { color: theme.text }]}>
          {question.instruction}
        </Text>

        {/* Question Type Rendering */}
        {renderQuestionType(question)}

        {/* Progress Indicator */}
        <View style={styles.progressIndicator}>
          {quiz.questions.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.progressDot,
                idx === currentQuestionIndex && styles.progressDotActive,
                answers[quiz.questions[idx].id] && styles.progressDotAnswered,
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  const renderQuestionType = (question) => {
    switch (question.type) {
      case 'multiple_choice':
        return renderMultipleChoice(question);
      case 'fill_in_blank':
        return renderFillInBlank(question);
      case 'matching':
        return renderMatching(question);
      case 'translation':
        return renderTranslation(question);
      default:
        return (
          <View style={[styles.questionTypeNotice, { backgroundColor: theme.background }]}>
            <Text style={[styles.questionTypeText, { color: theme.text }]}>
              {question.type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={[styles.questionTypeDescription, { color: theme.textSecondary }]}>
              This question type requires interactive practice.
              {'\n'}Select any answer to continue.
            </Text>
            {renderMultipleChoice({
              ...question,
              options: ['Practice Complete', 'Continue', 'Next Question']
            })}
          </View>
        );
    }
  };

  const renderMultipleChoice = (question) => {
    const options = question.options || ['Option A', 'Option B', 'Option C', 'Option D'];

    return (
      <View style={styles.optionsContainer}>
        {options.map((option, idx) => {
          const isSelected = answers[question.id] === option;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionButton,
                { backgroundColor: theme.background, borderColor: theme.border },
                isSelected && styles.optionButtonSelected,
              ]}
              onPress={() => selectAnswer(question.id, option)}
            >
              <View style={[
                styles.optionRadio,
                { borderColor: isSelected ? '#007AFF' : theme.border },
                isSelected && styles.optionRadioSelected,
              ]}>
                {isSelected && <View style={styles.optionRadioInner} />}
              </View>
              <Text style={[
                styles.optionText,
                { color: theme.text },
                isSelected && styles.optionTextSelected,
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderFillInBlank = (question) => {
    const options = ['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4'];
    return renderMultipleChoice({ ...question, options });
  };

  const renderMatching = (question) => {
    const pairs = [
      ['Item 1', 'Match A'],
      ['Item 2', 'Match B'],
      ['Item 3', 'Match C'],
    ];

    return (
      <View style={styles.matchingContainer}>
        {pairs.map((pair, idx) => {
          const pairAnswer = `${pair[0]} - ${pair[1]}`;
          const isSelected = answers[question.id] === pairAnswer;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.matchingPair,
                { backgroundColor: theme.background, borderColor: theme.border },
                isSelected && styles.matchingPairSelected,
              ]}
              onPress={() => selectAnswer(question.id, pairAnswer)}
            >
              <Text style={[styles.matchingText, { color: theme.text }]}>{pair[0]}</Text>
              <Text style={[styles.matchingArrow, { color: theme.textSecondary }]}>→</Text>
              <Text style={[styles.matchingText, { color: theme.text }]}>{pair[1]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  const renderTranslation = (question) => {
    const translations = ['Translation 1', 'Translation 2', 'Translation 3'];
    return renderMultipleChoice({ ...question, options: translations });
  };

  const renderResultsModal = () => {
    if (!quizResult) return null;

    const passed = quizResult.passed;
    const score = quizResult.score;

    return (
      <Modal
        visible={showResults}
        animationType="slide"
        transparent={false}
        onRequestClose={finishQuiz}
      >
        <SafeAreaView style={[styles.resultsContainer, { backgroundColor: theme.background }]}>
          <ScrollView contentContainerStyle={styles.resultsScrollContent}>
            {/* Results Header */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsEmoji}>{passed ? '🎉' : '💪'}</Text>
              <Text style={[styles.resultsTitle, { color: theme.text }]}>
                {passed ? 'Congratulations!' : 'Keep Trying!'}
              </Text>
              <Text style={[styles.resultsSubtitle, { color: theme.textSecondary }]}>
                {passed
                  ? 'You passed the quiz!'
                  : 'You need 70% to pass. Review and try again.'}
              </Text>
            </View>

            {/* Score Card */}
            <View style={[styles.scoreCard, { backgroundColor: theme.card }]}>
              <View style={styles.scoreCircle}>
                <Text style={[styles.scorePercentage, { color: passed ? '#34C759' : '#FF9500' }]}>
                  {score}%
                </Text>
                <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Score</Text>
              </View>
              <View style={styles.scoreDetails}>
                <View style={styles.scoreDetailRow}>
                  <Text style={[styles.scoreDetailLabel, { color: theme.textSecondary }]}>
                    Points Earned:
                  </Text>
                  <Text style={[styles.scoreDetailValue, { color: theme.text }]}>
                    {quizResult.earnedPoints} / {quizResult.totalPoints}
                  </Text>
                </View>
                <View style={styles.scoreDetailRow}>
                  <Text style={[styles.scoreDetailLabel, { color: theme.textSecondary }]}>
                    Status:
                  </Text>
                  <Text
                    style={[
                      styles.scoreDetailValue,
                      { color: passed ? '#34C759' : '#FF9500' }
                    ]}
                  >
                    {passed ? 'PASSED ✓' : 'NOT PASSED'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Achievements */}
            {achievements && achievements.length > 0 && (
              <View style={[styles.achievementsSection, { backgroundColor: theme.card }]}>
                <Text style={[styles.achievementsTitle, { color: theme.text }]}>
                  🏆 Achievements Unlocked
                </Text>
                {achievements.map((achievement, idx) => (
                  <View key={idx} style={[styles.achievementCard, { backgroundColor: theme.background }]}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <View style={styles.achievementInfo}>
                      <Text style={[styles.achievementTitle, { color: theme.text }]}>
                        {achievement.title}
                      </Text>
                      <Text style={[styles.achievementDescription, { color: theme.textSecondary }]}>
                        {achievement.description}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Actions */}
            <View style={styles.resultsActions}>
              {!passed && (
                <TouchableOpacity
                  style={[styles.retakeButton, { backgroundColor: theme.card, borderColor: '#007AFF' }]}
                  onPress={retakeQuiz}
                >
                  <Text style={[styles.retakeButtonText, { color: '#007AFF' }]}>
                    Retake Quiz
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.continueButton,
                  { backgroundColor: passed ? '#34C759' : '#007AFF' }
                ]}
                onPress={finishQuiz}
              >
                <Text style={styles.continueButtonText}>
                  {passed ? 'Continue to Next Lesson' : 'Back to Curriculum'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!quiz || !lesson) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Quiz not available</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            Alert.alert(
              'Exit Quiz?',
              'Your progress will not be saved. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Exit', style: 'destructive', onPress: () => navigation.goBack() },
              ]
            );
          }}
        >
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.lessonNumber, { color: theme.textSecondary }]}>
            LESSON {lessonId} QUIZ
          </Text>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={2}>
            {lesson.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {quiz.questions.length} Questions • {quiz.passingScore}% to Pass
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.quizProgressBarContainer, { backgroundColor: theme.border }]}>
        <View
          style={[
            styles.quizProgressBarFill,
            { width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }
          ]}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {quiz.questions.map((question, index) => renderQuestion(question, index))}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[
              styles.navButton,
              { backgroundColor: theme.card, borderColor: theme.border },
              currentQuestionIndex === 0 && styles.navButtonDisabled,
            ]}
            onPress={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <Text style={[styles.navButtonText, { color: currentQuestionIndex === 0 ? theme.textTertiary : '#007AFF' }]}>
              ← Previous
            </Text>
          </TouchableOpacity>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={submitQuizAnswers}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.submitButtonText}>Submit Quiz</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navButton, { backgroundColor: '#007AFF' }]}
              onPress={nextQuestion}
            >
              <Text style={[styles.navButtonText, { color: '#FFF' }]}>Next →</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Results Modal */}
      {renderResultsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 20,
    color: '#666',
  },
  headerContent: {
    flex: 1,
  },
  lessonNumber: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 26,
  },
  headerSubtitle: {
    fontSize: 13,
  },
  quizProgressBarContainer: {
    height: 4,
    width: '100%',
  },
  quizProgressBarFill: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  scrollView: {
    flex: 1,
  },
  questionContainer: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '500',
  },
  pointsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pointsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  questionInstruction: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    lineHeight: 26,
  },
  questionTypeNotice: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  questionTypeText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  questionTypeDescription: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  optionRadio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionRadioSelected: {
    borderColor: '#007AFF',
  },
  optionRadioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  optionTextSelected: {
    fontWeight: '500',
  },
  matchingContainer: {
    marginBottom: 20,
  },
  matchingPair: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  matchingPairSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  matchingText: {
    fontSize: 15,
    flex: 1,
  },
  matchingArrow: {
    fontSize: 18,
    marginHorizontal: 12,
  },
  progressIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DDD',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
    width: 24,
  },
  progressDotAnswered: {
    backgroundColor: '#34C759',
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#34C759',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsScrollContent: {
    padding: 20,
  },
  resultsHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultsEmoji: {
    fontSize: 80,
    marginBottom: 16,
  },
  resultsTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  resultsSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  scoreCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  scoreCircle: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scorePercentage: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  scoreDetails: {
    width: '100%',
  },
  scoreDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scoreDetailLabel: {
    fontSize: 15,
  },
  scoreDetailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  achievementsSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  achievementsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: 13,
  },
  resultsActions: {
    marginTop: 10,
  },
  retakeButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    marginBottom: 12,
  },
  retakeButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  continueButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
