import * as Connectivity from '../utils/Connectivity';
import * as dataStore from '../utils/Store';
import { localUri, localSapUri } from './config';

const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
};

const FINAL_STAGES = [
    'agent-returning',
    'agent-hold-returning',
    'agent-area-change',
    'delivered',
    'agent-returned',
    'return-hold-returning',
    'return-problematic-returning',
];

export const isOnFinalStage = (status) => FINAL_STAGES.includes(status);

const getHeaders = async () => {
    try {
        let agent = await dataStore.getLoggedInUser().then(JSON.parse);
        if (!agent || !agent.accessToken) {
            throw 'NOT_LOGGEDIN';
        }
        return {
            ...headers,
            'x-access-token': `Bearer ${agent.accessToken}`,
        };
    } catch (error) {
        console.log('error', error);
        return headers;
    }
};

/**
 * @param {Object} params - Parcel search params
 * @param {Number} params.agentId - It is agent id (not user id)
 * @param {String} params.accessToken - User access token (x-access-token)
 * @param {Number} params.shopId - shop id
 * @param {String} params.status - parcel status should be either pickup-in-progress, delivery-in-progress
 *
 */

export const fetchParcelList = (params) => {
    return Connectivity.hasInternetConnection()
        .then((isConnected) => {
            if (!isConnected)
                throw {
                    noInternetConnection: true,
                    message: 'No internet connection',
                };

            let endPoint = `${localSapUri}/api/logistics/agent/${params.agentId}/parcels`;
            let reqHeaders = Object.assign(headers, {
                'x-access-token': `Bearer ${params.accessToken}`,
            });

            delete params.accessToken;
            delete params.agentId;

            params = Object.keys(params).map((key) => {
                if (Array.isArray(params[key])) {
                    return params[key].map((value) => `${key}=${value}`).join('&');
                }
                return `${key}=${params[key]}`;
            });

            console.log('> fetchParcelList', `${endPoint}?${params.join('&')}`);

            return fetch(`${endPoint}?${params.join('&')}`, { method: 'GET', headers: reqHeaders });
        })
        .then((response) => {
            if (response.status === 200) return response.json();

            throw {
                isTokenExpired: true,
                message: 'Session has been expired. Please login to renew the session',
            };
        })
        .then(({ parcels }) => {
            // console.log('> fetchParcelList parcels:', parcels);
            let shopWiseParcels = {};
            // console.log('fetchParcelList - parcels', parcels);
            for (let i = 0; parcels && i < parcels.length; i++) {
                let shopId = parcels[i].shopId;
                if (!shopWiseParcels[shopId]) {
                    shopWiseParcels[shopId] = {
                        shopId: parcels[i].shopId,
                        shopName: parcels[i].shopName,
                        shopAddress: parcels[i].shopAddress,
                        shopPhone: parcels[i].shopPhone,
                        parcelShopPhone: parcels[i].parcelShopPhone,
                        shopupNote: parcels[i].shopupNote,
                        parcelCount: 0,
                        parcels: [],
                        merchantType: parcels[i].merchantType,
                        otpEnabled: parcels[i].otpEnabled,
                        businessType: parcels[i].businessType,
                        isExchanged: parcels[i].isExchanged,
                    };
                }

                shopWiseParcels[shopId].parcelCount++;
                shopWiseParcels[shopId].parcels.push({
                    id: parcels[i].id,
                    invoiceNumber: parcels[i].invoiceNumber,
                    customerName: parcels[i].customerName,
                    customerPhone: parcels[i].customerPhone,
                    customerAddress: parcels[i].deliveryAddress,
                    cash: parcels[i].cash,
                    firstMileReceivedTime: parcels[i].firstMileReceivedTime,
                    partnerId: parcels[i].partnerId,
                    sourceHubId: parcels[i].sourceHubId,
                    status: parcels[i].status,
                    parcelDeliveryType: parcels[i].parcelDeliveryType,
                    area: parcels[i].area,
                    areaId: parcels[i].areaId,
                    agentId: parcels[i].agentId,
                    sellerInstruction: parcels[i].sellerInstruction,
                    isReverseDelivery: parcels[i].isReverseDelivery,
                    gatewayMedium: parcels[i].gatewayMedium,
                    gatewayPaidAmount: parcels[i].gatewayPaidAmount,
                    merchantType: parcels[i].merchantType,
                    parcelCategories: parcels[i].parcelCategories,
                    adminNumber: parcels[i].adminNumber,
                    pickupType: parcels[i].pickupType,
                    otpEnabled: parcels[i].otpEnabled,
                    businessType: parcels[i].businessType,
                    shopStoreId: parcels[i].shopStoreId,
                    shopStoreAddress: parcels[i].shopAddress,
                    storeName: parcels[i].storeName,
                    storePhone: parcels[i].storePhone,
                    isExchanged: parcels[i].isExchanged,
                });
            }

            // console.log('> shopWiseParcels:', shopWiseParcels);

            return [null, shopWiseParcels];
        })
        .catch((err) => [err, []]);
};

