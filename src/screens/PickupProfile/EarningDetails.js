import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import styles from './styles';
import * as dataStore from '../../utils/Store';
import * as userApi from '../../api/User';
import Loader from '../../components/Loader';

const EarningDetails = ({ navigation }) => {
    const [fetching, setFetching] = useState(true);
    const [isGradeModalOpen, setGradeModalOpen] = useState(false);
    const [currentEarningDetails, setCurrentEarningDetails] = useState({});
    const [gradeSettings, setGradeSettings] = useState({});
    const [agent, setAgentInfo] = useState({});

    const closeGradeModal = () => {
        setGradeModalOpen(false);
    };

    const _gotoPayslipsDetails = () => {
        navigation.navigate('PayslipsDetails');
    };

    const _gotoMonthlyEarningDetails = () => {
        navigation.navigate('MonthWiseEarningDetails', { agent });
    };

    useEffect(() => {
        const fetch = async () => {
            console.log('EarningDetails useEffect for pickup');
            const ag = await dataStore.getLoggedInUser();
            const agentInfo = JSON.parse(ag);
            setAgentInfo({ ...agentInfo });
            const res = await Promise.all([
                userApi.getEarningDetails(agentInfo.agentId, agentInfo.accessToken),
                userApi.getGradeSettings(agentInfo.agentId, agentInfo.accessToken),
            ]);
            console.log('EarningDetails', res);
            setCurrentEarningDetails({ ...res[0] });
            setGradeSettings({ ...res[1] });
            setFetching(false);
        };
        fetch();
    }, []);

    return (
        <View style={styles.mainContainer}>
            {!fetching && (
                <GradeModal
                    isModalOpen={isGradeModalOpen}
                    onModalClose={closeGradeModal}
                    gradeSettings={gradeSettings}
                />
            )}

            {fetching && <Loader />}

            {!fetching && (
                <ScrollView>
                    <View style={[styles.commonCard, styles.mediumMarginTop]}>
                        <View style={[styles.flexSpaceBetween]}>
                            <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                Grade Breakdown
                            </Text>
                            <TouchableOpacity onPress={() => setGradeModalOpen(true)}>
                                <MaterialIcons color="#000" name="info" size={32} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            contentContainerStyle={styles.tableContainer}
                            showsHorizontalScrollIndicator={true}
                            horizontal={true}
                            persistentScrollbar={true}
                        >
                            <View style={styles.tableWrapper}>
                                <View style={[styles.row, styles.regularMarginBottom]}>
                                    <View style={styles.bigCell}>
                                        <Text
                                            style={[styles.boldRegularText, styles.blackTextColor]}
                                        >
                                            Details
                                        </Text>
                                    </View>

                                    <View style={styles.normalCell}>
                                        <Text
                                            style={[styles.boldRegularText, styles.blackTextColor]}
                                        >
                                            Archived
                                        </Text>
                                    </View>

                                    <View style={styles.smallCell}>
                                        <Text style={[styles.regularText]} />
                                    </View>

                                    <View style={styles.normalCell}>
                                        <Text
                                            style={[styles.boldRegularText, styles.blackTextColor]}
                                        >
                                            Weight
                                        </Text>
                                    </View>

                                    <View style={styles.smallCell}>
                                        <Text style={[styles.regularText]} />
                                    </View>

                                    <View style={styles.normalCell}>
                                        <Text
                                            style={[styles.boldRegularText, styles.blackTextColor]}
                                        >
                                            Points
                                        </Text>
                                    </View>
                                </View>

                                {currentEarningDetails.gradeBreakDown.length > 0 &&
                                    currentEarningDetails.gradeBreakDown.map(
                                        ({ details, achieved, weight, points }) => (
                                            <View
                                                style={[styles.row, styles.regularMarginBottom]}
                                                key={details}
                                            >
                                                <View style={styles.bigCell}>
                                                    <Text style={[styles.regularText]}>
                                                        {details}
                                                    </Text>
                                                </View>
                                                <View style={styles.normalCell}>
                                                    <Text style={[styles.regularText]}>
                                                        {achieved}
                                                    </Text>
                                                </View>
                                                <View style={styles.smallCell}>
                                                    <Text style={[styles.regularText]}>x</Text>
                                                </View>
                                                <View style={styles.normalCell}>
                                                    <Text style={[styles.regularText]}>
                                                        {weight}
                                                    </Text>
                                                </View>
                                                <View style={styles.smallCell}>
                                                    <Text style={[styles.regularText]}>=</Text>
                                                </View>
                                                <View style={styles.normalCell}>
                                                    <Text style={[styles.regularText]}>
                                                        {points}
                                                    </Text>
                                                </View>
                                            </View>
                                        )
                                    )}
                            </View>
                        </ScrollView>

                        <View style={[styles.flexSpaceBetween, styles.mediumMarginTop]}>
                            <Text style={[styles.boldRegularText, styles.blackTextColor]}>
                                Total Points Earned
                            </Text>
                            <Text style={styles.regularText}>
                                {currentEarningDetails.totalPointsEarned}
                            </Text>
                        </View>

                        <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                            <Text style={[styles.boldRegularText, styles.blackTextColor]}>
                                Grade
                            </Text>
                            <Text style={styles.regularText}>{currentEarningDetails.grade}</Text>
                        </View>
                    </View>

                    <View style={[styles.commonCard, styles.regularMarginTop]}>
                        <View style={[styles.flexSpaceBetween]}>
                            <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                Salary Breakdown
                            </Text>
                        </View>

                        <View style={styles.mediumMarginTop}>
                            <View style={styles.flexSpaceBetween}>
                                <Text style={styles.regularText}>Salary Grade</Text>
                                <Text style={[styles.boldRegularText, styles.blueTextColor]}>
                                    {currentEarningDetails.salaryBreakDown.salaryGrade}
                                </Text>
                            </View>

                            <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                <Text style={styles.regularText}>Basic Salary</Text>
                                <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                    {currentEarningDetails.salaryBreakDown.basicSalary}
                                </Text>
                            </View>

                            <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                <Text style={styles.regularText}>Bonus Payable</Text>
                                <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                    {currentEarningDetails.salaryBreakDown.bonusPayable}
                                </Text>
                            </View>

                            <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                <Text style={styles.regularText}>Working Days</Text>
                                <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                    {currentEarningDetails.salaryBreakDown.workingDays}
                                </Text>
                            </View>

                            <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                <Text style={styles.regularText}>Pickups Performed</Text>
                                <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                    {currentEarningDetails.salaryBreakDown.pickUpsPerformed}
                                </Text>
                            </View>
                            <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                <Text style={styles.regularText}>Returns Performed</Text>
                                <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                    {currentEarningDetails.salaryBreakDown.returnsPerformed}
                                </Text>
                            </View>

                            <View style={[styles.flexSpaceBetween, styles.mediumMarginTop]}>
                                <Text style={styles.regularText}>Basic Salary Payable</Text>
                                <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                    {currentEarningDetails.salaryBreakDown.basicPayable}
                                </Text>
                            </View>

                            <View style={[styles.flexSpaceBetween, styles.regularMarginTop]}>
                                <Text style={styles.regularText}>Total Earning</Text>
                                <Text style={[styles.boldRegularText, styles.redTextColor]}>
                                    {currentEarningDetails.salaryBreakDown.netAmountPayable}
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* TODO: After fist version */}
                    {/* <View style={[styles.commonCard, styles.regularMarginTop]}>
                    <View style={[styles.flexSpaceBetween]}>
                        <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                            View Payslips
                        </Text>
                        <TouchableOpacity onPress={() => _gotoPayslipsDetails()}>
                            <Text style={[styles.boldSmallText, styles.tealTextColor]}>
                                {'Details >'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View> */}
                    <View style={[styles.commonCard, styles.regularMarginTop]}>
                        <View style={[styles.flexSpaceBetween]}>
                            <Text>Monthly Salary Breakdown</Text>
                            <TouchableOpacity onPress={() => _gotoMonthlyEarningDetails()}>
                                <Text style={[styles.boldSmallText, styles.tealTextColor]}>
                                    {'Details >'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const GradeModal = ({ isModalOpen, onModalClose, gradeSettings }) => {
    return (
        <Modal
            visible={isModalOpen}
            animationType="slide"
            transparent={true}
            onRequestClose={() => onModalClose()}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <View style={[styles.flexSpaceBetween, styles.mediumMarginBottom]}>
                        <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                            {gradeSettings.zone}
                        </Text>
                        <TouchableOpacity onPress={() => onModalClose()}>
                            <MaterialIcons color="#000" name="close" size={32} />
                        </TouchableOpacity>
                    </View>
                    <ScrollView
                        contentContainerStyle={[styles.tableContainer]}
                        showsHorizontalScrollIndicator={true}
                        horizontal={true}
                        persistentScrollbar={true}
                    >
                        <View style={styles.tableWrapper}>
                            <View style={[styles.row, styles.regularMarginBottom]}>
                                <View style={styles.normalCell}>
                                    <Text style={[styles.boldRegularText, styles.blackTextColor]}>
                                        Grade
                                    </Text>
                                </View>

                                <View style={styles.normalCell}>
                                    <Text style={[styles.boldRegularText, styles.blackTextColor]}>
                                        Range(%)
                                    </Text>
                                </View>

                                <View style={styles.normalCell}>
                                    <Text style={[styles.boldRegularText, styles.blackTextColor]}>
                                        Basic
                                    </Text>
                                </View>

                                <View style={styles.bigCell}>
                                    <Text style={[styles.boldRegularText, styles.blackTextColor]}>
                                        Bonus
                                    </Text>
                                </View>
                            </View>

                            {gradeSettings.gradeSlabs.length > 0 &&
                                gradeSettings.gradeSlabs.map(({ grade, range, basic, bonus }) => (
                                    <View
                                        style={[styles.row, styles.regularMarginBottom]}
                                        key={grade}
                                    >
                                        <View style={styles.normalCell}>
                                            <Text style={[styles.regularText]}>{grade}</Text>
                                        </View>
                                        <View style={styles.normalCell}>
                                            <Text style={[styles.regularText]}>{range}</Text>
                                        </View>
                                        <View style={styles.normalCell}>
                                            <Text style={[styles.regularText]}>{basic}</Text>
                                        </View>
                                        <View style={styles.bigCell}>
                                            <Text style={[styles.regularText]}>{bonus}</Text>
                                        </View>
                                    </View>
                                ))}
                        </View>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default EarningDetails;
