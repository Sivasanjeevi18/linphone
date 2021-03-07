import React from 'react';
import { Facebook, Audio } from 'expo';
import { StyleSheet, Text, View, Image, Button } from 'react-native';

import { Entypo } from '@expo/vector-icons';
// import { Feather } from '@expo/vector-icons';
import styleConst from '../constants/Style';

export default class EmptyView extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={styles.position}>
                <View>
                    <Image
                        style={styles.illustration}
                        source={
                            this.props.illustration === 'delivery'
                                ? require('../../assets/img/delivery.png')
                                : require('../../assets/img/pickup.png')
                        }
                    />
                </View>

                <Text style={styles.message}>{this.props.message || 'Empty list'}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    position: {
        marginTop: 90,
        height: '100%',
        alignItems: 'center',
    },
    btnWrap: {
        marginTop: 20,
        width: '82%',
    },
    message: {
        paddingTop: 12,
        width: '80%',
        textAlign: 'center',
    },
    illustration: {
        width: 132,
        height: 132,
    },
});