export const fetchPickupList = (params) => {
    return Connectivity.hasInternetConnection()
        .then((isConnected) => {
            if (!isConnected)
                throw {
                    noInternetConnection: true,
                    message: 'No internet connection',
                };

            // console.log('localSapUri', localSapUri);
            // console.log('agentid', params.agentId);

            let endPoint = `${localSapUri}/api/logistics/agent/${params.agentId}/pickups`;
            let reqHeaders = Object.assign(headers, {
                'x-access-token': `Bearer ${params.accessToken}`,
            });

            // console.log(`Bearer ${params.accessToken}`);

            params = Object.keys(params).map((key) => {
                if (key === 'accessToken' || key === 'agentId') return;
                return `${key}=${params[key]}`;
            });

            return fetch(`${endPoint}?${params.join('&')}`, { method: 'GET', headers: reqHeaders });
        })
        .then((response) => {
            if (response.status === 200) return response.json();

            throw {
                isTokenExpired: true,
                message: 'Session has been expired. Please login to renew the session',
            };
        })
        .then(({ shops }) => {
            return [null, shops];
        })
        .catch((err) => [err, []]);
};

export const fetchParcelById = async (parcelId) => {
    try {
        const isConnected = await Connectivity.hasInternetConnection();
        if (!isConnected) {
            throw {
                noInternetConnection: true,
                message: 'No internet connection',
            };
        }

        const endPoint = `${localSapUri}/api/logistics/parcels?parcelId=${parcelId}`;
        let res = await fetch(endPoint, {
            method: 'GET',
            headers: await getHeaders(),
        });
        res = await res.json();

        if (!res?.error) {
            return res.parcels[0];
        }
    } catch (error) {
        console.log('> fetchParcelById error', error);
    }
};

export const updateParcelsStatus = (agent, parcels) => {
    return Connectivity.hasInternetConnection()
        .then((isConnected) => {
            if (!isConnected)
                throw {
                    noInternetConnection: true,
                    message: 'No internet connection',
                };

            let endPoint = `${localSapUri}/api/logistics/agent/${agent.agentId}/parcels`;
            let reqHeaders = Object.assign(headers, {
                'x-access-token': `Bearer ${agent.accessToken}`,
            });
            // return console.log('>> parcels', endPoint, parcels);
            return fetch(endPoint, {
                method: 'PUT',
                body: JSON.stringify(parcels),
                headers: reqHeaders,
            });
        })
        .then((response) => {
            if (response.status === 200) return response.json();
            throw {
                isTokenExpired: true,
                message: 'Session has been expired. Please login to renew the session',
            };
        });
};

export const updateParcelStatusV2 = async (agentId, parcelId, payload) => {
    console.log('REQUEST:', `${localUri}/v2/logistics/agent/${agentId}/parcel/${parcelId}`);
    try {
        const response = await fetch(
            `${localUri}/v2/logistics/agent/${agentId}/parcel/${parcelId}`,
            {
                method: 'PUT',
                headers: await getHeaders(),
                body: JSON.stringify(payload),
            }
        ).then((res) => res.json());
        console.log('response', response);
        return response;
    } catch (error) {
        console.error('xx- updating parcel status v2 error', error);
        return error;
    }
};

