//import Constants from 'expo-constants';

// const defaultEnv = 'DEVELOPMENT';
const defaultEnv = 'STAGING';
//let channel = Constants.manifest.releaseChannel;

//if (!channel) {
    ENV = defaultEnv;
//} else {
//    ENV = Constants.manifest.releaseChannel;
//    if (channel == 'default' || channel == 'production') {
//        ENV = 'production';
//    }
//}

export default ENV.toUpperCase(); // <---important

/* 
Usage:
import ENV from '../constants/ReleaseChannel';
console.log(ENV); // DEVELOPMENT/STAGING/PRODUCTION

Docs:
https://dev.to/jcoulaud/how-to-publish-an-expo-app-to-the-stores-with-release-channels-1e3n
https://docs.expo.io/versions/v36.0.0/distribution/release-channels
https://docs.expo.io/versions/latest/distribution/advanced-release-channels
*/
