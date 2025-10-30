import axios from 'axios';
import { getCurrentConfig } from '../config/llm.config';

class LLMService {
  constructor() {
    // Get configuration based on environment
    const config = getCurrentConfig();

    // Use backend URL in production, direct Ollama in development
    this.mode = config.mode || 'backend';
    this.backendURL = config.backendURL || 'https://speakeasy-backend-823510409781.us-central1.run.app';
    this.baseURL = config.llama?.baseURL || 'http://localhost:11434';
    this.model = config.llama?.model || 'llama2';
    this.isConnected = false;
    this.subscriptionContext = null; // Will be set by the app

    console.log(`🔧 LLM Service initialized in ${this.mode} mode`);
    console.log(`📡 Backend URL: ${this.backendURL}`);
  }

  /**
   * Set subscription context for token tracking
   */
  setSubscriptionContext(context) {
    this.subscriptionContext = context;
  }

  /**
   * Estimate tokens in a text (rough approximation: ~4 chars = 1 token)
   */
  estimateTokens(text) {
    if (!text) return 0;
    // Simple approximation: average 4 characters per token
    // This includes spaces and punctuation
    return Math.ceil(text.length / 4);
  }

  setConfig(baseURL, model) {
    this.baseURL = baseURL;
    this.model = model;
  }

  async testConnection() {
    try {
      // Test backend API connection instead of direct Ollama
      const url = this.mode === 'backend'
        ? `${this.backendURL}/health`
        : `${this.baseURL}/api/tags`;

      const response = await axios.get(url, {
        timeout: 5000
      });
      this.isConnected = response.status === 200;
      return {
        success: true,
        models: response.data.models || [],
        mode: this.mode,
        url: this.mode === 'backend' ? this.backendURL : this.baseURL
      };
    } catch (error) {
      this.isConnected = false;
      return {
        success: false,
        error: error.message || `Failed to connect to ${this.mode === 'backend' ? 'backend API' : 'Ollama'}`,
        mode: this.mode
      };
    }
  }

  async generate(prompt, options = {}) {
    try {
      // Check subscription and token limits before making the request
      if (this.subscriptionContext) {
        const { canUseService, isPowerUser } = this.subscriptionContext;

        if (!canUseService()) {
          return {
            success: false,
            error: 'Token limit exceeded',
            limitExceeded: true,
          };
        }
      }

      let responseData;

      if (this.mode === 'backend') {
        // Use backend API
        const response = await axios.post(
          `${this.backendURL}/api/generate`,
          {
            prompt: prompt,
            model: options.model || 'llama',
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || options.num_predict || 2048
          },
          {
            timeout: 60000 // 60 second timeout
          }
        );
        responseData = response.data.response;
      } else {
        // Direct Ollama call (development mode)
        const response = await axios.post(
          `${this.baseURL}/api/generate`,
          {
            model: this.model,
            prompt: prompt,
            stream: false,
            options: {
              temperature: options.temperature,
              num_predict: options.maxTokens || options.num_predict
            }
          },
          {
            timeout: 60000
          }
        );
        responseData = response.data.response;
      }

      // Track token usage
      if (this.subscriptionContext && responseData) {
        const promptTokens = this.estimateTokens(prompt);
        const responseTokens = this.estimateTokens(responseData);
        const totalTokens = promptTokens + responseTokens;

        const usageResult = await this.subscriptionContext.addTokenUsage(totalTokens);

        return {
          success: true,
          text: responseData,
          tokensUsed: totalTokens,
          limitExceeded: usageResult.limitExceeded,
          usage: usageResult.usage,
        };
      }

      return {
        success: true,
        text: responseData
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to generate response'
      };
    }
  }

  /**
   * Helper method that returns just the text response
   * Throws error on failure for easier error handling
   */
  async generateResponse(prompt, options = {}) {
    const result = await this.generate(prompt, options);
    if (result.success) {
      return result.text;
    } else {
      throw new Error(result.error);
    }
  }

  /**
   * Alias for generateResponse - used by LessonService
   * Generates text based on a prompt for lesson content
   */
  async generateText(prompt, targetLanguage, userLevel) {
    return await this.generateResponse(prompt, {});
  }

  async generateStory(userProfile, targetLanguage) {
    const interests = userProfile.interests.join(', ');
    const prompt = `Generate a short, engaging story (200-300 words) in ${targetLanguage} for a language learner.

Level: ${userProfile.level}
Interests: ${interests}

The story should:
- Use vocabulary appropriate for ${userProfile.level} level
- Include interesting dialogue
- Relate to the learner's interests: ${interests}
- Be engaging and culturally relevant

Generate ONLY the story in ${targetLanguage}, no explanations.`;

    return await this.generate(prompt);
  }