export const setPickupSuccess = async (
    shopId,
    parcelCount,
    scannedParcelCount = 0,
    unscannedParcelCount = 0
) => {
    console.log('[REQUEST]', `${localSapUri}/api/logistics/agent/pickup/${shopId}`);
    console.log(
        'payload',
        JSON.stringify({
            newStatus: 'picked-up',
            parcelCount,
            scannedParcelCount,
            unscannedParcelCount,
        })
    );
    try {
        let data = await dataStore.getLoggedInUser();
        const agent = JSON.parse(data);

        const response = await fetch(`${localSapUri}/api/logistics/agent/pickup/${shopId}`, {
            method: 'PUT',
            headers: { ...headers, 'x-access-token': `Bearer ${agent.accessToken}` },
            body: JSON.stringify({
                newStatus: 'picked-up',
                parcelCount,
                scannedParcelCount,
                unscannedParcelCount,
            }),
        });
        return response.json();
    } catch (error) {
        console.log(error);
    }
};

export const setPickupFailed = async (shopId, payload) => {
    try {
        let data = await dataStore.getLoggedInUser();
        const agent = JSON.parse(data);
        const response = await fetch(`${localSapUri}/api/logistics/agent/pickup/${shopId}`, {
            method: 'PUT',
            headers: { ...headers, 'x-access-token': `Bearer ${agent.accessToken}` },
            body: JSON.stringify({ newStatus: 'failed', ...payload }),
        });
        return response.json();
    } catch (error) {
        console.log(error);
    }
};

export const setAsReturned = async ({ parcelId, partnerId, sourceHubId, oldStatus }) => {
    // console.log('> setAsReturned', parcelId, partnerId, sourceHubId, oldStatus);
    try {
        let agent = await dataStore.getLoggedInUser().then(JSON.parse);
        const body = {
            currentStatus: 'agent-returned',
            action: 'parcel-returned-to-seller',
            oldStatus,
            packageInfo: null,
            productType: null,
            agentId: agent.agentId,
            partnerId,
            sourceHubId,
        };
        // return console.log('> body', body);

        const response = await fetch(`${localSapUri}/api/logistics/parcel/status/${parcelId}`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        }).then((res) => res.json());
        if (response.isError) {
            throw response;
        }
        return response;
    } catch (error) {
        console.log('xx- setAsReturned', error);
        throw error;
    }
};
/*
parcel: [
  {
  id: parcel.id,
	currentStatus: 'agent-returned',
	oldStatus: parcel.status,
	sourceHubId: // agentHubId
  currentPartnerId: 3
}
]
  action: 'parcel-returned-to-seller',
*/
export const bulkReturn = async (parcels, action = 'parcel-returned-to-seller') => {
    const body = {
        parcels,
        action,
    };
    console.log('[REQUEST]', `${localSapUri}/api/logistics/parcel/status/bulk`);
    console.log('[body]', JSON.stringify(body));
    try {
        const response = await fetch(`${localSapUri}/api/logistics/parcel/status/bulk`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        }).then((res) => res.json());
        console.log('bulkReturn response', response);
        return response;
    } catch (error) {
        console.log('xx- bulkReturn', error);
        throw error;
    }
};

/*
parcel: [
  {
  id: parcel.id,
	currentStatus: 'pickup-pending',
	oldStatus: picked-up,
	sourceHubId: // agentHubId
  currentPartnerId: 3
}
]
  action: 'pickedup-by-agent',
*/

export const bulkPickup = async (parcels, action = 'pickedup-by-agent') => {
    const body = {
        parcels,
        action,
    };
    console.log('[REQUEST]', `${localSapUri}/api/logistics/parcel/status/bulk`);
    try {
        const response = await fetch(`${localSapUri}/api/logistics/parcel/status/bulk`, {
            method: 'PUT',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        }).then((res) => res.json());
        console.log('bulkPickup response', response);
        return response;
    } catch (error) {
        console.log('xx- bulkPickup', error);
        return error;
    }
};

