import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../contexts/AppContext';
import LLMService from '../services/llm';
import { awardAccentTutorXP, incrementLessonsCompleted } from '../utils/xp';
import XPReward from '../components/XPReward';

const AccentTutorScreen = () => {
  const { userProfile, llmConnected } = useApp();
  const [loading, setLoading] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(null);
  const [difficulty, setDifficulty] = useState('beginner');
  const [focusArea, setFocusArea] = useState('pronunciation');
  const [recording, setRecording] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [xpReward, setXpReward] = useState(null);

  const focusAreas = [
    { id: 'pronunciation', label: 'Pronunciation', icon: 'mic' },
    { id: 'intonation', label: 'Intonation', icon: 'analytics' },
    { id: 'rhythm', label: 'Rhythm & Flow', icon: 'pulse' },
    { id: 'reduction', label: 'Sound Reduction', icon: 'contract' }
  ];

  const difficulties = [
    { id: 'beginner', label: 'Beginner', color: '#4CAF50' },
    { id: 'intermediate', label: 'Intermediate', color: '#FF9800' },
    { id: 'advanced', label: 'Advanced', color: '#F44336' }
  ];

  useEffect(() => {
    if (llmConnected && userProfile?.targetLanguage) {
      generateNewPhrase();
    }
  }, [focusArea, difficulty]);

  const generateNewPhrase = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const prompt = `Generate a ${difficulty} level ${focusArea} practice phrase in ${userProfile?.targetLanguage || 'Spanish'}.

      Provide a phrase that helps learners practice ${focusArea} with:
      1. The phrase itself
      2. Phonetic breakdown
      3. Key points to focus on
      4. Common mistakes to avoid

      Format as JSON:
      {
        "phrase": "the practice phrase",
        "phonetic": "phonetic breakdown",
        "focusPoints": ["point 1", "point 2"],
        "commonMistakes": ["mistake 1", "mistake 2"],
        "nativeTip": "a helpful tip from a native speaker perspective"
      }`;

      const response = await LLMService.generateResponse(prompt);

      try {
        // Try to parse JSON response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const phraseData = JSON.parse(jsonMatch[0]);
          setCurrentPhrase(phraseData);
        } else {
          // Fallback if not JSON
          setCurrentPhrase({
            phrase: response.split('\n')[0],
            phonetic: '',
            focusPoints: [],
            commonMistakes: [],
            nativeTip: response
          });
        }
      } catch (parseError) {
        console.error('Error parsing phrase:', parseError);
        setCurrentPhrase({
          phrase: response,
          phonetic: '',
          focusPoints: [],
          commonMistakes: [],
          nativeTip: ''
        });
      }
    } catch (error) {
      console.error('Error generating phrase:', error);
      Alert.alert('Error', 'Failed to generate practice phrase. Please check your LLM connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRecord = () => {
    // Toggle recording state
    // In a real implementation, this would use expo-av or react-native-audio-recorder-player
    setRecording(!recording);

    if (!recording) {
      // Start recording
      Alert.alert('Recording Started', 'Speak the phrase clearly into your microphone.');
    } else {
      // Stop recording and analyze
      analyzeRecording();
    }
  };

  const analyzeRecording = async () => {
    setLoading(true);

    try {
      // In a real implementation, this would send the audio to a speech recognition API
      // For now, we'll simulate feedback from the LLM
      const prompt = `As an accent coach for ${userProfile?.targetLanguage || 'Spanish'}, provide detailed feedback on practicing this phrase: "${currentPhrase?.phrase}"

      Focus area: ${focusArea}
      Difficulty level: ${difficulty}

      Provide constructive feedback as if analyzing a student's pronunciation, including:
      1. Overall assessment (score out of 10)
      2. What was done well
      3. Areas for improvement
      4. Specific exercises to practice

      Format as JSON:
      {
        "score": 7,
        "strengths": ["strength 1", "strength 2"],
        "improvements": ["area 1", "area 2"],
        "exercises": ["exercise 1", "exercise 2"]
      }`;

      const response = await LLMService.generateResponse(prompt);

      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const feedbackData = JSON.parse(jsonMatch[0]);
          setFeedback(feedbackData);

          // Award XP based on score
          const xpResult = await awardAccentTutorXP(feedbackData.score);
          if (xpResult.success) {
            setXpReward({
              amount: xpResult.amount,
              reason: xpResult.reason
            });

            // Increment lessons completed
            await incrementLessonsCompleted();
          }
        } else {
          const feedbackData = {
            score: 7,
            strengths: ['Good attempt!'],
            improvements: ['Keep practicing'],
            exercises: [response]
          };
          setFeedback(feedbackData);

          // Award XP
          const xpResult = await awardAccentTutorXP(7);
          if (xpResult.success) {
            setXpReward({
              amount: xpResult.amount,
              reason: xpResult.reason
            });
            await incrementLessonsCompleted();
          }
        }
      } catch (parseError) {
        const feedbackData = {
          score: 7,
          strengths: ['Good attempt!'],
          improvements: ['Keep practicing'],
          exercises: [response]
        };
        setFeedback(feedbackData);

        // Award XP
        const xpResult = await awardAccentTutorXP(7);
        if (xpResult.success) {
          setXpReward({
            amount: xpResult.amount,
            reason: xpResult.reason
          });
          await incrementLessonsCompleted();
        }
      }
    } catch (error) {
      console.error('Error analyzing recording:', error);
      Alert.alert('Error', 'Failed to analyze your pronunciation.');
    } finally {
      setLoading(false);
    }
  };

  const renderScoreCircle = (score) => {
    const percentage = (score / 10) * 100;
    const color = score >= 8 ? '#4CAF50' : score >= 6 ? '#FF9800' : '#F44336';

    return (
      <View style={styles.scoreCircle}>
        <Text style={[styles.scoreNumber, { color }]}>{score}</Text>
        <Text style={styles.scoreLabel}>/10</Text>
      </View>
    );
  };

  if (!llmConnected) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={64} color="#FF9800" />
          <Text style={styles.errorTitle}>LLM Not Connected</Text>
          <Text style={styles.errorText}>
            Please configure your LLM connection in Settings to use the Accent Tutor.
          </Text>
        </View>
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
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="mic-circle" size={48} color="#007AFF" />
          <Text style={styles.title}>Accent Tutor</Text>
          <Text style={styles.subtitle}>
            Perfect your {userProfile?.targetLanguage || 'target language'} accent
          </Text>
        </View>

        {/* Focus Area Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Focus Area</Text>
          <View style={styles.focusGrid}>
            {focusAreas.map((area) => (
              <TouchableOpacity
                key={area.id}
                style={[
                  styles.focusCard,
                  focusArea === area.id && styles.focusCardActive
                ]}
                onPress={() => setFocusArea(area.id)}
              >
                <Ionicons
                  name={area.icon}
                  size={24}
                  color={focusArea === area.id ? '#007AFF' : '#666'}
                />
                <Text
                  style={[
                    styles.focusLabel,
                    focusArea === area.id && styles.focusLabelActive
                  ]}
                >
                  {area.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Difficulty Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty</Text>
          <View style={styles.difficultyRow}>
            {difficulties.map((diff) => (
              <TouchableOpacity
                key={diff.id}
                style={[
                  styles.difficultyButton,
                  difficulty === diff.id && {
                    backgroundColor: diff.color,
                    borderColor: diff.color
                  }
                ]}
                onPress={() => setDifficulty(diff.id)}
              >
                <Text
                  style={[
                    styles.difficultyText,
                    difficulty === diff.id && styles.difficultyTextActive
                  ]}
                >
                  {diff.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Phrase */}
        {loading && !currentPhrase ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Generating practice phrase...</Text>
          </View>
        ) : currentPhrase ? (
          <View style={styles.phraseContainer}>
            <Text style={styles.phraseText}>{currentPhrase.phrase}</Text>

            {currentPhrase.phonetic && (
              <View style={styles.phoneticBox}>
                <Text style={styles.phoneticLabel}>Phonetic:</Text>
                <Text style={styles.phoneticText}>{currentPhrase.phonetic}</Text>
              </View>
            )}

            {currentPhrase.focusPoints?.length > 0 && (
              <View style={styles.tipsBox}>
                <Text style={styles.tipsTitle}>Focus Points:</Text>
                {currentPhrase.focusPoints.map((point, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                    <Text style={styles.tipText}>{point}</Text>
                  </View>
                ))}
              </View>
            )}

            {currentPhrase.commonMistakes?.length > 0 && (
              <View style={styles.mistakesBox}>
                <Text style={styles.mistakesTitle}>Avoid These Mistakes:</Text>
                {currentPhrase.commonMistakes.map((mistake, index) => (
                  <View key={index} style={styles.mistakeItem}>
                    <Ionicons name="close-circle" size={16} color="#F44336" />
                    <Text style={styles.mistakeText}>{mistake}</Text>
                  </View>
                ))}
              </View>
            )}

            {currentPhrase.nativeTip && (
              <View style={styles.nativeTipBox}>
                <Ionicons name="bulb" size={20} color="#FF9800" />
                <Text style={styles.nativeTipText}>{currentPhrase.nativeTip}</Text>
              </View>
            )}

            {/* Recording Button */}
            <TouchableOpacity
              style={[styles.recordButton, recording && styles.recordButtonActive]}
              onPress={handleRecord}
              disabled={loading}
            >
              <Ionicons
                name={recording ? "stop-circle" : "mic"}
                size={32}
                color="#FFF"
              />
              <Text style={styles.recordButtonText}>
                {recording ? 'Stop Recording' : 'Practice Speaking'}
              </Text>
            </TouchableOpacity>

            {/* Feedback Section */}
            {feedback && (
              <View style={styles.feedbackContainer}>
                <Text style={styles.feedbackTitle}>Your Performance</Text>

                {renderScoreCircle(feedback.score)}

                {feedback.strengths?.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackSectionTitle}>Strengths:</Text>
                    {feedback.strengths.map((strength, index) => (
                      <View key={index} style={styles.feedbackItem}>
                        <Ionicons name="star" size={16} color="#4CAF50" />
                        <Text style={styles.feedbackText}>{strength}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {feedback.improvements?.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackSectionTitle}>Areas to Improve:</Text>
                    {feedback.improvements.map((improvement, index) => (
                      <View key={index} style={styles.feedbackItem}>
                        <Ionicons name="arrow-up-circle" size={16} color="#FF9800" />
                        <Text style={styles.feedbackText}>{improvement}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {feedback.exercises?.length > 0 && (
                  <View style={styles.feedbackSection}>
                    <Text style={styles.feedbackSectionTitle}>Practice Exercises:</Text>
                    {feedback.exercises.map((exercise, index) => (
                      <View key={index} style={styles.feedbackItem}>
                        <Ionicons name="fitness" size={16} color="#007AFF" />
                        <Text style={styles.feedbackText}>{exercise}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* New Phrase Button */}
            <TouchableOpacity
              style={styles.newPhraseButton}
              onPress={generateNewPhrase}
              disabled={loading}
            >
              <Ionicons name="refresh" size={20} color="#007AFF" />
              <Text style={styles.newPhraseText}>Generate New Phrase</Text>
            </TouchableOpacity>
          </View>
        ) : null}
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
    marginBottom: 24,
    marginTop: Platform.OS === 'ios' ? 44 : 24
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  focusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12
  },
  focusCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0'
  },
  focusCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD'
  },
  focusLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginTop: 8,
    textAlign: 'center'
  },
  focusLabelActive: {
    color: '#007AFF'
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 12
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFF',
    alignItems: 'center'
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  difficultyTextActive: {
    color: '#FFF'
  },
  phraseContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  phraseText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16
  },
  phoneticBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16
  },
  phoneticLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4
  },
  phoneticText: {
    fontSize: 16,
    color: '#333',
    fontStyle: 'italic'
  },
  tipsBox: {
    marginBottom: 16
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  mistakesBox: {
    marginBottom: 16
  },
  mistakesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  mistakeItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8
  },
  mistakeText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  nativeTipBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    alignItems: 'flex-start'
  },
  nativeTipText: {
    flex: 1,
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20
  },
  recordButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8
  },
  recordButtonActive: {
    backgroundColor: '#F44336'
  },
  recordButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF'
  },
  feedbackContainer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12
  },
  feedbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center'
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF'
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666'
  },
  feedbackSection: {
    marginBottom: 16
  },
  feedbackSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  feedbackItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8
  },
  feedbackText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20
  },
  newPhraseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    marginTop: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF'
  },
  newPhraseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF'
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 32
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
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

export default AccentTutorScreen;
