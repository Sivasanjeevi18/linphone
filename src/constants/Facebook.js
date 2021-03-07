import ENV from '../constants/ReleaseChannel';

let FACEBOOK_APP_ID;

if (ENV === 'DEVELOPMENT') {
    FACEBOOK_APP_ID = '905184219664113'; // waliur's app
} else if (ENV === 'STAGING') {
    FACEBOOK_APP_ID = '1764431553806419';
} else if (ENV === 'PRODUCTION') {
    FACEBOOK_APP_ID = '1549384541977789';
}

export default {
    appId: FACEBOOK_APP_ID,
};
