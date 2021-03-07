import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    Button,
    FlatList,
    Text,
    ToastAndroid,
    Alert,
    Modal,
    TextInput,
} from 'react-native';
import styleConst from '../../constants/Style';
import * as parcelApi from '../../api/Parcel';
import * as dataStore from '../../utils/Store';
import Segment from '../../utils/Segment';
import { getLocationAsync } from '../../utils/Location';
import CustomeButton from '../../components/Button';

function ScannedParcelList({ navigation }) {
    const [location, setLocation] = useState(null);
    const [unScannedParcels, setUnScannedParcels] = useState('');
    const [showUnScannedParcelsModal, setUnScannedParcelsModal] = useState(false);
    const [isBusy, setIsBusy] = useState(false);
    const parcels = navigation.getParam('scannedParcels');
    const shopId = navigation.getParam('shopId');
    const refreshPickupPoints = navigation.getParam('refreshPickupPoints');

    const updateParcel = async () => {
        setUnScannedParcelsModal(false);
        setIsBusy(true);
        const {
            id,
            agentId,
            agentType,
            agentHubId,
        } = await dataStore.getLoggedInUser().then((data) => JSON.parse(data));
        const unscanned = !unScannedParcels ? 0 : parseInt(unScannedParcels, 10);
        try {
            await parcelApi.bulkPickup(
                parcels.map((parcel) => ({
                    id: parcel,
                    oldStatus: 'pickup-pending',
                    currentStatus: 'picked-up',
                    sourceHubId: agentHubId,
                    currentPartnerId: 3,
                }))
            );
            await parcelApi
                .setPickupSuccess(shopId, parcels.length + unscanned, parcels.length, unscanned)
                .then((res) => {
                    console.log('setPickupSuccess', res);
                    ToastAndroid.show('Successful!', ToastAndroid.SHORT);
                })
                .catch((error) => {
                    console.log('error setPickupSuccess', error);
                    Alert.alert('Error', 'Failed to finish pickup');
                });
            Segment.trackPickupSuccess({
                agent_id: agentId,
                user_id: id,
                agent_type: agentType,
                parcel_count: parcels.length,
                location: location,
            });
            ToastAndroid.show('Successful!', ToastAndroid.SHORT);
            refreshPickupPoints();
            navigation.navigate('PickupPoint');
            setIsBusy(false);
        } catch (e) {
            Alert.alert('Error', 'Failed to finish pickup');
        }
    };

    const showManualParcelEnterAlert = () => {
        Alert.alert(
            'Un-Scanned Parcel',
            `Do you have any un-scanned parcels?`,
            [
                { text: 'Cancel', onPress: () => {}, style: 'cancel' },
                { text: 'YES', onPress: () => setUnScannedParcelsModal(true) },
            ],
            { cancelable: false }
        );
    };

    const closeModal = () => {
        setUnScannedParcels('');
        setUnScannedParcelsModal(false);
    };

    const onParcelNumberChange = (v) => {
        if (!v) {
            setUnScannedParcels('');
            return;
        }
        if (/^[0-9]+$/.test(v) === false) {
            setUnScannedParcels('');
            return;
        }
        setUnScannedParcels(v);
    };

    useEffect(() => {
        (async () => {
            const lt = await getLocationAsync();
            setLocation(lt);
        })();
    }, []);

    return (
        <View style={styles.container}>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showUnScannedParcelsModal}
                onRequestClose={() => closeModal()}
            >
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <View style={styles.modalBody}>
                            <Text style={styles.label}>Enter number of un-scanned parcel</Text>
                            <TextInput
                                placeholder="Enter number of un-scanned parcel"
                                onChangeText={(text) => onParcelNumberChange(text)}
                                value={unScannedParcels}
                                keyboardType="number-pad"
                                style={styles.input}
                            />
                            <View style={styles.lastBtnsWrap}>
                                <CustomeButton
                                    title="Submit"
                                    onPress={() => updateParcel()}
                                    style={styles.lastBtns}
                                    bgColor="#3ab12c"
                                    color="#FFF"
                                />
                                <CustomeButton
                                    title="Cancel"
                                    onPress={() => closeModal()}
                                    style={styles.lastBtns}
                                    bgColor="#e74c3c"
                                    color="#FFF"
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
            <FlatList
                data={parcels}
                keyExtractor={(item) => item}
                renderItem={({ item, index }) => (
                    <View style={styles.card}>
                        <Text style={[styles.titleFontSize, styles.titleFontSize]}>
                            {`${index + 1}. `}
                        </Text>
                        <Text style={[styles.boldText, styles.smallMarginleft]}>{item}</Text>
                    </View>
                )}
            />
            <Button
                title="Marked as Picked up"
                onPress={() => showManualParcelEnterAlert()}
                disabled={parcels.length === 0 || isBusy}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#eee',
    },
    card: {
        padding: 10,
        marginBottom: 10,
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
    },
    titleFontSize: {
        fontSize: styleConst.font.heading1,
    },
    highlightedTextColor: {
        color: styleConst.color.highlightedText,
    },
    boldText: {
        fontWeight: 'bold',
    },
    smallMarginleft: {
        paddingLeft: 8,
    },
    input: {
        borderColor: '#000',
        fontSize: 20,
        borderColor: '#000',
        borderWidth: 1.2,
        paddingHorizontal: 15,
        paddingVertical: 7,
        width: '100%',
    },
    overlay: {
        height: '100%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    modal: {
        width: '90%',
        // minHeight: 320,
        height: 200,
        backgroundColor: '#FFF',
        borderRadius: 3,
        paddingLeft: 20,
        paddingRight: 20,
        paddingVertical: 10,
        alignSelf: 'center',
        // justifyContent: 'space-between',
    },
    modalBody: {
        marginTop: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
    },
    input: {
        borderColor: '#000',
        fontSize: 20,
        borderColor: '#000',
        borderWidth: 1.2,
        paddingHorizontal: 15,
        paddingVertical: 7,
    },
    lastBtnsWrap: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    lastBtns: {
        width: '48%',
    },
    label: {
        fontSize: 16,
        paddingBottom: 8,
    },
});

export default ScannedParcelList;
