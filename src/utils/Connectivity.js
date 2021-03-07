import NetInfo from '@react-native-community/netinfo';

export const hasInternetConnection = async () => {
    return NetInfo.fetch()
        .then(state => {
            console.log('state.isConnected', state.isConnected);
            return state.isConnected;
        })
        .catch(err => {
            console.log(err);
        });
};
