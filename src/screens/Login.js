import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Button,
    Alert,
    TextInput,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
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
            phoneNumber: '',
            phoneNumberError: null,
        };
    }

    _onChangeText = (phoneNumber) => {
        this.setState({ phoneNumber: phoneNumber.trim(), phoneNumberError: null });
    };

    onNext = async () => {
        this.setState({ loginProgress: true });
        const { phoneNumber } = this.state;
        const pattern = /^(\+880|880|0)?1(1|[3-9])[0-9]{8}$/;

        if (pattern.test(phoneNumber)) {
            let formattedPhoneNumber = '';
            if (phoneNumber.startsWith('+880')) {
                formattedPhoneNumber = phoneNumber.replace('+880', '');
            } else if (phoneNumber.startsWith('880')) {
                formattedPhoneNumber = phoneNumber.replace('880', '');
            } else if (phoneNumber.charAt(0) === '0') {
                formattedPhoneNumber = phoneNumber.substr(1, phoneNumber.length);
            } else {
                formattedPhoneNumber = phoneNumber;
            }

            const res = await userApi.doesPhoneExist(`880${formattedPhoneNumber}`);

            if (res.error) {
                await userApi.getLoginCode({
                    countryCode: 'BD',
                    callingCode: '+880',
                    phoneNumber: formattedPhoneNumber,
                });
                this.setState({ loginProgress: false });
                this.props.navigation.navigate('OTP', { phone: `0${formattedPhoneNumber}` });
            } else {
                this.setState({
                    loginProgress: false,
                    phoneNumberError: 'এই নাম্বারে কোন একাউন্ট নেই',
                });
            }
        } else {
            this.setState({ loginProgress: false, phoneNumberError: 'নাম্বারটি প্রযোজ্য নয়' });
        }
    };

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
                    <Text style={styles.whyFbLogin}>আপনার মোবাইল নাম্বার দিয়ে এপ এ লগইন করুন।</Text>
                    <View style={{ height: 60, marginBottom: 10 }}>
                        <TextInput
                            style={[
                                styles.textInputStyle,
                                this.state.phoneNumberError !== null && styles.textInputStyleError,
                            ]}
                            placeholder="01XXXXXXXXXXX"
                            onChangeText={this._onChangeText}
                            onSubmitEditing={this.onNext}
                            keyboardType="phone-pad"
                            editable={!this.state.loginProgress}
                        />
                        {this.state.phoneNumberError !== null && (
                            <Text style={styles.phoneNumberError}>
                                {this.state.phoneNumberError}
                            </Text>
                        )}
                        {this.state.loginProgress && <ActivityIndicator color="#fff" />}
                    </View>
                    <Button
                        onPress={this.onNext}
                        title="NEXT"
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
