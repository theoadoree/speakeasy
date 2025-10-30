// Web shim for expo-speech-recognition using Web Speech API
let recognition = null;

if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
}

const SpeechRecognitionModule = {
  start: async (options = {}) => {
    if (!recognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    recognition.lang = options.lang || 'en-US';
    recognition.start();
  },

  stop: async () => {
    if (recognition) {
      recognition.stop();
    }
  },

  abort: async () => {
    if (recognition) {
      recognition.abort();
    }
  },

  addResultListener: (callback) => {
    if (recognition) {
      recognition.onresult = (event) => {
        const results = [];
        for (let i = 0; i < event.results.length; i++) {
          results.push({
            transcript: event.results[i][0].transcript,
            confidence: event.results[i][0].confidence,
            isFinal: event.results[i].isFinal,
          });
        }
        callback({ results });
      };
      return { remove: () => { recognition.onresult = null; } };
    }
    return { remove: () => {} };
  },

  addErrorListener: (callback) => {
    if (recognition) {
      recognition.onerror = (event) => {
        callback({ error: event.error });
      };
      return { remove: () => { recognition.onerror = null; } };
    }
    return { remove: () => {} };
  },
};

export default SpeechRecognitionModule;
