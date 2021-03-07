import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styleConst from './../constants/Style';
import * as dataStore from '../utils/Store';

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            agent: undefined,
        };
    }

    componentDidMount() {
        dataStore
            .getLoggedInUser()
            .then((data) => JSON.parse(data))
            .then((agent) => this.setState({ agent }))
            .catch(console.log);
    }

    getActiveScreen = function () {
        const route = this.props.navigation.state;
        const activeScreen = route.routes[route.index];
        return activeScreen.routeName;
    };

    render() {
        const { navigation } = this.props;
        const { agent } = this.state;
        const activeScreen = this.getActiveScreen();

        if (agent !== undefined && agent.agentType === 'pickup') {
            return (
                <View style={$$.wrap}>
                    <Tab
                        iconName="person"
                        screenName="PickupProfile"
                        title="Profile"
                        activeScreen={activeScreen}
                        navigation={navigation}
                    />
                    <Tab
                        iconName="store"
                        screenName="Pickup"
                        title="Pickup"
                        activeScreen={activeScreen}
                        navigation={navigation}
                    />
                    <Tab
                        iconName="directions-bike"
                        screenName="Return"
                        title="Return"
                        activeScreen={activeScreen}
                        navigation={navigation}
                    />
                </View>
            );
        } else {
            return (
                <View style={$$.wrap}>
                    <Tab
                        iconName="person"
                        screenName="DeliveryProfile"
                        title="Profile"
                        activeScreen={activeScreen}
                        navigation={navigation}
                    />
                    <Tab
                        iconName="directions-bike"
                        screenName="Delivery"
                        title="Delivery"
                        activeScreen={activeScreen}
                        navigation={navigation}
                    />
                </View>
            );
        }
        // return (
        //     <View style={$$.wrap}>
        //         <Tab
        //             iconName="person"
        //             screenName="Profile"
        //             title="Profile"
        //             activeScreen={activeScreen}
        //             navigation={navigation}
        //         />
        //         <Tab
        //             iconName="store"
        //             screenName="Pickup"
        //             title="Pickup"
        //             activeScreen={activeScreen}
        //             navigation={navigation}
        //         />
        //         <Tab
        //             iconName="directions-bike"
        //             screenName="Delivery"
        //             title={agent && agent.agentType === 'delivery' ? 'Delivery' : 'Return'}
        //             activeScreen={activeScreen}
        //             navigation={navigation}
        //         />
        //     </View>
        // );
    }
}

const Tab = ({ screenName, iconName, title, activeScreen, navigation }) => {
    const isActive = screenName === activeScreen;
    return (
        <View style={$$.tab}>
            <TouchableOpacity onPress={() => navigation.navigate(screenName)}>
                <View style={$$.tabButton}>
                    <MaterialIcons
                        name={iconName}
                        size={24}
                        color={isActive ? styleConst.backgroundColor : '#566573'}
                    />
                    <Text style={$$.tabTitle}>{title}</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const $$ = StyleSheet.create({
    wrap: {
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: 'white',
        borderTopWidth: 1.2,
        borderColor: '#DDD',
    },
    tab: {
        flex: 1,
        display: 'flex',
        alignItems: 'center',
    },
    tabButton: {
        display: 'flex',
        alignItems: 'center',
        paddingVertical: 2,
    },
    tabTitle: {
        fontSize: 13,
    },
});
