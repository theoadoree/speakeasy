/**
 * API Client for SpeakEasy Backend
 * Handles communication with the Express backend API
 */

import axios from 'axios';
import { getCurrentConfig } from '../config/llm.config';

/**
 * Make a request to the backend API
 */
const apiRequest = async (endpoint, data, config = {}) => {
  const llmConfig = getCurrentConfig();
  const baseURL = llmConfig.backendURL;

  try {
    const response = await axios.post(`${baseURL}${endpoint}`, data, {
      headers: {
        'Content-Type': 'application/json',
        ...(llmConfig.apiKey && { 'Authorization': `Bearer ${llmConfig.apiKey}` }),
        ...config.headers,
      },
      timeout: config.timeout || 30000,
    });

    return response.data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error.message);
    throw new Error(error.response?.data?.error || error.message);
  }
};

/**
 * Generate a generic LLM response
 */
export const generateResponse = async (prompt, options = {}) => {
  const { model = 'llama', temperature, maxTokens } = options;

  return apiRequest('/api/generate', {
    prompt,
    model,
    temperature,
    maxTokens,
  });
};

/**
 * Send message during onboarding
 */
export const sendOnboardingMessage = async (message, context) => {
  const { conversationHistory, userName, targetLanguage } = context;

  return apiRequest('/api/onboarding/message', {
    message,
    conversationHistory,
    userName,
    targetLanguage,
  });
};

/**
 * Send message during practice conversation
 */
export const sendPracticeMessage = async (message, context) => {
  const { lesson, userProfile } = context;

  return apiRequest('/api/practice/message', {
    message,
    lesson,
    userProfile,
  });
};

/**
 * Generate personalized lessons
 */
export const generateLessons = async (userProfile, count = 5) => {
  return apiRequest('/api/lessons/generate', {
    userProfile,
    count,
  });
};

/**
 * Evaluate assessment responses
 */
export const evaluateAssessment = async (responses, targetLanguage) => {
  return apiRequest('/api/assessment/evaluate', {
    responses,
    targetLanguage,
  });
};

/**
 * Health check
 */
export const checkHealth = async () => {
  const llmConfig = getCurrentConfig();
  const baseURL = llmConfig.backendURL;

  try {
    const response = await axios.get(`${baseURL}/health`, {
      timeout: 5000,
    });
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return { status: 'unhealthy', error: error.message };
  }
};

export default {
  generateResponse,
  sendOnboardingMessage,
  sendPracticeMessage,
  generateLessons,
  evaluateAssessment,
  checkHealth,
};
