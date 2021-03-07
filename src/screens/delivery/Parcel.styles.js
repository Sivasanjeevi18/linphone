import styleConst from '../../constants/Style';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    split: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    scrollView: {
        paddingBottom: 20,
        backgroundColor: '#FFF',
    },
    parcelInfoContainer: {
        height: '100%',
        backgroundColor: '#FFF',
        paddingLeft: 15,
        paddingRight: 15,
    },
    recipientInfoContainer: {
        paddingTop: 12,
        display: 'flex',
        flexDirection: 'row',
    },
    recipientDetails: {
        width: '70%',
    },
    recipientImage: {
        width: '30%',
        alignItems: 'flex-end',
    },
    text: {
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.size,
        fontWeight: styleConst.font.weight,
    },
    label: {
        color: '#000',
        opacity: 0.4,
        marginBottom: 2,
    },
    info: {
        marginBottom: 10,
        fontSize: 16,
    },
    img: {
        width: 60,
        height: 60,
        borderRadius: 40,
    },
    btns: {
        marginTop: 2,
        marginBottom: 30,
    },
    btn: {
        height: 34,
        marginTop: 16,
    },
    bkashOnDeliveryContainer: {
        marginVertical: 10,
    },
    picker: {
        borderWidth: 1,
        borderColor: '#EEE',
        borderRadius: 3,
        height: 45,
    },
    bkashVerification: {
        width: '100%',
        flexDirection: 'row',
        marginVertical: 15,
    },
    bkashPaymentStatus: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#d6f8ed',
        paddingVertical: 15,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#05d493',
    },
    bkashPaymentStatusMsg: {
        marginLeft: 6,
        marginBottom: 2,
    },
    bkashTrxInputContainer: {
        flex: 0.7,
    },
    bkashTrxInput: {
        borderRadius: 5,
        marginRight: 10,
        paddingHorizontal: 8,
        borderWidth: 1,
        borderColor: '#E4E4E4',
        height: 40,
    },
    bkashSmsBtn: {
        flex: 0.3,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        height: 45,
        backgroundColor: styleConst.color.secondaryBackground,
    },
    bkashSmsBtnTitle: {
        color: '#FFF',
        fontSize: 16,
    },
    bKashSmsMsg: {
        flexDirection: 'row',
        marginTop: 5,
        marginLeft: 15,
    },
    bKashSmsMsgBtn: {
        color: styleConst.color.secondaryBackground,
        marginLeft: 5,
    },
    bkashTrxValidationMsgConatiner: {
        flexDirection: 'row',
    },
    bkashTrxValidationMsgText: {
        color: styleConst.color.errorText,
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.small,
        marginRight: 10,
    },
    bkashVerifySuccessText: {
        color: '#00ABC0',
        fontFamily: styleConst.font.regular,
        fontSize: styleConst.font.small,
        marginRight: 10,
    },
    bkashVerifySuccessIcon: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: '#00ABC0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bkashVerifyFailedIcon: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: styleConst.color.errorText,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default styles;
