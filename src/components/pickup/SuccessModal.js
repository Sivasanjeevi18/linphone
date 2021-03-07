import React from 'react';
import { View, Text, StyleSheet, Modal, Button, Alert, TextInput } from 'react-native';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parcelCount: undefined,
        };
    }

    finish = () => {
        // this.props.hide();
        this.props.completePickup(this.state.parcelCount);
    };

    render() {
        const { visible, hide } = this.props;
        const { parcelCount } = this.state;
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
                        <Text style={[$$.label, $$.mb10]}>How many parcels?</Text>
                        <TextInput
                            style={[$$.input, $$.mb20]}
                            keyboardType="decimal-pad"
                            autoFocus
                            onChangeText={parcelCount => this.setState({ parcelCount })}
                            value={parcelCount}
                        />
                        <View style={$$.mb10}>
                            <Button title="Complete Pickup" onPress={this.finish} color="#3bc582" />
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
    label: {
        fontSize: 22,
    },
    mb10: {
        marginBottom: 10,
    },
    mb20: {
        marginBottom: 20,
    },
    input: {
        borderWidth: 1.2,
        borderColor: '#000',
        fontSize: 22,
        paddingVertical: 5,
        paddingHorizontal: 10,
        textAlign: 'center',
    },
    cancelBtn: {
        color: '#000',
    },
});
