import { localUri, localSapUri } from './config';

const LOGIN_URL = `${localUri}/v1/user/social-login`;
const AGENT_URL = `${localSapUri}/api/logistics/agent`;
const ACL_URL = `${localSapUri}/api/user/admin`;

const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

export const doesPhoneExist = async (phoneNo) => {
    console.log(`[REQUEST]: ${localUri}/v1/user/phone-exists`);
    try {
        const response = await fetch(`${localUri}/v1/user/phone-exists`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                phoneNo: phoneNo,
            }),
        });

        return response.json();
    } catch (error) {
        console.log('>Does phone exist response error:');
        console.log(error);
        return error;
    }
};

export const getLoginCode = async ({ countryCode, callingCode, phoneNumber }) => {
    // {"countryCode":"BD","callingCode":"+880","phoneNumber":"1726106981"}
    console.log(`[REQUEST]: ${localUri}/v1/user/request-login-code`);
    try {
        const response = await fetch(`${localUri}/v1/user/request-login-code`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                service: 'redx',
                countryCode,
                callingCode,
                phoneNumber,
            }),
        });
    } catch (error) {
        console.log(error);
        return error;
    }
};

export const loginWithCode = async (loginCode, phone) => {
    console.log(`[REQUEST]: ${localUri}/v1/user/login-with-code`);
    try {
        const response = await fetch(`${localUri}/v1/user/login-with-code`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                loginCode,
                phone,
            }),
        });

        return response.json();
    } catch (error) {
        console.log(error);
        return error;
    }

    // const detailedUser = {
    //   ...normalizeUserData(user),
    //   agentId: agent.AGENT_ID,
    //   hubId: agent.HUB_ID,
    //   isSoho: agent.IS_SOHO,
    //   isHyperLocal: agent.IS_HYPER_LOCAL,
    // };

    // return {
    //   user: detailedUser,
    //   token: accessToken,
    // };
};

export const fetchUserProfile = (fbId, fbToken) => {
    return fetch(LOGIN_URL, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
            fbId: fbId,
            fbToken: fbToken,
        }),
    })
        .then((response) => {
            console.log(response.body);
            return response.json();
        })
        .catch((error) => console.log(error));
};

export const isEmployee = (userId, accessToken) => {
    return fetch(`${ACL_URL}?shopupId=${userId}`, {
        method: 'GET',
        headers: Object.assign(headers, {
            'x-access-token': `Bearer ${accessToken}`,
        }),
    })
        .then((response) => response.json())
        .then(({ admins }) => {
            if (admins.length !== 1) return false;
            return admins[0].accessDisabled === 0;
        });
};

export const fetchAgentInfo = (userId, accessToken) => {
    console.log(`${AGENT_URL}?userId=${userId}`);
    console.log(`accessToken: ${accessToken}`);
    return fetch(`${AGENT_URL}?userId=${userId}`, {
        method: 'GET',
        headers: Object.assign(headers, {
            'x-access-token': `Bearer ${accessToken}`,
        }),
    })
        .then((response) => response.json())
        .then(({ agents }) => agents[0]);
};

export const assignmentStatus = (agent) => {
    let endpoint = `${localSapUri}/api/logistics/agent/${agent.agentId}`;
    let reqHeaders = Object.assign(headers, {
        'x-access-token': `Bearer ${agent.accessToken}`,
    });

    return fetch(endpoint, { method: 'GET', headers: reqHeaders }).then((response) => {
        if (response.status === 200) return response.json();

        throw {
            isTokenExpired: true,
            message: 'Session has been expired. Please login to renew the session',
        };
    });
};

export const postCurrentLocation = (user, location) => {
    let endpoint = `${localSapUri}/api/logistics/agent/${user.agentId}/location`;
    let reqOption = {
        method: 'POST',
        body: JSON.stringify({
            userId: user.id,
            location: location,
        }),
        headers: Object.assign(headers, {
            'x-access-token': `Bearer ${user.accessToken}`,
        }),
    };

    return fetch(endpoint, reqOption);
};

export const saveDeviceToken = (user, token) => {
    let endpoint = `${localUri}/v1/redx-notifications/app-tokens/add`;
    const payload = {
        userId: user.id,
        device: 'android',
        app: 'redx-delivery-agents-app',
        token,
    };

    console.log('> saveDeviceToken payload', payload);

    let reqOption = {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: Object.assign(headers, {
            'x-access-token': `Bearer ${user.accessToken}`,
        }),
    };

    return fetch(endpoint, reqOption).then((res) => res.json());
};

export const logCall = ({
    agentId,
    parcelId,
    shopId,
    customerPhoneNumber,
    merchantPhoneNumber,
    callDuration,
    accessToken,
    type,
}) => {
    let endpoint = `${localSapUri}/api/agent/${agentId}/logistics/call`;
    let reqOption = {
        method: 'POST',
        body: JSON.stringify({
            shopId,
            parcelId,
            customerPhoneNumber,
            merchantPhoneNumber,
            callDuration,
            type,
        }),
        headers: Object.assign(headers, {
            'x-access-token': `Bearer ${accessToken}`,
        }),
    };

    return fetch(endpoint, reqOption);
};

