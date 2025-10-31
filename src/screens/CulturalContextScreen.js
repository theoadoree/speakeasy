/**
 * CulturalContextScreen - Learn cultural nuances, idioms, and social norms
 *
 * Features:
 * - Idioms and expressions with context
 * - Cultural gestures and body language
 * - Social etiquette and customs
 * - Regional variations
 * - Taboos and sensitivities
 * - Interactive scenarios
 */

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
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import LLMService from '../services/llm';
import UserMenu from '../components/UserMenu';

export default function CulturalContextScreen({ navigation }) {
  const { userProfile } = useApp();
  const { theme } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState('idioms');
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const categories = [
    { id: 'idioms', icon: '💬', title: 'Idioms & Expressions', description: 'Common sayings and phrases' },
    { id: 'gestures', icon: '👋', title: 'Gestures & Body Language', description: 'Non-verbal communication' },
    { id: 'etiquette', icon: '🤝', title: 'Social Etiquette', description: 'Manners and customs' },
    { id: 'dining', icon: '🍽️', title: 'Dining Culture', description: 'Food customs and table manners' },
    { id: 'greetings', icon: '👋', title: 'Greetings & Farewells', description: 'How to say hello and goodbye' },
    { id: 'taboos', icon: '⚠️', title: 'Taboos & Sensitivities', description: 'What to avoid' },
    { id: 'holidays', icon: '🎉', title: 'Holidays & Celebrations', description: 'Cultural festivals' },
    { id: 'business', icon: '💼', title: 'Business Culture', description: 'Professional etiquette' },
  ];

  useEffect(() => {
    loadLessons();
  }, [selectedCategory]);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const result = await generateCulturalLessons(selectedCategory);
      if (result.success) {
        setLessons(result.lessons || []);
      }
    } catch (error) {
      console.error('Failed to load lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCulturalLessons = async (category) => {
    const targetLanguage = userProfile?.targetLanguage || 'Spanish';
    const level = userProfile?.level || 'intermediate';

    const prompts = {
      idioms: `Generate 5 common idioms in ${targetLanguage} with explanations. For each idiom provide:
- The idiom in ${targetLanguage}
- Literal translation to English
- Actual meaning
- Example usage in a sentence
- Cultural context
- Similar English equivalent
Format as JSON array.`,

      gestures: `Describe 5 important gestures and body language cues in ${targetLanguage}-speaking cultures. For each provide:
- Name/description of the gesture
- What it means
- When it's used
- Cultural significance
- Potential misunderstandings for foreigners
- Regional variations if any
Format as JSON array.`,

      etiquette: `Explain 5 important social etiquette rules in ${targetLanguage}-speaking cultures. For each provide:
- The etiquette rule
- Why it's important
- Examples of proper behavior
- Common mistakes foreigners make
- Consequences of not following the rule
Format as JSON array.`,

      dining: `Describe 5 dining customs in ${targetLanguage}-speaking cultures. For each provide:
- The custom or tradition
- Historical background
- How to participate correctly
- Regional variations
- Modern vs traditional practices
Format as JSON array.`,

      greetings: `Explain 5 different ways to greet people in ${targetLanguage}-speaking cultures. For each provide:
- The greeting phrase
- Pronunciation guide
- When to use it (formal/informal)
- Accompanying gestures
- Cultural context
- Response to expect
Format as JSON array.`,

      taboos: `List 5 cultural taboos or sensitive topics in ${targetLanguage}-speaking cultures. For each provide:
- The taboo topic or behavior
- Why it's considered taboo
- Historical/cultural background
- How to navigate conversations around it
- Alternative approaches
Format as JSON array.`,

      holidays: `Describe 5 important holidays or celebrations in ${targetLanguage}-speaking cultures. For each provide:
- Holiday name
- Date/time of year
- Historical significance
- Traditional activities
- Common greetings for the holiday
- Food and customs
Format as JSON array.`,

      business: `Explain 5 business etiquette rules in ${targetLanguage}-speaking cultures. For each provide:
- The business practice
- Why it's important
- Proper protocol
- Common mistakes
- Tips for success
Format as JSON array.`
    };

    const result = await LLMService.generate(prompts[category] || prompts.idioms);

    if (result.success) {
      try {
        const jsonMatch = result.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return {
            success: true,
            lessons: JSON.parse(jsonMatch[0])
          };
        }
      } catch (e) {
        console.error('Parse error:', e);
      }
    }

    return { success: false, lessons: [] };
  };

  const openLesson = (lesson) => {
    setSelectedLesson(lesson);
    setModalVisible(true);
  };

  const renderLessonCard = (lesson, index) => {
    const category = categories.find(c => c.id === selectedCategory);

    return (
      <TouchableOpacity
        key={index}
        style={[styles.lessonCard, { backgroundColor: theme.card }]}
        onPress={() => openLesson(lesson)}
      >
        <View style={styles.lessonHeader}>
          <Text style={styles.lessonIcon}>{category?.icon || '📖'}</Text>
          <View style={styles.lessonInfo}>
            <Text style={[styles.lessonTitle, { color: theme.text }]}>
              {lesson.idiom || lesson.name || lesson.custom || lesson.greeting || lesson.topic || lesson.rule || lesson.holiday || lesson.practice || `Lesson ${index + 1}`}
            </Text>
            {lesson.meaning && (
              <Text style={[styles.lessonMeaning, { color: theme.textSecondary }]} numberOfLines={1}>
                {lesson.meaning}
              </Text>
            )}
          </View>
          <Text style={styles.arrowIcon}>→</Text>
        </View>

        {lesson.example && (
          <Text style={[styles.lessonExample, { color: theme.textSecondary }]} numberOfLines={2}>
            {lesson.example}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderLessonDetail = () => {
    if (!selectedLesson) return null;

    const fields = Object.keys(selectedLesson).filter(key =>
      !['id', 'timestamp'].includes(key)
    );

    return (
      <ScrollView style={styles.modalScroll}>
        {fields.map((field, index) => {
          const value = selectedLesson[field];
          if (!value || typeof value === 'object') return null;

          return (
            <View key={index} style={styles.detailSection}>
              <Text style={[styles.detailLabel, { color: theme.primary }]}>
                {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {Array.isArray(value) ? value.join(', ') : value}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <UserMenu navigation={navigation} />

      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Cultural Context 🌍
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Master {userProfile?.targetLanguage || 'language'} culture
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Category Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryCard,
                selectedCategory === category.id && styles.categoryCardActive,
                {
                  backgroundColor: selectedCategory === category.id ? theme.primary : theme.card,
                  borderColor: theme.border,
                }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryTitle,
                { color: selectedCategory === category.id ? '#FFF' : theme.text }
              ]}>
                {category.title}
              </Text>
              <Text style={[
                styles.categoryDescription,
                { color: selectedCategory === category.id ? '#FFF' : theme.textSecondary }
              ]}>
                {category.description}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lessons List */}
        <View style={styles.lessonsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.primary} />
              <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                Loading lessons...
              </Text>
            </View>
          ) : lessons.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No lessons available
              </Text>
              <TouchableOpacity
                style={[styles.refreshButton, { backgroundColor: theme.primary }]}
                onPress={loadLessons}
              >
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            lessons.map((lesson, index) => renderLessonCard(lesson, index))
          )}
        </View>

        {/* Cultural Tips */}
        <View style={[styles.tipsCard, { backgroundColor: theme.card }]}>
          <Text style={[styles.tipsTitle, { color: theme.text }]}>💡 Cultural Learning Tips</Text>
          <Text style={[styles.tipText, { color: theme.textSecondary }]}>
            • Observe native speakers in movies and videos{'\n'}
            • Ask questions when you're unsure{'\n'}
            • Be patient - cultural fluency takes time{'\n'}
            • Learn from your mistakes{'\n'}
            • Show respect and curiosity{'\n'}
            • Practice makes perfect
          </Text>
        </View>
      </ScrollView>

      {/* Lesson Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Cultural Lesson
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {renderLessonDetail()}

            <TouchableOpacity
              style={[styles.gotItButton, { backgroundColor: theme.primary }]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.gotItButtonText}>Got It!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  categoryScroll: {
    maxHeight: 180,
    marginTop: 16,
  },
  categoryContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryCard: {
    width: 160,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    marginRight: 12,
  },
  categoryCardActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryIcon: { fontSize: 32, marginBottom: 8 },
  categoryTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  categoryDescription: { fontSize: 11, lineHeight: 16 },
  lessonsContainer: { padding: 20 },
  lessonCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  lessonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  lessonIcon: { fontSize: 28, marginRight: 12 },
  lessonInfo: { flex: 1 },
  lessonTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  lessonMeaning: { fontSize: 13, lineHeight: 18 },
  arrowIcon: { fontSize: 20, color: '#999', marginLeft: 8 },
  lessonExample: { fontSize: 14, lineHeight: 20, fontStyle: 'italic', marginLeft: 40 },
  loadingContainer: { alignItems: 'center', paddingVertical: 60 },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 16, marginBottom: 20 },
  refreshButton: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  refreshButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  tipsCard: { margin: 20, padding: 20, borderRadius: 16, marginBottom: 40 },
  tipsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  tipText: { fontSize: 14, lineHeight: 22 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 24, fontWeight: 'bold' },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: { fontSize: 20, color: '#666' },
  modalScroll: { flex: 1, marginBottom: 20 },
  detailSection: { marginBottom: 20 },
  detailLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  detailValue: { fontSize: 16, lineHeight: 24 },
  gotItButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  gotItButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
});
