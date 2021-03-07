import React, { useEffect, useState } from 'react';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { Text, View, StyleSheet, Button, Linking, Alert } from 'react-native';
import styleConst from '../../constants/Style';

function ScanParcel({ navigation }) {
    const [hasPermission, setHasPermission] = useState(null);
    const [scannedParcels, setScannedParcels] = useState([]);
    const [scanned, setScanned] = useState(false);

    const refreshPickupPoints = navigation.getParam('refreshPickupPoints');

    const checkForCameraPermission = async () => {
        const { status, canAskAgain } = await BarCodeScanner.requestPermissionsAsync();

        if (status === 'denied' && canAskAgain) {
            checkForCameraPermission();
        }

        if (status === 'denied' && !canAskAgain) {
            setHasPermission(false);
            Linking.openSettings();
        }

        if (status === 'granted') {
            setHasPermission(true);
        }
    };

    useEffect(() => {
        checkForCameraPermission();
    }, []);

    const handleBarCodeScanned = ({ type, data }) => {
        setScanned(true);
        const alreadyScanned = scannedParcels.find((id) => data === id);
        if (!alreadyScanned) {
            setScannedParcels([...scannedParcels, `${data}`]);
            alert(`Scanned Successfull ${data}`);
        } else {
            alert(`Parcel Id: ${data} is scanned before`);
        }
    };

    const gotoScannedList = () => {
        navigation.navigate('ScannedParcelList', {
            scannedParcels,
            refreshPickupPoints,
            shopId: navigation.getParam('shopId'),
        });
    };

    if (hasPermission === null) {
        return <Text>Requesting for camera permission</Text>;
    }

    if (hasPermission === false) {
        return <Text>No access to camera</Text>;
    }

    return (
        <View style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={(StyleSheet.absoluteFillObject, { width: '100%', height: '100%' })}
                barCodeTypes={['qr']}
            />

            <View style={styles.bottomView}>
                <Text style={[styles.IdText, styles.centeredText, styles.smallPaddingTop]}>
                    সর্বশেষ স্ক্যানকৃত পার্সেল:
                    <Text style={styles.IdSerialColor}>
                        {scannedParcels[scannedParcels.length - 1]}
                    </Text>
                </Text>
                <View style={styles.parcelCountConatiner}>
                    <View style={styles.twoColumnCell}>
                        <Text>মোট পার্সেল সংখ্যা</Text>
                        <Text style={styles.parcelCount}>{navigation.getParam('parcelCount')}</Text>
                    </View>
                    <View style={styles.separator} />
                    <View style={styles.twoColumnCell}>
                        <Text>স্ক্যান করা পার্সেল এর সংখ্যা</Text>
                        <Text style={styles.receiveCount}>{scannedParcels.length}</Text>
                    </View>
                </View>
                <View style={styles.btnsWrapper}>
                    <View style={{ width: '49.5%' }}>
                        <Button
                            title="স্ক্যান সম্পূর্ণ হয়েছে"
                            color="#22313F"
                            onPress={() => gotoScannedList()}
                        />
                    </View>
                    <View style={{ width: '49.5%' }}>
                        <Button
                            title="আবার স্ক্যান করুন"
                            onPress={() => setScanned(false)}
                            disabled={scanned === false}
                            color={styleConst.color.highlightedText}
                        />
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    bottomView: {
        backgroundColor: '#fff',
    },
    centeredText: {
        alignSelf: 'center',
    },
    IdText: {
        fontSize: styleConst.font.heading1,
    },
    IdTextColor: {
        color: styleConst.color.defaultText,
    },
    IdSerialColor: {
        color: styleConst.color.highlightedText,
        fontWeight: 'bold',
    },
    parcelCountConatiner: {
        width: '100%',
        height: 80,
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: styleConst.color.borderColor,
        borderRadius: 5,
        marginVertical: 10,
    },
    twoColumnCell: {
        width: '49.5%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    parcelCount: {
        fontSize: styleConst.font.title,
        color: styleConst.color.highlightedText,
        fontWeight: 'bold',
    },
    separator: {
        width: '0.5%',
        backgroundColor: styleConst.color.borderColor,
    },
    receiveCount: {
        fontSize: styleConst.font.title,
        color: styleConst.color.darkGreen,
        fontWeight: 'bold',
    },
    btnsWrapper: {
        flexDirection: 'row',
        width: '100%',
    },
    smallPaddingTop: {
        paddingTop: 8,
    },
});

export default ScanParcel;
