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
    const [fetchParcel, setFetchParcel] = useState(false);
    const [fetchPayment, setFetchPayment] = useState(false);
    const [showParcelSummaryDatePicker, setParcelSummaryDatePicker] = useState(false);
    const [showParcelPaymentDatePicker, setParcelPaymentDatePicker] = useState(false);
    const [parcelDetailsDate, setParcelDetailsDate] = useState({
        startDate: moment().subtract(1, 'day'),
        endDate: moment(),
    });
    const [parcelPaymentDate, setParcelPaymentDate] = useState({
        startDate: moment().subtract(1, 'day'),
        endDate: moment(),
    });
    const [agent, setAgentInfo] = useState({});
    const [dateRangeParcelDetails, setDateRangeParcelDetails] = useState({});
    const [dateRangeParcelPaymentDetails, setDateRangeParcelPaymentDetails] = useState({});

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
        setParcelSummaryDatePicker(false);
        setParcelPaymentDatePicker(false);
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

    const _fetchParcelDetails = async (startDate, endDate) => {
        setFetchParcel(true);
        closeCalendarModal();
        const from = moment(startDate).startOf('day').unix() * 1000;
        const to = moment(endDate).endOf('day').unix() * 1000;
        setParcelDetailsDate({
            startDate: from,
            endDate: to,
        });
        const details = await userApi.getParcelSummary(agent.agentId, from, to, agent.accessToken);
        setDateRangeParcelDetails({ ...details });
        setFetchParcel(false);
    };

    const _fetchPaymentDetails = async (startDate, endDate) => {
        setFetchPayment(true);
        closeCalendarModal();
        const from = moment(startDate).startOf('day').unix() * 1000;
        const to = moment(endDate).endOf('day').unix() * 1000;
        setParcelPaymentDate({
            startDate: from,
            endDate: to,
        });
        const details = await userApi.getParcelSummary(agent.agentId, from, to, agent.accessToken);
        setDateRangeParcelPaymentDetails({ ...details });
        setFetchPayment(false);
    };

    useEffect(() => {
        const startDate = moment().subtract(1, 'day').startOf('day').unix() * 1000;
        const endDate = moment().endOf('day').unix() * 1000;
        const fetch = async () => {
            const ag = await dataStore.getLoggedInUser();
            const agentInfo = JSON.parse(ag);
            setAgentInfo({ ...agentInfo });
            const details = await userApi.getParcelSummary(
                agentInfo.agentId,
                startDate,
                endDate,
                agentInfo.accessToken
            );

            setDateRangeParcelDetails({ ...details });
            setDateRangeParcelPaymentDetails({ ...details });
            setFetching(false);
        };
        fetch();
    }, []);
    return (
        <View style={styles.mainContainer}>
            <CalendarModal
                visible={showParcelSummaryDatePicker}
                onClose={closeCalendarModal}
                onCalendarDayPress={onCalendarDayPress}
                calendarStates={calendarState}
                onSubmit={_fetchParcelDetails}
            />
            <CalendarModal
                visible={showParcelPaymentDatePicker}
                onClose={closeCalendarModal}
                onCalendarDayPress={onCalendarDayPress}
                calendarStates={calendarState}
                onSubmit={_fetchPaymentDetails}
            />

            {fetching && <Loader />}

            {!fetching && (
                <ScrollView>
                    <View style={[styles.commonCard, styles.mediumMarginTop]}>
                        <View style={[styles.flexSpaceBetween]}>
                            <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                Parcel Summary
                            </Text>
                            <MaterialIcons
                                color="#000"
                                name="date-range"
                                size={32}
                                onPress={() => setParcelSummaryDatePicker(true)}
                            />
                        </View>

                        <View style={styles.smallTopMargin}>
                            <Text style={[styles.redTextColor, styles.extraSmallText]}>
                                {`${moment(parcelDetailsDate.startDate).format('LL')} - ${moment(
                                    parcelDetailsDate.endDate
                                ).format('LL')}`}
                            </Text>
                        </View>

                        {fetchParcel && <ActivityIndicator />}

                        {!fetchParcel && (
                            <View style={styles.mediumMarginTop}>
                                <View style={styles.flexSpaceBetween}>
                                    <Text style={styles.regularText}>Parcel Assigned</Text>
                                    <Text style={[styles.boldRegularText, styles.blueTextColor]}>
                                        {dateRangeParcelDetails.TOTAL_PARCELS || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>In Progress</Text>
                                    <Text style={[styles.boldRegularText, styles.orangeTextColor]}>
                                        {dateRangeParcelDetails.IN_PROGRESS || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Delivered</Text>
                                    <Text style={[styles.boldRegularText, styles.greenTextColor]}>
                                        {dateRangeParcelDetails.DELIVERED || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Hold</Text>
                                    <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                        {dateRangeParcelDetails.HOLD || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Return</Text>
                                    <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                        {dateRangeParcelDetails.RETURNING || '0'}
                                    </Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={styles.commonCard}>
                        <View style={[styles.flexSpaceBetween]}>
                            <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                Payment
                            </Text>
                            <MaterialIcons
                                color="#000"
                                name="date-range"
                                size={32}
                                onPress={() => setParcelPaymentDatePicker(true)}
                            />
                        </View>

                        <View style={styles.smallTopMargin}>
                            <Text style={[styles.redTextColor, styles.extraSmallText]}>
                                {`${moment(parcelPaymentDate.startDate).format('LL')} - ${moment(
                                    parcelPaymentDate.endDate
                                ).format('LL')}`}
                            </Text>
                        </View>

                        {fetchPayment && <ActivityIndicator />}

                        {!fetchPayment && (
                            <View style={styles.mediumMarginTop}>
                                <View style={styles.flexSpaceBetween}>
                                    <Text style={styles.regularText}>Total Parcel Value</Text>
                                    <Text style={[styles.boldRegularText, styles.blueTextColor]}>
                                        {dateRangeParcelPaymentDetails.TOTAL_CASH || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Hold Parcel Value</Text>
                                    <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                        {dateRangeParcelPaymentDetails.HOLD_CASH || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Return Parcel Value</Text>
                                    <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                        {dateRangeParcelPaymentDetails.RETURNING_CASH || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                    <Text style={styles.regularText}>Delivered Parcel Value</Text>
                                    <Text style={[styles.boldRegularText, styles.greenTextColor]}>
                                        {dateRangeParcelPaymentDetails.DELIVERED_CASH || '0'}
                                    </Text>
                                </View>

                                <View style={[styles.flexSpaceBetween, styles.mediumMarginTop]}>
                                    <Text style={[styles.boldRegularText, styles.blackTextColor]}>
                                        Cash to Pay
                                    </Text>
                                    <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                        {dateRangeParcelPaymentDetails.DELIVERED_CASH || '0'}
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
