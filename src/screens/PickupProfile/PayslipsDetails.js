import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './styles';

const PayslipsDetails = ({ navigation }) => {
    return (
        <ScrollView style={styles.mainContainer}>
            <View style={[styles.commonCard, styles.mediumMarginTop]}>
                <View style={[styles.flexSpaceBetween]}>
                    <Text style={[styles.boldRegularText, styles.blackTextColor]}>
                        Payslip of June 2020
                    </Text>
                    <Text>{'Tk. 10000 >'}</Text>
                </View>
            </View>
        </ScrollView>
    );
};

export default PayslipsDetails;
