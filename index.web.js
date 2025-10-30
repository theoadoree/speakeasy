import { AppRegistry } from 'react-native';
import App from './App';

console.log('📱 index.web.js executing');
console.log('📱 App import:', App);
console.log('📱 AppRegistry:', AppRegistry);

// Register the app
AppRegistry.registerComponent('SpeakEasy', () => App);

console.log('📱 Component registered');

// Run the application
const rootElement = document.getElementById('root');
console.log('📱 Root element:', rootElement);

AppRegistry.runApplication('SpeakEasy', {
  rootTag: rootElement,
});

console.log('📱 runApplication called');
