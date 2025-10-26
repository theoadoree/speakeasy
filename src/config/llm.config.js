/**
 * LLM Configuration for SpeakEasy
 * Supports local development (Ollama) and cloud production (Google Cloud Run)
 */

const ENV = 'development'; // 'development' | 'production'

const LLM_CONFIG = {
  // Development: Local Ollama on Mac M1 Max
  development: {
    qwen: {
      baseURL: 'http://localhost:11434',
      model: 'qwen2.5:72b',
      temperature: 0.7,
      maxTokens: 4096,
    },
    llama: {
      baseURL: 'http://localhost:11434',
      model: 'llama3.1:8b',
      temperature: 0.8,
      maxTokens: 2048,
    },
  },

  // Production: Google Cloud Run or Hugging Face
  production: {
    qwen: {
      baseURL: 'https://speakeasy-llm.run.app', // Your Cloud Run endpoint
      model: 'qwen2.5:72b',
      temperature: 0.7,
      maxTokens: 4096,
      apiKey: process.env.CLOUD_LLM_API_KEY, // Optional auth
    },
    llama: {
      baseURL: 'https://speakeasy-llm.run.app',
      model: 'llama3.1:8b',
      temperature: 0.8,
      maxTokens: 2048,
    },
  },
};

/**
 * Task routing: Which model to use for which task
 */
export const TASK_ROUTING = {
  // Use Qwen2.5-72B for complex reasoning tasks
  QWEN_TASKS: [
    'onboarding',
    'level_assessment',
    'lesson_generation',
    'grammar_explanation',
    'content_analysis',
    'interest_profiling',
  ],

  // Use Llama 4-8B for fast conversational tasks
  LLAMA_TASKS: [
    'voice_practice',
    'quick_chat',
    'pronunciation_feedback',
    'simple_correction',
    'casual_conversation',
  ],
};

/**
 * Get current config based on environment
 */
export const getCurrentConfig = () => {
  return LLM_CONFIG[ENV];
};

/**
 * Switch environment (useful for testing)
 */
export const setEnvironment = (env) => {
  if (!['development', 'production'].includes(env)) {
    throw new Error('Invalid environment. Use "development" or "production"');
  }
  ENV = env;
};

export default LLM_CONFIG;
