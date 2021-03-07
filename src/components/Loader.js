import React from 'react';
// import { Feather } from '@expo/vector-icons';
import { StyleSheet, View, Text, Animated } from 'react-native';

export default class Loader extends React.Component {
    constructor() {
        super();
        this.state = {
            position: new Animated.Value(15),
        };
    }

    componentDidMount() {
        Animated.loop(
            Animated.timing(this.state.position, {
                toValue: 360,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();
    }

    render() {
        let position = this.state.position.interpolate({
            inputRange: [0, 360],
            outputRange: ['0deg', '360deg'],
        });
        return (
            <View style={styles.theOverlay}>
                <Animated.View style={[styles.holder, { transform: [{ rotate: position }] }]}>
                    {/* <Feather name="stop-circle" size={28} color="#FFF" /> */}
                </Animated.View>
                <Text style={styles.text}>Loading</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    theOverlay: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'black',
        opacity: 0.4,
        width: '100%',
        height: '100%',
        position: 'absolute',
    },
    holder: {
        alignItems: 'center',
        marginTop: 6,
    },
    text: {
        color: '#FFF',
        fontSize: 16,
    },
});
