import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    Button,
    ActivityIndicator,
    TouchableOpacity,
    Linking,
} from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import styleConst from '../constants/Style';
import CallButton from '../components/Button';

export const ReturnModal = ({
    isVisible,
    isBusy,
    sendingOTP,
    shopId,
    shopStoreId,
    shopPhone,
    callMerchant,
    closeModal,
    sendOtp,
    error,
    submitOTP,
    parcelCount,
    otpTimer,
    returnOtpNumber,
}) => {
    const [otp, setOtp] = useState('');
    return (
        <Modal
            visible={isVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => closeModal()}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.modalTitle}>OTP Verificaton</Text>
                    <View style={styles.modalBody}>
                        <Text
                            style={styles.copy}
                        >{`An OTP was sent to merchant on phone:${returnOtpNumber?.slice?.(-11)} please enter to successfully return ${parcelCount} parcel${
                            parcelCount > 1 ? 's' : ''
                        }`}</Text>

                        {sendingOTP ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <OTPInputView
                                    style={styles.otpInputContainer}
                                    pinCount={4}
                                    autoFocusOnLoad={false}
                                    codeInputFieldStyle={styles.underlineStyleBase}
                                    codeInputHighlightStyle={styles.underlineStyleHighLighted}
                                    onCodeChanged={(code) => setOtp(code)}
                                />
                                {error.length > 0 && <Text style={styles.error}>{error}</Text>}
                                <View style={styles.resendLink}>
                                    <TouchableOpacity
                                        onPress={() => sendOtp()}
                                        disabled={otpTimer > 0}
                                    >
                                        <Text
                                            style={[
                                                styles.info,
                                                otpTimer > 0
                                                    ? { color: styleConst.color.defaultText }
                                                    : styles.resendLinkActive,
                                            ]}
                                        >
                                            Resend OTP
                                        </Text>
                                    </TouchableOpacity>
                                    {otpTimer > 0 && (
                                        <Text
                                            style={[styles.resendLinkActive, { marginLeft: 10 }]}
                                        >{`${otpTimer}s`}</Text>
                                    )}
                                </View>
                            </>
                        )}
                        {isBusy && <ActivityIndicator color="#000" />}
                    </View>
                    <CallButton
                        style={styles.actionBtnx}
                        title="Call Merchant"
                        iconName="call"
                        size="small"
                        onPress={() => callMerchant(shopPhone)}
                    />
                    <View style={styles.footerTextWrapper}>
                        <TouchableOpacity
                            onPress={() => Linking.openURL('tel://' + '09610-066526')}
                        >
                            <Text style={styles.info}>সমস্যা হচ্ছে ? DE টিম কে কল করুন।</Text>
                        </TouchableOpacity>
                    </View>
                    <Button
                        disabled={otp.length !== 4 || isBusy}
                        title="CONFIRM"
                        color="#00A1B3"
                        onPress={() => submitOTP({ shopId, otp, shopStoreId })}
                    />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modal: {
        width: '90%',
        // minHeight: 320,
        height: '90%',
        backgroundColor: '#FFF',
        borderRadius: 3,
        paddingLeft: 20,
        paddingRight: 20,
        paddingVertical: 15,
        alignSelf: 'center',
        // justifyContent: 'space-between',
    },
    overlay: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modalBtnWrapper: {
        paddingBottom: 25,
    },
    modalTitle: {
        paddingBottom: 10,
        fontSize: styleConst.font.heading1,
        fontFamily: styleConst.font.regular,
        borderBottomWidth: 1,
        borderBottomColor: styleConst.color.highlightedText,
    },
    modalBody: {
        marginTop: 20,
        alignItems: 'center',
        flexGrow: 1,
    },
    copy: {
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.size,
        color: '#000',
    },
    error: {
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.small,
        fontWeight: 'bold',
        marginVertical: 5,
        color: 'red',
    },
    info: {
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.small,
        fontWeight: 'bold',
        marginVertical: 5,
        color: styleConst.color.highlightedText,
    },
    otpInputContainer: {
        width: '80%',
        height: 60,
    },
    underlineStyleBase: {
        width: 46,
        height: 55,
        borderWidth: 0,
        borderBottomWidth: 1,
        borderColor: '#000',
        fontSize: styleConst.font.title,
        color: '#000',
        fontWeight: 'bold',
    },
    underlineStyleHighLighted: {
        borderColor: styleConst.color.secondaryBackground,
        color: '#000',
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.title,
        fontWeight: 'bold',
    },
    actionBtnx: {
        marginBottom: 10,
    },
    footerTextWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    resendLink: {
        display: 'flex',
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    resendLinkActive: {
        color: styleConst.color.highlightedText,
    },
});