export const setStatusWithRemarks = async ({
    parcelId,
    partnerId,
    sourceHubId,
    oldStatus,
    remarks,
    holdReason,
}) => {
    try {
        let agent = await dataStore.getLoggedInUser().then(JSON.parse);
        const body = {
            oldStatus,
            remarks,
            holdReason,
            currentStatus: 'return-hold-returning',
            action: 'agent-return-hold-returning',
            // deliveryDate: 1568462400000,
            agentId: agent.agentId,
            partnerId,
            sourceHubId,
        };
        console.log('> setStatusWithRemarks', body);
        const response = await fetch(
            `${localSapUri}/api/logistics/parcel/status-with-remarks/${parcelId}`,
            {
                method: 'PUT',
                headers: await getHeaders(),
                body: JSON.stringify(body),
            }
        ).then((res) => res.json());
        if (response.isError) {
            throw response;
        }
        return response;
    } catch (error) {
        console.log('xx- setStatusWithRemarks', error);
        throw error;
    }
};

export const setProblematicWithRemarks = async ({ parcelId, oldStatus, remarks, returnReason }) => {
    try {
        let agent = await dataStore.getLoggedInUser().then(JSON.parse);
        const body = {
            oldStatus,
            remarks,
            returnReason,
            currentStatus: 'return-problematic-returning',
            action: 'agent-return-problematic-returning',
            agentId: agent.agentId,
        };
        console.log('> setProblematicWithRemarks', body);
        const response = await fetch(
            `${localSapUri}/api/logistics/parcel/status-with-remarks/${parcelId}`,
            {
                method: 'PUT',
                headers: await getHeaders(),
                body: JSON.stringify(body),
            }
        ).then((res) => res.json());
        if (response.isError) {
            throw response;
        }
        return response;
    } catch (error) {
        console.log('xx- setProblematicWithRemarks', error);
        throw error;
    }
};

export const verifyBkashPayment = async (parcelId, trxId) => {
    try {
        const body = {
            trxID: trxId,
        };
        console.log('> verifyBkashPayment', body);
        console.log(`${localUri}/v1/logistics/payment/parcel/${parcelId}`);
        const response = await fetch(`${localUri}/v1/logistics/payment/parcel/${parcelId}`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(body),
        }).then((res) => res.json());

        // if (response.isError) {
        //     throw response;
        // }
        return response;
    } catch (error) {
        console.log('xx- verifyBkashPayment', error);
        return error;
    }
};

export const getDeliveryReasons = async (categories, businessCategories) => {
    try {
        let queryString = '';
        for (let i = 0; i < categories.length; i++) {
            queryString = `${queryString}category=${categories[i]}${
                categories.length - 1 === i ? '' : '&'
            }`;
        }

        for (let i = 0; i < businessCategories.length; i++) {
            queryString = `${queryString}&businessCategory=${businessCategories[i]}${
                businessCategories.length - 1 === i ? '' : '&'
            }`;
        }
        console.log('[REQUEST]', `${localUri}/v2/logistics/reasons?module=delivery&${queryString}`);
        const response = await fetch(
            `${localUri}/v2/logistics/reasons?module=delivery&${queryString}`,
            {
                method: 'GET',
                headers: await getHeaders(),
            }
        ).then((res) => res.json());
        console.log('reasons', response);
        return response;
    } catch (error) {
        console.log('xx- get reasons error', error);
        return error;
    }
};

export const getPickupReasons = async () => {
    try {
        const response = await fetch(
            `${localUri}/v2/logistics/reasons?module=pickup&category=failed&businessCategory=common`,
            {
                method: 'GET',
                headers: await getHeaders(),
            }
        ).then((res) => res.json());
        return response;
    } catch (error) {
        console.log('xx- get reasons error', error);
        return error;
    }
};

export const getReasonCategoryWiseStatusAndAction = async () => {
    try {
        const response = await fetch(`${localUri}/v2/logistics/reasons/status-action`, {
            method: 'GET',
            headers: await getHeaders(),
        }).then((res) => res.json());
        return response;
    } catch (error) {
        console.error('xx- get reasons wise status and action error', error);
        return error;
    }
};

