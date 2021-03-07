import React from 'react';
import {
    View,
    Text,
    Image,
    Button,
    TouchableOpacity,
    Alert,
    StyleSheet,
    ScrollView,
} from 'react-native';

import * as dataStore from '../../utils/Store';

import { Ionicons } from '@expo/vector-icons';
import * as userApi from '../../api/User';
import styles from './styles';

import Loader from '../../components/Loader';
import Segment from '../../utils/Segment';

import demoImage from '../../../assets/img/demo-profile.png';
import { capitalizeFirstLetter } from '../../utils/capitalizeFirstLetter';
import { format } from 'date-fns';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            spinner: true,
            user: null,
            today: '',
            pickupAgentSummary: {},
            currentEarningSummary: {},
        };

        this.willFocusSubscription = null;
    }

    static navigationOptions = ({ navigation }) => {
        const params = navigation.state.params || {};
        return {
            headerTitle: 'Profile',
        };
    };

    getUserProfile = async () => {
        const today = format(new Date(), 'do LLL YYY');
        const ag = await dataStore.getLoggedInUser();
        const agent = JSON.parse(ag);
        const [currentEarningSummary, pickupAgentSummary] = await Promise.all([
            userApi.getEarningSummary(agent.agentId, agent.accessToken),
            userApi.getPickupAgentSummary(agent.agentId, agent.accessToken),
        ]);
        this.setState({
            user: {
                facebookId: agent.facebookId,
                name: agent.name,
                agentType: agent.agentType,
                hubName: agent.agentHubName,
            },
            currentEarningSummary,
            pickupAgentSummary,
            today,
            spinner: false,
        });
    };

    logout = async () => {
        Segment.logout();
        await dataStore.removeUserData().then(() => this.props.navigation.navigate('LogIn'));
    };

    UNSAFE_componentWillMount = () => {
        this.props.navigation.setParams({
            getUserProfile: this.getUserProfile,
        });
    };

    componentDidMount = () => {
        this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
            this.getUserProfile();
        });
    };

    _gotoParcelDetails = () => {
        this.props.navigation.navigate('ParcelDetails');
    };

    _gotoEarningDetails = () => {
        this.props.navigation.navigate('EarningDetails');
    };

    render() {
        const { spinner, user, currentEarningSummary, pickupAgentSummary, today } = this.state;
        const isCurrentEarningSummaryAvailable = Object.keys(currentEarningSummary).length > 0;
        const isPickupAgentSummaryAvailable = Object.keys(pickupAgentSummary).length > 0;

        return spinner ? (
            <Loader />
        ) : (
            <>
                <ScrollView style={styles.mainContainer}>
                    <View style={styles.profileContainer}>
                        <View style={styles.profileImageContainer}>
                            <Image source={demoImage} style={styles.profileImage} />
                            <View style={styles.iconContainer}>
                                <Ionicons name="ios-camera" size={24} color="#fff" />
                            </View>
                        </View>
                        <Text style={styles.profileName}>{user.name}</Text>
                        <View style={[styles.flexCenter, styles.flexDirectionRow]}>
                            <Text style={styles.mutedSmallText}>
                                {capitalizeFirstLetter(user.agentType)}
                            </Text>
                            <View style={styles.borderRight} />
                            <Text style={styles.mutedSmallText}>{user.hubName || ''}</Text>
                        </View>
                    </View>

                    <View style={[styles.commonCard, styles.flexSpaceBetween]}>
                        <View style={styles.flexCenter}>
                            <Text style={[styles.boldHeadingText, styles.greenTextColor]}>
                                {currentEarningSummary.averageRating || 'N/A'}
                            </Text>
                            <Text style={styles.mutedSmallText}>Agent Rating</Text>
                        </View>

                        <View style={styles.flexCenter}>
                            <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                {currentEarningSummary.successRate || 'N/A'}
                            </Text>
                            <Text style={styles.mutedSmallText}>Success Rate</Text>
                        </View>

                        <View style={styles.flexCenter}>
                            <Text style={[styles.boldHeadingText, styles.skyBlueTextColor]}>
                                {currentEarningSummary.appMarkingRate || 'N/A'}
                            </Text>
                            <Text style={styles.mutedSmallText}>App Usage</Text>
                        </View>
                    </View>

                    <View style={[styles.commonCard]}>
                        <View style={[styles.flexSpaceBetween]}>
                            <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                Earning Summary
                            </Text>
                            {isCurrentEarningSummaryAvailable > 0 && (
                                <TouchableOpacity
                                    onPress={() => this._gotoEarningDetails()}
                                    disabled={Object.keys(currentEarningSummary).length === 0}
                                >
                                    <Text style={[styles.boldSmallText, styles.tealTextColor]}>
                                        {'Details >'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {isCurrentEarningSummaryAvailable && (
                            <>
                                <View style={styles.smallTopMargin}>
                                    <Text style={[styles.redTextColor, styles.extraSmallText]}>
                                        {format(
                                            new Date(currentEarningSummary.until),
                                            'do LLL YYY'
                                        )}
                                    </Text>
                                </View>

                                <View style={styles.mediumMarginTop}>
                                    <View style={styles.flexSpaceBetween}>
                                        <Text style={styles.regularText}>Salary Grade</Text>
                                        <Text
                                            style={[
                                                styles.boldRegularText,
                                                styles.darkRedTextColor,
                                            ]}
                                        >
                                            {currentEarningSummary.salaryGrade}
                                        </Text>
                                    </View>

                                    <View
                                        style={[styles.flexSpaceBetween, styles.regularMarginTop]}
                                    >
                                        <Text style={styles.regularText}>Basic Salary</Text>
                                        <Text
                                            style={[
                                                styles.boldRegularText,
                                                styles.darkRedTextColor,
                                            ]}
                                        >
                                            {currentEarningSummary.basicSalary}
                                        </Text>
                                    </View>

                                    <View
                                        style={[styles.flexSpaceBetween, styles.regularMarginTop]}
                                    >
                                        <Text style={styles.regularText}>Total Bonus</Text>
                                        <Text
                                            style={[
                                                styles.boldRegularText,
                                                styles.darkRedTextColor,
                                            ]}
                                        >
                                            {currentEarningSummary.totalBonus}
                                        </Text>
                                    </View>

                                    <View
                                        style={[styles.flexSpaceBetween, styles.regularMarginTop]}
                                    >
                                        <Text style={styles.regularText}>Total Payable</Text>
                                        <Text
                                            style={[
                                                styles.boldRegularText,
                                                styles.skyBlueTextColor,
                                            ]}
                                        >
                                            {currentEarningSummary.totalPayable}
                                        </Text>
                                    </View>
                                </View>
                            </>
                        )}
                        {!isCurrentEarningSummaryAvailable && (
                            <View style={styles.mediumMarginTop}>
                                <View style={styles.flexSpaceBetween}>
                                    <Text style={styles.regularText}>No Summary found</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={[styles.commonCard, styles.mediumMarginBottom]}>
                        <View style={[styles.flexSpaceBetween]}>
                            <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                Pickup Summary
                            </Text>
                            {isPickupAgentSummaryAvailable && (
                                <TouchableOpacity onPress={() => this._gotoParcelDetails()}>
                                    <Text style={[styles.boldSmallText, styles.tealTextColor]}>
                                        {'Details >'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.smallTopMargin}>
                            <Text style={[styles.redTextColor, styles.extraSmallText]}>
                                {today}
                            </Text>
                        </View>

                        {isPickupAgentSummaryAvailable && (
                            <View style={[styles.flexSpaceBetween, styles.mediumMarginTop]}>
                                <View style={styles.flexCenter}>
                                    <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                        {pickupAgentSummary.pickup.in_progress || '0'}
                                    </Text>
                                    <Text style={styles.mutedSmallText}>In Progress</Text>
                                </View>

                                <View style={styles.flexCenter}>
                                    <Text style={[styles.boldHeadingText, styles.greenTextColor]}>
                                        {pickupAgentSummary.pickup.picked_up || '0'}
                                    </Text>
                                    <Text style={styles.mutedSmallText}>Picked Up</Text>
                                </View>

                                <View style={styles.flexCenter}>
                                    <Text style={[styles.boldHeadingText, styles.orangeTextColor]}>
                                        {pickupAgentSummary.pickup.failed || '0'}
                                    </Text>
                                    <Text style={styles.mutedSmallText}>Failed</Text>
                                </View>
                            </View>
                        )}

                        {!isPickupAgentSummaryAvailable && (
                            <View style={styles.mediumMarginTop}>
                                <View style={styles.flexSpaceBetween}>
                                    <Text style={styles.regularText}>No Summary found</Text>
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={[styles.commonCard, styles.mediumMarginBottom]}>
                        <View style={[styles.flexSpaceBetween]}>
                            <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                Return Summary
                            </Text>
                            {isPickupAgentSummaryAvailable && (
                                <TouchableOpacity onPress={() => this._gotoParcelDetails()}>
                                    <Text style={[styles.boldSmallText, styles.tealTextColor]}>
                                        {'Details >'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <View style={styles.smallTopMargin}>
                            <Text style={[styles.redTextColor, styles.extraSmallText]}>
                                {today}
                            </Text>
                        </View>

                        {isPickupAgentSummaryAvailable && (
                            <View style={[styles.flexSpaceBetween, styles.mediumMarginTop]}>
                                <View style={styles.flexCenter}>
                                    <Text style={[styles.boldHeadingText, styles.blueTextColor]}>
                                        {pickupAgentSummary.return.in_progress || '0'}
                                    </Text>
                                    <Text style={styles.mutedSmallText}>In Progress</Text>
                                </View>

                                <View style={styles.flexCenter}>
                                    <Text style={[styles.boldHeadingText, styles.greenTextColor]}>
                                        {pickupAgentSummary.return.returned || '0'}
                                    </Text>
                                    <Text style={styles.mutedSmallText}>Returned</Text>
                                </View>

                                <View style={styles.flexCenter}>
                                    <Text style={[styles.boldHeadingText, styles.orangeTextColor]}>
                                        {pickupAgentSummary.return.hold || '0'}
                                    </Text>
                                    <Text style={styles.mutedSmallText}>On Hold</Text>
                                </View>
                            </View>
                        )}

                        {!isPickupAgentSummaryAvailable && (
                            <View style={styles.mediumMarginTop}>
                                <View style={styles.flexSpaceBetween}>
                                    <Text style={styles.regularText}>No Summary found</Text>
                                </View>
                            </View>
                        )}
                    </View>
                </ScrollView>
                <View style={styles.logoutBtn}>
                    <Button title="Logout" color="#ffc928" onPress={() => this.logout()} />
                </View>
            </>
        );
    }
}
