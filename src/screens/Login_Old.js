import React from 'react';
import * as Facebook from 'expo-facebook';
import { StyleSheet, Text, View, Image, Button, Alert } from 'react-native';

import fbConst from '../constants/Facebook';
import styleConst from '../constants/Style';

import Version from '../components/Version';

import * as userApi from '../api/User';
import * as dataStore from '../utils/Store';
import Segment from '../utils/Segment';

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginProgress: false,
            isLoggedIn: false,
            user: {},
        };
    }

    // facebook test user: shopup_cklobwv_user@tfbnw.net (104890293738485)
    // password: access123
    async login() {
        this.setState({ loginProgress: true });
        try {
            await Facebook.initializeAsync(fbConst.appId);
            const { type, token } = await Facebook.logInWithReadPermissionsAsync(fbConst.appId, {
                permissions: ['public_profile'],
            });

            if (type !== 'success') {
                return this.setState({ loginProgress: false });
            }

            await fetch(`https://graph.facebook.com/me?access_token=${token}`)
                .then((response) => response.json())
                .then(({ id }) => userApi.fetchUserProfile(id, token))
                .then((res) => {
                    if (!res.body) {
                        throw new Error('User not found');
                    }
                    const { user, token } = res.body;
                    this.setState({
                        user: Object.assign(this.state.user, {
                            id: user.id,
                            facebookId: user.fbId,
                            name: user.name,
                            accessToken: token,
                        }),
                    });
                    Segment.setIdentity(user);

                    return userApi.fetchAgentInfo(user.id, token);
                })
                .then((agent) => {
                    if (!agent || !agent.id) throw new Error('Only shopup agents can use this app');
                    this.setState({
                        user: Object.assign(this.state.user, {
                            agentId: agent.id,
                            agentType: agent.agentType,
                        }),
                    });
                    return dataStore.storeUserData(this.state.user);
                })
                .then(() => {
                    this.setState({ loginProgress: false });
                    this.props.navigation.navigate('Profile');
                })
                .catch((err) => {
                    console.log('> login:', err.message);
                    this.setState({ loginProgress: false });
                    Alert.alert('Alert', err.message);
                });
        } catch (error) {
            console.log('error', error);
            this.setState({ loginProgress: false });
            Alert.alert('Error: logInWithReadPermissionsAsync', 'Failed to login.');
        }
    }

    render() {
        return (
            <View style={styles.loginContainer}>
                <View style={styles.logoHolder}>
                    <Image
                        resizeMode={'cover'}
                        style={styles.logo}
                        source={require('../../assets/img/shopuplogo.png')}
                    />
                </View>
                <View style={styles.loginPanel}>
                    <Text style={styles.whyFbLogin}>
                        You are required to login with your facebook account to use this application
                    </Text>
                    <Button
                        onPress={() => this.login()}
                        title="Continue With Facebook"
                        color={styleConst.color.defaultButton}
                        disabled={this.state.loginProgress}
                    />
                </View>
                <Version />
            </View>
        );
    }
}

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
        fontSize: styleConst.font.size,
        fontFamily: styleConst.font.regular,
        paddingBottom: 8,
    },
});
