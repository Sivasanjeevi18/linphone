//import Constants from 'expo-constants';
import ENV from '../constants/ReleaseChannel';

let localUri;
let localSapUri;
let segmentKey;

/* 
NOTE:
If you need to change the API, change 'defaultEnv' in:
src/constants/ReleaseChannel.js
*/

if (ENV === 'DEVELOPMENT') {
    //localUri = `http://${Constants.manifest.debuggerHost.split(':').shift()}:3000`;
    //localSapUri = `http://${Constants.manifest.debuggerHost.split(':').shift()}:1337`;
    segmentKey = '7Sr21VOpi3p7Kwt0ff23qEhEh8wxJNMs';
} else if (ENV === 'STAGING') {
    localUri = 'https://shopups1.xyz';
    localSapUri = 'https://sap.shopups1.xyz';
    segmentKey = '7Sr21VOpi3p7Kwt0ff23qEhEh8wxJNMs';
} else if (ENV === 'PRODUCTION') {
    localUri = 'https://shopup.com.bd';
    localSapUri = 'https://sap.shopup.com.bd';
    segmentKey = 'IsP13QuiFrYWQYrebX2WrI682q4BijSi';
}

export { localUri, localSapUri, segmentKey };
