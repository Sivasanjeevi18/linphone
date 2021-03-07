import React from 'react';
import { View, StyleSheet } from 'react-native';
import StyleConst from '../constants/Style';

export default ({ children, style }) => {
    return <View style={[$$.wrap, style]}>{children}</View>;
};

const $$ = StyleSheet.create({
    wrap: {
        borderLeftWidth: 2,
        borderColor: StyleConst.color.secondaryBackground,
        marginTop: 2,
        marginBottom: 6,
        paddingTop: 0,
        paddingBottom: 1,
        paddingLeft: 10,
    },
});
