/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import firebase from 'firebase/app';
import 'firebase/storage';
const firebaseConfig = {
    apiKey: 'AIzaSyDUp_3ECHXAZYPeeNF7j2qnh73VS82trso',
    projectId: 'cloneapp-572c5',
    storageBucket: 'cloneapp-572c5.appspot.com',
    appId: '1:479167510176:android:6af1798634a96562f8bbc5',
};

{
    firebase ? firebase.initializeApp(firebaseConfig)
        : null
}
AppRegistry.registerComponent(appName, () => App);