  async analyzeContent(content, targetLanguage, userLevel) {
    const prompt = `Analyze this ${targetLanguage} text for a ${userLevel} level language learner:

"${content}"

Provide a JSON response with:
{
  "difficulty": "A1/A2/B1/B2/C1/C2",
  "keyVocabulary": ["word1", "word2", ...],
  "grammarPoints": ["point1", "point2", ...],
  "culturalNotes": ["note1", "note2", ...],
  "summary": "brief summary"
}

Respond ONLY with valid JSON.`;

    return await this.generate(prompt);
  }

  async explainWord(word, context, targetLanguage, nativeLanguage) {
    const prompt = `Explain the word "${word}" from this ${targetLanguage} context: "${context}"

Provide explanation in ${nativeLanguage} with:
1. Definition
2. Grammar notes (part of speech, conjugation if verb)
3. Usage examples in ${targetLanguage}
4. Cultural context if relevant

Keep it concise and clear for language learners.`;

    return await this.generate(prompt);
  }

  async generateAdaptiveLayers(sentence, targetLanguage, userLevel) {
    const prompt = `For this ${targetLanguage} sentence at ${userLevel} level: "${sentence}"

Generate 3 versions:
1. SIMPLIFIED (A1-A2): Simpler vocabulary, present tense, short structure
2. CURRENT (${userLevel}): The given sentence
3. ADVANCED (C1-C2): Native speaker style, idioms, complex structures

Format as JSON:
{
  "simplified": "...",
  "current": "...",
  "advanced": "..."
}

Respond ONLY with valid JSON.`;

    return await this.generate(prompt);
  }

