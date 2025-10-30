// Web shim for expo-apple-authentication
const AppleAuthentication = {
  isAvailableAsync: async () => false,

  signInAsync: async () => {
    throw new Error('Apple Sign In not available on web');
  },
};

export default AppleAuthentication;
export const AppleAuthenticationButton = () => null;
export const AppleAuthenticationScope = {
  FULL_NAME: 0,
  EMAIL: 1,
};
