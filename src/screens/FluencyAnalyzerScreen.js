/**
 * FluencyAnalyzerScreen - Advanced speaking fluency analysis
 *
 * Features:
 * - Speech pattern analysis (pauses, hesitations, filler words)
 * - Fluency score calculation
 * - Pronunciation accuracy tracking
 * - Speaking speed analysis
 * - Progress tracking over time
 * - Personalized improvement recommendations
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
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSpeechRecognition, getLanguageCode } from '../services/speechRecognition';
import LLMService from '../services/llm';
import StorageService from '../utils/storage';
import UserMenu from '../components/UserMenu';
import * as Speech from 'expo-speech';

export default function FluencyAnalyzerScreen({ navigation }) {
  const { userProfile } = useApp();
  const { theme } = useTheme();
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [recordedText, setRecordedText] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [timerInterval, setTimerInterval] = useState(null);

  const speechRecognition = useSpeechRecognition({
    language: getLanguageCode(userProfile?.targetLanguage || 'English'),
    onResult: (transcript) => {
      setRecordedText(transcript);
      stopRecording();
      analyzeSpeech(transcript);
    },
    onError: (error) => {
      Alert.alert('Speech Recognition Error', error);
      stopRecording();
    },
  });

  const { isListening, start: startListening, stop: stopListening } = speechRecognition;

  const prompts = [
    { id: 1, text: 'Describe your daily morning routine', difficulty: 'beginner', time: 60 },
    { id: 2, text: 'Talk about a memorable trip you took', difficulty: 'intermediate', time: 90 },
    { id: 3, text: 'Explain your opinion on a current social issue', difficulty: 'advanced', time: 120 },
    { id: 4, text: 'Describe a book or movie you enjoyed recently', difficulty: 'intermediate', time: 90 },
    { id: 5, text: 'Talk about your future goals and aspirations', difficulty: 'advanced', time: 120 },
    { id: 6, text: 'Describe your hometown or city', difficulty: 'beginner', time: 60 },
    { id: 7, text: 'Explain how to cook your favorite dish', difficulty: 'intermediate', time: 90 },
    { id: 8, text: 'Discuss the pros and cons of technology in education', difficulty: 'advanced', time: 120 },
  ];

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } else {
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isRecording]);

  const loadHistory = async () => {
    try {
      const savedHistory = await StorageService.getItem('@fluentai:fluencyHistory');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveToHistory = async (analysis) => {
    try {
      const newHistory = [analysis, ...history].slice(0, 20); // Keep last 20
      setHistory(newHistory);
      await StorageService.setItem('@fluentai:fluencyHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  const selectPrompt = (prompt) => {
    setCurrentPrompt(prompt);
    setAnalysisResult(null);
    setRecordedText('');
    setRecordingDuration(0);

    // Read the prompt aloud
    Speech.speak(`Here is your speaking prompt: ${prompt.text}. You have ${prompt.time} seconds. Press start when you're ready.`, {
      language: 'en-US',
    });
  };

  const startRecording = async () => {
    if (!currentPrompt) {
      Alert.alert('Select a Prompt', 'Please choose a speaking prompt first');
      return;
    }

    setRecordedText('');
    setRecordingDuration(0);
    setAnalysisResult(null);
    setIsRecording(true);

    const success = await startListening();
    if (!success) {
      Alert.alert('Error', 'Failed to start speech recognition');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    setIsRecording(false);
    await stopListening();
  };

  const analyzeSpeech = async (transcript) => {
    if (!transcript || transcript.trim().length === 0) {
      Alert.alert('No Speech Detected', 'Please try speaking again');
      return;
    }

    setAnalyzing(true);

    try {
      const prompt = `Analyze this speech sample in ${userProfile?.targetLanguage || 'Spanish'} for fluency and provide detailed feedback.

Prompt: "${currentPrompt.text}"
Transcript: "${transcript}"
Speaking Duration: ${recordingDuration} seconds

Analyze the following aspects:
1. **Fluency Score** (0-100): Overall speaking fluency
2. **Pronunciation** (0-100): Clarity and accuracy
3. **Vocabulary Range** (0-100): Variety and appropriateness of words used
4. **Grammar Accuracy** (0-100): Correctness of sentence structures
5. **Coherence** (0-100): Logical flow and organization
6. **Speaking Speed**: Words per minute and whether it's appropriate
7. **Filler Words**: Count of hesitations like "um", "uh", "eh", etc.
8. **Pauses**: Frequency and placement of pauses
9. **Pronunciation Errors**: Specific words mispronounced
10. **Grammar Errors**: Specific mistakes made
11. **Strengths**: What the speaker did well
12. **Areas for Improvement**: Specific actionable feedback
13. **Next Steps**: 3 concrete recommendations

Provide response as JSON:
{
  "overallScore": 85,
  "fluency": 80,
  "pronunciation": 85,
  "vocabulary": 90,
  "grammar": 80,
  "coherence": 85,
  "wordsPerMinute": 120,
  "fillerWords": 5,
  "pauseCount": 8,
  "pronunciationErrors": ["word1", "word2"],
  "grammarErrors": ["error1", "error2"],
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"],
  "nextSteps": ["step1", "step2", "step3"],
  "levelAssessment": "intermediate",
  "summary": "Overall feedback summary"
}`;

      const result = await LLMService.generate(prompt);

      if (result.success) {
        try {
          const jsonMatch = result.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            const fullAnalysis = {
              ...analysis,
              timestamp: new Date().toISOString(),
              prompt: currentPrompt.text,
              transcript: transcript,
              duration: recordingDuration,
            };

            setAnalysisResult(fullAnalysis);
            await saveToHistory(fullAnalysis);

            // Speak the summary
            Speech.speak(`Your fluency score is ${analysis.overallScore} out of 100. ${analysis.summary}`, {
              language: 'en-US',
            });
          }
        } catch (e) {
          Alert.alert('Error', 'Failed to parse analysis results');
        }
      } else {
        Alert.alert('Error', 'Failed to analyze speech');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundSecondary }]}>
      <UserMenu navigation={navigation} />

      <View style={[styles.header, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Fluency Analyzer 🎯
        </Text>
        <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
          Measure your speaking progress
        </Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Speaking Prompts */}
        {!analysisResult && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Choose a Speaking Prompt
            </Text>
            {prompts.map((prompt) => (
              <TouchableOpacity
                key={prompt.id}
                style={[
                  styles.promptCard,
                  currentPrompt?.id === prompt.id && styles.promptCardActive,
                  {
                    backgroundColor: currentPrompt?.id === prompt.id ? theme.primary : theme.card,
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => selectPrompt(prompt)}
              >
                <View style={styles.promptHeader}>
                  <Text style={[
                    styles.promptDifficulty,
                    { color: currentPrompt?.id === prompt.id ? '#FFF' : theme.primary }
                  ]}>
                    {prompt.difficulty.toUpperCase()}
                  </Text>
                  <Text style={[
                    styles.promptTime,
                    { color: currentPrompt?.id === prompt.id ? '#FFF' : theme.textSecondary }
                  ]}>
                    {prompt.time}s
                  </Text>
                </View>
                <Text style={[
                  styles.promptText,
                  { color: currentPrompt?.id === prompt.id ? '#FFF' : theme.text }
                ]}>
                  {prompt.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Recording Controls */}
        {currentPrompt && !analysisResult && (
          <View style={styles.recordingSection}>
            <View style={[styles.recordingCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.selectedPromptLabel, { color: theme.textSecondary }]}>
                Selected Prompt:
              </Text>
              <Text style={[styles.selectedPromptText, { color: theme.text }]}>
                {currentPrompt.text}
              </Text>

              {isRecording && (
                <View style={styles.recordingIndicator}>
                  <View style={styles.recordingDot} />
                  <Text style={[styles.recordingText, { color: '#F44336' }]}>
                    Recording: {formatDuration(recordingDuration)}
                  </Text>
                </View>
              )}

              {recordedText && !analyzing && (
                <View style={styles.transcriptContainer}>
                  <Text style={[styles.transcriptLabel, { color: theme.textSecondary }]}>
                    Transcript:
                  </Text>
                  <Text style={[styles.transcriptText, { color: theme.text }]}>
                    {recordedText}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && styles.recordButtonActive,
                  { backgroundColor: isRecording ? '#F44336' : theme.primary }
                ]}
                onPress={isRecording ? stopRecording : startRecording}
                disabled={analyzing}
              >
                <Text style={styles.recordButtonText}>
                  {isRecording ? '⏹ Stop Recording' : '🎤 Start Speaking'}
                </Text>
              </TouchableOpacity>

              {analyzing && (
                <View style={styles.analyzingContainer}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={[styles.analyzingText, { color: theme.text }]}>
                    Analyzing your speech...
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Analysis Results */}
        {analysisResult && (
          <View style={styles.resultsSection}>
            <View style={[styles.scoreCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.scoreLabel, { color: theme.textSecondary }]}>
                Overall Fluency Score
              </Text>
              <Text style={[
                styles.scoreValue,
                { color: getScoreColor(analysisResult.overallScore) }
              ]}>
                {analysisResult.overallScore}/100
              </Text>
              <Text style={[styles.scoreSummary, { color: theme.text }]}>
                {analysisResult.summary}
              </Text>
            </View>

            {/* Detailed Scores */}
            <View style={[styles.detailsCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.detailsTitle, { color: theme.text }]}>
                Detailed Analysis
              </Text>

              {[
                { label: 'Pronunciation', value: analysisResult.pronunciation },
                { label: 'Vocabulary Range', value: analysisResult.vocabulary },
                { label: 'Grammar Accuracy', value: analysisResult.grammar },
                { label: 'Coherence', value: analysisResult.coherence },
              ].map((metric, index) => (
                <View key={index} style={styles.metricRow}>
                  <Text style={[styles.metricLabel, { color: theme.text }]}>
                    {metric.label}
                  </Text>
                  <View style={styles.metricBarContainer}>
                    <View
                      style={[
                        styles.metricBar,
                        {
                          width: `${metric.value}%`,
                          backgroundColor: getScoreColor(metric.value)
                        }
                      ]}
                    />
                  </View>
                  <Text style={[styles.metricValue, { color: theme.text }]}>
                    {metric.value}
                  </Text>
                </View>
              ))}

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Speed
                  </Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {analysisResult.wordsPerMinute} WPM
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Filler Words
                  </Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {analysisResult.fillerWords}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
                    Pauses
                  </Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>
                    {analysisResult.pauseCount}
                  </Text>
                </View>
              </View>
            </View>

            {/* Strengths */}
            <View style={[styles.feedbackCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.feedbackTitle, { color: '#4CAF50' }]}>
                ✅ Strengths
              </Text>
              {analysisResult.strengths?.map((strength, index) => (
                <Text key={index} style={[styles.feedbackItem, { color: theme.text }]}>
                  • {strength}
                </Text>
              ))}
            </View>

            {/* Areas for Improvement */}
            <View style={[styles.feedbackCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.feedbackTitle, { color: '#FF9800' }]}>
                📈 Areas for Improvement
              </Text>
              {analysisResult.improvements?.map((improvement, index) => (
                <Text key={index} style={[styles.feedbackItem, { color: theme.text }]}>
                  • {improvement}
                </Text>
              ))}
            </View>

            {/* Next Steps */}
            <View style={[styles.feedbackCard, { backgroundColor: theme.card }]}>
              <Text style={[styles.feedbackTitle, { color: theme.primary }]}>
                🎯 Next Steps
              </Text>
              {analysisResult.nextSteps?.map((step, index) => (
                <Text key={index} style={[styles.feedbackItem, { color: theme.text }]}>
                  {index + 1}. {step}
                </Text>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.tryAgainButton, { backgroundColor: theme.primary }]}
              onPress={() => {
                setAnalysisResult(null);
                setCurrentPrompt(null);
              }}
            >
              <Text style={styles.tryAgainText}>Try Another Prompt</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* History */}
        {history.length > 0 && !currentPrompt && (
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recent Analyses
            </Text>
            {history.slice(0, 5).map((item, index) => (
              <View key={index} style={[styles.historyCard, { backgroundColor: theme.card }]}>
                <View style={styles.historyHeader}>
                  <Text style={[styles.historyScore, { color: getScoreColor(item.overallScore) }]}>
                    {item.overallScore}/100
                  </Text>
                  <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                    {new Date(item.timestamp).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.historyPrompt, { color: theme.text }]} numberOfLines={2}>
                  {item.prompt}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  promptCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
  },
  promptCardActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  promptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  promptDifficulty: { fontSize: 12, fontWeight: 'bold' },
  promptTime: { fontSize: 12 },
  promptText: { fontSize: 16, lineHeight: 22 },
  recordingSection: { padding: 20, paddingTop: 0 },
  recordingCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  selectedPromptLabel: { fontSize: 12, marginBottom: 4 },
  selectedPromptText: { fontSize: 16, fontWeight: '600', marginBottom: 20 },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F44336',
  },
  recordingText: { fontSize: 16, fontWeight: '600' },
  transcriptContainer: { marginBottom: 20 },
  transcriptLabel: { fontSize: 12, marginBottom: 4 },
  transcriptText: { fontSize: 14, lineHeight: 20 },
  recordButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  recordButtonActive: {},
  recordButtonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  analyzingContainer: { alignItems: 'center', marginTop: 20 },
  analyzingText: { marginTop: 12, fontSize: 14 },
  resultsSection: { padding: 20 },
  scoreCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: { fontSize: 14, marginBottom: 8 },
  scoreValue: { fontSize: 48, fontWeight: 'bold', marginBottom: 12 },
  scoreSummary: { fontSize: 16, textAlign: 'center', lineHeight: 22 },
  detailsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  detailsTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metricLabel: { width: 120, fontSize: 14 },
  metricBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  metricBar: { height: '100%', borderRadius: 4 },
  metricValue: { width: 40, fontSize: 14, fontWeight: '600', textAlign: 'right' },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  statItem: { alignItems: 'center' },
  statLabel: { fontSize: 12, marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  feedbackCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  feedbackTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  feedbackItem: { fontSize: 14, lineHeight: 22, marginBottom: 8 },
  tryAgainButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  tryAgainText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  historySection: { padding: 20, paddingTop: 0 },
  historyCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historyScore: { fontSize: 18, fontWeight: 'bold' },
  historyDate: { fontSize: 12 },
  historyPrompt: { fontSize: 14, lineHeight: 20 },
});
