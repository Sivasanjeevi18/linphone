import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import styleConst from '../constants/Style';
const { expo } = require('../../app.json');
import ENV from '../constants/ReleaseChannel';

const postfix = ENV != 'PRODUCTION' ? ' - ' + ENV : '';
const Version = () => (
    <View style={styles.version}>
        <Text style={styles.holder}>
            <Text style={styles.info}>
                V{expo.version} {postfix}
            </Text>
        </Text>
    </View>
);
export default Version;

const styles = StyleSheet.create({
    version: {
        position: 'absolute',
        bottom: 10,
    },
    holder: {
        color: '#FFF',
    },
    info: {
        fontSize: 10,
        fontFamily: styleConst.font.regular,
    },
});
