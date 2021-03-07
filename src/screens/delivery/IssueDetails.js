import React, { Fragment } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Button,
    Alert,
    Modal,
    ActivityIndicator,
    Linking,
} from 'react-native';
import CallButton from '../../components/Button';
import styleConst from '../../constants/Style';
import OTPInputView from '@twotalltotems/react-native-otp-input';
import { MaterialIcons } from '@expo/vector-icons';
import EmptyView from '../../components/EmptyView';
import Loader from '../../components/Loader';
import {
    getReasonCategoryWiseStatusAndAction,
    updateParcelStatusV2,
    sendReturnOtp,
    verifyReturnOtp,
} from '../../api/Parcel';
import Segment from '../../utils/Segment';
import { getLocationAsync } from '../../utils/Location';
import Call from '../../components/Call';

export default class IssueDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reasons: [],
            selectedReasonId: '',
            selectedReason: '',
            selectedCategory: '',
            statusUpdatePending: false,
            statusActions: {},
            loading: true,
            location: null,
            showReturnOTPModal: false,
            returnOTP: '',
            sendingOTP: false,
            isBusy: false,
            error: '',
            reasonOTPSending: undefined,
            otpOwner: '',
            otpTimer: 0,
            intervalID: undefined,
        };
    }

    async componentDidMount() {
        const { reasons } = this.props.navigation.state.params;

        const location = await this._getLocation();

        const statusActions = await this._getReasonCategoryWiseStatusAndAction();
        this.setState({ reasons, statusActions, loading: false, location });
    }

    componentWillUnmount() {
        clearInterval(this._startOtpimer);
    }

    static navigationOptions = () => {
        return {
            headerTitle: 'Issue Details',
        };
    };

    _getLocation = async () => {
        return await getLocationAsync();
    };

    _getReasonCategoryWiseStatusAndAction = async () => {
        const response = await getReasonCategoryWiseStatusAndAction();
        return response.statusActions;
    };

    _selectIssue = (id, reason) => {
        const {
            CATEGORY,
            SCOPE,
            IS_CUSTOMER_OTP,
            IS_MERCHANT_OTP,
            IS_SLACK_OTP,
        } = this.state.reasons.find((reason) => reason.REASON_ID === id);
        let otpOwner = '';
        if (IS_CUSTOMER_OTP) {
            otpOwner = 'customer';
        } else if (IS_MERCHANT_OTP) {
            otpOwner = 'merchant';
        } else if (IS_CUSTOMER_OTP === false && IS_MERCHANT_OTP === false) {
            otpOwner = 'deTeam';
        }
        this.setState({
            selectedReasonId: id,
            selectedCategory: CATEGORY,
            selectedReason: reason,
            reasonScope: SCOPE,
            reasonOTPSending: {
                IS_CUSTOMER_OTP,
                IS_MERCHANT_OTP,
                IS_SLACK_OTP,
            },
            otpOwner,
        });
    };

    _startOtpimer = () => {
        if (this.state.otpTimer > 0) {
            this.setState({ otpTimer: this.state.otpTimer - 1 });
        }
    };

    _sendOtp = async () => {
        this.setState({ sendingOTP: true });
        const { parcelId } = this.props.navigation.state.params;
        const { selectedReasonId } = this.state;
        await sendReturnOtp(parcelId, selectedReasonId);
        if (this.state.intervalID) {
            clearInterval(this.state.intervalID);
        }
        const _intervalId = setInterval(this._startOtpimer, 1000);
        this.setState({ sendingOTP: false, otpTimer: 30, intervalID: _intervalId });
    };

    _openReturnOTPModal = async () => {
        this.setState({ showReturnOTPModal: true });
        await this._sendOtp();
    };

    _closeReturnOTPModal = () => {
        clearInterval(this._startOtpimer);
        this.setState({ showReturnOTPModal: false, returnOTP: '', error: '', otpTimer: 30 });
    };

    _callMerchant = (merchantNumber) => {
        const number = /(\d){10}$/.exec(merchantNumber);
        Call.call(`880${number[0]}`);
    };

    _submitOTP = async () => {
        const { parcelId } = this.props.navigation.state.params;
        const { returnOTP, selectedReasonId } = this.state;
        this.setState({ isBusy: true });
        const res = await verifyReturnOtp({
            parcelId,
            otp: returnOTP,
            reasonId: selectedReasonId,
        });
        if (res.isVerified === false) {
            this.setState({ error: 'OTP is incorrect, please input valid OTP', isBusy: false });
            return;
        }
        this.setState({ showReturnOTPModal: false });
        await this._submitIssue(true);
    };

    _submitIssue = async (showAlert = false) => {
        this.setState({ statusUpdatePending: true });
        const {
            statusActions,
            selectedCategory,
            selectedReasonId,
            selectedReason,
            location,
        } = this.state;
        const { navigation } = this.props;
        const { parcelId, sourceHubId, partnerId, agentInfo } = navigation.state.params;
        const { STATUS, ACTION } = statusActions[selectedCategory];
        const payload = {
            status: STATUS,
            action: ACTION,
            latitude: `${location.latitude}`,
            longitude: `${location.longitude}`,
            sourceHubId,
            partnerId,
            reasonId: selectedReasonId,
        };

        const res = await updateParcelStatusV2(agentInfo.agentId, parcelId, payload);

        Segment.trackFailedParcel({
            status: STATUS,
            failureReason: selectedReason,
            reasonId: selectedReasonId,
            location: location,
            agent_id: agentInfo.agentId,
            user_id: agentInfo.id,
            agent_type: agentInfo.agentType,
        });
        this.setState({ statusUpdatePending: false });
        if (res.isError === false) {
            if (showAlert) {
                Alert.alert(
                    'Successful',
                    'পার্সেলটি সফল ভাবে রিটার্ন করা হয়েছে',
                    [{ text: 'OK', onPress: () => {} }],
                    {
                        cancelable: false,
                    }
                );
            }
            this.props.navigation.navigate('DeliveryArea');
        } else {
            Alert.alert('Error!', 'Staus update failed!');
        }
    };

    _confirmAlert = () => {
        const { otpOwner, reasonOTPSending } = this.state;
        const { merchantType, pickupType, otpEnabled } = this.props.navigation.state.params;

        let alertText;

        if (pickupType === 'mokam_unbranded') {
            alertText = `OK বাটনটি প্রেস করলে ${OTP_OWNER_MAP.admin} কাছে একটি SMS যাবে যেখানে থাকবে OTP ও পার্সেল রিটার্নের কারন। পরবর্তী পেজ এ  OTP ইনপুট করে রিটার্ন মার্ক করতে হবে। আপনি কি এগিয়ে যেতে চান ?`;
        } else if (pickupType === 'mokam_life_style') {
            alertText = `OK বাটনটি প্রেস করলে ${OTP_OWNER_MAP.merchant} কাছে একটি SMS যাবে যেখানে থাকবে OTP ও পার্সেল রিটার্নের কারন। পরবর্তী পেজ এ  OTP ইনপুট করে রিটার্ন মার্ক করতে হবে। আপনি কি এগিয়ে যেতে চান ?`;
        } else {
            alertText = `OK বাটনটি প্রেস করলে ${OTP_OWNER_MAP[otpOwner]} কাছে একটি SMS যাবে যেখানে থাকবে OTP ও পার্সেল রিটার্নের কারন। পরবর্তী পেজ এ  OTP ইনপুট করে রিটার্ন মার্ক করতে হবে। আপনি কি এগিয়ে যেতে চান ?`;
        }

        // if (merchantType && merchantType === 'document') {
        //     Alert.alert(
        //         'Are you sure?',
        //         '',
        //         [
        //             { text: 'Cancel', style: 'cancel' },
        //             { text: 'OK', onPress: () => this._submitIssue() },
        //         ],
        //         { cancelable: false }
        //     );
        //     return;
        // }

        if (otpEnabled) {
            if (['mokam_unbranded', 'mokam_life_style'].includes(pickupType)) {
                Alert.alert(
                    'Are you sure?',
                    alertText,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'OK', onPress: () => this._openReturnOTPModal() },
                    ],
                    { cancelable: false }
                );
                return;
            }

            if (
                reasonOTPSending.IS_CUSTOMER_OTP ||
                reasonOTPSending.IS_MERCHANT_OTP ||
                reasonOTPSending.IS_SLACK_OTP
            ) {
                Alert.alert(
                    'Are you sure?',
                    alertText,
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'OK', onPress: () => this._openReturnOTPModal() },
                    ],
                    { cancelable: false }
                );
            } else {
                Alert.alert(
                    'Are you sure?',
                    '',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'OK', onPress: () => this._submitIssue() },
                    ],
                    { cancelable: false }
                );
            }
        } else {
            Alert.alert(
                'Are you sure?',
                '',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'OK', onPress: () => this._submitIssue() },
                ],
                { cancelable: false }
            );
        }
    };

    render() {
        const {
            loading,
            reasons,
            selectedReasonId,
            selectedCategory,
            otpOwner,
            statusUpdatePending,
            showReturnOTPModal,
            sendingOTP,
            isBusy,
            error,
            returnOTP,
            reasonOTPSending,
        } = this.state;
        const { customer, shop, pickupType, adminNumber } = this.props.navigation.state.params;

        return (
            <View style={styles.mainContainer}>
                <Modal
                    visible={showReturnOTPModal}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => this._closeReturnOTPModal()}
                >
                    <View style={styles.overlay}>
                        {reasonOTPSending && (
                            <View style={styles.modal}>
                                <Text style={styles.modalTitle}>OTP Verificaton</Text>
                                <View style={styles.modalBody}>
                                    {['mokam_unbranded', 'mokam_life_style'].includes(
                                        pickupType
                                    ) ? (
                                        <Text style={styles.copy}>
                                            {`পার্সেলটি ${selectedCategory} মার্ক করতে ${
                                                pickupType === 'mokam_unbranded'
                                                    ? OTP_OWNER_MAP.admin
                                                    : OTP_OWNER_MAP.merchant
                                            } কাছে OTP সংগ্রহ করে নিচের ঘরে ইনপুট করুন।`}
                                        </Text>
                                    ) : (
                                        <Text style={styles.copy}>
                                            {`পার্সেলটি ${selectedCategory} মার্ক করতে ${OTP_OWNER_MAP[otpOwner]} কাছে OTP সংগ্রহ করে নিচের ঘরে ইনপুট করুন।`}
                                        </Text>
                                    )}
                                    {['mokam_unbranded', 'mokam_life_style'].includes(
                                        pickupType
                                    ) === false && (
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                color: 'rgba(0, 0, 0, 0.85)',
                                                marginTop: 5,
                                            }}
                                        >
                                            (বিদ্রো: OTP নিয়ে কোনো সমস্যার সম্মুখীন হলে DE টীম অথবা
                                            হাবে যোগাযোগ করুন।)
                                        </Text>
                                    )}

                                    {sendingOTP ? (
                                        <ActivityIndicator color="#000" />
                                    ) : (
                                        <>
                                            <OTPInputView
                                                style={styles.otpInputContainer}
                                                pinCount={4}
                                                autoFocusOnLoad={false}
                                                codeInputFieldStyle={styles.underlineStyleBase}
                                                codeInputHighlightStyle={
                                                    styles.underlineStyleHighLighted
                                                }
                                                onCodeChanged={(code) =>
                                                    this.setState({ returnOTP: code })
                                                }
                                            />
                                            {error.length > 0 && (
                                                <Text style={styles.error}>{error}</Text>
                                            )}
                                        </>
                                    )}
                                    <View style={[styles.resendLink]}>
                                        <TouchableOpacity
                                            onPress={this._sendOtp}
                                            disabled={this.state.otpTimer > 0}
                                        >
                                            {pickupType === 'mokam_unbranded' && (
                                                <Text
                                                    style={
                                                        this.state.otpTimer === 0
                                                            ? styles.resendLinkActive
                                                            : {}
                                                    }
                                                >{`${RESEND_OTP_OWNER_MAP.admin} আবার কোড পাঠান`}</Text>
                                            )}
                                            {pickupType === 'mokam_life_style' && (
                                                <Text
                                                    style={
                                                        this.state.otpTimer === 0
                                                            ? styles.resendLinkActive
                                                            : {}
                                                    }
                                                >{`${RESEND_OTP_OWNER_MAP.merchant} আবার কোড পাঠান`}</Text>
                                            )}
                                            {['mokam_unbranded', 'mokam_life_style'].includes(
                                                pickupType
                                            ) === false && (
                                                <Text
                                                    style={
                                                        this.state.otpTimer === 0
                                                            ? styles.resendLinkActive
                                                            : {}
                                                    }
                                                >{`${RESEND_OTP_OWNER_MAP[otpOwner]} আবার কোড পাঠান`}</Text>
                                            )}
                                        </TouchableOpacity>
                                        {this.state.otpTimer > 0 && (
                                            <Text
                                                style={[
                                                    { marginLeft: 10 },
                                                    styles.resendLinkActive,
                                                ]}
                                            >{`${this.state.otpTimer}s পর`}</Text>
                                        )}
                                    </View>

                                    {isBusy && <ActivityIndicator color="#000" />}

                                    {['mokam_unbranded', 'mokam_life_style'].includes(
                                        pickupType
                                    ) && (
                                        <View>
                                            {pickupType === 'mokam_unbranded' && (
                                                <CallButton
                                                    style={styles.actionBtnx}
                                                    title="Call Admin"
                                                    iconName="call"
                                                    size="small"
                                                    onPress={() => Call.call(adminNumber)}
                                                />
                                            )}
                                            {pickupType === 'mokam_life_style' && (
                                                <CallButton
                                                    style={styles.actionBtnx}
                                                    title="Call Merchant"
                                                    iconName="call"
                                                    size="small"
                                                    onPress={() => Call.call(shop.phone)}
                                                />
                                            )}
                                        </View>
                                    )}
                                </View>
                                {['mokam_unbranded', 'mokam_life_style'].includes(pickupType) ===
                                    false && (
                                    <View>
                                        {reasonOTPSending.IS_CUSTOMER_OTP && (
                                            <CallButton
                                                style={styles.actionBtnx}
                                                title="Call Customer"
                                                iconName="call"
                                                size="small"
                                                onPress={() => Call.call(customer.phone)}
                                            />
                                        )}

                                        {reasonOTPSending.IS_MERCHANT_OTP && (
                                            <CallButton
                                                style={styles.actionBtnx}
                                                title="Call Merchant"
                                                iconName="call"
                                                size="small"
                                                onPress={() => this._callMerchant(shop.phone)}
                                            />
                                        )}
                                        {reasonOTPSending.IS_CUSTOMER_OTP === false &&
                                            reasonOTPSending.IS_MERCHANT_OTP === false && (
                                                <CallButton
                                                    style={styles.actionBtnx}
                                                    title="Call DE Team"
                                                    iconName="call"
                                                    size="small"
                                                    onPress={() =>
                                                        Linking.openURL('tel://' + '09610-066526')
                                                    }
                                                />
                                            )}
                                        {(reasonOTPSending.IS_CUSTOMER_OTP ||
                                            reasonOTPSending.IS_MERCHANT_OTP) &&
                                            reasonOTPSending.IS_SLACK_OTP === true && (
                                                <View style={styles.footerTextWrapper}>
                                                    <TouchableOpacity
                                                        onPress={() =>
                                                            Linking.openURL(
                                                                'tel://' + '09610-066526'
                                                            )
                                                        }
                                                    >
                                                        <Text style={styles.info}>
                                                            সমস্যা হচ্ছে ? DE টিম কে কল করুন।
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                    </View>
                                )}
                                <Button
                                    disabled={returnOTP.length !== 4 || isBusy}
                                    title="CONFIRM"
                                    color="#00A1B3"
                                    onPress={() => this._submitOTP()}
                                />
                            </View>
                        )}
                    </View>
                </Modal>
                {loading ? (
                    <Loader />
                ) : reasons && reasons.length > 0 ? (
                    <>
                        <ScrollView style={styles.checkboxContainer}>
                            {reasons.map((reason) => (
                                <Checkbox
                                    key={reason.REASON_ID}
                                    onPress={() =>
                                        this._selectIssue(reason.REASON_ID, reason.REASON_BN)
                                    }
                                    title={reason.REASON_BN}
                                    subTitle={reason.CATEGORY}
                                    isChecked={selectedReasonId === reason.REASON_ID}
                                />
                            ))}
                        </ScrollView>
                        <View style={styles.btn}>
                            <Button
                                title="Confirm"
                                color="#00A1B3"
                                onPress={() => this._confirmAlert()}
                                disabled={!selectedReasonId || statusUpdatePending}
                            />
                        </View>
                    </>
                ) : (
                    <EmptyView illustration="delivery" message="No reasons" />
                )}
            </View>
        );
    }
}

