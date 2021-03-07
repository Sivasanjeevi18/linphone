/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
const LinphoneHeadlessTask = async () => {
};

AppRegistry.registerHeadlessTask('Linphone', () => LinphoneHeadlessTask);
AppRegistry.registerComponent(appName, () => App);
