import React from 'react';
import { StyleSheet, Text, View, TouchableWithoutFeedback, Linking, Alert } from 'react-native';
import { formatDistanceStrict } from 'date-fns';
import Button from './Button';
import styleConst from '../constants/Style';
import { MaterialIcons } from '@expo/vector-icons';
import * as parcelApi from '../api/Parcel';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ParcelCatMarker from '../components/ParcelCatMarker';

class ReturnParcelCard extends React.Component {
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
        const { parcel, routeName = 'Parcel' } = this.props;
        // console.log('> routeName', routeName);
        this.props.navigation.navigate(routeName, {
            parcelId: parcel.id,
            sourceHubId: parcel.sourceHubId,
            partnerId: parcel.partnerId,
            shopupNote: parcel.shopupNote,
            sellerInstruction: parcel.sellerInstruction,
            cash: parcel.cash,
            gatewayMedium: parcel.gatewayMedium,
            gatewayPaidAmount: parcel.gatewayPaidAmount,
            isDoingDelivery,
            isReturning,
            isExchangeReturning,
            enableParcelStatusChange,
            shop: {
                name: parcel.storeName,
                address: parcel.shopStoreAddress,
                phone: parcel.storePhone || parcel.shopPhone,
            },
            customer: {
                name: parcel.customerName,
                address: parcel.customerAddress,
                phone: parcel.customerPhone,
            },
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

    _renderParcelCatMarker = () => {
        const { parcelCategories } = this.props.parcel;
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
        const {
            parcel,
            agentHubId,
            multiSelectEnabled = false,
            onSelect = () => {},
            isSelected,
        } = this.props;
        const isCompleted = parcelApi.isOnFinalStage(parcel.status);
        const isDoingDelivery = ['delivered', 'delivery-in-progress'].includes(parcel.status);
        const isReturning = 'return-in-progress' === parcel.status;
        const isReturned = [
            'agent-returned',
            'return-hold-returning',
            'return-problematic-returning',
        ].includes(parcel.status);
        const isExchangeReturning = 'exchange-returning' === parcel.status;
        const isAgentReturning = 'agent-returning' === parcel.status;
        const { parcelDeliveryType } = this.props;
        // console.log('---parcel isCompleted', isCompleted, parcel.id);
        // console.log('isDoingDelivery isReturning', isDoingDelivery, isReturning, this.props);
        const pendingTime = parcel.firstMileReceivedTime
            ? formatDistanceStrict(new Date(parcel.firstMileReceivedTime), new Date())
            : null;

        return (
            <TouchableWithoutFeedback
                underlayColor="#E9F7FD"
                onLongPress={() => {
                    if (isCompleted === false) {
                        onSelect(parcel.id, !isSelected);
                    }
                }}
            >
                <View style={[styles.parcels, isSelected ? styles.selectParcel : {}]}>
                    <TouchableOpacity
                        onPress={() => {
                            if (multiSelectEnabled && isCompleted === false) {
                                onSelect(parcel.id, !isSelected);
                            }
                        }}
                    >
                        <View style={styles.checkboxWrapper}>
                            {multiSelectEnabled && isSelected && isCompleted === false && (
                                <MaterialIcons
                                    name="radio-button-checked"
                                    size={30}
                                    color="#1976D2"
                                />
                            )}
                            {multiSelectEnabled &&
                                isSelected === false &&
                                isCompleted === false && (
                                    <MaterialIcons
                                        name="radio-button-unchecked"
                                        size={30}
                                        color="#000"
                                    />
                                )}
                        </View>
                    </TouchableOpacity>
                    <View style={styles.parcelInfo}>
                        <TouchableOpacity
                            onPress={() => {
                                if (multiSelectEnabled && isCompleted === false) {
                                    onSelect(parcel.id, !isSelected);
                                }
                            }}
                        >
                            <View style={styles.split}>
                                <Text style={[styles.recipient, styles.highlightedText]}>
                                    {parcel.id}
                                </Text>
                                <Text
                                    style={[
                                        styles.status,
                                        {
                                            backgroundColor: this.statusBgColors[parcel.status],
                                            color: this.statusColors[parcel.status],
                                        },
                                    ]}
                                >
                                    {this.statusNames[parcel.status]}
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
                        </TouchableOpacity>

                        <View style={styles.split} key="info">
                            <View style={{ flex: 1, marginRight: 5 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        if (multiSelectEnabled && isCompleted === false) {
                                            onSelect(parcel.id, !isSelected);
                                        }
                                    }}
                                >
                                    <Text style={styles.others}>{parcel.customerName}</Text>
                                    <Text style={styles.others}>{parcel.shopStoreAddress}</Text>
                                </TouchableOpacity>
                            </View>
                            {this._renderParcelCatMarker()}
                        </View>

                        {isReturning && (
                            <View style={styles.bottomActionsWrap} key="call">
                                <Button
                                    style={styles.actionBtn}
                                    wrapStyle={{ borderRadius: 5 }}
                                    title="Details"
                                    onPress={() =>
                                        this._navigateToRecipient(
                                            isDoingDelivery,
                                            isReturning,
                                            isExchangeReturning
                                        )
                                    }
                                />
                                <Button
                                    style={styles.actionBtn}
                                    wrapStyle={{ borderRadius: 5 }}
                                    title="Hold/Problem"
                                    iconName="info"
                                    iconSize={18}
                                    onPress={() => {
                                        this.props.showReturnProblemsModal(parcel.id);
                                    }}
                                />
                            </View>
                        )}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default ReturnParcelCard;

const styles = StyleSheet.create({
    split: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    flexCenter: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    flexRow: {
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

    parcels: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        // alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 8,
        paddingBottom: 3,
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
    },
    selectParcel: {
        borderColor: '#009def',
        borderBottomColor: '#009def',
        borderWidth: 2,
        borderBottomWidth: 2,
        margin: 4,
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
        alignItems: 'center',
        paddingTop: 12,
    },
    actionBtn: {
        width: '47%',
    },
    recipient: {
        fontSize: styleConst.font.heading1,
        fontFamily: styleConst.font.regular,
    },
    checkboxWrapper: {
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
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
