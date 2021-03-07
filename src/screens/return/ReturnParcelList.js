import React from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    Button,
    TextInput,
    TouchableHighlight,
    RefreshControl,
    Alert,
} from 'react-native';

import styleConst from '../../constants/Style';
import { MaterialIcons } from '@expo/vector-icons';

import * as parcelApi from '../../api/Parcel';
import * as dataStore from '../../utils/Store';

import ReturnParcelCard from '../../components/ReturnParcelCard';
import Call from '../../components/Call';

import { ReturnProblemsPicker, HoldReasonsPicker, DamagedOrMissingModal } from '../../modals';
import { ReturnModal } from '../../modals/ReturnModal';

export default class ReturnParcelList extends React.Component {
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
            multiSelectEnabled: false,
            pendingParcels: [],
            parcelCount: 0,
            selectedParcels: {},
            returnOTPModalVisible: false,
            returnParcelStatusChanging: false,
            returnOTPSending: false,
            returnOtpError: '',
            agent: {},
            merchantType: '',
            otpTimer: 0,
            intervalID: undefined,
            returnOtpNumber: '',
        };
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        // console.log('params', params);
        // const multiSelectEnabled = navigation.getParam('multiSelectEnabled');
        return {
            headerTitle: `Returns of ${params.shop.slice(0, 20)} ${
                params.shop.length > 20 ? '...' : ''
            }`,
            // headerRight: multiSelectEnabled ? (
            //     <CustomButtom title="Select All" onPress={navigation.getParam('selectAll')} />
            // ) : null,
            // headerRightContainerStyle: {
            //     paddingRight: 10,
            // },
        };
    };

    _prepareData = async () => {
        const {
            filterPhone,
            filterStatus,
            shopStoreId
        } = this.props.navigation.state.params || {};
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
            customerPhone: filterPhone,
            status: filterStatus,
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

        console.log('parcelData', parcelData);

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
                        parcelCategories: parcel.parcelCategories,
                        merchantType: parcelData[shopId].merchantType,
                    };
                });
            })
        );

        parcelData = parcelData.filter((parcel) => shopStoreId == parcel.shopStoreId);

        this.setState({ merchantType: parcelData[0].merchantType });

        const pendingParcels = parcelData.filter(
            (parcel) => parcelApi.isOnFinalStage(parcel.status) === false
        );
        // this.props.navigation.setParams({
        //     selectAll: this._selectAll,
        //     multiSelectEnabled: pendingParcels.length > 0 ? true : false,
        // });
        // console.log('> parcelData', parcelData);
        this.setState({
            parcelList: parcelData,
            listViewData: parcelData,
            spinner: false,
            multiSelectEnabled: pendingParcels.length > 0 ? true : false,
            pendingParcels,
            selectedParcels: {},
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
    };

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

    _selectParcel = async (id, status) => {
        const { selectedParcels, parcelList } = this.state;
        const updatedSelectedParcels = { ...selectedParcels, [id]: status };
        const parcelsForReturn = await parcelList.filter(
            (parcel) => updatedSelectedParcels[parcel.id] === true
        );
        await this.setState(() => ({
            selectedParcels: updatedSelectedParcels,
            parcelCount: parcelsForReturn.length,
        }));
    };

    _selectAll = () => {
        let selectedParcels = {};
        for (const parcel of this.state.pendingParcels) {
            selectedParcels = { ...selectedParcels, [parcel.id]: true };
        }
        this.setState({
            selectedParcels,
            parcelCount: Object.keys(selectedParcels).length,
        });
    };

    _closeReturnOtpModal = () => {
        clearInterval(this.state.intervalID);
        this.setState({
            returnOTPModalVisible: false,
            returnOtpError: '',
            returnOTPSending: false,
            otpTimer: 30,
        });
    };

    _call = (merchantPhoneNumber) => {
        try {
            Call.call(merchantPhoneNumber);
        } catch (error) {
            console.log('Call error', error);
        }
    };

    _startOtpTimer = () => {
        if (this.state.otpTimer > 0) {
            this.setState({ otpTimer: this.state.otpTimer - 1 });
        }
    };

    _sendMerchantReturnOTP = async () => {
        const { navigation } = this.props;
        const { agent, parcelCount } = this.state;

        const shopId = navigation.getParam('shopId');
        const shopStoreId = navigation.getParam('shopStoreId');

        this.setState({ returnOTPModalVisible: true });
        
        console.log(`agent.agentId ${agent.agentId} , shopId ${shopId}`);

        const res = await parcelApi.sendMerchantReturnOtp({
            shopId,
            shopStoreId,
            agentId: agent.agentId,
            parcelCount
        });
        
        if (this.state.intervalID) {
            clearInterval(this.state.intervalID);
        }

        const _intervalId = setInterval(this._startOtpTimer, 1000);

        this.setState({
            returnOtpError: res.isError ? 'Could not send otp' : '',
            returnOTPSending: false,
            otpTimer: 30,
            intervalID: _intervalId,
            returnOtpNumber: res.phoneNumber,
        });
    };

    _openReturnModal = async () => {
        if (this.state.merchantType === 'document') {
            this._submitParcelsForReturn();
        } else {
            this.setState({ returnOTPModalVisible: true });
            await this._sendMerchantReturnOTP();
        }
    };

    _openReturnAlert = () => {
        const { parcelCount } = this.state;
        Alert.alert(
            `Returning ${parcelCount} parcel${parcelCount > 1 ? 's' : ''}!`,
            'An OTP will be sent to merchant phone. Please input it in the next page to successfully return the parcels',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'OK', onPress: () => this._openReturnModal() },
            ],
            { cancelable: false }
        );
    };

    _submitParcelsForReturn = async () => {
        this.setState({ returnParcelStatusChanging: false });
        const { selectedParcels, parcelList, agent, parcelCount } = this.state;
        const parcelsForReturn = await parcelList
            .filter((parcel) => selectedParcels[parcel.id] === true)
            .map((parcel) => ({
                id: parcel.id,
                currentStatus: 'agent-returned',
                oldStatus: parcel.status,
                currentPartnerId: 3,
                sourceHubId: agent.agentHubId,
            }));

        try {
            await parcelApi.bulkReturn(parcelsForReturn);
            Alert.alert(
                'Successful',
                `${parcelCount} parcel${
                    parcelCount > 0 ? 's' : ''
                } has been successfully marked as returned.`
            );
            this.setState({
                returnParcelStatusChanging: false,
                returnOTPModalVisible: false,
                parcelCount: 0,
            });
            this.refreshParcels();
        } catch (error) {
            Alert.alert('Failed', error?.body?.message);
            this.setState({ returnParcelStatusChanging: false, returnOTPModalVisible: false });
        }
    };

    _submitReturnOTP = async ({ shopId, otp, shopStoreId }) => {
        this.setState({ returnOTPSending: true });
        const res = await parcelApi.verifyMerchantReturnOtp({
            shopId: `${shopId}`,
            otp,
            shopStoreId: `${shopStoreId}`
        });

        if (res.isVerified) {
            await this._submitParcelsForReturn();
            return;
        }

        if (res.isError) {
            this.setState({
                returnOtpError: res.message || 'Something went wrong',
                returnOTPSending: false,
            });
            return;
        }

        if (res.isVerified === false) {
            this.setState({
                returnOtpError: 'OTP is incorrect, please input valid OTP',
                returnOTPSending: false,
            });
            return;
        }
        this.setState({
            returnOtpError: 'Something went wrong',
            returnOTPSending: false,
        });
    };

    render() {
        const {
            selectedParcelId,
            returnProblemsPickerVisible,
            pickedReturnProblem,
            holdReasonsVisible,
            damagedOrMissingModalVisible,
            agent,
            returnOTPModalVisible,
            returnParcelStatusChanging,
            returnOTPSending,
            returnOtpError,
            parcelCount,
            returnOtpNumber,
            otpTimer,
        } = this.state;

        return (
            <View style={styles.container}>
                {this.state.listViewData ? (
                    <FlatList
                        style={styles.list}
                        data={this.state.listViewData}
                        renderHeader={this.renderListHeader}
                        keyExtractor={(item) => `${item.id}`}
                        renderItem={({ item }) => (
                            <ReturnParcelCard
                                logParcel={item}
                                parcel={item}
                                routeName="ReturnParcelDetails"
                                multiSelectEnabled={this.state.multiSelectEnabled}
                                isSelected={this.state.selectedParcels[item.id] || false}
                                onSelect={this._selectParcel}
                                agentHubId={agent.agentHubId}
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
                <ReturnModal
                    isVisible={returnOTPModalVisible}
                    isBusy={returnParcelStatusChanging}
                    sendingOTP={returnOTPSending}
                    shopId={this.props.navigation.getParam('shopId')}
                    shopStoreId={this.props.navigation.getParam('shopStoreId')}
                    shopPhone={this.props.navigation.getParam('shopPhone')}
                    callMerchant={this._call}
                    closeModal={this._closeReturnOtpModal}
                    sendOtp={this._sendMerchantReturnOTP}
                    error={returnOtpError}
                    submitOTP={this._submitReturnOTP}
                    parcelCount={parcelCount}
                    otpTimer={otpTimer}
                    returnOtpNumber={returnOtpNumber}
                />

                {this.state.multiSelectEnabled && (
                    <View style={styles.btnsWrapper}>
                        <View style={[styles.selctAllBtn]}>
                            <Button
                                title="Select All"
                                color="#22313F"
                                onPress={() => this._selectAll()}
                            />
                        </View>
                        <View style={[styles.returnBtn]}>
                            <Button
                                title="RETURN"
                                color="#00A1B3"
                                disabled={parcelCount === 0}
                                onPress={() => this._openReturnAlert()}
                            />
                        </View>
                    </View>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: styleConst.color.backgroundColor,
    },
    headerRightBtn: {
        marginRight: 16,
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
    btnsWrapper: {
        flexDirection: 'row',
        width: '100%',
    },
    selctAllBtn: {
        width: '40%',
    },
    returnBtn: {
        width: '60%',
    },
});
