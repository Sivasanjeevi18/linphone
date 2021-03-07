import React from 'react';
import Button from './Button';
import { View, Text, TouchableOpacity, Linking, StyleSheet } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import { logCall } from '../utils/CallLog';
import styleConst from '../constants/Style';

export default class PickupShop extends React.Component {
    constructor(props) {
        super(props);
    }

    __UNUSED__navigateToParcels = (navigation, { shopId, shopName }) => {
        navigation.navigate('PickupParcel', {
            shopId: shopId,
            shopName: shopName,
        });
    };

    call = (phone) => {
        const { shopId } = this.props.shop;
        let number = phone;
        if (number.slice(0, 3) === '880') {
            number = '+' + number;
        }
        logCall({
            merchantPhoneNumber: number,
            shopId,
            type: 'pickup',
        });
        Linking.openURL('tel://' + number);
    };

    render() {
        const { shop, navigation } = this.props;
        // console.log('shop-----', shop);

        return (
            <View style={$$.card}>
                <View style={$$.top}>
                    <View style={$$.left}>
                        <Text style={$$.name}>{shop.shopName}</Text>
                        <Text style={[$$.address, { color: !shop.shopAddress ? 'red' : '#000' }]}>
                            {shop.shopAddress || '(Address missing)'}
                        </Text>
                        <TouchableOpacity onPress={() => this.call(shop.shopPhone)}>
                            <View style={$$.contact}>
                                <MaterialIcons name="local-phone" size={24} color="#000" />
                                <Text style={$$.phone}>{shop.shopPhone}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    {shop.status === 'picked-up' && (
                        <View style={$$.right}>
                            <Text style={$$.count}>{`${shop.parcelCount} ${
                                shop.parcelCount > 1 ? 'parcels' : 'parcel'
                            }`}</Text>
                        </View>
                    )}
                    {shop.status === 'confirmed' && (
                        <View style={$$.right}>
                            <TouchableOpacity
                                onPress={() =>
                                    navigation.navigate('SacnParcel', {
                                        shopId: this.props.shop.shopId,
                                        shopName: this.props.shop.shopName,
                                        parcelCount: this.props.shop.parcelCount,
                                        refreshPickupPoints: this.props.refreshPickupPoints,
                                    })
                                }
                            >
                                <Text style={[$$.count, $$.linkColor]}>Scan QR</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {shop.status === 'confirmed' && (
                    <View style={$$.bottom}>
                        <Button
                            title="Successful"
                            style={$$.buttons}
                            onPress={this.props.toggleSuccessModal}
                        ></Button>
                        <Button
                            title="Failed"
                            style={$$.buttons}
                            onPress={this.props.toggleProblemModal}
                        ></Button>
                    </View>
                )}
                {shop.status && shop.status !== 'confirmed' && (
                    <Text
                        style={[
                            $$.status,
                            shop.status === 'picked-up' ? $$.greenColor : $$.redColor,
                        ]}
                    >
                        {shop.status === 'picked-up' ? 'Picked Up' : 'Failed'}
                    </Text>
                )}
            </View>
        );
    }
}

const $$ = StyleSheet.create({
    card: {
        paddingHorizontal: 15,
        paddingBottom: 15,
        borderBottomWidth: 1.2,
        borderColor: '#DDD',
    },
    top: {
        display: 'flex',
        flexDirection: 'row',
    },
    left: {
        flex: 7,
        paddingVertical: 10,
    },
    name: {
        fontSize: 20,
        fontWeight: '600',
    },
    address: {
        fontSize: 18,
    },
    contact: {
        display: 'flex',
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
    },
    phone: {
        fontSize: 18,
        marginLeft: 8,
    },
    right: {
        flex: 3,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    count: {
        fontSize: 19,
    },

    bottom: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttons: {
        width: '48%',
    },

    status: {
        fontSize: 22,
        textAlign: 'center',
        width: '100%',
    },
    greenColor: {
        color: 'green',
    },
    redColor: {
        color: 'red',
    },
    linkColor: {
        color: styleConst.color.skyBlue,
    },
});
