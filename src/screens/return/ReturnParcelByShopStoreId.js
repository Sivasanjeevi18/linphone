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

import Shop from '../../components/Shop';
import Loader from '../../components/Loader';
import EmptyView from '../../components/EmptyView';
import Call from '../../components/Call';

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

export default class ReturnParcelByShopStoreId extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            storeList: [],
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
        const { navigation } = this.props;
        const shopId = navigation.getParam('shopId');

        const { agentId, accessToken, agentType } = await dataStore
            .getLoggedInUser()
            .then((data) => JSON.parse(data));

        const { filterStatus, filterPhone } = this.state;
        const [error, parcelData] = await parcelApi.fetchParcelList({
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

        console.log(parcelData, '===');

        const storesByShopId = {};

        (parcelData[shopId]?.parcels || []).forEach((parcel) => {
            const isDone = parcelApi.isOnFinalStage(parcel.status);
            if (storesByShopId[parcel.shopStoreId]) {
                if (!isDone) storesByShopId[parcel.shopStoreId].parcelCount++;
            } else {
                storesByShopId[parcel.shopStoreId] = {
                    parcelCount: isDone ? 0 : 1,
                    shopName: parcelData[shopId].shopName,
                    shopId: parcelData[shopId].shopId,
                    shopPhone: parcelData[shopId].shopPhone,
                    shopStoreId: parcel.shopStoreId,
                    storeName: parcel.storeName,
                    storePhone: parcel.storePhone,
                    shopAddress: parcel.shopStoreAddress
                };
            }
        });

        const sortedStores = Object.values(storesByShopId)
            .sort((a, b) => {
                if (a.parcelCount > b.parcelCount) {
                    return -1;
                } else if (a.parcelCount < b.parcelCount) {
                    return 1;
                }
                return 0;
            });

        this.setState({
            storeList: sortedStores,
            listViewData: sortedStores,
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

    call = (merchantPhoneNumber) => {
        try {
            Call.call(merchantPhoneNumber);
        } catch (error) {
            console.log('Call error', error);
        }
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
        console.log('navigation', this.props.navigation.state.params);
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
        const {
            filterStatus,
            filterPhone,
            spinner,
            storeList,
            listViewData,
            refreshing
        } = this.state;

        const { navigation } = this.props;

        return spinner ? (
            <Loader />
        ) : (
            <View style={styles.container}>
                {storeList && storeList.length > 0 ? (
                    <FlatList
                        style={styles.list}
                        enableEmptySections={true}
                        data={listViewData}
                        keyExtractor={(item) => `${item.shopStoreId}`}
                        ListFooterComponent={<View style={styles.footer} />}
                        renderItem={({ item }) => (
                            <Shop
                                shop={item.storeName}
                                shopId={item.shopId}
                                shopStoreId={item.shopStoreId}
                                shopPhone={item.storePhone || item.shopPhone}
                                parcelCount={item.parcelCount}
                                address={item.shopAddress}
                                filterPhone={filterPhone}
                                filterStatus={statusFilters[filterStatus]}
                                routeName="ReturnParcelList"
                                call={this.call}
                                navigation={navigation}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                onRefresh={this.refreshDeliveryArea}
                                refreshing={refreshing}
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
