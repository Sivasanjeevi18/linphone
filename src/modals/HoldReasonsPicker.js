import React from 'react';
import { createForm } from 'rc-form';
import {
    StyleSheet,
    Modal,
    Text,
    View,
    Alert,
    TextInput,
    Picker as NativePicker,
} from 'react-native';
import Button from './../components/Button';
import Input from './../components/Input';

const ReasonsModal = ({ isVisible = false, onClose, form, parcelId }) => {
    const confirmHold = fields => {
        Alert.alert(
            parcelId,
            'Do you want to mark this parcel as HOLD?',
            [{ text: 'Cancel', style: 'cancel' }, { text: 'OK', onPress: () => onClose(fields) }],
            { cancelable: false }
        );
    };
    const onSubmit = () => {
        try {
            form.validateFields((error, fields) => {
                if (error) {
                    return Alert.alert('Error', 'Please select a REASON from the dropdown.');
                }
                confirmHold(fields);
            });
        } catch (error) {}
    };

    const { getFieldDecorator } = form;

    const reasons = [
        { value: 'NOT_REACHABLE', label: 'মার্চেন্ট কে পাওয়া যায় নি' },
        { value: 'HOLD_PARCEL', label: 'মার্চেন্ট আজ পার্সেল রিসিভ করতে পারবেন না' },
    ];

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
                        <Text style={$$.fieldLabel}>Reason of Hold:</Text>
                        {getFieldDecorator('reason', {
                            rules: [{ required: true }],
                            initialValue: reasons[0].value,
                        })(<Picker options={reasons} />)}
                    </View>
                    <View style={$$.eachField}>
                        <Text style={$$.fieldLabel}>Additional comments:</Text>
                        {getFieldDecorator('comment', { rules: [{ required: false }] })(
                            <Input placeholder="Comment" />
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

class Picker extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { options = [], onChange, value, ...restProps } = this.props;
        return (
            <View style={$$.picker}>
                <NativePicker
                    selectedValue={value}
                    onValueChange={selected => {
                        onChange(selected); // don't shorthand.
                    }}
                    style={{ fontSize: 20 }}
                    change
                    {...restProps}
                >
                    {options.map(op => (
                        <NativePicker.Item key={op.value} label={op.label} value={op.value} />
                    ))}
                </NativePicker>
            </View>
        );
    }
}

export const HoldReasonsPicker = createForm()(ReasonsModal);

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
