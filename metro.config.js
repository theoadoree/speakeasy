// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ensure react-native is properly resolved for web
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    // Force react-native to resolve to react-native-web on web platform
    if (platform === 'web' && moduleName === 'react-native') {
      return {
        type: 'sourceFile',
        filePath: require.resolve('react-native-web'),
      };
    }
    // Default resolution
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
