import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Modal,
    Alert,
    Picker,
    Button,
} from 'react-native';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pickedReason: undefined,
        };
    }

    finish = () => {
        // this.props.hide();
        this.props.completePickup(this.state.pickedReason);
    };

    render() {
        const { visible, hide, reasons } = this.props;
        const { pickedReason } = this.state;
        return (
            <Modal
                // animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={hide}
                style={$$.modal}
            >
                <View style={$$.wrap}>
                    <View style={$$.content}>
                        <Text style={$$.title}>What is the problem?</Text>
                        <Picker
                            selectedValue={pickedReason}
                            style={{ width: '100%' }}
                            onValueChange={(pickedReason) => this.setState({ pickedReason })}
                        >
                            <Picker.Item value="NOT_SELECTED" label="Choose an option" />
                            {reasons.map(({ REASON_ID, REASON_EN, REASON_BN }) => (
                                <Picker.Item value={REASON_ID} label={REASON_BN} key={REASON_ID} />
                            ))}
                        </Picker>
                        <View style={$$.mb10}>
                            <Button
                                disabled={!pickedReason || pickedReason === 'NOT_SELECTED'}
                                title="Submit Problem"
                                onPress={this.finish}
                                color="#e53935"
                            ></Button>
                        </View>
                        <Button title="Back" onPress={hide} color="#3ba3c5" />
                    </View>
                </View>
            </Modal>
        );
    }
}

const $$ = StyleSheet.create({
    wrap: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,.2)',
    },
    content: {
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingVertical: 20,
        margin: 20,
        width: '90%',
    },
    title: {
        fontSize: 22,
    },
    mb10: {
        marginBottom: 10,
    },
    mb20: {
        marginBottom: 20,
    },
});
