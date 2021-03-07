import * as Location from 'expo-location';
import { Linking, Alert } from 'react-native';

export const getLocationAsync = async () => {
    const { status } = await Location.requestPermissionsAsync();
    if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Highest,
        });
        return {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
        };
    }

    if (status !== 'granted') {
        Alert.alert(
            'নোটিশ',
            'এপ ব্যবহার করার জন্য অবশ্যই লোকেশান পারমিশন দিতে হবে',
            [{ text: 'OK', onPress: () => Linking.openSettings() }],
            { cancelable: false }
        );
    }

    return {
        latitude: '',
        longitude: '',
    };
};
