import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, ActivityIndicator, Button } from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import * as userApi from '../api/User';
import * as dataStore from '../utils/Store';
import Segment from '../utils/Segment';
import Notification from '../../src/utils/Notification';
import styleConst from '../constants/Style';

const Otp = (props) => {
    const [loader, setLoader] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const { phone } = props.navigation.state.params;

    const verifyOTPCode = async (code) => {
        setLoader(true);
        try {
            const res = await userApi.loginWithCode(code, phone);

            if (!res.error) {
                const { user, accessToken } = res.body;
                const agent = await userApi.fetchAgentInfo(user.ID, accessToken);
                console.log('agent info', agent);
                Notification.registerForPushNotificationsAsync({
                    id: user.ID,
                    accessToken,
                });
                console.log('x-x:registerForPushNotificationsAsync done');

                if (agent.id !== undefined) {
                    if (agent.agentType === 'pickup' || agent.agentType === 'delivery') {
                        setLoader(false);
                        dataStore.storeUserData({
                            id: user.ID,
                            accessToken: accessToken,
                            name: agent.name,
                            agentId: agent.id,
                            agentType: agent.agentType,
                            agentHubId: agent.hubId,
                            agentHubName: agent.hubName,
                        });
                        Segment.setIdentity({
                            id: user.ID,
                            accessToken: accessToken,
                            name: agent.name,
                            agentId: agent.id,
                            agentType: agent.agentType,
                        });
                        if (agent.agentType === 'pickup') {
                            props.navigation.navigate('PickupProfile');
                        } else {
                            props.navigation.navigate('DeliveryProfile');
                        }
                    } else {
                        setLoader(false);
                        Alert.alert('সতর্কীকরণ!', 'আপনার অ্যাপ ব্যবহার করার অনুমতি নেই');
                    }
                }
            } else {
                setLoader(false);
                Alert.alert('Erorr!', res.body.message);
            }
        } catch (error) {
            setLoader(false);
            Alert.alert('Erorr!', 'Login failed');
            console.log('Otp -> onCodeFilled', error);
        }
    };

    return (
        <View style={styles.conatiner}>
            <Text style={styles.otpText}>পিন কোড দিন</Text>
            <OTPInputView
                style={styles.otpInputContainer}
                pinCount={4}
                autoFocusOnLoad
                code={otpCode}
                onCodeChanged={(c) => setOtpCode(c)}
                codeInputFieldStyle={styles.underlineStyleBase}
                codeInputHighlightStyle={styles.underlineStyleHighLighted}
                // onCodeFilled={onCodeFilled}
            />
            {loader && <ActivityIndicator style={{ marginBottom: 25 }} color="#000" />}
            <View style={styles.btnContainer}>
                <Button
                    onPress={() => verifyOTPCode(otpCode)}
                    title="NEXT"
                    color={styleConst.color.defaultButton}
                    disabled={loader}
                />
            </View>
            {/* <Text style={styles.askNewOtpText}>নতুন পিন কোড চান</Text> */}
        </View>
    );
};

const styles = StyleSheet.create({
    conatiner: {
        flex: 1,
        alignItems: 'center',
        marginTop: 40,
    },
    otpInputContainer: {
        width: '50%',
        height: 200,
    },
    btnContainer: {
        width: '80%',
    },
    underlineStyleBase: {
        width: 46,
        height: 55,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderColor: '#000',
        color: '#000',
        fontSize: 28,
        fontWeight: 'bold',
    },
    underlineStyleHighLighted: {
        borderColor: '#00ABC0',
        color: '#000',
        fontSize: 28,
        fontWeight: 'bold',
    },
    otpText: {
        fontSize: 18,
    },
    askNewOtpText: {
        fontSize: 16,
        color: '#00ABC0',
    },
});

export default Otp;
