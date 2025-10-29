import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useState, useEffect, useCallback } from 'react';

/**
 * Speech Recognition Service for React Native
 * Uses expo-speech-recognition for cross-platform speech-to-text
 */

/**
 * Hook for using speech recognition in components
 * @param {string} language - Target language code (e.g., 'en-US', 'es-ES')
 * @param {Function} onResult - Callback when final result is received
 * @param {Function} onPartialResult - Callback for partial/interim results
 * @param {Function} onError - Callback for errors
 */
export function useSpeechRecognition({
  language = 'en-US',
  onResult,
  onPartialResult,
  onError,
}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isAvailable, setIsAvailable] = useState(false);

  // Check if speech recognition is available
  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.getStateAsync();
      setIsAvailable(result.state === 'authorized' || result.state === 'undetermined');
    } catch (error) {
      console.error('Speech recognition not available:', error);
      setIsAvailable(false);
    }
  };

  // Handle speech recognition events
  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
    setTranscript('');
    setInterimTranscript('');
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    setInterimTranscript('');
  });

  useSpeechRecognitionEvent('result', (event) => {
    const results = event.results;
    if (results && results.length > 0) {
      const result = results[0];
      const transcriptText = result.transcript;

      if (result.isFinal) {
        setTranscript(transcriptText);
        setInterimTranscript('');
        onResult?.(transcriptText);
      } else {
        setInterimTranscript(transcriptText);
        onPartialResult?.(transcriptText);
      }
    }
  });

  useSpeechRecognitionEvent('error', (event) => {
    console.error('Speech recognition error:', event.error);
    setIsListening(false);
    onError?.(event.error);
  });

  /**
   * Start listening for speech
   */
  const start = useCallback(async () => {
    if (!isAvailable) {
      onError?.('Speech recognition not available');
      return false;
    }

    try {
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      await ExpoSpeechRecognitionModule.start({
        lang: language,
        interimResults: true,
        maxAlternatives: 1,
        continuous: false,
        requiresOnDeviceRecognition: false,
        addsPunctuation: true,
        contextualStrings: [],
      });

      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError?.(error.message);
      return false;
    }
  }, [language, isAvailable, onError]);

  /**
   * Stop listening for speech
   */
  const stop = useCallback(async () => {
    try {
      await ExpoSpeechRecognitionModule.stop();
    } catch (error) {
      console.error('Failed to stop speech recognition:', error);
    }
  }, []);

  /**
   * Abort/cancel current recognition
   */
  const abort = useCallback(async () => {
    try {
      await ExpoSpeechRecognitionModule.abort();
      setIsListening(false);
      setTranscript('');
      setInterimTranscript('');
    } catch (error) {
      console.error('Failed to abort speech recognition:', error);
    }
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isAvailable,
    start,
    stop,
    abort,
  };
}

/**
 * Get language code for speech recognition based on language name
 */
export function getLanguageCode(language) {
  const languageCodes = {
    English: 'en-US',
    Spanish: 'es-ES',
    French: 'fr-FR',
    German: 'de-DE',
    Italian: 'it-IT',
    Japanese: 'ja-JP',
    Korean: 'ko-KR',
    Mandarin: 'zh-CN',
    Portuguese: 'pt-PT',
    Russian: 'ru-RU',
    Arabic: 'ar-SA',
    Hindi: 'hi-IN',
    Dutch: 'nl-NL',
    Polish: 'pl-PL',
    Turkish: 'tr-TR',
    Swedish: 'sv-SE',
    Norwegian: 'no-NO',
    Danish: 'da-DK',
    Finnish: 'fi-FI',
    Greek: 'el-GR',
    Czech: 'cs-CZ',
    Romanian: 'ro-RO',
    Hungarian: 'hu-HU',
    Thai: 'th-TH',
    Vietnamese: 'vi-VN',
  };
  return languageCodes[language] || 'en-US';
}

export default {
  useSpeechRecognition,
  getLanguageCode,
};
