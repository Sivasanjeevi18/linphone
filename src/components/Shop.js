import React, { Component } from 'react';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';
import styleConst from '../constants/Style';
import Button from '../components/Button';

class Shop extends Component {
    _navigate = () => {
        const { shop, shopId, shopStoreId, filterPhone, filterStatus, routeName, shopPhone } = this.props;
        console.log('routeName', routeName);
        this.props.navigation.navigate(routeName, {
            shop,
            shopId,
            shopStoreId,
            shopPhone,
            filterPhone,
            filterStatus,
        });
    };

    render() {
        const { parcelCount, call, shopPhone, shop, address } = this.props;

        let subtitle;
        if (parcelCount === 0) {
            subtitle = 'All delivered';
        } else if (parcelCount >= 1) {
            subtitle = `${parcelCount} parcel${parcelCount > 1 ? 's' : ''} to deliver`;
        }

        return (
            <View style={styles.shopInfo}>
                <TouchableHighlight
                    underlayColor="#E9F7FD"
                    onPress={this._navigate}
                    style={styles.wrapper}
                >
                    <View>
                        <Text style={styles.shopName}>{shop}</Text>
                        {address && <Text style={styles.address}>{address}</Text>}
                        <Text style={styles.parcelCount}>{subtitle}</Text>
                    </View>
                </TouchableHighlight>
                <View style={[styles.wrapper]}>
                    <Button
                        style={styles.actionBtnx}
                        title="Call Merchant"
                        iconName="call"
                        size="small"
                        onPress={() => call(shopPhone)}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    shopInfo: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
    },
    wrapper: {
        paddingLeft: 18,
        paddingRight: 18,
        paddingTop: 20,
        paddingBottom: 20,
        width: '50%',
    },
    shopName: {
        fontSize: styleConst.font.cardHeaderSize,
        fontFamily: styleConst.font.regular,
    },
    address: {
        marginVertical: 2,
        color: '#666',
    },
    parcelCount: {
        fontSize: styleConst.font.size,
        fontFamily: styleConst.font.regular,
        color: styleConst.color.highlightedText,
    },
});

export default Shop;