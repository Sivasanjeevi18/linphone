import React from 'react';
import SuccessModal from './../../components/pickup/SuccessModal';
import ProblemModal from './../../components/pickup/ProblemModal';

import {
    View,
    Alert,
    ToastAndroid,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    StyleSheet,
} from 'react-native';

import { MaterialIcons } from '@expo/vector-icons';
import styleConst from '../../constants/Style';

import Loader from '../../components/Loader';
import EmptyView from '../../components/EmptyView';
import PickupShop from '../../components/PickupShop';

import * as dataStore from '../../utils/Store';
import * as parcelApi from '../../api/Parcel';
import Segment from '../../utils/Segment';
import { getLocationAsync } from '../../utils/Location';
import { getPickupReasons } from '../../api/Parcel';

export default class PickupPoint extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            shopData: [],
            listViewData: null,
            refreshing: false,
            showLoader: true,
            successModalVisible: false,
            problemModalVisible: false,
            selectedShop: undefined,
            user: {},
            location: null,
            failedPickupReasons: [],
        };

        this.willFocusSubscription = null;
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};

        return {
            headerRight: (
                <TouchableOpacity
                    style={styles.headerRightBtn}
                    onPress={() => {
                        params.refreshPickupPoints();
                    }}
                >
                    <MaterialIcons name="cached" size={32} color="#FFF" />
                </TouchableOpacity>
            ),
        };
    };

    _getLocation = async () => {
        const location = await getLocationAsync();
        this.setState({ location });
    };

    _prepareData = async () => {
        try {
            let {
                id,
                agentId,
                accessToken,
                agentType,
            } = await dataStore.getLoggedInUser().then((data) => JSON.parse(data));

            let [error, shopData] = await parcelApi.fetchPickupList({
                agentId,
                agentType,
                accessToken,
                status: 'pickup-in-progress',
            });

            console.log('shopData', shopData);

            this.setState({
                shopData: shopData,
                user: {
                    id,
                    agentId,
                    agentType,
                },
            });
        } catch (error) {
            alert('Failed to load pickup list');
            console.log('Failed to load pickup list', error);
            // error
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
        }
    };

    refreshPickupPoints = () => {
        this.setState({ refreshing: true, showLoader: true });
        this._prepareData().then(() => {
            this.setState({
                refreshing: false,
                showLoader: false,
            });
        });
    };

    _getPickupReasons = async () => {
        this.setState({ showLoader: true });
        const { reasons } = await getPickupReasons();
        console.log('reasons', reasons);
        this.setState({ showLoader: false, failedPickupReasons: reasons[0].REASONS });
    };

    UNSAFE_componentWillMount = () => {
        this.props.navigation.setParams({
            refreshPickupPoints: this.refreshPickupPoints,
        });
    };

    componentDidMount = () => {
        this._getPickupReasons();
        if (this.willFocusSubscription) return;
        this.willFocusSubscription = this.props.navigation.addListener(
            'willFocus',
            this.refreshPickupPoints
        );
    };

    componentWillUnmount() {
        if (this.willFocusSubscription) {
            this.willFocusSubscription.remove();
        }
    }

    toggleSuccessModal = (shop) => {
        this._getLocation();
        this.setState(({ successModalVisible }) => ({
            successModalVisible: !successModalVisible,
            selectedShop: shop,
        }));
    };
    toggleProblemModal = (shop) => {
        this._getLocation();
        this.setState(({ problemModalVisible }) => ({
            problemModalVisible: !problemModalVisible,
            selectedShop: shop,
        }));
    };

    setSuccessfulPickup = (parcelCount) => {
        const { selectedShop } = this.state;
        Segment.trackPickupSuccess({
            agent_id: this.state.user.agentId,
            user_id: this.state.user.id,
            agent_type: this.state.user.agentType,
            parcel_count: parcelCount,
            location: this.state.location,
        });
        parcelApi
            .setPickupSuccess(selectedShop.shopId, parcelCount, 0, parcelCount)
            .then(() => {
                this.toggleSuccessModal(undefined);
                ToastAndroid.show('Successful!', ToastAndroid.SHORT);
                this.refreshPickupPoints();
            })
            .catch((error) => {
                console.log('error setPickupSuccess', error);
                Alert.alert('Error', 'Failed to finish pickup');
            });
    };
    setFailedPickup = (failedReason) => {
        const { selectedShop, failedPickupReasons } = this.state;
        const selectedReason = failedPickupReasons.find(
            ({ REASON_ID }) => failedReason === REASON_ID
        );
        console.log(
            'setFailedPickup() - failedReason',
            selectedShop.shopId,
            failedReason,
            failedReason.length
        );
        const payload = {
            failedReason: selectedReason.REASON_EN,
            remarks: selectedReason.REASON_BN,
            reasonId: selectedReason.REASON_ID,
        };
        if (failedReason === 'NOT_SELECTED') {
            return Alert.alert('Error', 'Wrong OPTION.');
        }
        Segment.trackPickupFailed({
            agent_id: this.state.user.agentId,
            user_id: this.state.user.id,
            agent_type: this.state.user.agentType,
            failed_reason: selectedReason.REASON_EN,
            location: this.state.location,
        });
        parcelApi
            .setPickupFailed(selectedShop.shopId, payload)
            .then(() => {
                this.toggleProblemModal(undefined);
                ToastAndroid.show('Successful!', ToastAndroid.SHORT);
                this.refreshPickupPoints();
            })
            .catch((error) => {
                console.log('error setFailedPickup', error);
                Alert.alert('Error', 'Failed to finish pickup');
            });
    };

    render() {
        const { successModalVisible, problemModalVisible } = this.state;
        return this.state.showLoader ? (
            <Loader />
        ) : (
            <View style={styles.container}>
                {this.state.shopData.length > 0 ? (
                    <FlatList
                        style={styles.list}
                        enableEmptySections={true}
                        data={this.state.shopData}
                        keyExtractor={(item) => `${item.shopId}`}
                        renderItem={({ item: shop }) => (
                            <PickupShop
                                shop={shop}
                                navigation={this.props.navigation}
                                toggleSuccessModal={(_) => this.toggleSuccessModal(shop)}
                                toggleProblemModal={(_) => this.toggleProblemModal(shop)}
                                refreshPickupPoints={this.refreshPickupPoints}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                onRefresh={this.refreshPickupPoints}
                                refreshing={this.state.refreshing}
                            />
                        }
                    />
                ) : (
                    <EmptyView
                        illustration="pickup"
                        message="No parcel is left to pickup at this moment"
                    />
                )}
                <SuccessModal
                    visible={successModalVisible}
                    hide={this.toggleSuccessModal}
                    completePickup={this.setSuccessfulPickup}
                />
                <ProblemModal
                    visible={problemModalVisible}
                    hide={this.toggleProblemModal}
                    completePickup={this.setFailedPickup}
                    reasons={this.state.failedPickupReasons}
                />
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
    list: {
        backgroundColor: styleConst.color.defaultBackground,
    },
});
