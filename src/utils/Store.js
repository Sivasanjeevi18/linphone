import { AsyncStorage } from "react-native";

const USER_DATA_KEY = '__@slud';

export const getLoggedInUser = () => AsyncStorage.getItem(USER_DATA_KEY);

export const storeUserData = (data) => {
    data = typeof data === 'object' ? JSON.stringify(data) : data;
    return AsyncStorage.setItem(USER_DATA_KEY, data);
}

export const removeUserData = () => AsyncStorage.removeItem(USER_DATA_KEY);