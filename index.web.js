import { AppRegistry } from 'react-native';
import App from './App';
import appManifest from './app.json';

const APP_NAME = (appManifest && appManifest.name) || 'SpeakEasy';

AppRegistry.registerComponent(APP_NAME, () => App);

AppRegistry.runApplication(APP_NAME, {
  rootTag: document.getElementById('root'),
});
