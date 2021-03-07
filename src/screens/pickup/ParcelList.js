import React from 'react';

import {
    StyleSheet,
    View,
    Text,
    ListView,
    TextInput,
    TouchableOpacity,
    TouchableHighlight,
    RefreshControl,
    Alert,
} from 'react-native';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import styleConst from '../../constants/Style';

import Loader from '../../components/Loader';
import EmptyView from '../../components/EmptyView';
import ParcelCard from '../../components/ParcelCard';

import * as parcelApi from '../../api/Parcel';
import * as dataStore from '../../utils/Store';

export default class ParcelList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            searchQ: null,
            parcelData: [],
            listViewData: null,
            refreshing: false,
            spinner: true,
        };

        this.pickedUpParcels = [];
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};

        return {
            headerTitle: 'Pickup of ' + params.shopName,
            headerRight:
                params.checkCount > 0 ? (
                    <TouchableOpacity
                        disabled={params.pickedUpReqInProgress}
                        style={styles.headerRightBtn}
                        onPress={() => {
                            Alert.alert(
                                `Confirm parcel pickup`,
                                `You have confirmed ${params.checkCount} parcels that are ready for pickup. Are your sure?`,
                                [
                                    { text: 'Cancel' },
                                    { text: 'OK', onPress: () => params.updateParcelsStatus() },
                                ],
                                { cancelable: false }
                            );
                        }}
                    >
                        <View style={styles.headerRightContent}>
                            <Text style={styles.headerRightText}>{params.checkCount}</Text>
                            <MaterialIcons name="done" size={28} color="#FFF" />
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View></View>
                ),
        };
    };

    _prepareData = async () => {
        let navState = this.props.navigation.state;

        let { agentId, accessToken, agentType } = await dataStore
            .getLoggedInUser()
            .then((data) => JSON.parse(data));

        let [error, parcelData] = await parcelApi.fetchParcelList({
            agentId,
            agentType,
            accessToken,
            shopId: navState.params.shopId,
            status: 'pickup-in-progress',
        });

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

        // parcelData
        let parcelList = [].concat(
            ...Object.keys(parcelData).map((shopId) => {
                return parcelData[shopId].parcels.map((parcel) => {
                    return Object.assign(parcel, {
                        shopId: shopId,
                        shopName: parcelData[shopId].shopName,
                    });
                });
            })
        );

        let ds = new ListView.DataSource({
            rowHasChanged: (x, y) => x !== y,
        });

        this.setState({
            parcelData: parcelList,
            listViewData: ds.cloneWithRows(parcelList),
            spinner: false,
        });
    };

    searchParcel() {
        let parcelList = this.state.parcelData;
        let regexp = new RegExp(this.state.searchQ, 'gi');

        parcelList = parcelList.filter((parcel) => {
            return (
                regexp.test(parcel.customerPhone) ||
                regexp.test(parcel.id) ||
                regexp.test(parcel.customerName)
            );
        });

        let ds = new ListView.DataSource({ rowHasChanged: (x, y) => x !== y });
        this.setState({ listViewData: ds.cloneWithRows(parcelList) });
    }

    clearSearchBox() {
        let ds = new ListView.DataSource({
            rowHasChanged: (x, y) => x !== y,
        });

        this.setState({
            searchQ: '',
            listViewData: ds.cloneWithRows(this.state.parcelData),
        });
    }

    renderListHeader() {
        return (
            <View>
                <TextInput
                    style={styles.searchBox}
                    underlineColorAndroid="transparent"
                    selectionColor={styleConst.color.secondaryBackground}
                    placeholder="Search.."
                    onChangeText={(searchQ) => {
                        if (!searchQ.trim()) {
                            this.clearSearchBox();
                            return;
                        }

                        this.setState({ searchQ });
                        this.searchParcel();
                    }}
                    onSubmitEditing={this.searchParcel.bind(this)}
                    multiline={false}
                    value={this.state.searchQ}
                    returnKeyType={'search'}
                />
                <TouchableHighlight
                    style={styles.searchBtn}
                    onPress={this.clearSearchBox.bind(this)}
                >
                    {this.state.searchQ ? (
                        <MaterialIcons name="close" size={24} color="#566573" />
                    ) : (
                        <MaterialIcons name="search" size={24} color="#566573" />
                    )}
                </TouchableHighlight>
            </View>
        );
    }

    onRefresh = () => {
        this.setState({ refreshing: true });
        this._prepareData().then(() => this.setState({ refreshing: false }));
        this.pickedUpParcels = [];
        this.props.navigation.setParams({
            checkCount: 0,
            updateParcelsStatus: this.updateParcelsStatus,
        });
    };

    markChecked = (parcelId) => {
        let navigation = this.props.navigation;
        let parcelList = this.state.parcelData;

        for (let i = 0; i < parcelList.length; i++) {
            let parcelCheckCount = navigation.state.params.checkCount;

            if (parcelList[i].id === parcelId && parcelList[i].isChecked) {
                parcelCheckCount--;
                parcelList[i].isChecked = false;
                navigation.setParams({ checkCount: parcelCheckCount });

                if (this.pickedUpParcels.length > 0) {
                    this.pickedUpParcels.splice(this.pickedUpParcels.indexOf(parcelId), 1);
                }

                break;
            } else if (parcelList[i].id === parcelId && !parcelList[i].isChecked) {
                parcelCheckCount++;
                parcelList[i].isChecked = true;
                navigation.setParams({ checkCount: parcelCheckCount });

                this.pickedUpParcels.push(parcelId);
                break;
            }
        }

        let ds = new ListView.DataSource({ rowHasChanged: (x, y) => x !== y });
        this.setState({ listViewData: ds.cloneWithRows(parcelList) });
    };

    updateParcelsStatus = async () => {
        this.setState({ refreshing: true });

        let navigation = this.props.navigation;
        navigation.setParams({ pickedUpReqInProgress: true });

        return Promise.all([
            Promise.resolve({}), // await Location.coordinate(),
            await dataStore.getLoggedInUser(),
        ])
            .then(([locationInfo, agent]) => {
                agent = JSON.parse(agent);
                let parcels = this.pickedUpParcels.map((parcelId) => {
                    return {
                        id: parcelId,
                        status: 'picked-up',
                        latitude: locationInfo.latitude,
                        longitude: locationInfo.longitude,
                    };
                });

                return parcelApi.updateParcelsStatus(agent, parcels);
            })
            .then(() => {
                let navigation = this.props.navigation;
                navigation.setParams({ checkCount: 0 });

                let parcelList = this.state.parcelData;
                parcelList = parcelList.filter(
                    (parcel) => this.pickedUpParcels.indexOf(parcel.id) < 0
                );
                if (parcelList.length > 0) {
                    let ds = new ListView.DataSource({ rowHasChanged: (x, y) => x !== y });
                    this.setState({
                        listViewData: ds.cloneWithRows(parcelList),
                        parcelData: parcelList,
                        refreshing: false,
                    });

                    navigation.setParams({ pickedUpReqInProgress: false });
                } else navigation.navigate('PickupPoint');
            })
            .catch((error) => {
                navigation.setParams({ pickedUpReqInProgress: false });
                if (error && error.isTokenExpired) {
                    return dataStore.removeUserData().then(() => {
                        this.props.navigation.navigate('LogIn');
                        Alert.alert('Error message', error.message);
                    });
                }

                this.setState({ refreshing: true });
                Alert.alert('Error message', error.message);
            });
    };

    UNSAFE_componentWillMount = () => {
        let navigation = this.props.navigation;
        navigation.setParams({
            checkCount: 0,
            pickedUpReqInProgress: false,
            updateParcelsStatus: this.updateParcelsStatus,
        });
    };

    componentDidMount = () => {
        alert('Parcel List');
        this._prepareData().then(() => this.setState({ showLoader: false }));
    };

    render() {
        return this.state.spinner ? (
            <Loader />
        ) : (
            <View style={styles.parcelListContainer}>
                {this.state.listViewData ? (
                    <ListView
                        style={styles.list}
                        enableEmptySections={true}
                        renderHeader={this.renderListHeader.bind(this)}
                        dataSource={this.state.listViewData}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this.onRefresh.bind(this)}
                            />
                        }
                        renderRow={(parcel) => (
                            <ParcelCard parcel={parcel} markChecked={this.markChecked} />
                        )}
                    />
                ) : (
                    <EmptyView
                        refreshAction={this.onRefresh.bind(this)}
                        isRefreshing={this.state.refreshing}
                        message="No parcel left to pickup"
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
    headerRightContent: {
        display: 'flex',
        flexDirection: 'row',
    },
    headerRightText: {
        color: '#FFF',
        fontSize: 18,
        marginTop: 2,
        marginRight: 4,
    },
    parcelListContainer: {
        backgroundColor: '#FFF',
    },
    list: {
        marginTop: 0,
        backgroundColor: '#FFF',
    },
    searchBox: {
        height: 48,
        paddingLeft: 14,
        paddingTop: 6,
        paddingRight: 48,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
        fontSize: 16,
        fontFamily: styleConst.font.regular,
        backgroundColor: '#EEE',
    },
    searchBtn: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'center',
        right: 0,
        width: 42,
        height: 48,
        position: 'absolute',
    },
});
