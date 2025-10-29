import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from 'react-native';
import { useApp } from '../contexts/AppContext';
import LLMService from '../services/llm';
import { awardWordLearnedXP, awardStoryReadXP, incrementLessonsCompleted } from '../utils/xp';
import XPReward from '../components/XPReward';

export default function ReaderScreen({ route }) {
  const { content } = route.params;
  const { userProfile } = useApp();
  const [selectedWord, setSelectedWord] = useState(null);
  const [wordExplanation, setWordExplanation] = useState(null);
  const [isLoadingExplanation, setIsLoadingExplanation] = useState(false);
  const [difficultyLevel, setDifficultyLevel] = useState(1); // 0=simple, 1=current, 2=advanced
  const [adaptiveLayers, setAdaptiveLayers] = useState(null);
  const [isLoadingLayers, setIsLoadingLayers] = useState(false);
  const [xpReward, setXpReward] = useState(null);
  const [wordsLearned, setWordsLearned] = useState(new Set());

  const words = content.text.split(/\s+/);

  const handleWordPress = async (word, index) => {
    // Clean the word of punctuation for lookup
    const cleanWord = word.replace(/[.,!?;:""'']/g, '');
    
    setSelectedWord({ word: cleanWord, originalWord: word, index });
    setIsLoadingExplanation(true);
    setWordExplanation(null);

    try {
      const context = words.slice(Math.max(0, index - 5), index + 6).join(' ');
      const result = await LLMService.explainWord(
        cleanWord,
        context,
        userProfile.targetLanguage,
        userProfile.nativeLanguage
      );

      if (result.success) {
        setWordExplanation(result.text);

        // Award XP for learning a new word (only once per word)
        if (!wordsLearned.has(cleanWord.toLowerCase())) {
          const xpResult = await awardWordLearnedXP();
          if (xpResult.success) {
            setXpReward({
              amount: xpResult.amount,
              reason: xpResult.reason
            });

            // Track this word as learned
            setWordsLearned(prev => new Set([...prev, cleanWord.toLowerCase()]));
          }
        }
      }
    } catch (error) {
      setWordExplanation('Failed to load explanation');
    } finally {
      setIsLoadingExplanation(false);
    }
  };

  const loadAdaptiveLayers = async () => {
    if (adaptiveLayers) {
      return; // Already loaded
    }

    setIsLoadingLayers(true);
    try {
      const sentences = content.text.match(/[^.!?]+[.!?]+/g) || [content.text];
      const firstSentence = sentences[0].trim();

      const result = await LLMService.generateAdaptiveLayers(
        firstSentence,
        userProfile.targetLanguage,
        userProfile.level
      );

      if (result.success) {
        try {
          const jsonMatch = result.text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const layers = JSON.parse(jsonMatch[0]);
            setAdaptiveLayers(layers);
          }
        } catch (e) {
          console.error('Failed to parse adaptive layers:', e);
        }
      }
    } catch (error) {
      console.error('Error loading adaptive layers:', error);
    } finally {
      setIsLoadingLayers(false);
    }
  };

  React.useEffect(() => {
    loadAdaptiveLayers();
  }, []);

  const getLevelName = (level) => {
    switch (level) {
      case 0:
        return 'Simplified';
      case 1:
        return 'Current Level';
      case 2:
        return 'Advanced';
      default:
        return 'Current Level';
    }
  };

  const getCurrentText = () => {
    if (!adaptiveLayers) return content.text;
    
    switch (difficultyLevel) {
      case 0:
        return adaptiveLayers.simplified || content.text;
      case 1:
        return adaptiveLayers.current || content.text;
      case 2:
        return adaptiveLayers.advanced || content.text;
      default:
        return content.text;
    }
  };

  const handleMarkComplete = async () => {
    // Award XP for completing the reading
    const xpResult = await awardStoryReadXP();
    if (xpResult.success) {
      setXpReward({
        amount: xpResult.amount,
        reason: xpResult.reason
      });
    }

    await incrementLessonsCompleted();
  };

  return (
    <View style={styles.container}>
      {xpReward && (
        <XPReward
          amount={xpReward.amount}
          reason={xpReward.reason}
          onComplete={() => setXpReward(null)}
        />
      )}
      <ScrollView style={styles.scrollView}>
        {/* Content Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{content.title}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>
              {content.type === 'story' ? '📖 Story' :
               content.type === 'lyrics' ? '🎵 Lyrics' : '📰 Article'}
            </Text>
            <Text style={styles.metaText}>•</Text>
            <Text style={styles.metaText}>{content.level}</Text>
          </View>
        </View>

        {/* Difficulty Slider */}
        {adaptiveLayers && (
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Reading Level</Text>
            <View style={styles.slider}>
              {[0, 1, 2].map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.sliderButton,
                    difficultyLevel === level && styles.sliderButtonActive
                  ]}
                  onPress={() => setDifficultyLevel(level)}
                >
                  <Text
                    style={[
                      styles.sliderButtonText,
                      difficultyLevel === level && styles.sliderButtonTextActive
                    ]}
                  >
                    {level === 0 ? 'A1' : level === 1 ? userProfile.level : 'C2'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sliderLevelName}>{getLevelName(difficultyLevel)}</Text>
          </View>
        )}

        {isLoadingLayers && !adaptiveLayers && (
          <View style={styles.loadingLayers}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Loading adaptive layers...</Text>
          </View>
        )}

        {/* Interactive Text */}
        <View style={styles.textContainer}>
          <View style={styles.textWrapper}>
            {getCurrentText().split(/\s+/).map((word, index) => (
              <TouchableOpacity
                key={`${word}-${index}`}
                onPress={() => handleWordPress(word, index)}
                style={styles.wordWrapper}
              >
                <Text style={styles.word}>{word} </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Analysis Section (if available) */}
        {content.analysis && (
          <View style={styles.analysisContainer}>
            <Text style={styles.analysisTitle}>📊 Analysis</Text>
            
            {content.analysis.summary && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>Summary</Text>
                <Text style={styles.analysisText}>{content.analysis.summary}</Text>
              </View>
            )}

            {content.analysis.keyVocabulary && content.analysis.keyVocabulary.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>Key Vocabulary</Text>
                {content.analysis.keyVocabulary.slice(0, 5).map((word, idx) => (
                  <Text key={idx} style={styles.analysisText}>• {word}</Text>
                ))}
              </View>
            )}

            {content.analysis.grammarPoints && content.analysis.grammarPoints.length > 0 && (
              <View style={styles.analysisSection}>
                <Text style={styles.analysisSectionTitle}>Grammar Points</Text>
                {content.analysis.grammarPoints.slice(0, 3).map((point, idx) => (
                  <Text key={idx} style={styles.analysisText}>• {point}</Text>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Mark Complete Button */}
        <View style={styles.completeButtonContainer}>
          <TouchableOpacity style={styles.completeButton} onPress={handleMarkComplete}>
            <Text style={styles.completeButtonText}>✓ Mark as Complete</Text>
          </TouchableOpacity>
          <Text style={styles.completeHint}>
            {wordsLearned.size > 0 && `${wordsLearned.size} word${wordsLearned.size !== 1 ? 's' : ''} learned`}
          </Text>
        </View>
      </ScrollView>

      {/* Word Explanation Modal */}
      <Modal
        visible={selectedWord !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedWord(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalWord}>{selectedWord?.originalWord}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedWord(null)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {isLoadingExplanation ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading explanation...</Text>
              </View>
            ) : (
              <ScrollView style={styles.explanationScroll}>
                <Text style={styles.explanationText}>
                  {wordExplanation || 'No explanation available'}
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  scrollView: {
    flex: 1
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8
  },
  meta: {
    flexDirection: 'row',
    gap: 8
  },
  metaText: {
    fontSize: 14,
    color: '#666'
  },
  sliderContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0'
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10
  },
  slider: {
    flexDirection: 'row',
    gap: 8
  },
  sliderButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F8F8',
    alignItems: 'center'
  },
  sliderButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF'
  },
  sliderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666'
  },
  sliderButtonTextActive: {
    color: '#FFF'
  },
  sliderLevelName: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    textAlign: 'center'
  },
  loadingLayers: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F0F8FF',
    gap: 10
  },
  textContainer: {
    padding: 20
  },
  textWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  wordWrapper: {
    marginVertical: 2
  },
  word: {
    fontSize: 18,
    lineHeight: 32,
    color: '#000'
  },
  analysisContainer: {
    padding: 20,
    paddingTop: 0
  },
  analysisTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15
  },
  analysisSection: {
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12
  },
  analysisSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8
  },
  analysisText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 4
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
    maxHeight: '70%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  modalWord: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF'
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666'
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 15
  },
  loadingText: {
    fontSize: 14,
    color: '#999'
  },
  explanationScroll: {
    maxHeight: 400
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333'
  },
  completeButtonContainer: {
    padding: 20,
    alignItems: 'center'
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF'
  },
  completeHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 12
  }
});
