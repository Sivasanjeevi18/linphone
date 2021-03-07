import * as Segment from 'expo-analytics-segment';
import { segmentKey } from '../api/config';

Segment.initialize({ androidWriteKey: segmentKey, iosWriteKey: segmentKey });

const lowercaseObjectKeys = payload => {
    const data = Object.keys(payload).reduce(
        (c, item) => ((c[item.toLowerCase()] = payload[item]), c),
        {}
    );
    return data;
};

const setIdentity = user => {
    Segment.identifyWithTraits(user.id.toString(10), {
        phone: user.phone,
        name: user.name,
    });
};

const setScreen = payload => {
    Segment.screenWithProperties(
        payload.current_screen.toLocaleLowerCase(),
        lowercaseObjectKeys(payload)
    );
};

const trackDeliveredParcel = payload => {
    Segment.trackWithProperties('Parcel Delivered', lowercaseObjectKeys(payload));
};

const trackFailedParcel = payload => {
    Segment.trackWithProperties('Parcel Not Delivered', lowercaseObjectKeys(payload));
};

const trackPickupSuccess = payload => {
    Segment.trackWithProperties('Parcel picked up', lowercaseObjectKeys(payload));
};

const trackPickupFailed = payload => {
    Segment.trackWithProperties('Parcel picked failed', lowercaseObjectKeys(payload));
};

const logout = () => {
    Segment.trackWithProperties('Logout', {});
};

export default {
    setIdentity,
    logout,
    setScreen,
    trackDeliveredParcel,
    trackFailedParcel,
    trackPickupSuccess,
    trackPickupFailed,
};
