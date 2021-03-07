import React from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from 'react-native';
import Loader from '../../components/Loader';
import styleConst from '../../constants/Style';
import { MaterialIcons } from '@expo/vector-icons';
import { getDeliveryReasons } from '../../api/Parcel';
import * as dataStore from '../../utils/Store';
import * as userApi from '../../api/User';

export default class IssueList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reasonGroups: [],
            loading: false,
            agentInfo: undefined,
        };
    }

    static navigationOptions = () => {
        return {
            headerTitle: 'Issue Type',
        };
    };

    async componentDidMount() {
        this.setState({ loading: true });
        const agent = await dataStore.getLoggedInUser().then((data) => JSON.parse(data));
        if (!agent.agentHubId) {
            console.log('no agentHubId', agent.agentHubId);
            const agInfo = await userApi.fetchAgentInfo(agent.id, agent.accessToken);
            this.setState({ agentInfo: { ...agent, agentHubId: agInfo.hubId } });
            dataStore.storeUserData({
                ...agent,
                agentHubId: agInfo.hubId,
            });
        } else {
            this.setState({ agentInfo: agent });
        }
        await this._getReasons();
        this.setState({ loading: false });
    }

    getReasonParams({ merchantType, businessType }) {
        let reasonModules;
        let businessTypes;

        if (['mokam_life_style'].includes(businessType)) {
            reasonModules = ['return', 'hold', 'areaChange'];
            businessTypes = ['mokam_lifestyle'];
        }
        else if (['document'].includes(merchantType)) {
            reasonModules = ['return', 'hold', 'areaChange'];
            businessTypes = ['document'];
        }
        else {
            reasonModules = ['return', 'hold', 'areaChange'];
            businessTypes = ['common'];
        }

        return {
            reasonModules,
            businessTypes
        }
    }

    _getReasons = async () => {
        const params = this.props.navigation.state.params;
        console.log('-------------params--------------', params);

        const { reasonModules, businessTypes } = this.getReasonParams(params);
        
        const res = await getDeliveryReasons(reasonModules, businessTypes);
        this.setState({ reasonGroups: res.reasons });
    };

    _navigateToIssueDetails = (reasons) => {
        const params = this.props.navigation.state.params;
        const { agentInfo } = this.state;

        this.props.navigation.navigate('IssueDetails', {
            parcelId: params.parcelId,
            sourceHubId: params.sourceHubId,
            partnerId: params.partnerId,
            customer: params.customer,
            shop: params.shop,
            merchantType: params.merchantType,
            otpEnabled: params.otpEnabled,
            pickupType: params.pickupType,
            adminNumber: params.adminNumber,
            reasons,
            agentInfo,
        });
    };

    _renderItem = ({ item }) => (
        <TouchableOpacity
            style={styles.issueContainer}
            onPress={() => this._navigateToIssueDetails(item.REASONS)}
        >
            <Text style={styles.issueName}>{item.GROUP}</Text>
            <MaterialIcons name="keyboard-arrow-right" size={24} color="#566573" />
        </TouchableOpacity>
    );

    render() {
        return (
            <View style={styles.mainContainer}>
                {this.state.loading ? (
                    <Loader />
                ) : (
                    <FlatList
                        data={this.state.reasonGroups}
                        keyExtractor={(item) => item.GROUP}
                        renderItem={this._renderItem}
                    />
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: '#eee',
        flex: 1,
    },
    issueContainer: {
        backgroundColor: styleConst.color.defaultBackground,
        width: styleConst.window.width,
        height: 60,
        paddingHorizontal: 25,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 4,
    },
    issueName: {
        fontSize: 18,
        color: styleConst.color.defaultText,
        fontWeight: 'bold',
    },
});
