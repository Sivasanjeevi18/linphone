import * as dataStore from '../../src/utils/Store';
import * as userApi from '../api/User';

export const logCall = async ({
    merchantPhoneNumber,
    customerPhoneNumber,
    parcelId,
    shopId,
    callDuration,
    type,
}) => {
    let agent = await dataStore.getLoggedInUser().then(JSON.parse);
    const payload = {
        agentId: agent.agentId,
        accessToken: agent.accessToken,
        parcelId,
        shopId,
        merchantPhoneNumber,
        customerPhoneNumber,
        callDuration,
        type, //pickup/delivery
    };

    // console.log('> log', agent);
    try {
        const res = await userApi.logCall(payload);
    } catch (error) {
        console.log(error);
    }
};
