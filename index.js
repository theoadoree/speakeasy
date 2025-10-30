import { AppRegistry, Platform } from 'react-native';
import App from './App';
import appManifest from './app.json';

const APP_NAME = (appManifest && appManifest.name) || 'SpeakEasy';

AppRegistry.registerComponent(APP_NAME, () => App);

if (Platform.OS === 'web') {
  const rootTag =
    (typeof document !== 'undefined' && document.getElementById('root')) ||
    (typeof document !== 'undefined' && document.getElementById('main'));

  if (!rootTag) {
    console.error('❌ Root element not found for web render');
  } else {
    AppRegistry.runApplication(APP_NAME, {
      rootTag,
      initialProps: {},
    });
  }
}
