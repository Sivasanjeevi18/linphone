import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Image,
    Button,
    Alert,
    ScrollView,
    Picker,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import * as dataStore from '../../utils/Store';
import * as parcelApi from '../../api/Parcel';
import styleConst from '../../constants/Style';
import ParcelStatus from '../../constants/ParcelStatus';
import Segment from '../../utils/Segment';
import { getLocationAsync } from '../../utils/Location';
import { MaterialIcons } from '@expo/vector-icons';
import PrepaidParcelModal from './PrepaidParcelModal';

export default class Parcel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            deliveredReqInProgress: false,
            location: null,
            paymentType: 'cash-on-delivery',
            showPaymentAlert: '',
            bkashVerified: false,
            bkashVerifiedAmount: '',
            bkashVerificationFailed: false,
            trxValidationError: false,
            trxValidationErrorMsg: '',
            trxId: '',
            isPrepaidModalOpen: false,
            isBusy: false,
        };
    }

    componentDidMount() {
        this._getLocation();
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: 'Parcel ID ' + params.parcelId,
        };
    };

    _getLocation = async () => {
        const location = await getLocationAsync();
        this.setState({ location });
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

    _onPressDelivered = async (cash) => {
        try {
            console.log('before confirm');
            await this.confirm();
            console.log('after confirm');

            if (cash) {
                this.updateParcelStatus(ParcelStatus.DELIVERED);
            } else {
                this.setState({ isPrepaidModalOpen: true });
            }
        } catch (error) {
            console.log('> Onpress Delivered error', error);
        }
    };

    updateParcelStatus = async ({ status, action } = null) => {
        // try {
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
        }

        let payload = {
            status: status,
            action: action,
            sourceHubId,
            partnerId,
        };
        // console.log('>> parcel payload', payload);

        // parcel update endpoint (for agents) expect an array of parcels
        return parcelApi
            .updateParcelStatusV2(agent.agentId, parcelId, payload)
            .then(() => {
                this.setState({ deliveredReqInProgress: false });
                this.props.navigation.navigate('ReturnShopList');
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
        // } catch (error) {
        //     console.log('> updateParcelStatus error', error);
        // }
    };

    onSelectPaymentMethod = (val) => {
        this.setState({
            showPaymentAlert: val,
            paymentType: val,
        });
    };

    onTrxIdChange = (val) => {
        this.setState({
            trxValidationError: false,
            trxValidationErrorMsg: '',
            trxId: val,
        });
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

    _naviagateToIssueList = () => {
        const params = this.props.navigation.state.params;
        this.props.navigation.navigate('IssueList', {
            parcelId: params.parcelId,
            sourceHubId: params.sourceHubId,
            partnerId: params.partnerId,
            customer: params.customer,
            shop: params.shop,
        });
    };

    _startUpdateParcelStatus = () => {
        this.updateParcelStatus(ParcelStatus.DELIVERED);
    };

    _hidePrepaidModal = () => this.setState({ isPrepaidModalOpen: false });

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
        } = data;
        const {
            paymentType,
            showPaymentAlert,
            bkashVerified,
            bkashVerificationFailed,
            bkashVerifiedAmount,
            trxValidationError,
            trxValidationErrorMsg,
            isBusy,
        } = this.state;

        return (
            <ScrollView style={styles.scrollView}>
                <View>
                    {showPaymentAlert === 'bkash' &&
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
                        )}
                    <View style={styles.parcelInfoContainer}>
                        <View style={styles.recipientInfoContainer}>
                            <View style={styles.recipientDetails}>
                                <Text style={[styles.text, styles.label]}>Name</Text>
                                <Text style={[styles.text, styles.info]}>
                                    {isDoingDelivery ? customer.name : shop.name || ''}
                                </Text>

                                <Text style={[styles.text, styles.label]}>Phone</Text>
                                <Text style={[styles.text, styles.info]}>
                                    {isDoingDelivery ? customer.phone : shop.phone}
                                </Text>

                                <Text style={[styles.text, styles.label]}>Address</Text>
                                <Text style={[styles.text, styles.info]}>
                                    {isDoingDelivery ? customer.address : shop.address}
                                </Text>

                                {isDoingDelivery && (
                                    <View>
                                        <Text style={[styles.text, styles.label]}>
                                            Cash to collect
                                        </Text>
                                        <Text style={[styles.text, styles.info]}>৳{data.cash}</Text>
                                    </View>
                                )}

                                {isDoingDelivery && (
                                    <>
                                        <Text style={[styles.text, styles.label]}>
                                            Payment Method
                                        </Text>
                                        <View style={styles.bkashOnDeliveryContainer}>
                                            <View style={styles.picker}>
                                                <Picker
                                                    mode="dropdown"
                                                    enabled={!bkashVerified}
                                                    selectedValue={paymentType}
                                                    onValueChange={this.onSelectPaymentMethod}
                                                >
                                                    <Picker.Item
                                                        label="ক্যাশ অন ডেলিভারী"
                                                        value="cash-on-delivery"
                                                    />
                                                    <Picker.Item label="বিকাশ" value="bkash" />
                                                </Picker>
                                            </View>
                                            {paymentType === 'bkash' && (
                                                <View style={styles.bkashVerification}>
                                                    <View style={styles.bkashTrxInputContainer}>
                                                        <TextInput
                                                            style={styles.bkashTrxInput}
                                                            onChangeText={this.onTrxIdChange}
                                                            editable={!isBusy && !bkashVerified}
                                                        />
                                                    </View>

                                                    <View style={styles.bkashTrxCheckBtn}>
                                                        <TouchableWithoutFeedback
                                                            onPress={this.onPressBkashVerify}
                                                        >
                                                            {isBusy ? (
                                                                <ActivityIndicator />
                                                            ) : (
                                                                <Text>Verify</Text>
                                                            )}
                                                        </TouchableWithoutFeedback>
                                                    </View>
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
                                )}

                                <Text style={[styles.text, styles.label]}>Shopup Note:</Text>
                                <Text style={[styles.text, styles.info]}>
                                    {shopupNote || 'none'}
                                </Text>

                                <Text style={[styles.text, styles.label]}>Seller Instruction:</Text>
                                <Text style={[styles.text, styles.info]}>
                                    {sellerInstruction || 'none'}
                                </Text>
                            </View>
                            <View style={styles.recipientImage}>
                                <Image
                                    style={styles.img}
                                    source={require('../../../assets/img/user_placeholder.png')}
                                    //source={{ uri: `https://graph.facebook.com/${this.state.user.facebookId}/picture?size=normal` }}
                                />
                            </View>
                        </View>
                        <View style={styles.btns}>
                            {isDoingDelivery && (
                                <View style={styles.btn}>
                                    <Button
                                        title="ISSUE"
                                        color="#ffc928"
                                        onPress={() => this._naviagateToIssueList()}
                                    />
                                </View>
                            )}
                            {isDoingDelivery && (
                                <View style={styles.btn}>
                                    <Button
                                        disabled={
                                            this.state.paymentType === 'bkash'
                                                ? !this.state.bkashVerified
                                                : this.state.deliveredReqInProgress
                                        }
                                        title="DELIVERED"
                                        color="#00A1B3"
                                        onPress={() => this._onPressDelivered(data.cash)}
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

                            {isExchangeReturning && (
                                <View style={styles.btn}>
                                    <Button
                                        disabled={this.state.deliveredReqInProgress}
                                        title="RETURN"
                                        color="#00A1B3"
                                        onPress={() => this.updateParcelStatus(ParcelStatus.RETURN)}
                                    />
                                </View>
                            )}
                        </View>
                        <PrepaidParcelModal
                            isPrepaidModalOpen={this.state.isPrepaidModalOpen}
                            hidePrepaidModal={this._hidePrepaidModal}
                            parcelId={data.parcelId}
                            startUpdateParcelStatus={this._startUpdateParcelStatus}
                        />
                    </View>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    scrollView: {
        paddingBottom: 20,
        backgroundColor: '#FFF',
    },
    parcelInfoContainer: {
        height: '100%',
        backgroundColor: '#FFF',
        paddingLeft: 15,
        paddingRight: 15,
    },
    recipientInfoContainer: {
        paddingTop: 12,
        display: 'flex',
        flexDirection: 'row',
    },
    recipientDetails: {
        width: '70%',
    },
    recipientImage: {
        width: '30%',
        alignItems: 'flex-end',
    },
    text: {
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.size,
        fontWeight: styleConst.font.weight,
    },
    label: {
        color: '#000',
        opacity: 0.4,
        marginBottom: 2,
    },
    info: {
        marginBottom: 10,
        fontSize: 16,
    },
    img: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    btns: {
        marginTop: 2,
        marginBottom: 30,
    },
    btn: {
        height: 34,
        marginTop: 16,
    },
    bkashOnDeliveryContainer: {
        marginVertical: 10,
    },
    picker: {
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 3,
        height: 45,
        marginTop: 10,
    },
    bkashVerification: {
        width: '100%',
        flexDirection: 'row',
        marginVertical: 15,
    },
    bkashTrxInputContainer: {
        flex: 0.7,
    },
    bkashTrxInput: {
        borderRadius: 5,
        marginRight: 10,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#E4E4E4',
        height: 40,
    },
    bkashTrxCheckBtn: {
        flex: 0.3,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        height: 40,
        backgroundColor: '#E4E4E4',
    },
    bkashTrxValidationMsgConatiner: {
        flexDirection: 'row',
    },
    bkashTrxValidationMsgText: {
        color: styleConst.color.errorText,
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.small,
        marginRight: 10,
    },
    bkashVerifySuccessText: {
        color: '#00ABC0',
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.small,
        marginRight: 10,
    },
    bkashVerifySuccessIcon: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: '#00ABC0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bkashVerifyFailedIcon: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: styleConst.color.errorText,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