const Checkbox = ({ onPress, isChecked, title, subTitle }) => (
    <TouchableOpacity onPress={onPress}>
        <View style={styles.option}>
            <CheckboxIcon isChecked={isChecked} />
            <Text style={styles.optionLabel}>{`${title} (${subTitle})`}</Text>
        </View>
    </TouchableOpacity>
);

const CheckboxIcon = ({ isChecked }) => (
    <MaterialIcons
        name={isChecked ? 'radio-button-checked' : 'radio-button-unchecked'}
        size={24}
        color="#000"
    />
);

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#fff',
        flex: 1,
    },
    checkboxContainer: {
        marginTop: 15,
    },
    option: {
        marginTop: 10,
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: 20,
    },
    optionLabel: {
        flex: 1,
        paddingLeft: 10,
        paddingTop: 1,
        fontSize: 18,
        color: '#000',
        fontFamily: styleConst.font.regular,
        fontWeight: styleConst.font.weight,
    },
    btn: {
        height: 34,
        marginTop: 16,
    },
    modal: {
        width: '90%',
        // minHeight: 320,
        height: '95%',
        backgroundColor: '#FFF',
        borderRadius: 3,
        paddingLeft: 20,
        paddingRight: 20,
        paddingVertical: 10,
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
        paddingBottom: 5,
        fontSize: styleConst.font.heading1,
        fontFamily: styleConst.font.regular,
        borderBottomWidth: 1,
        borderBottomColor: styleConst.color.highlightedText,
    },
    copy: {
        fontFamily: styleConst.font.regular,
        fontSize: 16,
        color: '#000',
    },
    modalBody: {
        marginTop: 10,
        // alignItems: 'center',
        flexGrow: 1,
    },
    otpInputContainer: {
        width: '80%',
        height: 50,
    },
    resendLink: {
        display: 'flex',
        marginTop: 20,
        flexDirection: 'row',
    },
    resendLinkActive: {
        color: '#00828e',
    },
    actionBtnx: {
        marginTop: 20,
    },
    footerTextWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
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
    error: {
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.small,
        fontWeight: 'bold',
        marginVertical: 5,
        color: 'red',
    },
    info: {
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.size,
        fontWeight: 'bold',
        marginVertical: 5,
        color: styleConst.color.highlightedText,
    },
});

const OTP_OWNER_MAP = {
    customer: 'কাস্টমারের',
    merchant: 'মার্চেন্টের',
    deTeam: 'DE টীমের',
    admin: 'অ্যাডমিনের',
};

const RESEND_OTP_OWNER_MAP = {
    customer: 'কাস্টমারকে',
    merchant: 'মার্চেন্টকে',
    deTeam: 'DE টিমকে',
    admin: 'অ্যাডমিনকে',
};
