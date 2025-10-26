/**
 * Intelligent LLM Service for SpeakEasy
 * Routes tasks to optimal model (Qwen2.5-72B or Llama 4-8B)
 * Manages conversation memory and context
 */

import axios from 'axios';
import { getCurrentConfig, TASK_ROUTING } from '../config/llm.config';
import StorageService from '../utils/storage';

class IntelligentLLMService {
  constructor() {
    this.config = getCurrentConfig();
    this.conversationHistory = [];
    this.maxHistoryLength = 10; // Keep last 10 exchanges
  }

  /**
   * Route task to appropriate model
   * @param {string} taskType - Type of task (from TASK_ROUTING)
   * @param {string} prompt - User input
   * @param {object} options - Additional options
   * @returns {Promise<string>} - LLM response
   */
  async executeTask(taskType, prompt, options = {}) {
    const useQwen = TASK_ROUTING.QWEN_TASKS.includes(taskType);
    const modelConfig = useQwen ? this.config.qwen : this.config.llama;

    console.log(`🤖 Using ${useQwen ? 'Qwen2.5-72B' : 'Llama 4-8B'} for: ${taskType}`);

    try {
      const response = await this.generateCompletion(
        modelConfig,
        prompt,
        options
      );

      // Store in conversation history
      if (options.saveHistory !== false) {
        this.addToHistory(prompt, response);
      }

      return response;
    } catch (error) {
      console.error('LLM Error:', error);
      throw error;
    }
  }

  /**
   * Generate completion using Ollama API
   * @private
   */
  async generateCompletion(modelConfig, prompt, options = {}) {
    const { baseURL, model, temperature, maxTokens } = modelConfig;

    // Include conversation history if requested
    let fullPrompt = prompt;
    if (options.includeHistory && this.conversationHistory.length > 0) {
      const historyText = this.conversationHistory
        .map((h) => `User: ${h.user}\nAssistant: ${h.assistant}`)
        .join('\n\n');
      fullPrompt = `${historyText}\n\nUser: ${prompt}`;
    }

    const response = await axios.post(
      `${baseURL}/api/generate`,
      {
        model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: options.temperature || temperature,
          num_predict: options.maxTokens || maxTokens,
        },
      },
      {
        timeout: 60000, // 60 second timeout
      }
    );

