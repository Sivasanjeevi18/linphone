import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableHighlight,
    Linking,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { formatDistanceStrict } from 'date-fns';
import Button from './Button';
import styleConst from '../constants/Style';
import Call from '../components/Call';
import PaddedDivider from '../components/PaddedDivider';
import { logCall } from '../../src/utils/CallLog';
import * as parcelApi from '../api/Parcel';
import * as dataStore from '../../src/utils/Store';
// import * as userApi from '../api/User';
class ParcelCard extends React.Component {
    constructor(props) {
        super(props);
    }

    __unused__callParcelReceiver = (shopPhone, customerPhone) => {
        const { status } = this.props.parcel;
        const isDoingDelivery = ['delivered', 'delivery-in-progress'].includes(status);

        let phoneNumber = isDoingDelivery ? customerPhone : shopPhone;
        let regex = new RegExp('^(\\+880|880|0)1(1|[3-9])[0-9]{8}$');
        if (regex.test(phoneNumber)) {
            Linking.openURL('tel://' + phoneNumber);
            return;
        }

        Alert.alert(
            `Invalid phone number`,
            `The given phone number is not correct. Please report it to your supervisor`,
            [{ text: 'OK' }],
            { cancelable: false }
        );
    };

    _navigateToRecipient = (
        isDoingDelivery,
        isReturning,
        isExchangeReturning,
        enableParcelStatusChange = true
    ) => {
        const { parcel } = this.props;
        console.log('> _navigateToRecipient', parcel);
        this.props.navigation.navigate('Parcel', {
            parcelId: parcel.id,
            businessType: parcel.businessType,
            invoiceNumber: parcel.invoiceNumber,
            sourceHubId: parcel.sourceHubId,
            partnerId: parcel.partnerId,
            shopupNote: parcel.shopupNote,
            sellerInstruction: parcel.sellerInstruction,
            cash: parcel.cash,
            gatewayMedium: parcel.gatewayMedium,
            gatewayPaidAmount: parcel.gatewayPaidAmount,
            shopId: parcel.shopId,
            isDoingDelivery,
            isReturning,
            isExchangeReturning,
            enableParcelStatusChange,
            merchantType: parcel.merchantType,
            pickupType: parcel.pickupType,
            adminNumber: parcel.adminNumber,
            parcelCategories: parcel.parcelCategories,
            otpEnabled: parcel.otpEnabled,
            shop: {
                name: parcel.shopName,
                address: parcel.shopAddress,
                phone: parcel.parcelShopPhone || parcel.shopPhone,
            },
            customer: {
                name: parcel.customerName,
                address: parcel.customerAddress,
                phone: parcel.customerPhone,
            },
            isDisabledStatusChange: parcel.isExchanged && ['agent-returning', 'exchange-returning'].includes(parcel.status)

        });
    };

    statusBgColors = {
        'delivery-in-progress': '#1976D2',
        'exchange-returning': '#1976D2',
        'agent-returning': 'red',
        'agent-hold-returning': 'teal',
        'return-hold-returning': 'teal',
        'agent-area-change': '#FFEB3B',
        'return-in-progress': '#1976D2',
        delivered: 'green',
        'agent-returned': 'green',
        'return-problematic-returning': 'red',
    };
    statusColors = {
        'delivery-in-progress': 'white',
        'exchange-returning': 'white',
        'agent-returning': 'white',
        'agent-hold-returning': 'white',
        'return-hold-returning': 'white',
        'agent-area-change': 'black',
        'return-in-progress': 'white',
        delivered: 'white',
        'agent-returned': 'white',
        'return-problematic-returning': 'white',
    };

    statusNames = {
        'delivery-in-progress': 'Delivery',
        'exchange-returning': 'Exchange Returning',
        'agent-returning': 'Return',
        'agent-hold-returning': 'Hold',
        'return-hold-returning': 'Hold',
        'agent-area-change': 'Area change',
        'return-in-progress': 'Return',
        delivered: 'Delivered',
        'agent-returned': 'Returned',
        'return-problematic-returning': 'Problem',
    };

    exchangeTheme = {
        'partial-return': { title: 'Partial Return', theme: 'red' },
        'partial-delivery': { title: 'Partial Delivery', theme: 'green' },
        'exchange-return': { title: 'Exchange Return', theme: 'red' },
        'exchange-delivery': { title: 'Exchange Delivery', theme: 'green' },
    };

    call = async ({ customer: customerPhoneNumber, merchant: merchantPhoneNumber }) => {
        try {
            const { parcel } = this.props;
            const agent = await dataStore.getLoggedInUser().then(JSON.parse);
            logCall({
                customerPhoneNumber,
                merchantPhoneNumber,
                parcelId: parcel.id,
                shopId: parcel.shopId,
                type: agent.agentType === 'pickup' ? 'return' : 'delivery',
            });

            Call.call(customerPhoneNumber || merchantPhoneNumber);
        } catch (error) {
            console.log('Call error', error);
        }
    };

