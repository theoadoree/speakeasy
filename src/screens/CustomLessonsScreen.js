import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import LLMService from '../services/llm';
import StorageService from '../utils/storage';
import { awardCustomLessonCreatedXP, incrementLessonsCompleted } from '../utils/xp';
import XPReward from '../components/XPReward';

const LESSON_TYPES = [
  { id: 'vocabulary', label: 'Vocabulary Builder', icon: 'book', color: '#4CAF50' },
  { id: 'grammar', label: 'Grammar Focus', icon: 'construct', color: '#9C27B0' },
  { id: 'conversation', label: 'Conversation Practice', icon: 'chatbubbles', color: '#FF9800' },
  { id: 'reading', label: 'Reading Comprehension', icon: 'reader', color: '#2196F3' },
  { id: 'writing', label: 'Writing Exercise', icon: 'create', color: '#F44336' },
  { id: 'culture', label: 'Cultural Context', icon: 'globe', color: '#00BCD4' }
];

const CustomLessonsScreen = () => {
  const { userProfile, llmConnected } = useApp();
  const [savedLessons, setSavedLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatingLesson, setGeneratingLesson] = useState(false);
  const [selectedType, setSelectedType] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [xpReward, setXpReward] = useState(null);

  useEffect(() => {
    loadSavedLessons();
  }, []);

  const loadSavedLessons = async () => {
    const lessons = await StorageService.getCustomLessons();
    setSavedLessons(lessons);
  };

  const generateLesson = async (type) => {
    if (!llmConnected) {
      Alert.alert('Error', 'LLM is not connected. Please configure it in Settings.');
      return;
    }

    setGeneratingLesson(true);
    setSelectedType(type);

    try {
      const prompt = getLessonPrompt(type);
      const response = await LLMService.generateResponse(prompt);

      // Try to parse JSON response
      let lessonData;
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          lessonData = JSON.parse(jsonMatch[0]);
        } else {
          lessonData = {
            type: type.id,
            content: response,
            exercises: []
          };
        }
      } catch (parseError) {
        lessonData = {
          type: type.id,
          content: response,
          exercises: []
        };
      }

      const lesson = {
        type: type.id,
        typeName: type.label,
        typeColor: type.color,
        data: lessonData,
        timestamp: new Date().toISOString()
      };

      setCurrentLesson(lesson);
    } catch (error) {
      console.error('Error generating lesson:', error);
      Alert.alert('Error', 'Failed to generate lesson. Please try again.');
    } finally {
      setGeneratingLesson(false);
    }
  };

  const getLessonPrompt = (type) => {
    const targetLanguage = userProfile?.targetLanguage || 'Spanish';
    const level = userProfile?.level || 'intermediate';
    const interests = userProfile?.interests || [];

    const basePrompt = `Create a ${level} level ${type.label} lesson for learning ${targetLanguage}.`;

    const interestsText = interests.length > 0
      ? ` The learner is interested in: ${interests.join(', ')}.`
      : '';

    let specificInstructions = '';

    switch (type.id) {
      case 'vocabulary':
        specificInstructions = `
        Include:
        1. 15-20 thematic vocabulary words with translations
        2. Example sentences for each word
        3. Memory tips or mnemonics
        4. Practice exercises (matching, fill-in-the-blank)

        Format as JSON:
        {
          "theme": "theme name",
          "vocabulary": [
            {
              "word": "word",
              "translation": "translation",
              "example": "example sentence",
              "tip": "memory tip"
            }
          ],
          "exercises": [
            {
              "type": "matching|fill_in_blank",
              "question": "question",
              "answer": "answer",
              "options": ["option1", "option2", "option3", "option4"]
            }
          ]
        }`;
        break;

      case 'grammar':
        specificInstructions = `
        Include:
        1. Clear explanation of one grammar concept
        2. Rules and patterns
        3. Common mistakes to avoid
        4. 10+ example sentences
        5. Practice exercises

        Format as JSON:
        {
          "concept": "grammar concept name",
          "explanation": "detailed explanation",
          "rules": ["rule 1", "rule 2"],
          "examples": ["example 1", "example 2"],
          "commonMistakes": ["mistake 1", "mistake 2"],
          "exercises": [
            {
              "type": "correction|transformation",
              "question": "question",
              "answer": "answer"
            }
          ]
        }`;
        break;

      case 'conversation':
        specificInstructions = `
        Include:
        1. A realistic dialogue scenario
        2. Key phrases and expressions
        3. Cultural notes about the conversation
        4. Role-play exercises
        5. Follow-up questions

        Format as JSON:
        {
          "scenario": "scenario description",
          "dialogue": [
            {"speaker": "A", "text": "dialogue line"},
            {"speaker": "B", "text": "dialogue line"}
          ],
          "keyPhrases": [
            {"phrase": "phrase", "meaning": "meaning", "usage": "when to use"}
          ],
          "culturalNotes": "cultural context",
          "exercises": [
            {
              "type": "response",
              "prompt": "situation",
              "sampleAnswer": "example response"
            }
          ]
        }`;
        break;

      case 'reading':
        specificInstructions = `
        Include:
        1. A short story or article (200-300 words)
        2. Vocabulary glossary for difficult words
        3. Comprehension questions
        4. Discussion questions

        Format as JSON:
        {
          "title": "title",
          "text": "full text of the reading",
          "glossary": [
            {"word": "word", "definition": "definition"}
          ],
          "comprehension": [
            {
              "question": "question",
              "answer": "answer",
              "options": ["a", "b", "c", "d"]
            }
          ],
          "discussion": ["question 1", "question 2"]
        }`;
        break;

      case 'writing':
        specificInstructions = `
        Include:
        1. Writing prompt
        2. Useful vocabulary and phrases
        3. Structure guidelines
        4. Sample response
        5. Self-check criteria

        Format as JSON:
        {
          "prompt": "writing prompt",
          "vocabulary": ["word 1", "word 2"],
          "phrases": ["phrase 1", "phrase 2"],
          "structure": ["step 1", "step 2"],
          "sampleResponse": "sample text",
          "checkCriteria": ["criterion 1", "criterion 2"]
        }`;
        break;

      case 'culture':
        specificInstructions = `
        Include:
        1. Cultural topic explanation
        2. Historical or social context
        3. Comparisons with other cultures
        4. Practical applications
        5. Discussion questions

        Format as JSON:
        {
          "topic": "cultural topic",
          "explanation": "detailed explanation",
          "context": "historical/social context",
          "comparisons": "cultural comparisons",
          "practicalTips": ["tip 1", "tip 2"],
          "discussion": ["question 1", "question 2"]
        }`;
        break;
    }

    return basePrompt + interestsText + specificInstructions;
  };

  const saveLesson = async () => {
    if (!currentLesson) return;

    const result = await StorageService.saveCustomLesson(currentLesson);

    if (result.success) {
      // Award XP for creating a custom lesson
      const xpResult = await awardCustomLessonCreatedXP();

      if (xpResult.success) {
        setXpReward({
          amount: xpResult.amount,
          reason: xpResult.reason
        });
      }

      // Increment lessons completed
      await incrementLessonsCompleted();

      Alert.alert('Success', `Lesson saved successfully!\n\n+${xpResult.amount} XP earned!`);
      await loadSavedLessons();
      setCurrentLesson(null); // Close lesson viewer
    } else {
      Alert.alert('Error', 'Failed to save lesson');
    }
  };

  const deleteLesson = async (lessonId) => {
    Alert.alert(
      'Delete Lesson',
      'Are you sure you want to delete this lesson?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await StorageService.deleteCustomLesson(lessonId);
            await loadSavedLessons();
          }
        }
      ]
    );
  };

  const renderLessonTypeCard = (type) => {
    return (
      <TouchableOpacity
        key={type.id}
        style={styles.lessonTypeCard}
        onPress={() => generateLesson(type)}
        disabled={generatingLesson}
      >
        <View style={[styles.lessonTypeIcon, { backgroundColor: type.color }]}>
          <Ionicons name={type.icon} size={32} color="#FFF" />
        </View>
        <Text style={styles.lessonTypeLabel}>{type.label}</Text>
      </TouchableOpacity>
    );
  };

  const renderSavedLesson = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.savedLessonCard}
        onPress={() => setCurrentLesson(item)}
      >
        <View style={[styles.savedLessonIcon, { backgroundColor: item.typeColor }]}>
          <Ionicons
            name={LESSON_TYPES.find(t => t.id === item.type)?.icon || 'book'}
            size={24}
            color="#FFF"
          />
        </View>

        <View style={styles.savedLessonInfo}>
          <Text style={styles.savedLessonType}>{item.typeName}</Text>
          <Text style={styles.savedLessonDate}>
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => deleteLesson(item.id)}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#F44336" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderCurrentLesson = () => {
    if (!currentLesson) return null;

    return (
      <ScrollView style={styles.lessonViewer} contentContainerStyle={styles.lessonViewerContent}>
        <View style={styles.lessonHeader}>
          <TouchableOpacity onPress={() => setCurrentLesson(null)} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <View style={styles.lessonHeaderInfo}>
            <View style={[styles.lessonHeaderIcon, { backgroundColor: currentLesson.typeColor }]}>
              <Ionicons
                name={LESSON_TYPES.find(t => t.id === currentLesson.type)?.icon || 'book'}
                size={24}
                color="#FFF"
              />
            </View>
            <Text style={styles.lessonHeaderTitle}>{currentLesson.typeName}</Text>
          </View>

          {!currentLesson.id && (
            <TouchableOpacity onPress={saveLesson} style={styles.saveButton}>
              <Ionicons name="bookmark" size={24} color="#007AFF" />
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.lessonContent}>
          <Text style={styles.lessonContentText}>
            {JSON.stringify(currentLesson.data, null, 2)}
          </Text>
        </View>
      </ScrollView>
    );
  };

  if (!llmConnected) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#FF9800" />
          <Text style={styles.errorTitle}>LLM Not Connected</Text>
          <Text style={styles.errorText}>
            Please configure your LLM connection in Settings to use Custom Lessons.
          </Text>
        </View>
      </View>
    );
  }

  if (currentLesson) {
    return <View style={styles.container}>{renderCurrentLesson()}</View>;
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="sparkles" size={48} color="#007AFF" />
          <Text style={styles.title}>Custom Lessons</Text>
          <Text style={styles.subtitle}>
            AI-generated lessons tailored to your learning goals
          </Text>
        </View>

        {/* Generating Indicator */}
        {generatingLesson && (
          <View style={styles.generatingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.generatingText}>
              Generating your {selectedType?.label}...
            </Text>
          </View>
        )}

        {/* Lesson Types */}
        {!generatingLesson && (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Choose a Lesson Type</Text>
              <View style={styles.lessonTypesGrid}>
                {LESSON_TYPES.map(renderLessonTypeCard)}
              </View>
            </View>

            {/* Saved Lessons */}
            {savedLessons.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Your Saved Lessons ({savedLessons.length})
                </Text>
                <FlatList
                  data={savedLessons}
                  renderItem={renderSavedLesson}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: Platform.OS === 'ios' ? 44 : 24
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32
  },
  generatingContainer: {
    alignItems: 'center',
    padding: 40
  },
  generatingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  lessonTypesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  lessonTypeCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  lessonTypeIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12
  },
  lessonTypeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center'
  },
  savedLessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  savedLessonIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center'
  },
  savedLessonInfo: {
    flex: 1
  },
  savedLessonType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  savedLessonDate: {
    fontSize: 14,
    color: '#666'
  },
  deleteButton: {
    padding: 8
  },
  lessonViewer: {
    flex: 1,
    backgroundColor: '#FFF'
  },
  lessonViewerContent: {
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12
  },
  closeButton: {
    padding: 4
  },
  lessonHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  lessonHeaderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  lessonHeaderTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF'
  },
  lessonContent: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16
  },
  lessonContentText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  }
});

export default CustomLessonsScreen;