    return response.data.response;
  }

  /**
   * Voice-First Onboarding Conversation
   */
  async onboardingConversation(userInput, stage = 'discover_interests') {
    const prompts = {
      discover_interests: `You are a friendly language learning tutor starting a conversation.
The user just said: "${userInput}"

Your task: Have a natural conversation to discover their interests, hobbies, and goals.
Ask 1-2 friendly follow-up questions to learn more about what they enjoy.
Keep it casual and conversational. Don't be too formal.

Respond in a warm, encouraging tone:`,

      assess_level: `You are assessing the user's language level through casual conversation.
The user said: "${userInput}"

Based on their response, gauge their current level and ask a question that helps assess their proficiency.
Be encouraging and natural. Don't make it feel like a test.

Provide a conversational response:`,

      finalize_profile: `Summarize the user's learning profile based on this conversation.
User's latest input: "${userInput}"

Generate a JSON object with:
{
  "interests": ["interest1", "interest2", "interest3"],
  "goals": ["goal1", "goal2"],
  "estimated_level": "beginner|intermediate|advanced",
  "preferred_topics": ["topic1", "topic2"]
}

JSON only, no explanation:`,
    };

    return await this.executeTask(
      'onboarding',
      prompts[stage],
      { includeHistory: true }
    );
  }

  /**
   * Assess Language Level Organically
   */
  async assessLevel(userResponse, previousResponses = []) {
    const prompt = `You are a language assessment expert. Based on this user's response, determine their language proficiency level.

User's response: "${userResponse}"

${previousResponses.length > 0 ? `Previous responses: ${previousResponses.join('; ')}` : ''}

Analyze:
- Vocabulary range and complexity
- Grammar accuracy
- Sentence structure
- Fluency indicators

Return JSON:
{
  "level": "A1|A2|B1|B2|C1|C2",
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "confidence": 0.0-1.0
}`;

    return await this.executeTask('level_assessment', prompt, {
      saveHistory: false,
    });
  }

  /**
   * Generate Personalized Lesson
   */
  async generateLesson(userProfile, targetLanguage) {
    const prompt = `Create a personalized language lesson for this learner:

Profile:
- Level: ${userProfile.level || 'beginner'}
- Interests: ${(userProfile.interests || []).join(', ')}
- Target Language: ${targetLanguage}
- Learning Goals: ${(userProfile.goals || []).join(', ')}

Generate a lesson plan as JSON:
{
  "title": "Engaging lesson title",
  "description": "Brief description",
  "difficulty": "beginner|intermediate|advanced",
  "duration_minutes": 15,
  "sections": [
    {
      "type": "vocabulary|grammar|practice|review",
      "content": "Section content",
      "examples": ["example1", "example2"],
      "practice_prompts": ["prompt1", "prompt2"]
    }
  ],
  "conversation_starters": ["starter1", "starter2", "starter3"]
}`;

    return await this.executeTask('lesson_generation', prompt);
  }

  /**
   * Real-Time Voice Conversation Practice
   */
  async voicePractice(userSpeech, lessonContext = '') {
    const prompt = `You are a friendly language tutor having a voice conversation.

${lessonContext ? `Current lesson context: ${lessonContext}` : ''}

User said: "${userSpeech}"

Provide a natural, conversational response. Be encouraging and helpful.
If there are errors, gently correct them in a natural way (don't be too formal).

Keep your response concise (2-3 sentences) since this is voice conversation.

Response:`;

    return await this.executeTask('voice_practice', prompt, {
      includeHistory: true,
    });
  }

  /**
   * Provide Grammar Explanation
   */
  async explainGrammar(grammaticalConcept, userLevel) {
    const prompt = `Explain this grammar concept to a ${userLevel} learner: "${grammaticalConcept}"

Provide:
1. Simple explanation in plain language
2. 2-3 practical examples
3. Common mistakes to avoid

Keep it clear and concise. Use analogies if helpful.`;

    return await this.executeTask('grammar_explanation', prompt);
  }

  /**
   * Analyze Content for Lesson Creation
   */
  async analyzeContent(contentText, contentType = 'article') {
    const prompt = `Analyze this ${contentType} for language learning:

Content: "${contentText.substring(0, 2000)}"

Extract:
{
  "key_vocabulary": ["word1", "word2", "..."],
  "grammar_points": ["point1", "point2"],
  "difficulty_level": "beginner|intermediate|advanced",
  "topics": ["topic1", "topic2"],
  "suggested_exercises": ["exercise1", "exercise2"]
}

JSON only:`;

    return await this.executeTask('content_analysis', prompt);
  }

  /**
   * Quick Pronunciation Feedback
   */
  async provideFeedback(userSpeech, expectedPhrase) {
    const prompt = `User tried to say: "${expectedPhrase}"
They actually said: "${userSpeech}"

Provide quick, encouraging feedback (1-2 sentences).
If correct, praise them! If incorrect, gently guide them.

Feedback:`;

    return await this.executeTask('simple_correction', prompt);
  }

  /**
   * Conversation History Management
   */
  addToHistory(userMessage, assistantResponse) {
    this.conversationHistory.push({
      user: userMessage,
      assistant: assistantResponse,
      timestamp: new Date().toISOString(),
    });

    // Keep only recent history
    if (this.conversationHistory.length > this.maxHistoryLength) {
      this.conversationHistory.shift();
    }

    // Persist to storage
    this.saveHistory();
  }

  async saveHistory() {
    try {
      await StorageService.saveConversationHistory(this.conversationHistory);
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  }

  async loadHistory() {
    try {
      const history = await StorageService.getConversationHistory();
      this.conversationHistory = history || [];
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  }

  clearHistory() {
    this.conversationHistory = [];
    StorageService.clearConversationHistory();
  }

  getHistory() {
    return this.conversationHistory;
  }

  /**
   * Test Connection to LLM
   */
  async testConnection() {
    try {
      const response = await this.generateCompletion(this.config.qwen, 'Say "Hello!"');
      return {
        success: true,
        message: 'Connected to LLM successfully',
        response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new IntelligentLLMService();
