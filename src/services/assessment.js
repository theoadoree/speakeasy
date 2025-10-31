import axios from 'axios';
import { getCurrentConfig } from '../config/llm.config';

class AssessmentService {
  constructor() {
    const config = getCurrentConfig();
    this.backendURL = config.backendURL || 'https://speakeasy-backend-823510409781.us-central1.run.app';
  }

  /**
   * Evaluate user's language level based on conversation responses
   * @param {Array} conversationMessages - Array of messages from first conversation
   * @param {string} targetLanguage - The language being learned
   * @returns {Object} Assessment results with level and feedback
   */
  async evaluateLevel(conversationMessages, targetLanguage) {
    try {
      // Extract only user messages for assessment
      const userResponses = conversationMessages
        .filter(msg => msg.role === 'user')
        .map(msg => msg.content);

      if (userResponses.length === 0) {
        return {
          success: false,
          error: 'No user responses to evaluate'
        };
      }

      const response = await axios.post(
        `${this.backendURL}/api/assessment/evaluate`,
        {
          responses: userResponses,
          targetLanguage: targetLanguage
        },
        {
          timeout: 30000
        }
      );

      const assessment = response.data.assessment;

      // Map backend levels to our CEFR format
      const level = this.mapToLevel(assessment.level);

      return {
        success: true,
        level: level,
        feedback: assessment.feedback,
        strengths: assessment.strengths || [],
        areasToImprove: assessment.areasToImprove || []
      };
    } catch (error) {
      console.error('Assessment evaluation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to evaluate level'
      };
    }
  }

  /**
   * Map various level formats to CEFR standard (A1, A2, B1, B2, C1, C2)
   */
  mapToLevel(levelString) {
    const normalized = levelString.toLowerCase().trim();

    // Direct CEFR match
    const cefrMatch = normalized.match(/[abc][12]/);
    if (cefrMatch) {
      return cefrMatch[0].toUpperCase();
    }

    // Common level descriptions
    const levelMap = {
      'absolute beginner': 'A1',
      'beginner': 'A1',
      'elementary': 'A2',
      'pre-intermediate': 'A2',
      'intermediate': 'B1',
      'upper intermediate': 'B2',
      'upper-intermediate': 'B2',
      'advanced': 'C1',
      'proficient': 'C2',
      'mastery': 'C2',
      'native': 'C2'
    };

    return levelMap[normalized] || 'A1'; // Default to beginner if unknown
  }

  /**
   * Check if a user needs initial level assessment
   * @param {Object} userProfile - User profile object
   * @returns {boolean} True if assessment is needed
   */
  needsAssessment(userProfile) {
    return !userProfile ||
           !userProfile.level ||
           userProfile.level === 'unknown' ||
           userProfile.assessmentPending === true;
  }

  /**
   * Get friendly level description
   */
  getLevelDescription(level) {
    const descriptions = {
      'A1': 'Beginner - Just starting out',
      'A2': 'Elementary - Basic conversations',
      'B1': 'Intermediate - Everyday situations',
      'B2': 'Upper Intermediate - Complex topics',
      'C1': 'Advanced - Fluent expression',
      'C2': 'Mastery - Native-like proficiency'
    };
    return descriptions[level] || 'Unknown level';
  }

  /**
   * Get assessment prompts for initial conversation
   * @param {string} targetLanguage - The language being learned
   * @param {string} nativeLanguage - User's native language
   * @returns {Array} Array of prompts to guide assessment conversation
   */
  getAssessmentPrompts(targetLanguage, nativeLanguage) {
    return [
      `Tell me about yourself in ${targetLanguage}. What's your name and where are you from?`,
      `What do you like to do in your free time? Try to answer in ${targetLanguage}.`,
      `Can you describe your daily routine in ${targetLanguage}?`,
      `What are your goals for learning ${targetLanguage}?`
    ];
  }

  /**
   * Determine minimum number of exchanges needed for assessment
   */
  getMinimumExchanges() {
    return 3; // At least 3 back-and-forth exchanges
  }
}

export default new AssessmentService();
