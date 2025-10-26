import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USER_PROFILE: '@fluentai:userProfile',
  LLM_CONFIG: '@fluentai:llmConfig',
  CONTENT_LIBRARY: '@fluentai:contentLibrary',
  CONVERSATION_HISTORY: '@fluentai:conversationHistory',
  ONBOARDING_COMPLETE: '@fluentai:onboardingComplete',
  AUTH_TOKEN: '@fluentai:authToken',
  USER_DATA: '@fluentai:userData'
};

class StorageService {
  async saveUserProfile(profile) {
    try {
      await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserProfile() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  async saveLLMConfig(config) {
    try {
      await AsyncStorage.setItem(KEYS.LLM_CONFIG, JSON.stringify(config));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getLLMConfig() {
    try {
      const data = await AsyncStorage.getItem(KEYS.LLM_CONFIG);
      return data ? JSON.parse(data) : { 
        baseURL: 'http://localhost:11434',
        model: 'llama2'
      };
    } catch (error) {
      return { 
        baseURL: 'http://localhost:11434',
        model: 'llama2'
      };
    }
  }

  async saveContent(content) {
    try {
      const library = await this.getContentLibrary();
      const newContent = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...content
      };
      library.push(newContent);
      await AsyncStorage.setItem(KEYS.CONTENT_LIBRARY, JSON.stringify(library));
      return { success: true, content: newContent };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getContentLibrary() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CONTENT_LIBRARY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async deleteContent(contentId) {
    try {
      const library = await this.getContentLibrary();
      const filtered = library.filter(item => item.id !== contentId);
      await AsyncStorage.setItem(KEYS.CONTENT_LIBRARY, JSON.stringify(filtered));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveConversationHistory(history) {
    try {
      await AsyncStorage.setItem(KEYS.CONVERSATION_HISTORY, JSON.stringify(history));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getConversationHistory() {
    try {
      const data = await AsyncStorage.getItem(KEYS.CONVERSATION_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  async clearConversationHistory() {
    try {
      await AsyncStorage.setItem(KEYS.CONVERSATION_HISTORY, JSON.stringify([]));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async setOnboardingComplete(complete) {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, complete.toString());
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async isOnboardingComplete() {
    try {
      const data = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
      return data === 'true';
    } catch (error) {
      return false;
    }
  }

  async clearAll() {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Authentication methods
  async saveAuthToken(token) {
    try {
      await AsyncStorage.setItem(KEYS.AUTH_TOKEN, token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getAuthToken() {
    try {
      const token = await AsyncStorage.getItem(KEYS.AUTH_TOKEN);
      return token;
    } catch (error) {
      return null;
    }
  }

  async removeAuthToken() {
    try {
      await AsyncStorage.removeItem(KEYS.AUTH_TOKEN);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async saveUserData(userData) {
    try {
      await AsyncStorage.setItem(KEYS.USER_DATA, JSON.stringify(userData));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getUserData() {
    try {
      const data = await AsyncStorage.getItem(KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  }

  async removeUserData() {
    try {
      await AsyncStorage.removeItem(KEYS.USER_DATA);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async clearAuthData() {
    try {
      await AsyncStorage.multiRemove([KEYS.AUTH_TOKEN, KEYS.USER_DATA]);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export default new StorageService();
