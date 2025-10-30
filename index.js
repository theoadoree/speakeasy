import { AppRegistry, Platform } from 'react-native';
import { registerRootComponent } from 'expo';
import App from './App';

// Register component for all platforms
AppRegistry.registerComponent('main', () => App);

if (Platform.OS === 'web') {
  // For web, wait for DOM to be ready before mounting
  const mountApp = () => {
    const rootTag = document.getElementById('root');
    if (rootTag) {
      console.log('✅ Mounting app to DOM');
      AppRegistry.runApplication('main', {
        rootTag,
        initialProps: {},
      });
    } else {
      console.error('❌ Root element not found');
    }
  };

  // If DOM is already ready, mount immediately
  if (document.readyState === 'loading') {
    // DOM not ready yet, wait for it
    document.addEventListener('DOMContentLoaded', mountApp);
  } else {
    // DOM is ready, mount now
    mountApp();
  }
} else {
  // For iOS/Android, use Expo's registration
  registerRootComponent(App);
}
