/**
 * WritingWorkshopScreen - Advanced writing practice and correction
 *
 * Features:
 * - Essay writing prompts
 * - Grammar and style correction
 * - Formal vs informal writing
 * - Creative writing exercises
 * - AI-powered feedback
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import LLMService from '../services/llm';
import UserMenu from '../components/UserMenu';

export default function WritingWorkshopScreen({ navigation }) {
  const { userProfile } = useApp();
  const { theme } = useTheme();
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [writingText, setWritingText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [wordCount, setWordCount] = useState(0);

  const prompts = [
    { id: 1, type: 'formal', title: 'Write a Job Application Letter', minWords: 150, difficulty: 'advanced' },
    { id: 2, type: 'informal', title: 'Describe Your Perfect Day', minWords: 100, difficulty: 'beginner' },
    { id: 3, type: 'creative', title: 'Write a Short Story', minWords: 200, difficulty: 'intermediate' },
    { id: 4, type: 'formal', title: 'Write a Business Proposal', minWords: 200, difficulty: 'advanced' },
    { id: 5, type: 'informal', title: 'Describe a Childhood Memory', minWords: 100, difficulty: 'beginner' },
    { id: 6, type: 'persuasive', title: 'Convince Someone to Visit Your City', minWords: 150, difficulty: 'intermediate' },
  ];

  const handleTextChange = (text) => {
    setWritingText(text);
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  };

  const analyzWriting = async () => {
    if (wordCount < selectedPrompt.minWords) {
      Alert.alert('Too Short', `Please write at least ${selectedPrompt.minWords} words`);
      return;
    }

    setAnalyzing(true);

    try {
      const prompt = `Analyze this ${userProfile?.targetLanguage} writing and provide detailed feedback.

Prompt: "${selectedPrompt.title}"
Type: ${selectedPrompt.type}
Text: "${writingText}"

Provide comprehensive feedback as JSON:
{
  "overallScore": 85,
  "grammar": { "score": 80, "errors": ["error1", "error2"], "suggestions": ["fix1", "fix2"] },
  "vocabulary": { "score": 90, "strengths": ["good word1"], "improvements": ["use instead of X"] },
  "structure": { "score": 85, "feedback": "feedback text" },
  "style": { "score": 80, "feedback": "style feedback" },
  "corrections": [{"original": "text", "corrected": "text", "reason": "why"}],
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "rewriteSuggestion": "improved version of their text"
}`;

      const result = await LLMService.generate(prompt);

      if (result.success) {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          setFeedback(JSON.parse(jsonMatch[0]));
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze writing');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <UserMenu navigation={navigation} />

      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Writing Workshop ✍️</Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Improve your writing skills
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {!selectedPrompt && (
          <View style={styles.promptsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Choose a Writing Prompt</Text>
            {prompts.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={[styles.promptCard, { backgroundColor: theme.card }]}
                onPress={() => setSelectedPrompt(prompt)}
              >
                <View style={styles.promptHeader}>
                  <Text style={[styles.promptType, { color: theme.primary }]}>
                    {prompt.type.toUpperCase()}
                  </Text>
                  <Text style={[styles.promptDifficulty, { color: theme.textSecondary }]}>
                    {prompt.difficulty}
                  </Text>
                </View>
                <Text style={[styles.promptTitle, { color: theme.text }]}>{prompt.title}</Text>
                <Text style={[styles.promptMinWords, { color: theme.textSecondary }]}>
                  Min. {prompt.minWords} words
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {selectedPrompt && !feedback && (
          <View style={styles.writingContainer}>
            <View style={[styles.promptBanner, { backgroundColor: theme.card }]}>
              <Text style={[styles.bannerTitle, { color: theme.text }]}>{selectedPrompt.title}</Text>
              <Text style={[styles.wordCountText, { color: wordCount >= selectedPrompt.minWords ? '#4CAF50' : theme.textSecondary }]}>
                {wordCount} / {selectedPrompt.minWords} words
              </Text>
            </View>

            <TextInput
              style={[styles.textInput, { backgroundColor: theme.card, color: theme.text }]}
              placeholder={`Start writing in ${userProfile?.targetLanguage}...`}
              placeholderTextColor={theme.textSecondary}
              value={writingText}
              onChangeText={handleTextChange}
              multiline
              textAlignVertical="top"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.cancelButton, { backgroundColor: theme.card }]}
                onPress={() => setSelectedPrompt(null)}
              >
                <Text style={[styles.cancelButtonText, { color: theme.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.analyzeButton, { backgroundColor: theme.primary }]}
                onPress={analyzWriting}
                disabled={analyzing}
              >
                {analyzing ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.analyzeButtonText}>Get Feedback</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {feedback && (
          <View style={styles.feedbackContainer}>
            <View style={[styles.scoreCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>Overall Score</Text>
              <Text style={[styles.scoreValue, { color: '#4CAF50' }]}>{feedback.overallScore}/100</Text>
            </View>

            <View style={[styles.detailCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.detailTitle, { color: theme.text }]}>Detailed Scores</Text>
              {Object.entries(feedback).filter(([key]) => typeof feedback[key] === 'object' && feedback[key].score).map(([key, value]) => (
                <View key={key} style={styles.scoreRow}>
                  <Text style={[styles.scoreLabel, { color: theme.text }]}>{key}</Text>
                  <Text style={[styles.scoreNum, { color: theme.text }]}>{value.score}/100</Text>
                </View>
              ))}
            </View>

            {feedback.corrections && (
              <View style={[styles.correctionsCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.cardTitle, { color: theme.text }]}>Corrections</Text>
                {feedback.corrections.map((correction, i) => (
                  <View key={i} style={styles.correctionItem}>
                    <Text style={[styles.originalText, { color: '#F44336' }]}>❌ {correction.original}</Text>
                    <Text style={[styles.correctedText, { color: '#4CAF50' }]}>✅ {correction.corrected}</Text>
                    <Text style={[styles.correctionReason, { color: theme.textSecondary }]}>{correction.reason}</Text>
                  </View>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={[styles.newPromptButton, { backgroundColor: theme.primary }]}
              onPress={() => { setFeedback(null); setSelectedPrompt(null); setWritingText(''); }}
            >
              <Text style={styles.newPromptButtonText}>Try Another Prompt</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  header: { padding: 20, paddingTop: 60 },
  headerTitle: { fontSize: 28, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 14, marginTop: 4 },
  promptsContainer: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  promptCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  promptHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  promptType: { fontSize: 12, fontWeight: 'bold' },
  promptDifficulty: { fontSize: 12 },
  promptTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  promptMinWords: { fontSize: 13 },
  writingContainer: { padding: 20 },
  promptBanner: { borderRadius: 12, padding: 16, marginBottom: 16 },
  bannerTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  wordCountText: { fontSize: 16, fontWeight: '600' },
  textInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    minHeight: 300,
    marginBottom: 16,
  },
  buttonRow: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, padding: 16, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600' },
  analyzeButton: { flex: 2, padding: 16, borderRadius: 12, alignItems: 'center' },
  analyzeButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  feedbackContainer: { padding: 20 },
  scoreCard: { borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  scoreLabel: { fontSize: 14, marginBottom: 8 },
  scoreValue: { fontSize: 48, fontWeight: 'bold' },
  detailCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  detailTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  scoreNum: { fontWeight: '600' },
  correctionsCard: { borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  correctionItem: { marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  originalText: { fontSize: 14, marginBottom: 4 },
  correctedText: { fontSize: 14, marginBottom: 4 },
  correctionReason: { fontSize: 13, fontStyle: 'italic' },
  newPromptButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  newPromptButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
