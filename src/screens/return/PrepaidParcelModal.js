import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    StyleSheet,
    Button,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import * as parcelApi from '../../api/Parcel';
import styleConst from '../../constants/Style';

const PrepaidParcelModal = ({
    isPrepaidModalOpen,
    hidePrepaidModal,
    parcelId,
    startUpdateParcelStatus,
}) => {
    const [OTP, setOTP] = useState('');
    const [error, setError] = useState('');
    const [isLaoding, setLoading] = useState(false);
    const [isBusy, setBusy] = useState(false);
    const [isDeliveryOtpVerified, setDeliveryOtpVerified] = useState(false);
    // const [sendOtpAgain, setSendOtpAgain] = useState(false);

    const sendOtp = async () => {
        setLoading(true);
        // setSendOtpAgain(false);
        setError('');

        const res = await parcelApi.sendDliveryOtp(parcelId);
        setLoading(false);
        if (res.isError) {
            setError('Could not send otp');
            // setSendOtpAgain(true);
        }
    };

    const _onCodeFilled = async (code) => {
        setBusy(true);
        setError('');
        const data = {
            parcelId: parcelId,
            otp: code,
        };
        const res = await parcelApi.verifyDeliveryOtp(data);
        setBusy(false);

        if (res.isVerified) {
            setDeliveryOtpVerified(true);
        } else {
            // setSendOtpAgain(true);
            setError('Either Invaild OTP or OTP is expired');
            setDeliveryOtpVerified(false);
        }
    };

    useEffect(() => {
        if (isPrepaidModalOpen) {
            sendOtp();
        }
    }, [isPrepaidModalOpen]);

    return (
        <Modal
            visible={isPrepaidModalOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={() => hidePrepaidModal()}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.modalTitle}>OTP Verificaton</Text>
                    <View style={styles.modalBody}>
                        <Text style={styles.copy}>
                            কাস্টমারের ফোনে একটি ওটিপি পাঠানো হয়েছে। এই পার্সেলটি ডেলিভার্ড মার্ক
                            করার জন্যে, ওটিপি কোড টি কাস্টমারের থেকে চেয়ে নিয়ে নিচের বক্সে ফিলাপ
                            করুন ও কন্ফার্ম বাটন টি প্রেস করুন।
                        </Text>

                        {isLaoding ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <OTPInputView
                                    style={styles.otpInputContainer}
                                    pinCount={4}
                                    autoFocusOnLoad
                                    codeInputFieldStyle={styles.underlineStyleBase}
                                    codeInputHighlightStyle={styles.underlineStyleHighLighted}
                                    onCodeFilled={_onCodeFilled}
                                />
                                <TouchableOpacity onPress={() => sendOtp()}>
                                    <Text style={styles.info}>নতুন পিনকোড পাঠান</Text>
                                </TouchableOpacity>
                            </>
                        )}
                        {isBusy && <ActivityIndicator color="#000" />}
                        {error.length > 0 && <Text style={styles.error}>{error}</Text>}
                    </View>
                    <Button
                        disabled={!isDeliveryOtpVerified}
                        title="CONTINUE"
                        color="#00A1B3"
                        onPress={() => startUpdateParcelStatus()}
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
        height: 100,
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
});

export default PrepaidParcelModal;
