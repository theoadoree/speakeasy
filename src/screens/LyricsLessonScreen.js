import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import MusicService from '../services/music';
import StorageService from '../utils/storage';
import { awardLyricsLessonXP, incrementLessonsCompleted } from '../utils/xp';
import XPReward from '../components/XPReward';

const LyricsLessonScreen = ({ route, navigation }) => {
  const { song, lyrics, lessonData: existingLessonData } = route.params || {};
  const { userProfile } = useApp();

  const [loading, setLoading] = useState(false);
  const [lessonData, setLessonData] = useState(existingLessonData);
  const [selectedTab, setSelectedTab] = useState('lyrics'); // 'lyrics', 'vocabulary', 'exercises'
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [xpReward, setXpReward] = useState(null);

  useEffect(() => {
    if (!existingLessonData && lyrics) {
      generateLesson();
    }
  }, []);

  const generateLesson = async () => {
    setLoading(true);

    try {
      const lesson = await MusicService.createLyricsLesson(
        lyrics,
        userProfile?.targetLanguage || 'Spanish',
        userProfile?.level || 'intermediate'
      );

      setLessonData(lesson);

      // Save lesson to storage
      await StorageService.saveMusicLesson({
        song,
        lyrics,
        lessonData: lesson
      });
    } catch (error) {
      console.error('Error generating lesson:', error);
      Alert.alert('Error', 'Failed to generate lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExerciseAnswer = (exerciseIndex, answer) => {
    setExerciseAnswers({
      ...exerciseAnswers,
      [exerciseIndex]: answer
    });
  };

  const checkAnswers = async () => {
    let correct = 0;
    let total = lessonData.exercises?.length || 0;

    lessonData.exercises?.forEach((exercise, index) => {
      if (exerciseAnswers[index] === exercise.answer) {
        correct++;
      }
    });

    setShowAnswers(true);

    // Award XP based on performance
    const xpResult = await awardLyricsLessonXP(correct, total);

    if (xpResult.success) {
      setXpReward({
        amount: xpResult.amount,
        reason: xpResult.reason
      });
    }

    // Increment lessons completed
    await incrementLessonsCompleted();

    Alert.alert(
      'Results',
      `You got ${correct} out of ${total} correct! ${correct === total ? '🎉' : ''}\n\n+${xpResult.amount} XP earned!`,
      [
        {
          text: 'OK'
        }
      ]
    );
  };

  const resetExercises = () => {
    setExerciseAnswers({});
    setShowAnswers(false);
  };

  const renderLyricsTab = () => {
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabScrollContent}>
        <View style={styles.lyricsContainer}>
          <Text style={styles.lyricsText}>{lyrics}</Text>
        </View>

        {lessonData?.culturalNotes && (
          <View style={styles.culturalNotesBox}>
            <View style={styles.culturalNotesHeader}>
              <Ionicons name="globe" size={20} color="#007AFF" />
              <Text style={styles.culturalNotesTitle}>Cultural Notes</Text>
            </View>
            <Text style={styles.culturalNotesText}>{lessonData.culturalNotes}</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  const renderVocabularyTab = () => {
    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabScrollContent}>
        {/* Vocabulary Section */}
        {lessonData?.vocabulary && lessonData.vocabulary.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vocabulary ({lessonData.vocabulary.length})</Text>
            {lessonData.vocabulary.map((item, index) => (
              <View key={index} style={styles.vocabCard}>
                <View style={styles.vocabHeader}>
                  <Text style={styles.vocabWord}>{item.word}</Text>
                  <Text style={styles.vocabTranslation}>{item.translation}</Text>
                </View>
                {item.context && (
                  <Text style={styles.vocabContext}>"{item.context}"</Text>
                )}
                {item.difficulty && (
                  <View style={styles.vocabFooter}>
                    <View style={[
                      styles.difficultyTag,
                      { backgroundColor: getDifficultyColor(item.difficulty) }
                    ]}>
                      <Text style={styles.difficultyText}>{item.difficulty}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Phrases Section */}
        {lessonData?.phrases && lessonData.phrases.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Phrases ({lessonData.phrases.length})</Text>
            {lessonData.phrases.map((item, index) => (
              <View key={index} style={styles.phraseCard}>
                <Text style={styles.phraseText}>{item.phrase}</Text>
                <Text style={styles.phraseMeaning}>{item.meaning}</Text>
                {item.usage && (
                  <Text style={styles.phraseUsage}>💡 {item.usage}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Grammar Points Section */}
        {lessonData?.grammarPoints && lessonData.grammarPoints.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Grammar Points</Text>
            {lessonData.grammarPoints.map((item, index) => (
              <View key={index} style={styles.grammarCard}>
                <Text style={styles.grammarConcept}>{item.concept}</Text>
                <Text style={styles.grammarExplanation}>{item.explanation}</Text>
                {item.examples && item.examples.length > 0 && (
                  <View style={styles.grammarExamples}>
                    <Text style={styles.grammarExamplesTitle}>Examples:</Text>
                    {item.examples.map((example, i) => (
                      <Text key={i} style={styles.grammarExample}>• {example}</Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  const renderExercisesTab = () => {
    if (!lessonData?.exercises || lessonData.exercises.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="create" size={64} color="#CCC" />
          <Text style={styles.emptyStateText}>No exercises available</Text>
        </View>
      );
    }

    return (
      <ScrollView style={styles.tabContent} contentContainerStyle={styles.tabScrollContent}>
        <View style={styles.exercisesHeader}>
          <Text style={styles.exercisesTitle}>
            Practice Exercises ({lessonData.exercises.length})
          </Text>
          {showAnswers && (
            <TouchableOpacity style={styles.resetButton} onPress={resetExercises}>
              <Ionicons name="refresh" size={20} color="#007AFF" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          )}
        </View>

        {lessonData.exercises.map((exercise, index) => (
          <View key={index} style={styles.exerciseCard}>
            <Text style={styles.exerciseNumber}>Question {index + 1}</Text>
            <Text style={styles.exerciseQuestion}>{exercise.question}</Text>

            {exercise.type === 'fill_in_blank' && exercise.options && (
              <View style={styles.optionsContainer}>
                {exercise.options.map((option, optIndex) => {
                  const isSelected = exerciseAnswers[index] === option;
                  const isCorrect = showAnswers && option === exercise.answer;
                  const isWrong = showAnswers && isSelected && option !== exercise.answer;

                  return (
                    <TouchableOpacity
                      key={optIndex}
                      style={[
                        styles.optionButton,
                        isSelected && styles.optionButtonSelected,
                        isCorrect && styles.optionButtonCorrect,
                        isWrong && styles.optionButtonWrong
                      ]}
                      onPress={() => !showAnswers && handleExerciseAnswer(index, option)}
                      disabled={showAnswers}
                    >
                      <Text style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                        (isCorrect || isWrong) && styles.optionTextAnswer
                      ]}>
                        {option}
                      </Text>
                      {isCorrect && (
                        <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                      )}
                      {isWrong && (
                        <Ionicons name="close-circle" size={20} color="#F44336" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {showAnswers && exerciseAnswers[index] !== exercise.answer && (
              <View style={styles.correctAnswerBox}>
                <Text style={styles.correctAnswerLabel}>Correct answer:</Text>
                <Text style={styles.correctAnswerText}>{exercise.answer}</Text>
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={styles.checkButton}
          onPress={checkAnswers}
          disabled={Object.keys(exerciseAnswers).length === 0 || showAnswers}
        >
          <Text style={styles.checkButtonText}>
            {showAnswers ? 'Completed' : 'Check Answers'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return '#4CAF50';
      case 'intermediate':
        return '#FF9800';
      case 'advanced':
        return '#F44336';
      default:
        return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Creating your lesson...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {xpReward && (
        <XPReward
          amount={xpReward.amount}
          reason={xpReward.reason}
          onComplete={() => setXpReward(null)}
        />
      )}
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle} numberOfLines={1}>{song?.title || 'Song Lesson'}</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>{song?.artist || ''}</Text>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'lyrics' && styles.tabActive]}
          onPress={() => setSelectedTab('lyrics')}
        >
          <Ionicons
            name="musical-notes"
            size={20}
            color={selectedTab === 'lyrics' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, selectedTab === 'lyrics' && styles.tabTextActive]}>
            Lyrics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'vocabulary' && styles.tabActive]}
          onPress={() => setSelectedTab('vocabulary')}
        >
          <Ionicons
            name="book"
            size={20}
            color={selectedTab === 'vocabulary' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, selectedTab === 'vocabulary' && styles.tabTextActive]}>
            Learn
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'exercises' && styles.tabActive]}
          onPress={() => setSelectedTab('exercises')}
        >
          <Ionicons
            name="create"
            size={20}
            color={selectedTab === 'exercises' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, selectedTab === 'exercises' && styles.tabTextActive]}>
            Practice
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {selectedTab === 'lyrics' && renderLyricsTab()}
      {selectedTab === 'vocabulary' && renderVocabularyTab()}
      {selectedTab === 'exercises' && renderExercisesTab()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12
  },
  backButton: {
    padding: 4
  },
  headerInfo: {
    flex: 1
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666'
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6
  },
  tabActive: {
    borderBottomColor: '#007AFF'
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  tabTextActive: {
    color: '#007AFF'
  },
  tabContent: {
    flex: 1
  },
  tabScrollContent: {
    padding: 16,
    paddingBottom: 32
  },
  lyricsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  lyricsText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  culturalNotesBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16
  },
  culturalNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  culturalNotesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF'
  },
  culturalNotesText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1976D2'
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  vocabCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  vocabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  vocabWord: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  vocabTranslation: {
    fontSize: 16,
    color: '#666'
  },
  vocabContext: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
    marginBottom: 8
  },
  vocabFooter: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  difficultyTag: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF'
  },
  phraseCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  phraseText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  phraseMeaning: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8
  },
  phraseUsage: {
    fontSize: 13,
    color: '#4CAF50',
    fontStyle: 'italic'
  },
  grammarCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#9C27B0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  grammarConcept: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#9C27B0',
    marginBottom: 8
  },
  grammarExplanation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  grammarExamples: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12
  },
  grammarExamplesTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8
  },
  grammarExample: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20
  },
  exercisesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  exercisesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF'
  },
  exerciseCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  exerciseNumber: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8
  },
  exerciseQuestion: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24
  },
  optionsContainer: {
    gap: 12
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF'
  },
  optionButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD'
  },
  optionButtonCorrect: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9'
  },
  optionButtonWrong: {
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE'
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    flex: 1
  },
  optionTextSelected: {
    fontWeight: '600',
    color: '#007AFF'
  },
  optionTextAnswer: {
    fontWeight: '600'
  },
  correctAnswerBox: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50'
  },
  correctAnswerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4
  },
  correctAnswerText: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600'
  },
  checkButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8
  },
  checkButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF'
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16
  }
});

export default LyricsLessonScreen;
