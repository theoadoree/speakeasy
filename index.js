import { registerRootComponent } from 'expo';
import { AppRegistry, Platform } from 'react-native';
import App from './App';

console.log('📱 Entry point loaded');
console.log('📱 Platform.OS:', Platform.OS);

if (Platform.OS === 'web') {
  // For web, manually mount using AppRegistry
  AppRegistry.registerComponent('SpeakEasy', () => App);

  if (typeof document !== 'undefined') {
    const rootTag = document.getElementById('root');
    console.log('📱 Root element found:', !!rootTag);

    if (rootTag) {
      AppRegistry.runApplication('SpeakEasy', {
        rootTag,
        initialProps: {},
      });
      console.log('📱 App mounted to DOM');
    } else {
      console.error('❌ Root element not found!');
    }
  }
} else {
  // For native, use registerRootComponent
  registerRootComponent(App);
}
