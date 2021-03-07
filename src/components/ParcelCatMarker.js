import React from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';

const ParcelCatMarker = ({ categoryType, count = undefined }) => {
    return (
        <View
            style={[
                styles.conatiner,
                // eslint-disable-next-line react-native/no-inline-styles
                count ? { justifyContent: 'space-between' } : { justifyContent: 'center' },
            ]}
        >
            {categoryType === 'fragile' && (
                <Image
                    source={require('../../assets/img/fragile.png')}
                    style={count ? styles.iconWithText : styles.icon}
                />
            )}
            {categoryType === 'liquid' && (
                <Image
                    source={require('../../assets/img/liquid.png')}
                    style={count ? styles.iconWithText : styles.icon}
                />
            )}
            {count !== 0 && <Text>{count}</Text>}
        </View>
    );
};

export default ParcelCatMarker;

const styles = StyleSheet.create({
    conatiner: {
        backgroundColor: '#ebf6f8',
        width: 45,
        height: 25,
        borderRadius: 10,
        flexDirection: 'row',
        // justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 5,
        marginHorizontal: 10,
    },
    icon: {
        width: 15,
        height: 15,
    },
    iconWithText: {
        width: 10,
        height: 10,
    },
});
