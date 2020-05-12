/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import bgMessaging from './BgMessage';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerHeadlessTask(
  'RNFirebaseBackgroundMessage',
  () => bgMessaging,
); // <-- Add this line