    confirmReturn = (parcelId) => {
        const { selectParcel, returnParcel } = this.props;
        selectParcel(parcelId);
        Alert.alert(
            parcelId,
            'Do you want to mark this parcel as Returned?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: () => returnParcel(parcelId) },
            ],
            { cancelable: false }
        );
    };

    render() {
        const { parcel, agentHubId } = this.props;
        const isCompleted = parcelApi.isOnFinalStage(parcel.status);
        const isDoingDelivery = ['delivered'].includes(parcel.status);
        const isReturning = 'return-in-progress' === parcel.status;
        const isReturned = [
            'agent-returned',
            'return-hold-returning',
            'return-problematic-returning',
        ].includes(parcel.status);
        const isExchangeReturning = 'exchange-returning' === parcel.status;
        const isAgentReturning = 'agent-returning' === parcel.status;
        const { parcelDeliveryType } = this.props;
        // console.log('---parcel', this.props.parcel);
        // console.log('isDoingDelivery isReturning', isDoingDelivery, isReturning, this.props);
        const pendingTime = parcel.firstMileReceivedTime
            ? formatDistanceStrict(new Date(parcel.firstMileReceivedTime), new Date())
            : null;
        // console.log(`parcel info`, parcel);
        return (
            <TouchableHighlight
                underlayColor="#E9F7FD"
                onPress={() => {
                    if (isCompleted) {
                        this._navigateToRecipient(
                            isDoingDelivery,
                            isReturning,
                            isExchangeReturning,
                            isCompleted
                        );
                    }
                }}
            >
                <View style={styles.parcels}>
                    <View style={styles.parcelInfo}>
                        <View style={styles.split}>
                            <Text style={styles.recipient}>{parcel.customerName}</Text>
                            <Text
                                style={[
                                    styles.status,
                                    {
                                        backgroundColor: this.statusBgColors[parcel.status],
                                        color: this.statusColors[parcel.status],
                                    },
                                ]}
                            >
                                {parcel.isReverseDelivery === 1
                                    ? 'Reverse Delivery'
                                    : this.statusNames[parcel.status]}
                            </Text>
                            {parcelDeliveryType && (
                                <Text
                                    style={[
                                        styles.deliveryType,
                                        this.exchangeTheme[parcelDeliveryType].theme === 'red'
                                            ? styles.delvTypeRed
                                            : styles.delvTypeGreen,
                                    ]}
                                >
                                    {this.exchangeTheme[parcelDeliveryType].title}
                                </Text>
                            )}
                        </View>
                        {parcel.status === 'delivery-in-progress' && (
                            <View>
                                <Text style={[styles.others, styles.highlightedText]}>
                                    Cash to collect: ৳{parcel.cash}{' '}
                                </Text>
                                <View style={{ flex: 1, marginRight: 5 }}>
                                    <Text style={styles.others}>{parcel.customerAddress}</Text>
                                    <Text style={styles.others}>Area: {parcel.area}</Text>
                                    <Text style={styles.others}>
                                        Invoice Number: {parcel.invoiceNumber || 'none'}
                                    </Text>
                                </View>
                                <TouchableOpacity
                                    style={styles.proceedBtnWrapper}
                                    onPress={() =>
                                        this._navigateToRecipient(
                                            isDoingDelivery,
                                            isReturning,
                                            isExchangeReturning,
                                            isCompleted
                                        )
                                    }
                                >
                                    <Text style={styles.proceedBtnText}>PROCEED TO DELIVERY</Text>
                                </TouchableOpacity>
                                {pendingTime && (
                                    <Text style={styles.pendingTimeText}>
                                        Pending for {pendingTime}
                                    </Text>
                                )}
                            </View>
                        )}
                        {isDoingDelivery && (
                            <View>
                                <Text style={[styles.others, styles.highlightedText]}>
                                    Cash to collect: ৳{parcel.cash}{' '}
                                </Text>
                                <PaddedDivider style={styles.split}>
                                    <View style={{ flex: 1, marginRight: 5 }}>
                                        <Text style={styles.others}>{parcel.customerName}</Text>
                                        <Text style={styles.others}>{parcel.customerAddress}</Text>
                                        <Text style={styles.others}>Area: {parcel.area}</Text>
                                    </View>
                                    <View>
                                        <Button
                                            style={styles.actionBtnx}
                                            title="Call Customer"
                                            iconName="call"
                                            size="small"
                                            onPress={() =>
                                                this.call({ customer: parcel.customerPhone })
                                            }
                                        />
                                    </View>
                                </PaddedDivider>
                                <PaddedDivider style={styles.split}>
                                    <View style={{ flex: 1, marginRight: 5 }}>
                                        <Text style={[styles.others, styles.shopName]}>
                                            {parcel.shopName}
                                        </Text>
                                    </View>
                                    <View>
                                        <Button
                                            style={styles.actionBtnx}
                                            title="Call Merchant"
                                            iconName="call"
                                            size="small"
                                            onPress={() =>
                                                this.call({
                                                    merchant:
                                                        parcel.parcelShopPhone || parcel.shopPhone,
                                                })
                                            }
                                        />
                                    </View>
                                </PaddedDivider>
                            </View>
                        )}
                        {(isReturning || isReturned) && (
                            <View style={styles.split} key="info">
                                <View style={{ flex: 1, marginRight: 5 }}>
                                    <Text style={[styles.others, styles.highlightedText]}>
                                        {parcel.id}
                                    </Text>
                                    <Text style={styles.others}>{parcel.shopAddress}</Text>
                                    <Text style={[styles.others, styles.shopName]}>
                                        {parcel.shopName}
                                    </Text>
                                </View>
                                {!isReturned && (
                                    <View>
                                        <Button
                                            style={styles.actionBtnx}
                                            title="Call Merchant"
                                            iconName="call"
                                            size="small"
                                            onPress={() =>
                                                this.call({
                                                    merchant:
                                                        parcel.parcelShopPhone || parcel.shopPhone,
                                                })
                                            }
                                        />
                                    </View>
                                )}
                            </View>
                        )}
                        {isReturning && (
                            <View style={styles.bottomActionsWrap} key="call">
                                <Button
                                    style={styles.actionBtn}
                                    title="Returned"
                                    iconName="check"
                                    onPress={() => this.confirmReturn(parcel.id)}
                                />
                                <Button
                                    style={styles.actionBtn}
                                    title="Hold/Problem"
                                    iconName="info"
                                    onPress={() => {
                                        this.props.showReturnProblemsModal(parcel.id);
                                    }}
                                />
                            </View>
                        )}
                        {isAgentReturning && (
                            <View>
                                <Text style={[styles.others, styles.highlightedText]}>
                                    {parcel.id}
                                </Text>
                                <Text style={styles.others}>{parcel.shopName}</Text>
                            </View>
                        )}
                        {isExchangeReturning && (
                            <View style={styles.split} key="detail">
                                <View style={{ flex: 1, marginRight: 5 }}>
                                    <Text style={[styles.others, styles.highlightedText]}>
                                        {parcel.id}
                                    </Text>
                                    <Text style={styles.others}>{parcel.customerAddress}</Text>
                                    <Text style={[styles.others, styles.shopName]}>
                                        {parcel.shopName}
                                    </Text>
                                </View>
                                <View>
                                    <Button
                                        style={styles.actionBtnx}
                                        title="Call Merchant"
                                        iconName="call"
                                        size="small"
                                        onPress={() =>
                                            this.call({
                                                merchant:
                                                    parcel.parcelShopPhone || parcel.shopPhone,
                                            })
                                        }
                                    />
                                </View>
                            </View>
                        )}
                    </View>
                    {/* {parcelInfo} */}

                    {/* <View style={styles.bottomActionsWrap}></View> */}
                </View>
            </TouchableHighlight>
        );
    }
}

