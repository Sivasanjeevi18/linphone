import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Alert,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Picker,
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import styleConst from '../../constants/Style';

import * as dataStore from '../../utils/Store';
import * as parcelApi from '../../api/Parcel';

import Area from '../../components/Area';
import Loader from '../../components/Loader';
import EmptyView from '../../components/EmptyView';

const statusFilters = {
    all: [
        'return-hold-returning',
        'delivery-in-progress',
        'agent-returning',
        'agent-hold-returning',
        'agent-area-change',
        'return-in-progress',
        'delivered',
        'agent-returned',
        'return-problematic-returning',
        // 'exchange-returning',
    ],
    deliveryInProgress: ['delivery-in-progress'],
    delivered: ['delivered'],
    hold: ['agent-hold-returning'],
};

export default class DeliveryArea extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            areaList: [],
            listViewData: null,
            refreshing: false,
            spinner: true,
            filterStatus: 'all',
            filterPhone: '',
        };

        this.willFocusSubscription = null;
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerRight: (
                <TouchableOpacity
                    style={styles.headerRightBtn}
                    onPress={() => params.refreshDeliveryArea(true)}
                >
                    <MaterialIcons name="cached" size={32} color="#FFF" />
                </TouchableOpacity>
            ),
        };
    };

    _prepareData = async () => {
        let { agentId, accessToken, agentType } = await dataStore
            .getLoggedInUser()
            .then((data) => JSON.parse(data));

        const { filterStatus, filterPhone } = this.state;
        let [error, parcelData] = await parcelApi.fetchParcelList({
            agentId,
            agentType,
            accessToken,
            customerPhone: filterPhone,
            status: statusFilters[filterStatus],
        });

        if (error && error.isTokenExpired) {
            return dataStore.removeUserData().then(() => {
                this.props.navigation.navigate('LogIn');
                Alert.alert('Error message', error.message);
                return null;
            });
        } else if (error && error.noInternetConnection) {
            Alert.alert('Error message', error.message);
            return null;
        }

        parcelData = [].concat(
            ...Object.keys(parcelData).map((shopId) => {
                return parcelData[shopId].parcels;
            })
        );

        // const fragileParcelCount = parcelData.filter((parcel) => {
        //     if (parcel.parcelCategories && parcel.parcelCategories.includes('fragile')) {
        //         return parcel;
        //     }
        // }).length;
        // const liquidParcelCount = parcelData.filter((parcel) => {
        //     if (parcel.parcelCategories && parcel.parcelCategories.includes('liquid')) {
        //         return parcel;
        //     }
        // }).length;

        let areaList = {};
        parcelData.forEach((parcel) => {
            const isDone = parcelApi.isOnFinalStage(parcel.status);
            if (areaList[parcel.areaId]) {
                if (!isDone) areaList[parcel.areaId].parcelCount++;
            } else {
                areaList[parcel.areaId] = {
                    parcelCount: isDone ? 0 : 1,
                    area: parcel.area,
                    areaId: parcel.areaId,
                };
            }
            areaList[parcel.areaId] = {
                ...areaList[parcel.areaId],
                // fargileCount: fragileParcelCount,
                // liquidCount: liquidParcelCount,
            };
        });

        areaList = Object.keys(areaList)
            .map((areaId) => {
                return areaList[areaId];
            })
            .sort((a, b) => {
                if (a.parcelCount > b.parcelCount) {
                    return -1;
                } else if (a.parcelCount < b.parcelCount) {
                    return 1;
                }
                return 0;
            });

        this.setState({
            areaList: areaList,
            listViewData: areaList,
        });
    };

    refreshDeliveryArea = (reset) => {
        this.setState({
            refreshing: true,
            ...(reset && {
                filterStatus: 'all',
                filterPhone: '',
            }),
        });
        this._prepareData().then(() => {
            this.setState({
                refreshing: false,
                spinner: false,
            });
        });
    };

    onStatusChange = (newStatus) => {
        this.setState({ filterStatus: newStatus }, this.refreshDeliveryArea);
    };

    onPhoneChange = (phone) => {
        this.setState({ filterPhone: phone }, this.refreshDeliveryArea);
    };

    UNSAFE_componentWillMount = () => {
        this.props.navigation.setParams({
            refreshDeliveryArea: this.refreshDeliveryArea,
        });
    };

    componentDidMount = () => {
        console.log('> DeliveryArea: navigation', this.props.navigation.state.params);
        if (this.willFocusSubscription) return;
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () =>
            this.refreshDeliveryArea()
        );
    };

    componentWillUnmount() {
        if (this.willFocusSubscription) {
            this.willFocusSubscription.remove();
        }
    }

    render() {
        const { filterStatus, filterPhone } = this.state;

        return this.state.spinner ? (
            <Loader />
        ) : (
            <View style={styles.container}>
                <View style={styles.controls}>
                    <View style={{ flex: 5 }}>
                        <View style={styles.picker}>
                            <Picker
                                mode="dropdown"
                                selectedValue={filterStatus}
                                onValueChange={this.onStatusChange}
                            >
                                <Picker.Item label="All parcels" value="all" />
                                <Picker.Item
                                    label="Delivery In Progress"
                                    value="deliveryInProgress"
                                />
                                <Picker.Item label="Delivered" value="delivered" />
                                <Picker.Item label="Hold parcels" value="hold" />
                            </Picker>
                        </View>
                    </View>
                    <View style={{ flex: 5 }}>
                        <TextInput
                            style={styles.phone}
                            placeholder="Customer phone"
                            onSubmitEditing={this.refreshDeliveryArea}
                            onChangeText={this.onPhoneChange}
                            value={filterPhone}
                            keyboardType="phone-pad"
                        />
                    </View>
                </View>
                {this.state.areaList && this.state.areaList.length > 0 ? (
                    <FlatList
                        style={styles.list}
                        enableEmptySections={true}
                        data={this.state.listViewData}
                        keyExtractor={(item) => `${item.areaId}`}
                        ListFooterComponent={<View style={styles.footer} />}
                        renderItem={({ item }) => (
                            <Area
                                {...item}
                                routeName="DeliveryParcel"
                                filterPhone={filterPhone}
                                filterStatus={statusFilters[filterStatus]}
                                navigation={this.props.navigation}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                onRefresh={this.refreshDeliveryArea}
                                refreshing={this.state.refreshing}
                            />
                        }
                    />
                ) : (
                    <EmptyView
                        illustration="delivery"
                        message="No more parcel is left to delivery at this moment"
                    />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    headerRightBtn: {
        marginRight: 16,
    },
    container: {
        backgroundColor: styleConst.color.defaultBackground,
    },
    controls: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#EEE',
    },
    phone: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 3,
        fontSize: 19,
        height: 50,
        paddingLeft: 15,
    },
    picker: {
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 3,
        height: 50,
    },
    list: {
        backgroundColor: styleConst.color.defaultBackground,
    },
    footer: {
        backgroundColor: '#EEE',
        height: 180,
    },
});
