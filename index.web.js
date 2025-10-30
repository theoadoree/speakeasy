import { AppRegistry, Platform } from 'react-native';
import App from './App';

console.log('📱 index.web.js executing');
console.log('📱 Platform:', Platform);
console.log('📱 Platform.OS:', Platform.OS);
console.log('📱 App import:', App);
console.log('📱 AppRegistry:', AppRegistry);

// Ensure Platform is globally available to prevent reference errors
if (typeof window !== 'undefined' && !window.Platform) {
  window.Platform = Platform;
}

// Register the app
AppRegistry.registerComponent('SpeakEasy', () => App);

console.log('📱 Component registered');

// Run the application after DOM is ready
const mountApp = () => {
  const rootElement = document.getElementById('root');
  console.log('📱 Root element:', rootElement);

  if (rootElement) {
    AppRegistry.runApplication('SpeakEasy', {
      rootTag: rootElement,
    });
    console.log('📱 runApplication called successfully');
  } else {
    console.error('❌ Root element not found!');
  }
};

// Ensure DOM is ready before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mountApp);
} else {
  mountApp();
}
