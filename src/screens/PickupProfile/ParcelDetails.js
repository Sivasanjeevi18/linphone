import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, ToastAndroid } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './styles';
import * as dataStore from '../../utils/Store';
import * as userApi from '../../api/User';
import Loader from '../../components/Loader';
import moment from 'moment';
import { CalendarModal } from '../../components/CalendarModal';

const ParcelDetails = ({ navigation }) => {
    const [fetching, setFetching] = useState(true);
    const [fetchPickupParcel, setFetchPickupParcel] = useState(false);
    const [fetchReturnParcel, setFetchReturnParcel] = useState(false);
    const [showPickupParcelDatePicker, setPickupParcelDatePicker] = useState(false);
    const [showReturnParcelDatePicker, setReturnParcelDatePicker] = useState(false);
    const [parcelDetailsDate, setParcelDetailsDate] = useState({
        startDate: moment().subtract(1, 'day'),
        endDate: moment(),
    });
    const [parcelPaymentDate, setParcelPaymentDate] = useState({
        startDate: moment().subtract(1, 'day'),
        endDate: moment(),
    });
    const [agent, setAgentInfo] = useState({});
    const [pickupParcelDetails, setPickupParcelDetails] = useState({});
    const [returnParcelDetails, setReturnParcelDetails] = useState({});

    const [calendarState, setCalendarState] = useState({
        markedDates: {},
        isStartDatePicked: false,
        isEndDatePicked: false,
        startDate: '',
        btnDisable: true,
        startDateForSubmit: '',
        endDateForSubmit: '',
    });

    const closeCalendarModal = () => {
        setPickupParcelDatePicker(false);
        setReturnParcelDatePicker(false);
        setCalendarState({
            markedDates: {},
            isStartDatePicked: false,
            isEndDatePicked: false,
            startDate: '',
            btnDisable: true,
            startDateForSubmit: '',
            endDateForSubmit: '',
        });
    };

    const onCalendarDayPress = (day) => {
        if (calendarState.isStartDatePicked === false) {
            let markedDates = {};
            markedDates[day.dateString] = {
                startingDay: true,
                color: '#00B0BF',
                textColor: '#FFFFFF',
            };
            setCalendarState({
                markedDates: { ...markedDates },
                isStartDatePicked: true,
                isEndDatePicked: false,
                startDate: day.dateString,
                btnDisable: true,
                startDateForSubmit: '',
                endDateForSubmit: '',
            });
            console.log('start date', {
                markedDates: markedDates,
                isStartDatePicked: true,
                isEndDatePicked: false,
                startDate: day.dateString,
            });
        } else {
            let markedDates = calendarState.markedDates;
            let startDate = moment(calendarState.startDate);
            let endDate = moment(day.dateString);
            let range = endDate.diff(startDate, 'days');
            if (range > 0) {
                for (let i = 1; i <= range; i++) {
                    let tempDate = startDate.add(1, 'day');
                    tempDate = moment(tempDate).format('YYYY-MM-DD');
                    if (i < range) {
                        markedDates[tempDate] = { color: '#00B0BF', textColor: '#FFFFFF' };
                    } else {
                        markedDates[tempDate] = {
                            endingDay: true,
                            color: '#00B0BF',
                            textColor: '#FFFFFF',
                        };
                    }
                }
                setCalendarState({
                    markedDates: { ...markedDates },
                    isStartDatePicked: false,
                    isEndDatePicked: true,
                    startDate: '',
                    btnDisable: false,
                    startDateForSubmit: calendarState.startDate,
                    endDateForSubmit: day.dateString,
                });
                console.log('end date', {
                    markedDates: markedDates,
                    isStartDatePicked: false,
                    isEndDatePicked: true,
                    startDate: '',
                });
            } else {
                ToastAndroid.showWithGravity(
                    'Select an upcomming date!',
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM
                );
            }
        }
    };

    const _fetchPickupParcelDetails = async (startDate, endDate) => {
        setFetchPickupParcel(true);
        closeCalendarModal();
        const from = moment(startDate).startOf('day').unix() * 1000;
        const to = moment(endDate).endOf('day').unix() * 1000;
        setParcelDetailsDate({
            startDate: from,
            endDate: to,
        });
        const details = await userApi.getPickupAgentPickupDetails(
            agent.agentId,
            from,
            to,
            agent.accessToken
        );
        setPickupParcelDetails({ ...details });
        setFetchPickupParcel(false);
    };

    const _fetchReturnParcelDetails = async (startDate, endDate) => {
        setFetchReturnParcel(true);
        closeCalendarModal();
        const from = moment(startDate).startOf('day').unix() * 1000;
        const to = moment(endDate).endOf('day').unix() * 1000;
        setParcelPaymentDate({
            startDate: from,
            endDate: to,
        });
        const details = await userApi.getPickupAgentReturnDetails(
            agent.agentId,
            from,
            to,
            agent.accessToken
        );
        setReturnParcelDetails({ ...details });
        setFetchReturnParcel(false);
    };

    useEffect(() => {
        const startDate = moment().subtract(1, 'day').startOf('day').unix() * 1000;
        const endDate = moment().endOf('day').unix() * 1000;
        const fetch = async () => {
            const ag = await dataStore.getLoggedInUser();
            const agentInfo = JSON.parse(ag);
            setAgentInfo({ ...agentInfo });
            const [pickupDetails, returnDetails] = await Promise.all([
                userApi.getPickupAgentPickupDetails(
                    agentInfo.agentId,
                    startDate,
                    endDate,
                    agentInfo.accessToken
                ),
                userApi.getPickupAgentReturnDetails(
                    agentInfo.agentId,
                    startDate,
                    endDate,
                    agentInfo.accessToken
                ),
            ]);
            setPickupParcelDetails({ ...pickupDetails });
            setReturnParcelDetails({ ...returnDetails });
            setFetching(false);
        };
        fetch();
    }, []);
    return (
        <View style={styles.mainContainer}>
            <CalendarModal
                visible={showPickupParcelDatePicker}
                onClose={closeCalendarModal}
                onCalendarDayPress={onCalendarDayPress}
                calendarStates={calendarState}
                onSubmit={_fetchPickupParcelDetails}
            />
            <CalendarModal
                visible={showReturnParcelDatePicker}
                onClose={closeCalendarModal}
                onCalendarDayPress={onCalendarDayPress}
                calendarStates={calendarState}
                onSubmit={_fetchReturnParcelDetails}
            />

            {fetching && <Loader />}

            {!fetching && (
                <ScrollView>
                    <View style={[styles.commonCard, styles.mediumMarginTop]}>
                        <View style={[styles.flexSpaceBetween]}>
                            <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                Pickup Count
                            </Text>
                            <MaterialIcons
                                color="#000"
                                name="date-range"
                                size={32}
                                onPress={() => setPickupParcelDatePicker(true)}
                            />
                        </View>

                        <View style={styles.smallTopMargin}>
                            <Text style={[styles.redTextColor, styles.extraSmallText]}>
                                {`${moment(parcelDetailsDate.startDate).format('LL')} - ${moment(
                                    parcelDetailsDate.endDate
                                ).format('LL')}`}
                            </Text>
                        </View>

                        {fetchPickupParcel && <ActivityIndicator />}

                        {!fetchPickupParcel && (
                            <View style={styles.mediumMarginTop}>
                                <View style={styles.flexSpaceBetween}>
                                    <Text style={styles.regularText}>Pickup Assigned</Text>
                                    <Text style={[styles.boldRegularText, styles.blueTextColor]}>
                                        {pickupParcelDetails.pickup_assigned || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>In Progress</Text>
                                    <Text style={[styles.boldRegularText, styles.orangeTextColor]}>
                                        {pickupParcelDetails.in_progress || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Picked Up</Text>
                                    <Text style={[styles.boldRegularText, styles.greenTextColor]}>
                                        {pickupParcelDetails.picked_up || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Merchant Canceled</Text>
                                    <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                        {pickupParcelDetails.merchant_canceled || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Merchant Postponed</Text>
                                    <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                        {pickupParcelDetails.merchant_postponed || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Merchant Unavailable</Text>
                                    <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                        {pickupParcelDetails.merchant_unavailable || '0'}
                                    </Text>
                                </View>
                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>RedX Canceled</Text>
                                    <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                        {pickupParcelDetails.redx_canceled || '0'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.commonCard}>
                        <View style={[styles.flexSpaceBetween]}>
                            <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                Return Count
                            </Text>
                            <MaterialIcons
                                color="#000"
                                name="date-range"
                                size={32}
                                onPress={() => setReturnParcelDatePicker(true)}
                            />
                        </View>

                        <View style={styles.smallTopMargin}>
                            <Text style={[styles.redTextColor, styles.extraSmallText]}>
                                {`${moment(parcelPaymentDate.startDate).format('LL')} - ${moment(
                                    parcelPaymentDate.endDate
                                ).format('LL')}`}
                            </Text>
                        </View>

                        {fetchReturnParcel && <ActivityIndicator />}

                        {!fetchReturnParcel && (
                            <View style={styles.mediumMarginTop}>
                                <View style={styles.flexSpaceBetween}>
                                    <Text style={styles.regularText}>Total Assigned</Text>
                                    <Text style={[styles.boldRegularText, styles.blueTextColor]}>
                                        {returnParcelDetails.total_parcels || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>In Progress</Text>
                                    <Text style={[styles.boldRegularText, styles.orangeTextColor]}>
                                        {returnParcelDetails.in_progress || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Returned</Text>
                                    <Text style={[styles.boldRegularText, styles.greenTextColor]}>
                                        {returnParcelDetails.returned || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Hold</Text>
                                    <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                        {returnParcelDetails.hold || '0'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

export default ParcelDetails;