export default ParcelCard;

const styles = StyleSheet.create({
    split: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    deliveryType: {
        borderWidth: 1.2,
        borderColor: '#009def',
        color: '#009def',
        borderRadius: 4,
        marginTop: 4,
        paddingHorizontal: 8,
        paddingTop: 2,
        paddingBottom: 1,
        marginLeft: 6,
    },

    delvTypeRed: {
        borderColor: 'red',
        color: 'red',
    },
    delvTypeGreen: {
        borderColor: 'green',
        color: 'green',
    },

    proceedBtnWrapper: {
        borderColor: '#00a9bf',
        borderWidth: 2.5,
        paddingVertical: 8,
        marginTop: 10,
        borderRadius: 5,
        alignItems: 'center',
    },

    proceedBtnText: {
        color: '#00a9bf',
    },

    parcels: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
    },
    parcelInfo: {
        flex: 9,
        marginRight: 10,
        paddingBottom: 10,
    },
    actions: {
        borderWidth: 1.2,
        borderColor: 'red',
    },
    bottomActionsWrap: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingTop: 8,
    },
    actionBtn: {
        width: '47%',
    },
    recipient: {
        fontSize: styleConst.font.cardHeaderSize,
        fontFamily: styleConst.font.regular,
    },
    highlightedText: {
        color: styleConst.color.highlightedText,
    },
    shopName: {
        color: '#797979',
    },
    others: {
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.size,
        fontWeight: styleConst.font.weight,
    },
    statusWrap: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
    },
    status: {
        color: 'white',
        borderRadius: 4,
        marginTop: 4,
        paddingHorizontal: 8,
        paddingTop: 2,
        paddingBottom: 4,
    },
    actionBlock: {
        width: 30,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnDisabled: {
        backgroundColor: '#EEE',
    },
    pendingTimeText: {
        marginTop: 10,
        alignSelf: 'center',
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.heading1,
        color: 'red',
        fontWeight: 'bold',
    },
});
