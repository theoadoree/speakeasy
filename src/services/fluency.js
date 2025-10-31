/**
 * Fluency Service - Advanced features for language fluency
 *
 * Services:
 * - Conversation scenarios
 * - Vocabulary mastery with SRS
 * - Pronunciation drills
 * - Progress tracking and fluency prediction
 */

import LLMService from './llm';
import StorageService from '../utils/storage';

class FluencyService {
  // Conversation Scenarios
  static async generateConversationScenario(scenarioType, userProfile) {
    const targetLanguage = userProfile?.targetLanguage || 'Spanish';
    const level = userProfile?.level || 'intermediate';

    const scenarios = {
      'job_interview': `Generate a realistic job interview scenario in ${targetLanguage} at ${level} level.`,
      'ordering_food': `Generate a restaurant ordering scenario in ${targetLanguage} at ${level} level.`,
      'making_friends': `Generate a casual conversation for making new friends in ${targetLanguage} at ${level} level.`,
      'doctor_visit': `Generate a medical appointment scenario in ${targetLanguage} at ${level} level.`,
      'shopping': `Generate a shopping/retail scenario in ${targetLanguage} at ${level} level.`,
      'hotel_checkin': `Generate a hotel check-in scenario in ${targetLanguage} at ${level} level.`,
    };

    const prompt = `${scenarios[scenarioType] || scenarios.ordering_food}

Include:
- Setting and context
- 2-3 conversation participants with roles
- 10-15 exchanges of realistic dialogue
- Key vocabulary and phrases used
- Cultural notes
- Common mistakes to avoid
- Practice tips

Format as JSON with: setting, participants, dialogue, vocabulary, culturalNotes, tips`;

    const result = await LLMService.generate(prompt);

    if (result.success) {
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return { success: true, scenario: JSON.parse(jsonMatch[0]) };
        }
      } catch (e) {
        return { success: false, error: 'Parse error' };
      }
    }

    return { success: false, error: 'Generation failed' };
  }

  // Vocabulary Mastery with Spaced Repetition
  static async addWordToSRS(word, translation, context, language) {
    try {
      const srsData = await StorageService.getItem('@fluentai:srsVocabulary');
      const vocabulary = srsData ? JSON.parse(srsData) : [];

      const newWord = {
        id: Date.now().toString(),
        word,
        translation,
        context,
        language,
        addedDate: new Date().toISOString(),
        lastReviewed: null,
        nextReview: new Date().toISOString(),
        interval: 1, // days
        easeFactor: 2.5,
        repetitions: 0,
        lapses: 0,
      };

      vocabulary.push(newWord);
      await StorageService.setItem('@fluentai:srsVocabulary', JSON.stringify(vocabulary));

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async getDueWords() {
    try {
      const srsData = await StorageService.getItem('@fluentai:srsVocabulary');
      if (!srsData) return { success: true, words: [] };

      const vocabulary = JSON.parse(srsData);
      const now = new Date();
      const dueWords = vocabulary.filter(word => {
        const nextReview = new Date(word.nextReview);
        return nextReview <= now;
      });

      return { success: true, words: dueWords };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  static async reviewWord(wordId, quality) {
    // quality: 0-5 (0 = complete blackout, 5 = perfect recall)
    try {
      const srsData = await StorageService.getItem('@fluentai:srsVocabulary');
      const vocabulary = JSON.parse(srsData || '[]');

      const wordIndex = vocabulary.findIndex(w => w.id === wordId);
      if (wordIndex === -1) return { success: false, error: 'Word not found' };

      const word = vocabulary[wordIndex];

      // SM-2 Algorithm for spaced repetition
      if (quality >= 3) {
        if (word.repetitions === 0) {
          word.interval = 1;
        } else if (word.repetitions === 1) {
          word.interval = 6;
        } else {
          word.interval = Math.round(word.interval * word.easeFactor);
        }
        word.repetitions += 1;
      } else {
        word.repetitions = 0;
        word.interval = 1;
        word.lapses += 1;
      }

      word.easeFactor = Math.max(1.3, word.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));

      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + word.interval);
      word.nextReview = nextReview.toISOString();
      word.lastReviewed = new Date().toISOString();

      vocabulary[wordIndex] = word;
      await StorageService.setItem('@fluentai:srsVocabulary', JSON.stringify(vocabulary));

      return { success: true, word };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Pronunciation Drills
  static async generatePronunciationDrill(phonemeCategory, targetLanguage) {
    const categories = {
      vowels: 'difficult vowel sounds',
      consonants: 'challenging consonant sounds',
      clusters: 'consonant clusters',
      intonation: 'sentence intonation patterns',
    };

    const prompt = `Generate 10 pronunciation practice phrases in ${targetLanguage} focusing on ${categories[phonemeCategory] || 'general pronunciation'}.

For each phrase provide:
- The phrase in ${targetLanguage}
- Phonetic transcription (IPA if possible)
- English translation
- Pronunciation tips
- Common mistakes
- Audio description (how it should sound)

Format as JSON array.`;

    const result = await LLMService.generate(prompt);

    if (result.success) {
      try {
        const jsonMatch = result.text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return { success: true, drills: JSON.parse(jsonMatch[0]) };
        }
      } catch (e) {
        return { success: false, error: 'Parse error' };
      }
    }

    return { success: false, error: 'Generation failed' };
  }

  // Progress Tracking and Fluency Prediction
  static async calculateFluencyScore(userProfile, activityHistory) {
    // Analyze user's learning data to predict fluency level
    const scores = {
      vocabularySize: this._estimateVocabulary(activityHistory),
      grammarAccuracy: this._calculateGrammarAccuracy(activityHistory),
      speakingFluency: this._estimateSpeakingFluency(activityHistory),
      listeningComprehension: this._estimateListening(activityHistory),
      writingSkill: this._estimateWriting(activityHistory),
      culturalKnowledge: this._estimateCulturalKnowledge(activityHistory),
    };

    const overallScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length;

    const fluencyLevel = this._mapScoreToLevel(overallScore);
    const daysToFluency = this._estimateDaysToFluency(overallScore, activityHistory);

    return {
      success: true,
      scores,
      overallScore: Math.round(overallScore),
      fluencyLevel,
      estimatedDaysToFluency: daysToFluency,
      recommendations: this._generateRecommendations(scores),
    };
  }

  static _estimateVocabulary(history) {
    // Simplified estimation
    const wordsLearned = history?.vocabularyCards?.length || 0;
    return Math.min(100, (wordsLearned / 3000) * 100);
  }

  static _calculateGrammarAccuracy(history) {
    const quizScores = history?.quizResults || [];
    if (quizScores.length === 0) return 50;

    const avgScore = quizScores.reduce((sum, score) => sum + score, 0) / quizScores.length;
    return avgScore;
  }

  static _estimateSpeakingFluency(history) {
    const speakingScores = history?.speakingAnalyses || [];
    if (speakingScores.length === 0) return 40;

    const recent = speakingScores.slice(-10);
    const avgScore = recent.reduce((sum, analysis) => sum + analysis.overallScore, 0) / recent.length;
    return avgScore;
  }

  static _estimateListening(history) {
    const listeningActivities = history?.listeningComprehension || [];
    return Math.min(100, (listeningActivities.length / 50) * 100);
  }

  static _estimateWriting(history) {
    const writingScores = history?.writingAnalyses || [];
    if (writingScores.length === 0) return 35;

    const avgScore = writingScores.reduce((sum, score) => sum + score.overallScore, 0) / writingScores.length;
    return avgScore;
  }

  static _estimateCulturalKnowledge(history) {
    const culturalLessons = history?.culturalLessons || [];
    return Math.min(100, (culturalLessons.length / 30) * 100);
  }

  static _mapScoreToLevel(score) {
    if (score >= 90) return 'C2 - Mastery';
    if (score >= 80) return 'C1 - Advanced';
    if (score >= 70) return 'B2 - Upper Intermediate';
    if (score >= 60) return 'B1 - Intermediate';
    if (score >= 50) return 'A2 - Elementary';
    return 'A1 - Beginner';
  }

  static _estimateDaysToFluency(currentScore, history) {
    const targetScore = 85; // C1 level
    const scoreNeeded = targetScore - currentScore;
    if (scoreNeeded <= 0) return 0;

    const dailyProgress = history?.dailyStreak || 0;
    const avgProgressRate = dailyProgress > 0 ? 0.5 : 0.2; // points per day

    return Math.ceil(scoreNeeded / avgProgressRate);
  }

  static _generateRecommendations(scores) {
    const recommendations = [];

    if (scores.vocabularySize < 70) {
      recommendations.push('Focus on vocabulary building - aim for 20 new words per week');
    }
    if (scores.grammarAccuracy < 70) {
      recommendations.push('Practice grammar exercises and complete structured lessons');
    }
    if (scores.speakingFluency < 70) {
      recommendations.push('Increase daily speaking practice - aim for 15 minutes minimum');
    }
    if (scores.writingSkill < 70) {
      recommendations.push('Complete writing exercises 3 times per week');
    }
    if (scores.culturalKnowledge < 70) {
      recommendations.push('Study cultural lessons and watch native content');
    }

    if (recommendations.length === 0) {
      recommendations.push('Maintain your excellent pace - you\'re doing great!');
      recommendations.push('Consider challenging yourself with advanced content');
    }

    return recommendations;
  }
}

export default FluencyService;
