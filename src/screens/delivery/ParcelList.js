import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    ListView,
    TextInput,
    TouchableHighlight,
    RefreshControl,
    Alert,
} from 'react-native';

import styleConst from '../../constants/Style';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import * as parcelApi from '../../api/Parcel';
import * as dataStore from '../../utils/Store';

import ParcelCard from '../../components/ParcelCard';

import { ReturnProblemsPicker, HoldReasonsPicker, DamagedOrMissingModal } from '../../modals';

export default class ParcelList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parcelList: [],
            listViewData: null,
            spinner: true,
            refreshing: false,
            searchQ: null,
            selectedParcelId: undefined,
            returnProblemsPickerVisible: false,
            pickedReturnProblem: undefined,
            holdReasonsVisible: false,
            damagedOrMissingModalVisible: false,
            agent: {},
        };
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: 'Deliveries of ' + params.area,
        };
    };

    _prepareData = async () => {
        const navParams = this.props.navigation.state.params || {};
        // console.log('> navParams:', navParams);

        let {
            agentId,
            accessToken,
            agentType,
            agentHubId,
        } = await dataStore.getLoggedInUser().then((data) => JSON.parse(data));
        let [error, parcelData] = await parcelApi.fetchParcelList({
            agentId,
            agentType,
            accessToken,
            customerPhone: navParams.filterPhone,
            status: navParams.filterStatus,
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

        parcelData = [].concat(
            ...Object.keys(parcelData).map((shopId) => {
                return parcelData[shopId].parcels.map((parcel) => {
                    return {
                        ...parcel,
                        shopId: parcelData[shopId].shopId,
                        shopName: parcelData[shopId].shopName,
                        shopPhone: parcelData[shopId].shopPhone,
                        parcelShopPhone: parcelData[shopId].parcelShopPhone,
                        shopAddress: parcelData[shopId].shopAddress,
                        shopupNote: parcelData[shopId].shopupNote,
                    };
                });
            })
        );

        parcelData = parcelData.filter((parcel) => navParams.areaId == parcel.areaId);
        // console.log('> parcelData', parcelData);
        this.setState({
            parcelList: parcelData,
            listViewData: parcelData,
            spinner: false,
            agent: {
                agentId,
                accessToken,
                agentType,
                agentHubId,
            },
        });
    };

    clearSearchBox = () => {
        this.setState({
            searchQ: '',
            listViewData: this.state.parcelList,
        });
    };

    searchParcel = () => {
        let parcelList = this.state.parcelList;
        let regexp = new RegExp(this.state.searchQ, 'gi');

        parcelList = parcelList.filter((parcel) => {
            return regexp.test(parcel.customerPhone) || regexp.test(parcel.id);
        });

        if (parcelList.length > 0) {
            this.setState({ listViewData: parcelList });
        }
    };

    renderListHeader = () => {
        return (
            <View>
                <TextInput
                    style={styles.searchBox}
                    underlineColorAndroid="transparent"
                    selectionColor={styleConst.color.secondaryBackground}
                    placeholder="Search.."
                    onChangeText={(searchQ) => {
                        if (!searchQ) {
                            this.clearSearchBox();
                            return;
                        }

                        this.setState({ searchQ });
                        this.searchParcel();
                    }}
                    onSubmitEditing={this.searchParcel}
                    multiline={false}
                    value={this.state.searchQ}
                    returnKeyType={'search'}
                />
                <TouchableHighlight
                    style={styles.searchBtn}
                    underlayColor="#EEE"
                    onPress={this.clearSearchBox}
                >
                    {this.state.searchQ ? (
                        <MaterialIcons name="close" size={24} color="#566573" />
                    ) : (
                        <MaterialIcons name="search" size={24} color="#566573" />
                    )}
                </TouchableHighlight>
            </View>
        );
    };

    refreshParcels = () => {
        this.setState({ refreshing: true });
        this._prepareData().then(() => this.setState({ refreshing: false }));
    };

    componentDidMount = () => {
        this._prepareData().then(() => {
            this.setState({ spinner: false });
        });

        if (this.willFocusSubscription) return;
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            this._prepareData().then(() => {
                this.setState({ spinner: false });
            });
        });
    };

    componentWillUnmount() {
        if (this.willFocusSubscription) {
            this.willFocusSubscription.remove();
        }
    }

    setSelectedParcelId = (parcelId, callback) => {
        this.setState({ selectedParcelId: parcelId }, callback);
    };

    returnParcel = async () => {
        const { parcelList, selectedParcelId } = this.state;
        const parcel = parcelList.find((p) => p.id === selectedParcelId);
        // console.log('> returnParcel', parcel);

        try {
            let agent = await dataStore.getLoggedInUser().then(JSON.parse);
            await parcelApi.setAsReturned({
                parcelId: parcel.id,
                partnerId: parcel.partnerId,
                sourceHubId: parcel.sourceHubId,
                oldStatus: parcel.status,
                agentId: agent.agentId,
            });
            this.refreshParcels();
            Alert.alert('Successful', 'This parcel has been successfully marked as returned.');
        } catch (error) {
            console.log('returnParcel', error);
            Alert.alert('Failed', error?.body?.message);
        }
        this.setState({
            selectedParcelId: undefined,
            pickedReturnProblem: undefined,
        });
    };

    holdParcel = async (fields) => {
        const { reason, comment } = fields;
        const { parcelList, selectedParcelId } = this.state;
        const parcel = parcelList.find((p) => p.id === selectedParcelId);

        try {
            await parcelApi.setStatusWithRemarks({
                parcelId: parcel.id,
                partnerId: parcel.partnerId,
                sourceHubId: parcel.sourceHubId,
                oldStatus: parcel.status,
                remarks: comment,
                holdReason: reason,
            });
            this.refreshParcels();
            Alert.alert('Successful', 'This parcel has been successfully marked as HOLD.');
        } catch (error) {
            console.log('holdParcel', error);
            Alert.alert('Failed', error?.body?.message);
        }
        this.setState({
            selectedParcelId: undefined,
            pickedReturnProblem: undefined,
        });
    };

    damagedOrMissingParcel = async (fields) => {
        const { comment } = fields;
        const { parcelList, selectedParcelId, pickedReturnProblem } = this.state;
        const parcel = parcelList.find((p) => p.id === selectedParcelId);
        // console.log(pickedReturnProblem, fields);

        try {
            await parcelApi.setProblematicWithRemarks({
                parcelId: parcel.id,
                partnerId: parcel.partnerId,
                sourceHubId: parcel.sourceHubId,
                oldStatus: parcel.status,
                remarks: comment,
                returnReason: pickedReturnProblem,
            });
            this.refreshParcels();
            Alert.alert(
                'Successful',
                `This parcel has been successfully marked as ${pickedReturnProblem}.`
            );
        } catch (error) {
            console.log('damagedOrMissingParcel', error);
            Alert.alert('Failed', error?.body?.message);
        }
        this.setState({
            selectedParcelId: undefined,
            pickedReturnProblem: undefined,
        });
    };

    setReturnProblemsPickerVisibility = (value) => {
        this.setState({ returnProblemsPickerVisible: value });
    };
    setReturnProblem = (problem) => {
        this.setState({ pickedReturnProblem: problem });
    };

    setHoldReasonsVisibility = (value) => {
        this.setState({ holdReasonsVisible: value });
    };

    setDamagedOrMissingModalVisibility = (value) => {
        this.setState({ damagedOrMissingModalVisible: value });
    };

    render() {
        const {
            selectedParcelId,
            returnProblemsPickerVisible,
            pickedReturnProblem,
            holdReasonsVisible,
            damagedOrMissingModalVisible,
            agent,
        } = this.state;

        return (
            <View>
                {this.state.listViewData ? (
                    <FlatList
                        style={styles.list}
                        data={this.state.listViewData}
                        renderHeader={this.renderListHeader}
                        keyExtractor={(item) => `${item.id}`}
                        renderItem={({ item }) => (
                            <ParcelCard
                                logParcel={item}
                                parcel={item}
                                agentHubId={agent.agentHubId}
                                routeName="Parcel"
                                multiSelectEnabled={false}
                                navigation={this.props.navigation}
                                returnParcel={this.returnParcel}
                                selectParcel={this.setSelectedParcelId}
                                showReturnProblemsModal={(parcelId) => {
                                    this.setSelectedParcelId(parcelId, () => {
                                        this.setReturnProblemsPickerVisibility(true);
                                    });
                                }}
                            />
                        )}
                        refreshControl={
                            <RefreshControl
                                onRefresh={this.refreshParcels}
                                refreshing={this.state.refreshing}
                            />
                        }
                    />
                ) : (
                    <View></View>
                )}
                <ReturnProblemsPicker
                    isVisible={returnProblemsPickerVisible}
                    onClose={(result) => {
                        this.setReturnProblemsPickerVisibility(false);
                        if (result) {
                            this.setReturnProblem(result);
                            if (result === 'HOLD') {
                                this.setHoldReasonsVisibility(true);
                            } else if (result === 'DEFECTIVE_PRODUCT') {
                                this.setDamagedOrMissingModalVisibility(true);
                            } else if (result === 'LOST_PRODUCT') {
                                this.setDamagedOrMissingModalVisibility(true);
                            }
                        } else {
                            this.setState({
                                selectedParcelId: undefined,
                                pickedReturnProblem: undefined,
                            });
                        }
                    }}
                />
                <HoldReasonsPicker
                    isVisible={holdReasonsVisible}
                    parcelId={selectedParcelId}
                    onClose={(fields) => {
                        this.setHoldReasonsVisibility(false);
                        if (fields) {
                            this.holdParcel(fields);
                        } else {
                            this.setState({
                                selectedParcelId: undefined,
                                pickedReturnProblem: undefined,
                            });
                        }
                    }}
                />
                <DamagedOrMissingModal
                    isVisible={damagedOrMissingModalVisible}
                    parcelId={selectedParcelId}
                    problemType={pickedReturnProblem}
                    onClose={(fields) => {
                        this.setDamagedOrMissingModalVisibility(false);
                        if (fields) {
                            this.damagedOrMissingParcel(fields);
                        } else {
                            this.setState({
                                selectedParcelId: undefined,
                                pickedReturnProblem: undefined,
                            });
                        }
                    }}
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
        backgroundColor: styleConst.color.backgroundColor,
    },
    list: {
        backgroundColor: styleConst.color.defaultBackground,
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
