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
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import LessonService from '../services/lesson';

export default function LessonDetailScreen({ route, navigation }) {
  const { lessonId } = route.params;
  const {
    userProfile,
    lessonProgress,
    startCurriculumLesson,
    completeCurriculumLesson,
    generateLessonContent,
    generateRoleplay,
  } = useApp();
  const { theme } = useTheme();

  const [lesson, setLesson] = useState(null);
  const [lessonContent, setLessonContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentSection, setCurrentSection] = useState('overview');

  useEffect(() => {
    loadLesson();
    setStartTime(Date.now());

    // Mark lesson as started
    const markStarted = async () => {
      const progress = lessonProgress[lessonId];
      if (!progress || !progress.started) {
        await startCurriculumLesson(lessonId);
      }
    };
    markStarted();

    return () => {
      // Cleanup - could save partial progress here
    };
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const lessonData = LessonService.getLesson(lessonId, userProfile?.targetLanguage || 'spanish');
      setLesson(lessonData);
    } catch (error) {
      console.error('Error loading lesson:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const generateContent = async () => {
    setGeneratingContent(true);
    try {
      const result = await generateLessonContent(lessonId);
      if (result.success) {
        setLessonContent(result.content);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate content');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      Alert.alert('Error', 'Failed to generate content');
    } finally {
      setGeneratingContent(false);
    }
  };

  const startRoleplay = async () => {
    try {
      const result = await generateRoleplay(lessonId);
      if (result.success && result.roleplay) {
        navigation.navigate('Practice', {
          lessonId,
          roleplayScenario: result.roleplay,
        });
      } else {
        Alert.alert('Error', result.error || 'No roleplay available for this lesson');
      }
    } catch (error) {
      console.error('Error starting roleplay:', error);
      Alert.alert('Error', 'Failed to start roleplay');
    }
  };

  const completeLesson = async () => {
    const timeSpent = Math.floor((Date.now() - startTime) / 1000); // seconds
    await completeCurriculumLesson(lessonId, timeSpent);

    // Navigate to quiz
    navigation.navigate('Quiz', { lessonId });
  };

  const renderObjectives = () => {
    if (!lesson?.objectives) return null;

    return (
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          🎯 Learning Objectives
        </Text>
        {lesson.objectives.map((objective, index) => (
          <View key={index} style={styles.objectiveItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={[styles.objectiveText, { color: theme.text }]}>{objective}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderVocabulary = () => {
    const vocab = lesson?.vocabulary;
    const languageSpecific = lesson?.languageSpecificContent;

    if (!vocab && !languageSpecific?.vocabulary) return null;

    const displayVocab = languageSpecific?.vocabulary || vocab;
    const vocabList = Array.isArray(displayVocab) ? displayVocab : Object.values(displayVocab).flat();

    return (
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          📚 Key Vocabulary
        </Text>
        <View style={styles.vocabGrid}>
          {vocabList.slice(0, 12).map((word, index) => (
            <View key={index} style={[styles.vocabChip, { backgroundColor: theme.border }]}>
              <Text style={[styles.vocabText, { color: theme.text }]}>{word}</Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderGrammar = () => {
    const grammar = lesson?.grammar;
    const languageSpecific = lesson?.languageSpecificContent;

    if (!grammar && !languageSpecific?.grammar) return null;

    return (
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          ✏️ Grammar Focus
        </Text>
        {grammar && grammar.map((item, index) => (
          <View key={index} style={styles.grammarItem}>
            <Text style={[styles.grammarText, { color: theme.text }]}>{item}</Text>
          </View>
        ))}
        {languageSpecific?.grammar && (
          <View style={[styles.grammarExamples, { backgroundColor: theme.background }]}>
            <Text style={[styles.grammarExamplesTitle, { color: theme.textSecondary }]}>
              Examples:
            </Text>
            {languageSpecific.grammar.examples?.map((example, index) => (
              <Text key={index} style={[styles.exampleText, { color: theme.text }]}>
                • {example}
              </Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderAIContent = () => {
    if (!lessonContent) {
      return (
        <View style={[styles.section, { backgroundColor: theme.card }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            🤖 AI-Generated Lesson Content
          </Text>
          <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
            Get personalized examples and exercises generated just for you
          </Text>
          <TouchableOpacity
            style={styles.generateButton}
            onPress={generateContent}
            disabled={generatingContent}
          >
            {generatingContent ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.generateButtonText}>Generate Content</Text>
                <Text style={styles.generateButtonIcon}>✨</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          📝 Lesson Content
        </Text>
        <Text style={[styles.contentText, { color: theme.text }]}>
          {lessonContent.introduction}
        </Text>

        {lessonContent.examples && (
          <>
            <Text style={[styles.subsectionTitle, { color: theme.text }]}>Examples:</Text>
            <Text style={[styles.contentText, { color: theme.text }]}>
              {lessonContent.examples}
            </Text>
          </>
        )}

        {lessonContent.dialogue && (
          <>
            <Text style={[styles.subsectionTitle, { color: theme.text }]}>Dialogue:</Text>
            <View style={[styles.dialogueBox, { backgroundColor: theme.background }]}>
              <Text style={[styles.dialogueText, { color: theme.text }]}>
                {lessonContent.dialogue}
              </Text>
            </View>
          </>
        )}
      </View>
    );
  };

  const renderExercises = () => {
    if (!lesson?.exercises) return null;

    return (
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          📋 Practice Exercises
        </Text>
        {lesson.exercises.map((exercise, index) => (
          <View key={index} style={[styles.exerciseCard, { backgroundColor: theme.background }]}>
            <Text style={[styles.exerciseType, { color: '#007AFF' }]}>
              {exercise.type.replace('_', ' ').toUpperCase()}
            </Text>
            <Text style={[styles.exerciseDescription, { color: theme.text }]}>
              {exercise.focus}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderRoleplay = () => {
    if (!lesson?.aiRoleplay) return null;

    return (
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          🎭 AI Conversation Practice
        </Text>
        <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
          Scenario: {lesson.aiRoleplay.scenario.replace(/_/g, ' ')}
        </Text>
        <TouchableOpacity style={styles.roleplayButton} onPress={startRoleplay}>
          <Text style={styles.roleplayButtonText}>Start Conversation</Text>
          <Text style={styles.roleplayButtonIcon}>💬</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCulturalNotes = () => {
    const culturalNotes = lesson?.languageSpecificContent?.culturalNotes;
    if (!culturalNotes) return null;

    const notes = Array.isArray(culturalNotes) ? culturalNotes : [culturalNotes];

    return (
      <View style={[styles.section, { backgroundColor: theme.card }]}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          🌍 Cultural Notes
        </Text>
        {notes.map((note, index) => (
          <View key={index} style={[styles.culturalNoteCard, { backgroundColor: '#FFF9E6' }]}>
            <Text style={styles.culturalNoteText}>{note}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  if (!lesson) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Lesson not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.lessonNumber, { color: theme.textSecondary }]}>
            LESSON {lesson.id} OF 30
          </Text>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={2}>
            {lesson.title}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Phase {lesson.phase}: {lesson.phase === 1 ? 'Foundation' : lesson.phase === 2 ? 'Daily Life' : lesson.phase === 3 ? 'Communication' : 'Fluency'} • {lesson.estimatedMinutes} min
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressBarContainer, { backgroundColor: theme.border }]}>
        <View style={[styles.progressBarFill, { width: `${(lesson.id / 30) * 100}%` }]} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={[styles.description, { color: theme.text }]}>{lesson.description}</Text>
        </View>

        {renderObjectives()}
        {renderVocabulary()}
        {renderGrammar()}
        {renderAIContent()}
        {renderExercises()}
        {renderRoleplay()}
        {renderCulturalNotes()}

        {/* Complete Lesson Button */}
        <View style={styles.completeSection}>
          <TouchableOpacity style={styles.completeButton} onPress={completeLesson}>
            <Text style={styles.completeButtonText}>Complete Lesson & Take Quiz</Text>
            <Text style={styles.completeButtonIcon}>→</Text>
          </TouchableOpacity>
          <Text style={[styles.completeHint, { color: theme.textSecondary }]}>
            You must pass the quiz (70%+) to unlock the next lesson
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
    fontSize: 24,
    color: '#007AFF',
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
  progressBarContainer: {
    height: 4,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
  },
  scrollView: {
    flex: 1,
  },
  descriptionContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  objectiveItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    color: '#007AFF',
  },
  objectiveText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  vocabGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vocabChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  vocabText: {
    fontSize: 14,
  },
  grammarItem: {
    marginBottom: 8,
  },
  grammarText: {
    fontSize: 15,
    fontWeight: '500',
  },
  grammarExamples: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  grammarExamplesTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  generateButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  generateButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  generateButtonIcon: {
    fontSize: 20,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  dialogueBox: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
  },
  dialogueText: {
    fontSize: 14,
    lineHeight: 22,
    fontFamily: 'monospace',
  },
  exerciseCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseType: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  exerciseDescription: {
    fontSize: 14,
  },
  roleplayButton: {
    backgroundColor: '#34C759',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roleplayButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  roleplayButtonIcon: {
    fontSize: 20,
  },
  culturalNoteCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  culturalNoteText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#8B6914',
  },
  completeSection: {
    paddingHorizontal: 16,
    marginTop: 8,
  },
  completeButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  completeButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '600',
  },
  completeButtonIcon: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  completeHint: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
