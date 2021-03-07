import React from 'react';
import { Facebook } from 'expo';
import { StyleSheet, Text, View, TouchableHighlight } from 'react-native';

import styleConst from '../constants/Style';
import { createIconSetFromFontello } from '@expo/vector-icons';

export default class Area extends React.Component {
    constructor(props) {
        super(props);
    }

    goToDeliveryParcel = () => {
        const {
            area,
            areaId,
            filterPhone,
            filterStatus,
            routeName = 'DeliveryParcel',
        } = this.props;
        this.props.navigation.navigate(routeName, {
            area,
            areaId,
            filterPhone,
            filterStatus,
        });
    };

    render() {
        const { parcelCount } = this.props;

        let subtitle;
        if (parcelCount === 0) {
            subtitle = 'All delivered';
        } else if (parcelCount >= 1) {
            subtitle = `${parcelCount} parcel${parcelCount > 1 ? 's' : ''} to deliver`;
        }

        return (
            <TouchableHighlight underlayColor="#E9F7FD" onPress={this.goToDeliveryParcel}>
                <View style={styles.areaInfo}>
                    <Text style={styles.areaName}>{this.props.area}</Text>
                    <Text style={styles.parcelCount}>{subtitle}</Text>
                </View>
            </TouchableHighlight>
        );
    }
}

const styles = StyleSheet.create({
    areaInfo: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingLeft: 18,
        paddingRight: 18,
        paddingTop: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
    },
    areaName: {
        fontSize: styleConst.font.cardHeaderSize,
        fontFamily: styleConst.font.regular,
    },
    parcelCount: {
        fontSize: styleConst.font.size,
        fontFamily: styleConst.font.regular,
        color: styleConst.color.highlightedText,
    },
});
