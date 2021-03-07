import React, { useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import styleConst from '../constants/Style';
import Version from '../components/Version';
import * as dataStore from '../utils/Store';

const InitialLoggedInScreen = ({ navigation }) => {
    useEffect(() => {
        console.log('useEffect in common profile screen');
        const _navigateToAgentProfile = async () => {
            const agent = await dataStore.getLoggedInUser().then(JSON.parse);
            console.log('> agent #############', agent);
            if (agent.agentType === 'pickup') {
                navigation.navigate('PickupProfile');
            } else {
                navigation.navigate('DeliveryProfile');
            }
        };
        _navigateToAgentProfile();
    }, []);
    return (
        <View style={styles.loginContainer}>
            <View style={styles.logoHolder}>
                <Image
                    resizeMode={'cover'}
                    style={styles.logo}
                    source={require('../../assets/img/shopuplogo.png')}
                />
            </View>
            <Version />
        </View>
    );
};

const styles = StyleSheet.create({
    loginContainer: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: styleConst.color.secondaryBackground,
    },
    logoHolder: {
        width: '100%',
        alignItems: 'center',
        paddingBottom: 20,
    },
    logo: {
        width: 180,
        height: 30,
    },
    loginPanel: {
        width: '80%',
    },
    whyFbLogin: {
        color: '#FFF',
        textAlign: 'center',
        fontSize: styleConst.font.heading1,
        fontFamily: styleConst.font.regular,
        fontWeight: 'bold',
        paddingBottom: 8,
    },
    textInputStyle: {
        backgroundColor: '#fff',
        height: 40,
        paddingHorizontal: 10,
        marginBottom: 5,
    },
    textInputStyleError: {
        borderWidth: 1,
        borderColor: '#FF9494',
    },
    phoneNumberError: {
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.small,
        fontWeight: 'bold',
        color: '#FF9494',
    },
});

export default InitialLoggedInScreen;
