/**
 * ReviewScreen - Personalized review lessons based on user struggles
 *
 * This screen displays:
 * - Analysis of weak areas from lessons and quizzes
 * - Auto-generated review lessons targeting struggle areas
 * - Progress tracking for reviewed content
 */

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
  RefreshControl
} from 'react-native';
import { useApp } from '../contexts/AppContext';

export default function ReviewScreen() {
  const { reviewAnalysis, generateReviewLesson, refreshReviewAnalysis } = useApp();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshReviewAnalysis();
    setRefreshing(false);
  };

  const handleGenerateLesson = async (focusType = null) => {
    setLoading(true);
    try {
      const result = await generateReviewLesson(focusType);
      if (result.success) {
        setSelectedLesson(result.lesson);
        setLessonStarted(false);
        setCurrentExercise(0);
        setAnswers({});
        setShowResults(false);
      } else {
        Alert.alert('Error', result.message || 'Failed to generate review lesson');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to generate review lesson. Please try again.');
      console.error('Generate lesson error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartLesson = () => {
    setLessonStarted(true);
  };

  const handleAnswerSelect = (exerciseIndex, answer) => {
    setAnswers({
      ...answers,
      [exerciseIndex]: answer
    });
  };

  const handleNextExercise = () => {
    if (currentExercise < selectedLesson.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      // Show results
      setShowResults(true);
    }
  };

  const handleCompleteLesson = () => {
    // Mark lesson as complete in context
    setSelectedLesson(null);
    setLessonStarted(false);
    setShowResults(false);
    onRefresh();
  };

  const calculateScore = () => {
    if (!selectedLesson) return 0;
    let correct = 0;
    selectedLesson.exercises.forEach((ex, i) => {
      if (answers[i] === ex.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / selectedLesson.exercises.length) * 100);
  };

  // If viewing a lesson
  if (selectedLesson) {
    if (!lessonStarted) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.lessonIntro}>
            <Text style={styles.lessonTitle}>{selectedLesson.title}</Text>

            <View style={styles.focusAreasContainer}>
              <Text style={styles.sectionTitle}>Focus Areas:</Text>
              {selectedLesson.focusAreas.map((area, i) => (
                <View key={i} style={styles.focusAreaTag}>
                  <Text style={styles.focusAreaText}>{area}</Text>
                </View>
              ))}
            </View>

            <View style={styles.explanationContainer}>
              <Text style={styles.sectionTitle}>What We'll Review:</Text>
              <Text style={styles.introText}>{selectedLesson.explanation.intro}</Text>

              {selectedLesson.explanation.sections.map((section, i) => (
                <View key={i} style={styles.explanationSection}>
                  <Text style={styles.topicTitle}>{section.topic}</Text>
                  <Text style={styles.explanationText}>{section.explanation}</Text>

                  {section.examples && section.examples.length > 0 && (
                    <View style={styles.examplesContainer}>
                      <Text style={styles.examplesTitle}>Examples:</Text>
                      {section.examples.map((example, j) => (
                        <Text key={j} style={styles.exampleText}>• {example}</Text>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </View>

            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {selectedLesson.exercises.length} practice exercises
              </Text>
              <Text style={styles.statsText}>
                Addresses {selectedLesson.strugglesAddressed} struggle points
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setSelectedLesson(null)}
              >
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.startButton}
                onPress={handleStartLesson}
              >
                <Text style={styles.startButtonText}>Start Practice</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    // Show results
    if (showResults) {
      const score = calculateScore();
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Review Complete!</Text>

            <View style={styles.scoreContainer}>
              <Text style={styles.scoreText}>{score}%</Text>
              <Text style={styles.scoreLabel}>
                {score >= 80 ? 'Great job!' : score >= 60 ? 'Good progress!' : 'Keep practicing!'}
              </Text>
            </View>

            <Text style={styles.sectionTitle}>Your Answers:</Text>
            {selectedLesson.exercises.map((ex, i) => {
              const isCorrect = answers[i] === ex.correctAnswer;
              return (
                <View key={i} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <Text style={styles.resultQuestion}>{i + 1}. {ex.question}</Text>
                    <Text style={isCorrect ? styles.correctBadge : styles.incorrectBadge}>
                      {isCorrect ? '✓' : '✗'}
                    </Text>
                  </View>

                  {!isCorrect && (
                    <View style={styles.answerFeedback}>
                      <Text style={styles.yourAnswer}>Your answer: {answers[i]}</Text>
                      <Text style={styles.correctAnswer}>Correct: {ex.correctAnswer}</Text>
                    </View>
                  )}

                  <Text style={styles.explanationSmall}>{ex.explanation}</Text>
                </View>
              );
            })}

            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>Key Takeaways:</Text>
              <Text style={styles.summaryText}>{selectedLesson.summary}</Text>
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={handleCompleteLesson}
            >
              <Text style={styles.completeButtonText}>Complete Review</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      );
    }

    // Show exercise
    const exercise = selectedLesson.exercises[currentExercise];
    const progress = ((currentExercise + 1) / selectedLesson.exercises.length) * 100;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.exerciseContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>

          <Text style={styles.progressText}>
            Exercise {currentExercise + 1} of {selectedLesson.exercises.length}
          </Text>

          <ScrollView contentContainerStyle={styles.exerciseContent}>
            <Text style={styles.exerciseQuestion}>{exercise.question}</Text>

            {exercise.type === 'multiple-choice' && exercise.options && (
              <View style={styles.optionsContainer}>
                {exercise.options.map((option, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[
                      styles.optionButton,
                      answers[currentExercise] === option && styles.optionSelected
                    ]}
                    onPress={() => handleAnswerSelect(currentExercise, option)}
                  >
                    <Text style={[
                      styles.optionText,
                      answers[currentExercise] === option && styles.optionTextSelected
                    ]}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {exercise.type !== 'multiple-choice' && (
              <View style={styles.openAnswerContainer}>
                <Text style={styles.openAnswerHint}>Type your answer:</Text>
                <Text style={styles.openAnswerNote}>
                  (For this demo, tap the correct answer below)
                </Text>
                <TouchableOpacity
                  style={[
                    styles.optionButton,
                    answers[currentExercise] === exercise.correctAnswer && styles.optionSelected
                  ]}
                  onPress={() => handleAnswerSelect(currentExercise, exercise.correctAnswer)}
                >
                  <Text style={[
                    styles.optionText,
                    answers[currentExercise] === exercise.correctAnswer && styles.optionTextSelected
                  ]}>
                    {exercise.correctAnswer}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={styles.exerciseButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                if (currentExercise > 0) {
                  setCurrentExercise(currentExercise - 1);
                }
              }}
              disabled={currentExercise === 0}
            >
              <Text style={[
                styles.secondaryButtonText,
                currentExercise === 0 && styles.disabledText
              ]}>
                Previous
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                !answers[currentExercise] && styles.disabledButton
              ]}
              onPress={handleNextExercise}
              disabled={!answers[currentExercise]}
            >
              <Text style={styles.primaryButtonText}>
                {currentExercise === selectedLesson.exercises.length - 1 ? 'Finish' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Main review screen
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.title}>Review & Practice</Text>
        <Text style={styles.subtitle}>
          Personalized lessons based on your struggle areas
        </Text>

        {reviewAnalysis && reviewAnalysis.totalStruggles > 0 ? (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsCardTitle}>Your Progress</Text>
              <Text style={styles.bigNumber}>{reviewAnalysis.totalStruggles}</Text>
              <Text style={styles.statsLabel}>areas to review</Text>
            </View>

            <View style={styles.weakAreasSection}>
              <Text style={styles.sectionTitle}>Weak Areas Detected:</Text>
              {reviewAnalysis.weakAreas.map((area, index) => (
                <View key={index} style={styles.weakAreaCard}>
                  <View style={styles.weakAreaHeader}>
                    <Text style={styles.weakAreaType}>{area.type}</Text>
                    <View style={[
                      styles.priorityBadge,
                      area.priority === 'high' && styles.priorityHigh,
                      area.priority === 'medium' && styles.priorityMedium,
                      area.priority === 'low' && styles.priorityLow
                    ]}>
                      <Text style={styles.priorityText}>{area.priority}</Text>
                    </View>
                  </View>

                  <Text style={styles.weakAreaCount}>
                    {area.count} struggle{area.count !== 1 ? 's' : ''}
                  </Text>

                  <TouchableOpacity
                    style={styles.reviewButton}
                    onPress={() => handleGenerateLesson(area.type)}
                    disabled={loading}
                  >
                    <Text style={styles.reviewButtonText}>
                      Generate {area.type} Review
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <TouchableOpacity
              style={styles.generateAllButton}
              onPress={() => handleGenerateLesson(null)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.generateAllButtonText}>
                  Generate Mixed Review Lesson
                </Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📚</Text>
            <Text style={styles.emptyStateTitle}>No Review Content Yet</Text>
            <Text style={styles.emptyStateText}>
              Complete some lessons and quizzes first. The app will track areas where you struggle and create personalized review content.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  statsCardTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 12,
  },
  bigNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsLabel: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  weakAreasSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  weakAreaCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weakAreaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  weakAreaType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityHigh: {
    backgroundColor: '#FF6B6B',
  },
  priorityMedium: {
    backgroundColor: '#FFA500',
  },
  priorityLow: {
    backgroundColor: '#4CAF50',
  },
  priorityText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  weakAreaCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  reviewButton: {
    backgroundColor: '#4A90E2',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  generateAllButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  generateAllButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  lessonIntro: {
    padding: 20,
  },
  lessonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  focusAreasContainer: {
    marginBottom: 24,
  },
  focusAreaTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
    marginRight: 8,
  },
  focusAreaText: {
    color: '#1976D2',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  explanationContainer: {
    marginBottom: 24,
  },
  introText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  explanationSection: {
    marginBottom: 20,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 12,
  },
  examplesContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 4,
  },
  statsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  statsText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  startButton: {
    flex: 2,
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseContainer: {
    flex: 1,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A90E2',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    paddingVertical: 12,
  },
  exerciseContent: {
    flex: 1,
    padding: 20,
  },
  exerciseQuestion: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    lineHeight: 28,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  optionSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#E3F2FD',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#1976D2',
    fontWeight: '600',
  },
  openAnswerContainer: {
    gap: 12,
  },
  openAnswerHint: {
    fontSize: 16,
    color: '#666',
  },
  openAnswerNote: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  exerciseButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 2,
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#999',
  },
  resultsContainer: {
    padding: 20,
  },
  resultsTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  scoreContainer: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 32,
  },
  scoreText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#fff',
    marginTop: 8,
  },
  resultItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  resultQuestion: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  correctBadge: {
    fontSize: 24,
    color: '#4CAF50',
    marginLeft: 8,
  },
  incorrectBadge: {
    fontSize: 24,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  answerFeedback: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  yourAnswer: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 4,
  },
  correctAnswer: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  explanationSmall: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  summaryContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
    marginBottom: 24,
  },
  summaryText: {
    fontSize: 16,
    color: '#2E7D32',
    lineHeight: 24,
  },
  completeButton: {
    backgroundColor: '#28a745',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