export const sendDliveryOtp = async (parcelId) => {
    try {
        const response = await fetch(
            `${localUri}/v1/logistics/delivery-otp/request?parcelId=${parcelId}`,
            {
                method: 'GET',
                headers: await getHeaders(),
            }
        ).then((res) => res.json());
        console.log(response);
        return response;
    } catch (error) {
        console.error('xx- get reasons wise status and action error', error);
        return error;
    }
};

export const verifyDeliveryOtp = async (data) => {
    try {
        const response = await fetch(`${localUri}/v1/logistics/delivery-otp/verify`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        }).then((res) => res.json());
        console.log(response);
        return response;
    } catch (error) {
        console.error('xx- get reasons wise status and action error', error);
        return error;
    }
};

export const sendReturnOtp = async (parcelId, reasonId) => {
    try {
        const response = await fetch(
            `${localUri}/v1/logistics/return-otp/request?parcelId=${parcelId}&reasonId=${reasonId}`,
            {
                method: 'GET',
                headers: await getHeaders(),
            }
        ).then((res) => res.json());
        console.log('return otp response', response);
        return response;
    } catch (error) {
        console.error('xx - return otp error', error);
        return error;
    }
};

// parcelId, otp, reasonId

export const verifyReturnOtp = async (data) => {
    try {
        const response = await fetch(`${localUri}/v1/logistics/return-otp/verify`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        }).then((res) => res.json());
        console.log('return otp verify response', response);
        return response;
    } catch (error) {
        console.error('xx- return otp verify error', error);
        return error;
    }
};

export const sendMerchantReturnOtp = async ({
    shopId,
    shopStoreId,
    agentId,
    parcelCount
}) => {
    console.log(
        '[REQUEST]',
        `${localUri}/v1/logistics/merchant-return-otp/request?shopId=${shopId}&shopStoreId=${shopStoreId}&agentId=${agentId}&parcelCount=${parcelCount}`
    );
    try {
        const response = await fetch(
            `${localUri}/v1/logistics/merchant-return-otp/request?shopId=${shopId}&shopStoreId=${shopStoreId}&agentId=${agentId}&parcelCount=${parcelCount}`,
            {
                method: 'GET',
                headers: await getHeaders(),
            }
        ).then((res) => res.json());
        console.log('sendMerchantReturnOtp', response);
        return response;
    } catch (error) {
        console.error('xx- get reasons wise status and action error', error);
        return error;
    }
};

// shopId, otp
export const verifyMerchantReturnOtp = async (data) => {
    console.log('[REQUEST]', `${localUri}/v1/logistics/merchant-return-otp/verify`);
    try {
        const response = await fetch(`${localUri}/v1/logistics/merchant-return-otp/verify`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify(data),
        }).then((res) => res.json());
        console.log('verifyMerchantReturnOtp', response);
        return response;
    } catch (error) {
        console.error('xx- return otp verify error', error);
        return error;
    }
};

export const postReceiverName = async (encodedParcelId, payload) => {
    const response = await fetch(`${localUri}/v2/parcels/${encodedParcelId}/receiver-name`, {
        method: 'POST',
        headers: await getHeaders(),
        body: JSON.stringify(payload),
    }).then((res) => {
        if (res.status === 200) return res.json();
        return res.json().then((json) => {
            throw json;
        });
    });
    return response;
};

export const sendPaymentUrlSms = async (parcelId) => {
    console.log('> sendPaymentUrlSms parcelId', parcelId);
    console.log('[REQUEST]', `${localUri}/v1/bkash/tokenized/send-payment-url-sms`);
    try {
        const response = await fetch(`${localUri}/v1/bkash/tokenized/send-payment-url-sms`, {
            method: 'POST',
            headers: await getHeaders(),
            body: JSON.stringify({ parcelId: parcelId }),
        }).then((res) => res.json());

        console.log('> sendPaymentUrlSms res', response);
        return response;
    } catch (error) {
        console.error('> error: sendPaymentUrlSms', error);
        return error;
    }
};
