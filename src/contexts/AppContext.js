import React, { createContext, useState, useContext, useEffect } from 'react';
import StorageService from '../utils/storage';
import LLMService from '../services/llm';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [userProfile, setUserProfile] = useState(null);
  const [llmConfig, setLLMConfig] = useState(null);
  const [contentLibrary, setContentLibrary] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [llmConnected, setLLMConnected] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const profile = await StorageService.getUserProfile();
      const config = await StorageService.getLLMConfig();
      const library = await StorageService.getContentLibrary();

      setUserProfile(profile);
      setLLMConfig(config);
      setContentLibrary(library);

      if (config) {
        LLMService.setConfig(config.baseURL, config.model);
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (profile) => {
    await StorageService.saveUserProfile(profile);
    setUserProfile(profile);
  };

  const updateLLMConfig = async (config) => {
    await StorageService.saveLLMConfig(config);
    setLLMConfig(config);
    LLMService.setConfig(config.baseURL, config.model);
  };

  const testLLMConnection = async () => {
    const result = await LLMService.testConnection();
    setLLMConnected(result.success);
    return result;
  };

  const addContent = async (content) => {
    const result = await StorageService.saveContent(content);
    if (result.success) {
      setContentLibrary([...contentLibrary, result.content]);
    }
    return result;
  };

  const deleteContent = async (contentId) => {
    const result = await StorageService.deleteContent(contentId);
    if (result.success) {
      setContentLibrary(contentLibrary.filter(item => item.id !== contentId));
    }
    return result;
  };

  const refreshContentLibrary = async () => {
    const library = await StorageService.getContentLibrary();
    setContentLibrary(library);
  };

  const value = {
    userProfile,
    setUserProfile: updateUserProfile,
    llmConfig,
    setLLMConfig: updateLLMConfig,
    contentLibrary,
    addContent,
    deleteContent,
    refreshContentLibrary,
    isLoading,
    llmConnected,
    setLLMConnected,
    testLLMConnection
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
