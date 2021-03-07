import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput, Text, View } from 'react-native';
import styleConst from '../../constants/Style';
import Icon from '@expo/vector-icons/MaterialIcons';

function DeliveryReceiverInput({ value, onChange, error }) {
    return (
        <View style={styles.inputContainer}>
            <TextInput
                value={value}
                onChangeText={onChange}
                style={[styles.inputStyle, error && styles.inputErrorStyle]}
                placeholder="Receiver's Name"
            />
            {error && (
                <View style={styles.errorContainer}>
                    <Icon name="clear" color={styleConst.color.red} size={18} />

                    <Text style={styles.error}>
                        You can not proceed without entering receiver's name
                    </Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    errorContainer: {
        flexDirection: 'row',
        marginTop: 10,
        alignItems: 'center',
    },
    inputContainer: {
        marginBottom: 20,
        marginTop: 5,
    },
    inputStyle: {
        borderWidth: 1,
        borderColor: styleConst.color.borderColor,
        borderRadius: 5,
        padding: 6,
        fontSize: 18,
        width: '100%',
    },
    inputErrorStyle: {
        borderColor: styleConst.color.red,
    },
    error: { color: styleConst.color.red, fontSize: 14, marginLeft: 5 },
});

export default DeliveryReceiverInput;
