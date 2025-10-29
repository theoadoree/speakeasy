import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import LLMService from '../services/llm';
import UserMenu from '../components/UserMenu';

export default function HomeScreen({ navigation }) {
  const {
    userProfile,
    contentLibrary,
    addContent,
    deleteContent,
    llmConnected,
    getCurriculumProgress,
    currentLessonId
  } = useApp();
  const { theme, isDark } = useTheme();
  const [isGenerating, setIsGenerating] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');
  const [contentType, setContentType] = useState('article');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [curriculumProgress, setCurriculumProgress] = useState({ percentage: 0, completed: 0, total: 30 });

  useEffect(() => {
    if (getCurriculumProgress) {
      const progress = getCurriculumProgress();
      setCurriculumProgress(progress);
    }
  }, [getCurriculumProgress]);

  const generateStory = async () => {
    if (!llmConnected) {
      Alert.alert('LLM Not Connected', 'Please configure your LLM connection in Settings.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await LLMService.generateStory(
        userProfile,
        userProfile.targetLanguage
      );

      if (result.success) {
        const content = {
          type: 'story',
          title: 'Generated Story',
          text: result.text,
          language: userProfile.targetLanguage,
          level: userProfile.level
        };
        await addContent(content);
        Alert.alert('Success! ✨', 'Your personalized story is ready!', [
          { text: 'View Now', onPress: () => navigation.navigate('Reader', { content }) }
        ]);
      } else {
        Alert.alert('Error', result.error || 'Failed to generate story');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsGenerating(false);
    }
  };

  const analyzeImportedContent = async () => {
    if (!importText.trim()) {
      Alert.alert('Error', 'Please enter some text to analyze');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await LLMService.analyzeImportedContent(
        importText,
        contentType,
        userProfile.targetLanguage,
        userProfile.level
      );

      if (result.success) {
        let analysis = {};
        try {
          // Try to parse JSON response
          const jsonMatch = result.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
          }
        } catch (e) {
          // If parsing fails, use raw text
          analysis = { rawAnalysis: result.text };
        }

        const content = {
          type: contentType,
          title: analysis.title || `Imported ${contentType}`,
          text: importText,
          analysis: analysis,
          language: userProfile.targetLanguage,
          level: userProfile.level
        };

        await addContent(content);
        setImportModalVisible(false);
        setImportText('');
        Alert.alert('Success! 📚', 'Content analyzed and added to your library!');
      } else {
        Alert.alert('Error', result.error || 'Failed to analyze content');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDeleteContent = (contentId) => {
    Alert.alert(
      'Delete Content',
      'Are you sure you want to remove this from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteContent(contentId)
        }
      ]
    );
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
          <Text style={[styles.greeting, { color: theme.text }]}>Hello, {userProfile.name}! 👋</Text>
          <Text style={[styles.subGreeting, { color: theme.textSecondary }]}>
            Learning {userProfile.targetLanguage} • Level {userProfile.level}
          </Text>
        </View>

        {/* Curriculum Progress Card */}
        {curriculumProgress.total > 0 && (
          <View style={[styles.curriculumCard, { backgroundColor: theme.card }]}>
            <View style={styles.curriculumHeader}>
              <View>
                <Text style={[styles.curriculumTitle, { color: theme.text }]}>
                  🎓 Learning Path
                </Text>
                <Text style={[styles.curriculumSubtitle, { color: theme.textSecondary }]}>
                  {curriculumProgress.completed} of {curriculumProgress.total} lessons completed
                </Text>
              </View>
              <View style={styles.curriculumProgressCircle}>
                <Text style={styles.curriculumProgressPercentage}>
                  {curriculumProgress.percentage}%
                </Text>
              </View>
            </View>

            <View style={[styles.curriculumProgressBarContainer, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.curriculumProgressBar,
                  { width: `${curriculumProgress.percentage}%` }
                ]}
              />
            </View>

            <TouchableOpacity
              style={styles.curriculumButton}
              onPress={() => navigation.navigate('Curriculum')}
            >
              <Text style={styles.curriculumButtonText}>
                {currentLessonId
                  ? `Continue Lesson ${currentLessonId}`
                  : curriculumProgress.completed === curriculumProgress.total
                  ? 'Review Curriculum'
                  : 'Start Learning'}
              </Text>
              <Text style={styles.curriculumButtonIcon}>→</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={generateStory}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.actionIcon}>✨</Text>
                <Text style={styles.actionButtonText}>Generate Story</Text>
                <Text style={styles.actionButtonSubtext}>AI creates content for you</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => setImportModalVisible(true)}
          >
            <Text style={styles.actionIcon}>📄</Text>
            <Text style={styles.actionButtonTextSecondary}>Import Content</Text>
            <Text style={styles.actionButtonSubtextSecondary}>
              Songs, articles, texts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Library */}
        <View style={styles.libraryContainer}>
          <Text style={styles.sectionTitle}>Your Library 📚</Text>
          
          {contentLibrary.length === 0 ? (
            <View style={styles.emptyLibrary}>
              <Text style={styles.emptyLibraryText}>No content yet</Text>
              <Text style={styles.emptyLibrarySubtext}>
                Generate a story or import content to get started!
              </Text>
            </View>
          ) : (
            contentLibrary.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.contentCard}
                onPress={() => navigation.navigate('Reader', { content: item })}
                onLongPress={() => handleDeleteContent(item.id)}
              >
                <View style={styles.contentCardHeader}>
                  <Text style={styles.contentType}>
                    {item.type === 'story' ? '📖' : item.type === 'lyrics' ? '🎵' : '📰'}
                  </Text>
                  <View style={styles.contentInfo}>
                    <Text style={styles.contentTitle} numberOfLines={1}>
                      {item.title}
                    </Text>
                    <Text style={styles.contentMeta}>
                      {new Date(item.timestamp).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.contentPreview} numberOfLines={2}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Import Modal */}
      <Modal
        visible={importModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setImportModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Import Content</Text>

            {/* Content Type Selector */}
            <View style={styles.typeSelector}>
              {['article', 'lyrics', 'text'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    contentType === type && styles.typeButtonSelected
                  ]}
                  onPress={() => setContentType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      contentType === type && styles.typeButtonTextSelected
                    ]}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.importInput}
              placeholder={`Paste your ${contentType} here...`}
              value={importText}
              onChangeText={setImportText}
              multiline
              numberOfLines={10}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => {
                  setImportModalVisible(false);
                  setImportText('');
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalAnalyzeButton}
                onPress={analyzeImportedContent}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.modalAnalyzeText}>Analyze & Import</Text>
                )}
              </TouchableOpacity>
            </View>
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
    flex: 1
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#FFF'
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5
  },
  subGreeting: {
    fontSize: 16,
    color: '#666'
  },
  curriculumCard: {
    margin: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  curriculumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  curriculumTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  curriculumSubtitle: {
    fontSize: 14,
  },
  curriculumProgressCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  curriculumProgressPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  curriculumProgressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  curriculumProgressBar: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 4,
  },
  curriculumButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  curriculumButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  curriculumButtonIcon: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionsContainer: {
    padding: 20,
    gap: 15
  },
  actionButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    minHeight: 120
  },
  secondaryButton: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#E0E0E0'
  },
  actionIcon: {
    fontSize: 36,
    marginBottom: 8
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 4
  },
  actionButtonSubtext: {
    fontSize: 14,
    color: '#FFF',
    opacity: 0.8
  },
  actionButtonTextSecondary: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4
  },
  actionButtonSubtextSecondary: {
    fontSize: 14,
    color: '#666'
  },
  libraryContainer: {
    padding: 20
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15
  },
  emptyLibrary: {
    padding: 40,
    alignItems: 'center'
  },
  emptyLibraryText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 5
  },
  emptyLibrarySubtext: {
    fontSize: 14,
    color: '#CCC',
    textAlign: 'center'
  },
  contentCard: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  contentCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10
  },
  contentType: {
    fontSize: 24,
    marginRight: 12
  },
  contentInfo: {
    flex: 1
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2
  },
  contentMeta: {
    fontSize: 12,
    color: '#999'
  },
  contentPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15
  },
  typeButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    alignItems: 'center'
  },
  typeButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD'
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  typeButtonTextSelected: {
    color: '#007AFF'
  },
  importInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    minHeight: 200,
    marginBottom: 20
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10
  },
  modalCancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center'
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666'
  },
  modalAnalyzeButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    alignItems: 'center'
  },
  modalAnalyzeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF'
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 50
  }
});
