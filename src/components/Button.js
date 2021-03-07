import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';

import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
export default ({
    title,
    style,
    wrapStyle = {},
    onPress,
    iconName,
    iconSize = 24,
    size = 'normal',
    bgColor = '#FFF',
    color = '#000',
}) => {
    const $$btnSize = $$[`${size}BtnSize`];
    const $$btnTitle = $$[`${size}BtnTitle`];
    return (
        <View style={[style]}>
            <TouchableOpacity onPress={onPress}>
                <View
                    style={[
                        $$.wrap,
                        wrapStyle,
                        $$btnSize,
                        { backgroundColor: bgColor },
                        { borderColor: bgColor === '#FFF' ? '#000' : bgColor },
                    ]}
                >
                    {iconName && (
                        <MaterialIcons
                            name={iconName}
                            size={iconSize}
                            color={color}
                            style={$$.icon}
                        />
                    )}
                    <Text style={[$$.title, $$btnTitle, { color }]}>{title}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const $$ = StyleSheet.create({
    wrap: {
        borderWidth: 1.2,
        borderColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    smallBtnSize: {
        paddingTop: 2,
        paddingHorizontal: 6,
        paddingBottom: 2,
    },
    normalBtnSize: {
        paddingTop: 5,
        paddingHorizontal: 10,
        paddingBottom: 5 + 3,
    },

    icon: {
        marginRight: 4,
    },
    title: {
        textAlign: 'center',
    },
    smallBtnTitle: {
        fontSize: 14,
    },
    normalBtnTitle: {
        fontSize: 17,
    },
});
