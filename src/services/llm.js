import axios from 'axios';

class LLMService {
  constructor() {
    this.baseURL = 'http://localhost:11434';
    this.model = 'llama2';
    this.isConnected = false;
  }

  setConfig(baseURL, model) {
    this.baseURL = baseURL;
    this.model = model;
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/api/tags`, {
        timeout: 5000
      });
      this.isConnected = response.status === 200;
      return { success: true, models: response.data.models || [] };
    } catch (error) {
      this.isConnected = false;
      return { 
        success: false, 
        error: error.message || 'Failed to connect to Ollama' 
      };
    }
  }

  async generate(prompt, options = {}) {
    try {
      const response = await axios.post(
        `${this.baseURL}/api/generate`,
        {
          model: this.model,
          prompt: prompt,
          stream: false,
          ...options
        },
        {
          timeout: 60000 // 60 second timeout
        }
      );
      return {
        success: true,
        text: response.data.response
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to generate response'
      };
    }
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

  async chat(message, conversationHistory, targetLanguage) {
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
}

export default new LLMService();
