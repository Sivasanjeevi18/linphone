import React from 'react';
import { StyleSheet, Modal, Text, View, Alert } from 'react-native';
import Button from './../components/Button';

export const ReturnProblemsPicker = ({ isVisible = false, onClose }) => {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => {
                // onClose && onClose();
            }}
        >
            <View style={$$.wrap}>
                <View style={$$.innerWrap}>
                    <Text style={$$.title}>Choose a problem:</Text>
                    <View style={$$.btnWrap}>
                        <Button
                            title="Hold Parcel"
                            onPress={() => onClose('HOLD')}
                            bgColor="#3ab12c"
                            color="#FFF"
                        />
                    </View>
                    <View style={$$.btnWrap}>
                        <Button
                            title="Parcel Damaged"
                            onPress={() => onClose('DEFECTIVE_PRODUCT')}
                            bgColor="#3ab12c"
                            color="#FFF"
                        />
                    </View>
                    <View style={$$.btnWrap}>
                        <Button
                            title="Item Missing"
                            onPress={() => onClose('LOST_PRODUCT')}
                            bgColor="#3ab12c"
                            color="#FFF"
                        />
                    </View>
                    <View style={$$.lastBtnWrap}>
                        <Button
                            title="Cancel"
                            onPress={() => onClose()}
                            bgColor="#e74c3c"
                            color="#FFF"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const $$ = StyleSheet.create({
    wrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0, .3)',
    },
    innerWrap: {
        width: '80%',
        borderColor: '#000',
        borderWidth: 1.2,
        backgroundColor: '#FFF',
        borderRadius: 4,
        marginHorizontal: 20,
        paddingVertical: 20,
        paddingHorizontal: 15,
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 20,
    },
    btnWrap: {
        marginBottom: 10,
    },
    lastBtnWrap: {
        marginTop: 15,
    },
});
