import React from 'react';
import {
    View,
    Text,
    Image,
    Button,
    Alert,
    ScrollView,
    Picker,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import * as dataStore from '../../utils/Store';
import * as parcelApi from '../../api/Parcel';
import decodeTrackingId from '../../utils/decodeTrackingId';
import ParcelStatus from '../../constants/ParcelStatus';
import Segment from '../../utils/Segment';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import { getLocationAsync } from '../../utils/Location';
import PrepaidParcelModal from './PrepaidParcelModal';
import Noti from '../../utils/Notification';
import Notification from '../../../src/utils/Notification';
import styles from './Parcel.styles';

/* https://docs.expo.io/versions/v36.0.0/sdk/notifications/ */
import { Notifications } from 'expo';
import Call from '../../components/Call';
import { logCall } from '../../utils/CallLog';
import ParcelCatMarker from '../../components/ParcelCatMarker';
import DeliveryReceiverInput from '../../components/DeliveryReceiverInput/DeliveryReceiverInput';

export default class Parcel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            deliveredReqInProgress: false,
            location: null,
            paymentType: 'cash-on-delivery',
            bkashVerified: false,
            bkashVerifiedAmount: '',
            bkashVerificationFailed: false,
            trxValidationError: false,
            trxValidationErrorMsg: '',
            trxId: '',
            isPrepaidModalOpen: false,
            isBusy: false,
            showActionBtns: true,
            spinner: true,
            receiverName: '',
            bkashLinkSent: false,
        };
    }

    componentDidMount = () => {
        this._prepareData().then(() => {
            this.setState({ spinner: false });
        });

        this.notificationSubscripition = Notifications.addListener((notification) => {
            const isDisplaying =
                notification.data?.parcelId === this.props.navigation.state.params.parcelId;
            if (isDisplaying) {
                this.setState({ spinner: true });
                this.refresh().then(() => this.setState({ spinner: false }));
            }
        });
    };

    refresh = async () => {
        const parcelId = this.props.navigation.state.params.parcelId;
        const parcel = await parcelApi.fetchParcelById(parcelId);
        this.props.navigation.setParams(Noti.convertParcelToProp({ ...parcel }));
    };

    componentWillUnmount() {
        if (this.notificationSubscripition) {
            this.notificationSubscripition.remove();
        }
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: 'Parcel ID ' + params.parcelId,
        };
    };

    _prepareData = async () => {
        try {
            const { params } = this.props.navigation.state;
            console.log('enableParcelStatusChange', params.enableParcelStatusChange);
            const location = await getLocationAsync();
            this.setState({ location, showActionBtns: !params.enableParcelStatusChange });
        } catch (error) {
            error.message && Alert.alert('Error!', error.message);
        }
    };

    confirm = () => {
        return new Promise((yes, cancel) => {
            Alert.alert(
                'Warning',
                `Are you sure?`,
                [
                    { text: 'Cancel', onPress: cancel, style: 'cancel' },
                    { text: 'YES', onPress: yes },
                ],
                { cancelable: false }
            );
        });
    };

    _onPressDelivered = async (parcel) => {
        const { merchantType, cash, otpEnabled } = parcel;

        console.log('parcel', parcel);

        try {
            console.log('before confirm');
            await this.confirm();
            console.log('after confirm');

            if (!cash && otpEnabled) {
                this.setState({ isPrepaidModalOpen: true });
            } else {
                this.updateParcelStatus(ParcelStatus.DELIVERED);
            }
        } catch (error) {
            console.log('> Onpress Delivered error', error);
        }
    };

    updateParcelStatus = async ({ status, action } = null) => {
        try {
        //     await this.confirm();
        /*
                Delivery guys hit multiple times within a sec
                therefore if deliveredReqInProgress === true
                the delivered button will remain disabled
             */
        if (ParcelStatus.DELIVERED.status === status) {
            this.setState({ deliveredReqInProgress: true });
        }

        let agent = await dataStore.getLoggedInUser().then((data) => JSON.parse(data));
        let navigation = this.props.navigation;
        const { parcelId, sourceHubId, partnerId } = navigation.state.params;

        if (status === 'delivered') {
            Segment.trackDeliveredParcel({
                status,
                location: this.state.location,
                agent_id: agent.agentId,
                user_id: agent.id,
                agent_type: agent.agentType,
            });
            if (this.isMerchantTypeDocument()) {
                await this.submitReceiverName();
            }
        }

        let payload = {
            status: status,
            action: action,
            sourceHubId,
            partnerId,
        };

        // parcel update endpoint (for agents) expect an array of parcels
        return parcelApi
            .updateParcelStatusV2(agent.agentId, parcelId, payload)
            .then(() => {
                this.setState({ deliveredReqInProgress: false });
                this.props.navigation.navigate('DeliveryArea');
            })
            .catch((error) => {
                if (error && error.isTokenExpired) {
                    return dataStore.removeUserData().then(() => {
                        this.props.navigation.navigate('LogIn');
                        Alert.alert('Error message', error.message);
                    });
                }
                Alert.alert('Error message', error.message);
            });
        } catch (error) {
            console.log('> updateParcelStatus error', error)
            this.setState({ deliveredReqInProgress: false });
        }
    };

    onSelectPaymentMethod = async (paymentType) => {
        this.setState({ paymentType });
        if (paymentType === 'bkash') {
            try {
                let agent = await dataStore.getLoggedInUser().then((data) => JSON.parse(data));
                Notification.registerForPushNotificationsAsync({
                    id: agent.id,
                    accessToken: agent.accessToken,
                });
            } catch (error) {
                console.log('> onSelectPaymentMethod error', error);
            }
        }
    };

    onTrxIdChange = (val) => {
        this.setState({
            trxValidationError: false,
            trxValidationErrorMsg: '',
            trxId: val,
        });
    };

    onReceiverNameChange = (value) => {
        this.setState({ receiverName: value });
    }

    isMerchantTypeDocument = () => {
        const { merchantType } = this.props.navigation.state.params;
        return merchantType === 'document';
    }

    submitReceiverName = async () => {
        const { parcelId } = this.props.navigation.state.params;
        const { receiverName } = this.state;
        try {
            await parcelApi.postReceiverName(parcelId, { receiverName });
        } catch (err) {
            Alert.alert('Error message', err?.message || 'Something went wrong.');
            throw err;
        }
      };

    onPressBkashVerify = async () => {
        const { bkashVerified, trxId } = this.state;
        const params = this.props.navigation.state.params;
        const validTrxId = this.state.trxId.replace(/\s/g, '');

        if (!validTrxId) {
            this.setState({
                trxValidationError: true,
                trxValidationErrorMsg: 'Transaction ID cannot be empty',
            });
            return;
        }

        if (bkashVerified) {
            return;
        }

        this.setState({ isBusy: true });
        const json = await parcelApi.verifyBkashPayment(params.parcelId, trxId);
        console.log(json);
        if (json.isError) {
            this.setState({
                isBusy: false,
                bkashVerificationFailed: true,
            });
        } else {
            this.setState({
                isBusy: false,
                bkashVerified: true,
                bkashVerificationFailed: false,
                bkashVerifiedAmount: json.body.paidAmount,
            });
            Alert.alert(
                'Success!',
                `bKash payment of ৳${json.body.paidAmount} received`,
                [
                    {
                        text: 'Confirm Delivery',
                        onPress: () => this._startUpdateParcelStatus(ParcelStatus.DELIVERED),
                    },
                ],
                { cancelable: false }
            );
        }
    };

    sendBkashLinkToCustomer = () => {
        let { cash = 0, parcelId } = this.props.navigation.state.params;
        if (!cash) {
            return Alert.alert('Error!', 'CASH amount is zero.');
        }
        parcelId = decodeTrackingId(parcelId);
        parcelApi.sendPaymentUrlSms(parcelId);
        this.setState({ bkashLinkSent: true });
    };

    _showStatusChangeAlert = () => {
        Alert.alert(
            'Warning!',
            'Are you sure that you want to change the current status of this parcel?',
            [
                {
                    text: 'Cancel',
                    onPress: () => {},
                },
                {
                    text: 'Yes',
                    onPress: () => this.setState({ showActionBtns: true }),
                },
            ],
            { cancelable: true }
        );
    };

    _showStatusNotChangeAlert = () => {
        Alert.alert(
            'Cannot change status',
            'Agents are not allowed to change status of a parcel once a parcel is marked as delivered.',
            [
                {
                    text: 'OK',
                    onPress: () => {},
                },
            ],
            { cancelable: true }
        );
    };

    _naviagateToIssueList = () => {
        const params = this.props.navigation.state.params;
        this.props.navigation.navigate('IssueList', {
            parcelId: params.parcelId,
            sourceHubId: params.sourceHubId,
            partnerId: params.partnerId,
            customer: params.customer,
            shop: params.shop,
            merchantType: params.merchantType,
            otpEnabled: params.otpEnabled,
            pickupType: params.pickupType,
            adminNumber: params.adminNumber,
            businessType: params.businessType
        });
    };

    _startUpdateParcelStatus = () => {
        this.updateParcelStatus(ParcelStatus.DELIVERED);
    };

    _hidePrepaidModal = () => this.setState({ isPrepaidModalOpen: false });

    call = async ({ customer: customerPhoneNumber, merchant: merchantPhoneNumber }) => {
        try {
            const { parcelId, shopId } = this.props.navigation.state.params;
            const agent = await dataStore.getLoggedInUser().then(JSON.parse);
            logCall({
                customerPhoneNumber,
                merchantPhoneNumber,
                parcelId,
                shopId,
                type: agent.agentType === 'pickup' ? 'return' : 'delivery',
            });

            Call.call(customerPhoneNumber || merchantPhoneNumber);
        } catch (error) {
            console.log('Call error', error);
        }
    };

    _renderParcelCatMarker = () => {
        const { parcelCategories } = this.props.navigation.state.params;
        const parcelCats = parcelCategories
            ? parcelCategories.indexOf(',') > -1
                ? parcelCategories.split(',')
                : parcelCategories
            : [];

        return (
            <View>
                <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                    {typeof parcelCats === 'object' && parcelCats.length > 0 ? (
                        parcelCats.map((item, index) => (
                            <ParcelCatMarker categoryType={item} key={`cat-${index}`} />
                        ))
                    ) : typeof parcelCats === 'string' ? (
                        <ParcelCatMarker categoryType={parcelCats} />
                    ) : (
                        <View />
                    )}
                </View>
            </View>
        );
    };

    render() {
        let data = this.props.navigation.state.params;

        const {
            isDoingDelivery,
            isReturning,
            isExchangeReturning,
            customer,
            shop,
            shopupNote,
            sellerInstruction,
            enableParcelStatusChange,
            merchantType,
            gatewayMedium,
            gatewayPaidAmount,
            parcelCategories,
            isDisabledStatusChange
        } = data;
        const {
            paymentType,
            bkashVerified,
            bkashVerificationFailed,
            bkashVerifiedAmount,
            trxValidationError,
            trxValidationErrorMsg,
            isBusy,
            spinner,
            showActionBtns,
            receiverName,
            bkashLinkSent,
        } = this.state;

        const isReceiverNameRequired = this.isMerchantTypeDocument() && !receiverName.trim();

        const bKashPaid = gatewayMedium === 'bKash';
        
        console.log('delivery parcel card');

        return (
            <ScrollView
                style={styles.scrollView}
                refreshControl={<RefreshControl refreshing={spinner} onRefresh={this.refresh} />}
            >
                {/* {spinner && <ActivityIndicator size="large" />} */}
                {!spinner && (
                    <View>
                        {/* showPaymentAlert === 'bkash' &&
                            Alert.alert(
                                'bKash Payment',
                                'REDX-এ এখন পেমেন্ট করা যাবে বিকাশ-এর মাধ্যমে। আপনার কাস্টমারকে ডেলিভারির পেমেন্ট এর জন্য বিকাশ-এর 01870696032 এই নম্বর টি দিন',
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => this.setState({ showPaymentAlert: '' }),
                                    },
                                ],
                                { cancelable: false }
                            ) */}
                        <View style={styles.parcelInfoContainer}>
                            <View style={styles.recipientInfoContainer}>
                                <View style={styles.recipientDetails}>
                                    <Text style={[styles.text, styles.label]}>Name</Text>
                                    <Text style={[styles.text, styles.info]}>{customer.name}</Text>

                                    <Text style={[styles.text, styles.label]}>Phone</Text>
                                    <Text style={[styles.text, styles.info]}>{customer.phone}</Text>

                                    <Text style={[styles.text, styles.label]}>Address</Text>
                                    <Text style={[styles.text, styles.info, { width: '70%' }]}>
                                        {customer.address}
                                    </Text>

                                    {this.isMerchantTypeDocument() && showActionBtns && (
                                        <>
                                            <Text style={[styles.text, styles.label]}>Receiver Name</Text>
                                            <DeliveryReceiverInput
                                                value={receiverName}
                                                onChange={this.onReceiverNameChange}
                                                error={isReceiverNameRequired}
                                            />
                                        </>
                                    )}

                                    <View>
                                        <Text style={[styles.text, styles.label]}>
                                            Cash to collect
                                        </Text>
                                        <Text style={[styles.text, styles.info]}>৳{data.cash}</Text>
                                    </View>
                                    <View>
                                        <Text style={[styles.text, styles.label]}>
                                            Invoice Number
                                        </Text>
                                        <Text style={[styles.text, styles.info]}>
                                            {data.invoiceNumber || 'none'}
                                        </Text>
                                    </View>
                                    {parcelCategories && (
                                        <View>
                                            <Text style={[styles.text, styles.label]}>
                                                Parcel Type
                                            </Text>
                                            {this._renderParcelCatMarker()}
                                        </View>
                                    )}

                                    <>
                                        {showActionBtns && data.cash > 0 && (
                                            <Text style={[styles.text, styles.label]}>
                                                Payment Method
                                            </Text>
                                        )}

                                        <View style={styles.bkashOnDeliveryContainer}>
                                            {showActionBtns && !bKashPaid && data.cash > 0 && (
                                                <View style={styles.split}>
                                                    <View
                                                        style={[
                                                            styles.picker,
                                                            {
                                                                width:
                                                                    paymentType === 'bkash' &&
                                                                    !bkashLinkSent
                                                                        ? '60%'
                                                                        : '100%',
                                                            },
                                                        ]}
                                                    >
                                                        <Picker
                                                            mode="dropdown"
                                                            enabled={!bkashVerified}
                                                            selectedValue={paymentType}
                                                            onValueChange={
                                                                this.onSelectPaymentMethod
                                                            }
                                                        >
                                                            <Picker.Item
                                                                label="ক্যাশ অন ডেলিভারী"
                                                                value="cash-on-delivery"
                                                            />
                                                            <Picker.Item
                                                                label="বিকাশ"
                                                                value="bkash"
                                                            />
                                                        </Picker>
                                                    </View>
                                                    {paymentType === 'bkash' &&
                                                        !bkashLinkSent &&
                                                        data.cash > 0 && (
                                                            <View style={{ width: '38%' }}>
                                                                <TouchableOpacity
                                                                    onPress={
                                                                        this.sendBkashLinkToCustomer
                                                                    }
                                                                >
                                                                    <View
                                                                        style={styles.bkashSmsBtn}
                                                                    >
                                                                        <Text
                                                                            style={
                                                                                styles.bkashSmsBtnTitle
                                                                            }
                                                                        >
                                                                            SEND LINK
                                                                        </Text>
                                                                    </View>
                                                                </TouchableOpacity>
                                                            </View>
                                                        )}
                                                </View>
                                            )}

                                            {showActionBtns &&
                                            paymentType === 'bkash' &&
                                            bkashLinkSent &&
                                            !bKashPaid ? (
                                                <View style={styles.bKashSmsMsg}>
                                                    <Text>A link has been sent to Customer</Text>
                                                    <TouchableOpacity
                                                        onPress={this.sendBkashLinkToCustomer}
                                                    >
                                                        <Text style={styles.bKashSmsMsgBtn}>
                                                            Resend link
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            ) : null}

                                            {bKashPaid && (
                                                <View style={styles.bkashPaymentStatus}>
                                                    <AntDesign
                                                        name="checkcircle"
                                                        size={15}
                                                        color="#05d493"
                                                    />
                                                    <Text style={styles.bkashPaymentStatusMsg}>
                                                        Bkash payment verified
                                                    </Text>
                                                </View>
                                            )}

                                            {paymentType === 'bkash' && trxValidationError && (
                                                <View style={styles.bkashTrxValidationMsgConatiner}>
                                                    <Text style={styles.bkashTrxValidationMsgText}>
                                                        {trxValidationErrorMsg}
                                                    </Text>
                                                </View>
                                            )}
                                            {paymentType === 'bkash' && bkashVerificationFailed && (
                                                <View style={styles.bkashTrxValidationMsgConatiner}>
                                                    <Text style={styles.bkashTrxValidationMsgText}>
                                                        bKash verification failed
                                                    </Text>
                                                    <View style={styles.bkashVerifyFailedIcon}>
                                                        <MaterialIcons
                                                            name="clear"
                                                            color="#fff"
                                                            size={12}
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                            {paymentType === 'bkash' && bkashVerified && (
                                                <View style={styles.bkashTrxValidationMsgConatiner}>
                                                    <Text style={styles.bkashVerifySuccessText}>
                                                        bKash payment of ৳{bkashVerifiedAmount}{' '}
                                                        received
                                                    </Text>
                                                    <View style={styles.bkashVerifySuccessIcon}>
                                                        <MaterialIcons
                                                            name="done"
                                                            color="#fff"
                                                            size={12}
                                                        />
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </>

                                    <Text style={[styles.text, styles.label]}>Shopup Note:</Text>
                                    <Text style={[styles.text, styles.info]}>
                                        {shopupNote || 'none'}
                                    </Text>

                                    <Text style={[styles.text, styles.label]}>
                                        Seller Instruction:
                                    </Text>
                                    <Text style={[styles.text, styles.info]}>
                                        {sellerInstruction || 'none'}
                                    </Text>
                                </View>
                                <View style={styles.recipientImage}>
                                    <TouchableOpacity
                                        onPress={() => this.props.navigation.navigate('Call', {phone: customer.phone, name: customer.name})}
                                    >
                                        <Image
                                            style={styles.img}
                                            source={require('../../../assets/img/call-customer-icon.png')}
                                            //source={{ uri: `https://graph.facebook.com/${this.state.user.facebookId}/picture?size=normal` }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[styles.recipientInfoContainer]}>
                                <View style={[styles.recipientDetails]}>
                                    <Text style={[styles.text, styles.label]}>Merchant</Text>
                                    <Text style={[styles.text, styles.info]}>{shop.name}</Text>
                                </View>
                                <View style={styles.recipientImage}>
                                    <TouchableOpacity
                                        onPress={() => this.props.navigation.navigate('Call',{ phone: shop.phone, name: shop.name })}
                                    >
                                        <Image
                                            style={styles.img}
                                            source={require('../../../assets/img/call-merchant-icon.png')}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={styles.btns}>
                                {showActionBtns && (
                                    <View style={styles.btn}>
                                        <Button
                                            title="ISSUE"
                                            color="#ffc928"
                                            onPress={() => this._naviagateToIssueList()}
                                        />
                                    </View>
                                )}
                                {showActionBtns && (
                                    <View style={styles.btn}>
                                        <Button
                                            disabled={
                                                (paymentType === 'bkash' && !bKashPaid) ||
                                                this.state.deliveredReqInProgress ||
                                                isReceiverNameRequired
                                            }
                                            title="DELIVERED"
                                            color="#00A1B3"
                                            onPress={() => this._onPressDelivered(data)}
                                        />
                                    </View>
                                )}

                                {/* {isReturning && (
                                <View style={styles.btn}>
                                    <Button
                                        disabled={this.state.deliveredReqInProgress}
                                        title="RETURNED"
                                        color="#00A1B3"
                                        onPress={() => this.updateParcelStatus(ParcelStatus.RETURNED)}
                                    />
                                </View>
                            )} */}

                                {isExchangeReturning && showActionBtns && (
                                    <View style={styles.btn}>
                                        <Button
                                            disabled={this.state.deliveredReqInProgress}
                                            title="RETURN"
                                            color="#00A1B3"
                                            onPress={() =>
                                                this.updateParcelStatus(ParcelStatus.RETURN)
                                            }
                                        />
                                    </View>
                                )}

                                {!showActionBtns && !isDisabledStatusChange && (
                                    <View style={styles.btn}>
                                        <Button
                                            disabled={this.state.deliveredReqInProgress}
                                            title="CHANGE STATUS"
                                            color="#00A1B3"
                                            onPress={() => {
                                                if (isDoingDelivery) {
                                                    this._showStatusNotChangeAlert();
                                                } else {
                                                    this._showStatusChangeAlert();
                                                }
                                            }}
                                        />
                                    </View>
                                )}
                            </View>
                            <PrepaidParcelModal
                                isPrepaidModalOpen={this.state.isPrepaidModalOpen}
                                hidePrepaidModal={this._hidePrepaidModal}
                                parcelId={data.parcelId}
                                pickupType={data.pickupType}
                                startUpdateParcelStatus={this._startUpdateParcelStatus}
                            />
                        </View>
                    </View>
                )}
            </ScrollView>
        );
    }
}