  async chat(message, conversationHistory, targetLanguage, userLevel = 'beginner') {
    try {
      if (this.mode === 'backend') {
        // Use backend's specialized practice endpoint
        const response = await axios.post(
          `${this.backendURL}/api/practice/message`,
          {
            message: message,
            targetLanguage: targetLanguage,
            userLevel: userLevel,
            conversationHistory: conversationHistory
          },
          {
            timeout: 30000
          }
        );
        return {
          success: true,
          text: response.data.response
        };
      }

      // Fallback to direct Ollama (development mode)
      const history = conversationHistory
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = `You are a friendly language tutor helping someone learn ${targetLanguage}.

Conversation history:
${history}

Student: ${message}

Respond naturally in ${targetLanguage}. If the student makes mistakes, gently correct them. Keep responses conversational and encouraging.

Tutor:`;

      return await this.generate(prompt);
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to process chat'
      };
    }
  }

  async analyzeImportedContent(content, contentType, targetLanguage, userLevel) {
    let specificInstructions = '';

    if (contentType === 'lyrics') {
      specificInstructions = `This is song lyrics. Include:
- Cultural/historical context of the song
- Poetic/figurative language explanations
- Common expressions and idioms
- Pronunciation tips for singing`;
    } else if (contentType === 'article') {
      specificInstructions = `This is an article. Include:
- Main ideas summary
- Formal register analysis
- Topic-specific vocabulary
- Complex sentence structures breakdown`;
    }

    const prompt = `Analyze this ${targetLanguage} ${contentType} for a ${userLevel} learner:

"${content}"

${specificInstructions}

Provide comprehensive analysis as JSON:
{
  "title": "...",
  "difficulty": "A1/A2/B1/B2/C1/C2",
  "summary": "...",
  "vocabulary": [{"word": "...", "definition": "...", "difficulty": "..."}],
  "grammar": ["point1", "point2"],
  "cultural": ["note1", "note2"],
  "practicePrompts": ["prompt1", "prompt2"]
}

Respond ONLY with valid JSON.`;

    return await this.generate(prompt);
  }

  async generateLesson(userProfile, targetLanguage, lessonType) {
    try {
      if (this.mode === 'backend') {
        // Use backend's specialized lesson generation endpoint
        const response = await axios.post(
          `${this.backendURL}/api/lessons/generate`,
          {
            userProfile: {
              ...userProfile,
              targetLanguage: targetLanguage
            },
            count: 1
          },
          {
            timeout: 60000
          }
        );
        // Return first lesson from array
        const lesson = response.data.lessons?.[0];
        if (lesson) {
          return {
            success: true,
            text: JSON.stringify(lesson)
          };
        }
      }

      // Fallback to direct generation
      const interests = userProfile.interests?.join(', ') || 'general topics';

      let lessonInstructions = '';

      switch (lessonType) {
        case 'vocabulary':
          lessonInstructions = `Create a vocabulary lesson with:
- 10-15 thematic words/phrases related to ${interests}
- Definitions in simple ${targetLanguage}
- Example sentences for each word
- Memory tips or mnemonics
- Practice exercises (fill-in-the-blank, matching)`;
          break;

        case 'grammar':
          lessonInstructions = `Create a grammar lesson with:
- One key grammar concept appropriate for ${userProfile.level} level
- Clear explanation with examples
- Common mistakes to avoid
- Practice exercises (transformation, correction)
- Real-world usage examples`;
          break;

        case 'listening':
          lessonInstructions = `Create a listening comprehension lesson with:
- A short dialogue or monologue (150-200 words) about ${interests}
- Comprehension questions
- Vocabulary preview
- Cultural notes
- Follow-up discussion prompts`;
          break;

        case 'speaking':
          lessonInstructions = `Create a speaking practice lesson with:
- Pronunciation focus (specific sounds or patterns)
- Useful phrases for conversation about ${interests}
- Role-play scenarios
- Speaking prompts
- Common expressions and their usage`;
          break;

        case 'reading':
          lessonInstructions = `Create a reading comprehension lesson with:
- A short text (200-300 words) about ${interests}
- Pre-reading vocabulary
- Comprehension questions
- Discussion questions
- Cultural context`;
          break;

        case 'writing':
          lessonInstructions = `Create a writing practice lesson with:
- A writing prompt related to ${interests}
- Key vocabulary and phrases to use
- Structural guidelines
- Example sentences
- Self-check criteria`;
          break;
      }

      const prompt = `Generate a personalized ${lessonType} lesson in ${targetLanguage} for a ${userProfile.level} level learner.

Learner Profile:
- Name: ${userProfile.name}
- Level: ${userProfile.level}
- Interests: ${interests}

${lessonInstructions}

Provide response as JSON:
{
  "title": "Lesson title",
  "content": "Main lesson content with explanations",
  "exercises": [
    {
      "type": "exercise type",
      "question": "Exercise question or prompt",
      "answer": "Correct answer or sample answer",
      "hints": ["hint1", "hint2"]
    }
  ]
}

Make the lesson engaging, practical, and tailored to the learner's interests.
Respond ONLY with valid JSON.`;

      return await this.generate(prompt, { model: 'qwen' });
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to generate lesson'
      };
    }
  }

  async checkLessonAnswer(lesson, exercise, userAnswer, targetLanguage) {
    const prompt = `You are a language tutor checking a student's answer in ${targetLanguage}.

Lesson: ${lesson.title}
Exercise: ${exercise.question}
Correct Answer: ${exercise.answer}
Student's Answer: ${userAnswer}

Evaluate the student's answer and provide feedback as JSON:
{
  "correct": true/false,
  "explanation": "Explain why it's correct or what's wrong",
  "suggestion": "Helpful tip or corrected version if incorrect"
}

Be encouraging and constructive. If the answer is mostly correct but has minor errors, mark it as correct but note the errors in the explanation.
Respond ONLY with valid JSON.`;

    return await this.generate(prompt);
  }

  async generateQuiz(lesson, targetLanguage, userLevel) {
    const prompt = `Generate a comprehensive quiz for this ${targetLanguage} lesson at ${userLevel} level:

Lesson Type: ${lesson.type}
Lesson Content: ${lesson.content}

Create a quiz with 10 questions using a mix of question types:
- Multiple choice (4 options each)
- True/False
- Fill in the blank
- Short answer

Questions should test:
1. Vocabulary understanding
2. Grammar application
3. Comprehension
4. Practical usage

Provide response as JSON:
{
  "questions": [
    {
      "type": "multiple_choice|true_false|fill_blank|short_answer",
      "question": "The question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct answer text or index",
      "explanation": "Why this is correct"
    }
  ]
}

Make questions relevant to the lesson content and appropriately challenging for ${userLevel} level.
Respond ONLY with valid JSON.`;

    return await this.generate(prompt);
  }

  async checkQuizAnswer(question, userAnswer, targetLanguage) {
    // For multiple choice and true/false, do simple comparison
    if (question.type === 'multiple_choice' || question.type === 'true_false') {
      const correct = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
      return {
        success: true,
        correct,
        explanation: question.explanation
      };
    }

    // For fill_blank and short_answer, use LLM to evaluate
    const prompt = `Evaluate this answer for a ${targetLanguage} language learning quiz question.

Question: ${question.question}
Correct Answer: ${question.correctAnswer}
Student's Answer: ${userAnswer}

Evaluate if the student's answer is correct, accounting for:
- Minor spelling mistakes
- Acceptable variations
- Grammatical correctness
- Meaning equivalence

Provide response as JSON:
{
  "correct": true/false,
  "explanation": "Brief explanation of why it's correct or incorrect",
  "acceptableVariation": true/false
}

Be fair but accurate. Accept reasonable variations.
Respond ONLY with valid JSON.`;

    const result = await this.generate(prompt);

    if (result.success) {
      try {
        const jsonMatch = result.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const evaluation = JSON.parse(jsonMatch[0]);
          return {
            success: true,
            correct: evaluation.correct,
            explanation: evaluation.explanation
          };
        }
      } catch (e) {
        console.error('Error parsing quiz answer evaluation:', e);
      }
    }

    return {
      success: false,
      error: 'Failed to evaluate answer'
    };
  }
}

export default new LLMService();
