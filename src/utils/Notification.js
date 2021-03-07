//import Constants from 'expo-constants';
import { Notifications } from 'expo';

import * as Permissions from 'expo-permissions';
import { Platform } from 'react-native';
import * as dataStore from '../../src/utils/Store';
import * as userApi from '../api/User';

const registerForPushNotificationsAsync = async (user) => {
    if (!user) {
        throw 'ERROR: registerForPushNotificationsAsync function requires valid user object';
    }

    let token;
    /*
    if (!Constants.isDevice) {
        alert('Must use physical device for Push Notifications. Emulators are not supported.');
        return;
    }
    */
    const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    console.log('> existingStatus', existingStatus);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification! Status:' + finalStatus);
        return;
    }

    console.log('> noti granted', finalStatus);
    try {
        token = await Notifications.getExpoPushTokenAsync();
        console.log('x-x: NotificationToken, I mean [deviceToken]', token);
    } catch (error) {
        console.log('> get noti tok error', error);
    }

    try {
        const res = await userApi.saveDeviceToken(user, token);
        console.log('> saveDeviceToken req successful', res);
    } catch (error) {
        console.log('> ERROR saveDeviceToken', error);
    }

    if (Platform.OS === 'android') {
        Notifications.createChannelAndroidAsync('default', {
            name: 'default',
            priority: 'max',
            sound: true,
            vibrate: true,
        });
    }

    return token;
};

const convertParcelToProp = (parcel) => {
    const isDoingDelivery = ['delivered', 'delivery-in-progress'].includes(parcel.status);
    const isReturning = 'return-in-progress' === parcel.status;
    const isExchangeReturning = 'exchange-returning' === parcel.status;
    return {
        parcelId: parcel.id,
        sourceHubId: parcel.sourceHubId,
        partnerId: parcel.partnerId,
        shopupNote: parcel.shopupNote,
        sellerInstruction: parcel.sellerInstruction,
        cash: parcel.cash,
        gatewayMedium: parcel.gatewayMedium,
        gatewayPaidAmount: parcel.gatewayPaidAmount,
        isDoingDelivery,
        isReturning,
        isExchangeReturning,
        enableParcelStatusChange: false,
        shop: {
            name: parcel.shopName,
            address: parcel.shopAddress,
            phone: parcel.parcelShopPhone || parcel.shopPhone,
        },
        customer: {
            name: parcel.customerName,
            address: parcel.deliveryAddress,
            phone: parcel.customerPhone,
        },
    };
};

export default {
    registerForPushNotificationsAsync,
    convertParcelToProp,
};

/* 
    Docs:
    Copy pasted from: https://docs.expo.io/push-notifications/overview/#example-usage
*/
