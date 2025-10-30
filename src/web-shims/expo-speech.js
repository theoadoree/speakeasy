// Web shim for expo-speech using Web Speech API
const Speech = {
  speak: (text, options = {}) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language || 'en-US';
      utterance.rate = options.rate || 1.0;
      utterance.pitch = options.pitch || 1.0;

      if (options.onDone) {
        utterance.onend = options.onDone;
      }
      if (options.onError) {
        utterance.onerror = options.onError;
      }

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech synthesis not supported in this browser');
      if (options.onError) {
        options.onError(new Error('Speech synthesis not supported'));
      }
    }
  },

  stop: () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  },

  isSpeakingAsync: async () => {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.speaking;
    }
    return false;
  },
};

export default Speech;