export const getParcelSummary = async (agentId, from, to, accessToken) => {
    console.log(
        '[REQUEST]:',
        `${localUri}/v2/logistics/agent/${agentId}/summary/parcels?from=${from}&to=${to}`
    );
    try {
        const response = await fetch(
            `${localUri}/v2/logistics/agent/${agentId}/summary/parcels?from=${from}&to=${to}`,
            {
                method: 'GET',
                headers: Object.assign(headers, {
                    'x-access-token': `Bearer ${accessToken}`,
                }),
            }
        ).then((res) => res.json());
        console.log('getParcelSummary', response);
        return response.body.summary;
    } catch (error) {
        console.log('xx - return otp error', error);
        return {};
    }
};

export const getPickupAgentSummary = async (agentId, accessToken) => {
    console.log('[REQUEST]:', `${localUri}/v2/logistics/pickup/agent/${agentId}/summary`);
    try {
        const response = await fetch(`${localUri}/v2/logistics/pickup/agent/${agentId}/summary`, {
            method: 'GET',
            headers: Object.assign(headers, {
                'x-access-token': `Bearer ${accessToken}`,
            }),
        }).then((res) => res.json());
        console.log('getPickupAgentSummary', response);
        return response.body;
    } catch (error) {
        console.log('xx - getPickupAgentSummary', error);
        return {};
    }
};

export const getPickupAgentReturnDetails = async (agentId, from, to, accessToken) => {
    console.log(
        '[REQUEST]:',
        `${localUri}/v2/logistics/pickup/agent/${agentId}/return-details?from=${from}&to=${to}`
    );
    try {
        const response = await fetch(
            `${localUri}/v2/logistics/pickup/agent/${agentId}/return-details?from=${from}&to=${to}`,
            {
                method: 'GET',
                headers: Object.assign(headers, {
                    'x-access-token': `Bearer ${accessToken}`,
                }),
            }
        ).then((res) => res.json());
        console.log('getPickupAgentReturnDetails', response);
        return response.body.summary[0];
    } catch (error) {
        console.log('xx - getPickupAgentReturnDetails', error);
        return {};
    }
};

export const getPickupAgentPickupDetails = async (agentId, from, to, accessToken) => {
    console.log(
        '[REQUEST]:',
        `${localUri}/v2/logistics/pickup/agent/${agentId}/pickup-details?from=${from}&to=${to}`
    );
    try {
        const response = await fetch(
            `${localUri}/v2/logistics/pickup/agent/${agentId}/pickup-details?from=${from}&to=${to}`,
            {
                method: 'GET',
                headers: Object.assign(headers, {
                    'x-access-token': `Bearer ${accessToken}`,
                }),
            }
        ).then((res) => res.json());
        console.log('getPickupAgentPickupDetails', response);
        return response.body.summary;
    } catch (error) {
        console.log('xx - getPickupAgentPickupDetails', error);
        return {};
    }
};

export const getEarningSummary = async (agentId, accessToken) => {
    console.log(
        '[REQUEST]:',
        `${localUri}/v1/logistics/salary/delivery-agents-payable/${agentId}/current-earning-summary`
    );
    try {
        const response = await fetch(
            `${localUri}/v1/logistics/salary/delivery-agents-payable/${agentId}/current-earning-summary`,
            {
                method: 'GET',
                headers: Object.assign(headers, {
                    'x-access-token': `Bearer ${accessToken}`,
                }),
            }
        ).then((res) => res.json());
        console.log('getEarningSummary', response);
        return response.body.currentEarningSummary;
    } catch (error) {
        console.log('xx - getEarningSummary', error);
        return {};
    }
};

export const getEarningDetails = async (agentId, accessToken) => {
    console.log(
        '[REQUEST]:',
        `${localUri}/v1/logistics/salary/delivery-agents-payable/${agentId}/current-earning-details`
    );
    try {
        const response = await fetch(
            `${localUri}/v1/logistics/salary/delivery-agents-payable/${agentId}/current-earning-details`,
            {
                method: 'GET',
                headers: Object.assign(headers, {
                    'x-access-token': `Bearer ${accessToken}`,
                }),
            }
        ).then((res) => res.json());
        console.log('getEarningDetails', response);
        return response.body.currentEarningDetails;
    } catch (error) {
        console.log('xx - return otp error', error);
        return error;
    }
};

export const getGradeSettings = async (agentId, accessToken) => {
    console.log(
        '[REQUEST]:',
        `${localUri}/v1/logistics/salary/delivery-agents-payable/${agentId}/grade-settings`
    );
    try {
        const response = await fetch(
            `${localUri}/v1/logistics/salary/delivery-agents-payable/${agentId}/grade-settings`,
            {
                method: 'GET',
                headers: Object.assign(headers, {
                    'x-access-token': `Bearer ${accessToken}`,
                }),
            }
        ).then((res) => res.json());
        console.log('getGradeSettings', response);
        return response.body.gradeSettings;
    } catch (error) {
        console.log('xx - return otp error', error);
        return error;
    }
};

export const getMonthlyEarningDetails = async (agentId, month, year, accessToken) => {
    console.log(
        '[REQUEST]:',
        `${localUri}/v1/logistics/salary/delivery-agents-payable/${agentId}/monthly-salary-details?month=${month}&year=${year}`
    );
    try {
        const response = await fetch(
            `${localUri}/v1/logistics/salary/delivery-agents-payable/${agentId}/monthly-salary-details?month=${month}&year=${year}`,
            {
                method: 'GET',
                headers: Object.assign(headers, {
                    'x-access-token': `Bearer ${accessToken}`,
                }),
            }
        ).then((res) => res.json());
        console.log('getMonthlyEarningDetails', response);
        return response.body.salaryDetailsForMonth;
    } catch (error) {
        console.log('xx - getMonthlyEarningDetails', error);
        return {};
    }
};
