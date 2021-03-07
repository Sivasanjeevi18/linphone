import React, { useEffect, useState } from 'react';
import { View, Text, Modal, Button, ActivityIndicator, ToastAndroid } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './styles';
import * as userApi from '../../api/User';
import { format, getMonth, getYear, subMonths } from 'date-fns';
import DatePicker from 'react-native-modern-datepicker';

const MonthWiseEarningDetails = ({ navigation }) => {
    const agent = navigation.getParam('agent');

    const [earningDetails, setEarningDetails] = useState({});
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(getMonth(new Date())); // zero based month number
    const [year, setYear] = useState(getYear(new Date()));
    const [showMonthPicker, setMonthPicker] = useState(false);
    const [date, setDate] = useState('');
    const [btnDisable, setBtnDisable] = useState(true);

    const onMonthYearChange = (selectedDate) => {
        console.log('selectedDate', selectedDate);
        const [y, m] = selectedDate.split(' ');
        if (parseInt(m, 10) >= getMonth(new Date()) + 1) {
            ToastAndroid.showWithGravity(
                'Please select previous month',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM
            );
            setBtnDisable(true);
        } else {
            setBtnDisable(false);
        }
        setDate(selectedDate);
    };

    const submitMonthYear = () => {
        setLoading(true);
        const [y, m] = date.split(' ');
        setMonthPicker(false);
        setYear(y);
        setMonth(parseInt(m, 10));
    };

    useEffect(() => {
        const fetch = async () => {
            console.log(
                'MonthWiseEarningDetails useEffect for pickup',
                getMonth(new Date('Dec 17 2020 23:59:59 GMT+0600'))
            );
            const res = await userApi.getMonthlyEarningDetails(
                agent.agentId,
                month,
                year,
                agent.accessToken
            );
            console.log('MonthWiseEarningDetails', res);
            if (Object.keys(res).length > 0) {
                setEarningDetails({ ...res });
            } else {
                setEarningDetails({});
                ToastAndroid.showWithGravity(
                    `${agent.agentType} agent salary details for specified month not found!`,
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM
                );
            }
            setLoading(false);
            setBtnDisable(true);
        };
        fetch();
    }, [month, year]);

    return (
        <>
            <Modal
                visible={showMonthPicker}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setMonthPicker(false)}
            >
                <View style={styles.overlay}>
                    <View style={[styles.modal, { height: '70%' }]}>
                        <DatePicker
                            mode="monthYear"
                            selectorStartingYear={2020}
                            onMonthYearChange={onMonthYearChange}
                            maximumDate={format(subMonths(new Date(), 1), 'yyyy-M-d')}
                        />
                        <Button
                            title="Submit"
                            disabled={btnDisable}
                            onPress={() => submitMonthYear()}
                        />
                    </View>
                </View>
            </Modal>
            <View style={[styles.commonCard, styles.regularMarginTop]}>
                <View style={[styles.flexSpaceBetween]}>
                    <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                        {`Salary Breakdown - ${monthNames[month - 1]}`}
                    </Text>
                    <MaterialIcons
                        color="#000"
                        name="date-range"
                        size={32}
                        onPress={() => setMonthPicker(true)}
                    />
                </View>

                {loading && <ActivityIndicator />}
                {loading === false && Object.keys(earningDetails).length > 0 && (
                    <View style={styles.mediumMarginTop}>
                        <View style={styles.flexSpaceBetween}>
                            <Text style={styles.regularText}>Salary Grade</Text>
                            <Text style={[styles.boldRegularText, styles.blueTextColor]}>
                                {earningDetails.salaryGrade}
                            </Text>
                        </View>

                        <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                            <Text style={styles.regularText}>Basic Salary</Text>
                            <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                {earningDetails.basicSalary}
                            </Text>
                        </View>

                        <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                            <Text style={styles.regularText}>Bonus Payable</Text>
                            <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                {earningDetails.bonusPayable}
                            </Text>
                        </View>

                        <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                            <Text style={styles.regularText}>Working Days</Text>
                            <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                {earningDetails.workingDays}
                            </Text>
                        </View>

                        <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                            <Text style={styles.regularText}>Pickups Performed</Text>
                            <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                {earningDetails.pickUpsPerformed}
                            </Text>
                        </View>
                        <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                            <Text style={styles.regularText}>Returns Performed</Text>
                            <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                {earningDetails.returnsPerformed}
                            </Text>
                        </View>

                        <View style={[styles.flexSpaceBetween, styles.mediumMarginTop]}>
                            <Text style={styles.regularText}>Basic Salary Payable</Text>
                            <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                {earningDetails.basicPayable}
                            </Text>
                        </View>

                        <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                            <Text style={styles.regularText}>Total Earning</Text>
                            <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                {earningDetails.netAmountPayable}
                            </Text>
                        </View>
                    </View>
                )}
                {loading === false && Object.keys(earningDetails).length === 0 && (
                    <View style={styles.mediumMarginTop}>
                        <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                            <Text
                                style={styles.regularText}
                            >{`${agent.agentType} agent salary details for specified month not found!`}</Text>
                        </View>
                    </View>
                )}
            </View>
        </>
    );
};

const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

export default MonthWiseEarningDetails;
