import { StyleSheet, Dimensions } from 'react-native';
import styleConst from '../../constants/Style';

export default StyleSheet.create({
    mainContainer: {
        backgroundColor: 'rgba(62, 181, 180, 0.15)',
        flex: 1,
        // justifyContent: 'center',
    },
    profileContainer: {
        justifyContent: 'flex-start',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 25,
    },
    profileImageContainer: {
        // position: 'absolute',
    },
    iconContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: 36,
        height: 36,
        borderRadius: 36 / 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileImage: {
        borderRadius: 100 / 2,
        width: 100,
        height: 100,
        borderWidth: 1,
        borderColor: '#000',
        // position: 'relative',
    },
    profileName: {
        fontSize: styleConst.font.size,
        fontWeight: 'bold',
        marginVertical: 5,
    },
    mutedSmallText: {
        fontSize: styleConst.font.small,
        color: 'rgba(0, 0, 0, 0.6)',
    },
    commonCard: {
        backgroundColor: '#fff',
        marginHorizontal: 8,
        marginVertical: 5,
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingVertical: 15,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
        elevation: 3,
    },
    flexCenter: {
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    flexStart: {
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    flexDirectionRow: {
        flexDirection: 'row',
    },
    flexSpaceBetween: {
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
    },
    additionalParcelText: {
        fontSize: styleConst.font.small,
        paddingBottom: 7,
    },
    boldHeadingText: {
        fontSize: styleConst.font.heading1,
        fontWeight: 'bold',
    },
    boldSmallText: {
        fontSize: styleConst.font.small,
        fontWeight: 'bold',
    },
    boldRegularText: {
        fontSize: styleConst.font.size,
        fontWeight: 'bold',
    },
    regularText: {
        fontSize: styleConst.font.size,
    },
    extraSmallText: {
        fontSize: styleConst.font.extraSmall,
    },
    blueTextColor: {
        color: styleConst.color.blue,
    },
    blackTextColor: {
        color: '#000',
    },
    greenTextColor: {
        color: styleConst.color.darkGreen,
    },
    orangeTextColor: {
        color: '#E08214',
    },
    darkRedTextColor: {
        color: styleConst.color.errorText,
    },
    redTextColor: {
        color: styleConst.color.red,
    },
    skyBlueTextColor: {
        color: styleConst.color.skyBlue,
    },
    tealTextColor: {
        color: styleConst.color.secondaryBackground,
    },
    smallTopMargin: {
        marginTop: 5,
    },
    regularMarginTop: {
        marginTop: 10,
    },
    mediumMarginLeft: {
        marginLeft: 20,
    },
    mediumMarginTop: {
        marginTop: 20,
    },
    regularMarginleft: {
        marginLeft: 10,
    },
    mediumMarginBottom: {
        marginBottom: 20,
    },
    regularMarginBottom: {
        marginBottom: 10,
    },
    borderRight: {
        borderColor: 'rgba(0, 0, 0, 0.8)',
        borderWidth: 1,
        marginHorizontal: 7,
        height: 20,
    },
    tableContainer: {
        width: 410,
        marginTop: 20,
        marginBottom: 10,
    },
    tableWrapper: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    row: {
        flex: 1,
        alignSelf: 'stretch',
        flexDirection: 'row',
    },
    bigCell: {
        flex: 1.8,
        alignSelf: 'stretch',
    },
    normalCell: {
        flex: 1.1,
        alignSelf: 'stretch',
    },
    smallCell: {
        flex: 0.3,
        alignSelf: 'stretch',
    },
    logoutBtn: {
        height: 34,
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
        height: '50%',
        backgroundColor: '#FFF',
        borderRadius: 3,
        paddingLeft: 20,
        paddingRight: 20,
        paddingTop: 15,
    },
});
