// Web shim for expo-crypto using Web Crypto API
const Crypto = {
  randomUUID: () => {
    if (crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    // Fallback for browsers without randomUUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  getRandomBytes: (byteCount) => {
    const buffer = new Uint8Array(byteCount);
    crypto.getRandomValues(buffer);
    return Array.from(buffer);
  },

  digestStringAsync: async (algorithm, data) => {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest(algorithm.toUpperCase(), dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
};

export default Crypto;
