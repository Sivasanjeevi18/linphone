// DamagedOrMissingModal
import React from 'react';
import { createForm } from 'rc-form';
import { StyleSheet, Modal, Text, View, Alert } from 'react-native';
import Button from './../components/Button';
import Input from './../components/Input';

const DamagedOrMissing = ({ isVisible = false, onClose, form, parcelId, problemType }) => {
    const confirmSubmit = fields => {
        Alert.alert(
            parcelId,
            `Do you want to mark this parcel as ${problemType}?`,
            [{ text: 'Cancel', style: 'cancel' }, { text: 'OK', onPress: () => onClose(fields) }],
            { cancelable: false }
        );
    };
    const onSubmit = () => {
        try {
            form.validateFields((error, fields) => {
                if (error) {
                    return;
                }
                confirmSubmit(fields);
            });
        } catch (error) {}
    };
    const { getFieldDecorator } = form;

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
                    <View style={$$.eachField}>
                        <Text style={$$.fieldLabel}>
                            Specify the details of {problemType} Item:
                        </Text>
                        {getFieldDecorator('comment', { rules: [{ required: true }] })(
                            <Input placeholder="Comment" autoFocus />
                        )}
                    </View>
                    <View style={$$.lastBtnsWrap}>
                        <Button
                            title="Submit"
                            onPress={onSubmit}
                            style={$$.lastBtns}
                            bgColor="#3ab12c"
                            color="#FFF"
                        />
                        <Button
                            title="Cancel"
                            onPress={() => onClose()}
                            style={$$.lastBtns}
                            bgColor="#e74c3c"
                            color="#FFF"
                        />
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export const DamagedOrMissingModal = createForm()(DamagedOrMissing);

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
    eachField: {
        marginBottom: 15,
    },
    fieldLabel: {
        fontSize: 20,
        marginBottom: 4,
    },
    picker: {
        borderColor: '#000',
        fontSize: 20,
        borderColor: '#000',
        borderWidth: 1.2,
        // paddingHorizontal: 15,
        // paddingVertical: 5,
    },
    input: {
        borderColor: '#000',
        fontSize: 20,
        borderColor: '#000',
        borderWidth: 1.2,
        paddingHorizontal: 15,
        paddingVertical: 7,
    },
    title: {
        textAlign: 'center',
        fontSize: 24,
        marginBottom: 20,
    },
    btnWrap: {
        marginBottom: 10,
    },
    lastBtnsWrap: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    lastBtns: {
        width: '48%',
    },
});
