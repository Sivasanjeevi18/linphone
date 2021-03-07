import { Dimensions, PixelRatio } from 'react-native';

const dimensions = Dimensions.get('window');

const color = {
    defaultBackground: '#FFF',
    secondaryBackground: '#00A1B3',
    defaultButton: '#FFC928',
    defaultButtonText: '#FFF',
    defaultText: '#000',
    headerText: '#FFF',
    highlightedText: '#00A1B3',
    errorText: '#ED1C24',
    blue: '#3546C6',
    skyBlue: '#17A2E0',
    red: '#ED1C24',
    darkGreen: '#20843E',
    borderColor: '#E4E4E4',
    bkashRed: '#E2136E',
};

const font = {
    title: 24,
    heading1: 18,
    small: 12,
    extraSmall: 10,
    size: 14,
    cardHeaderSize: 16,
    weight: 'normal',
    regular: 'Roboto-Regular',
};

export default {
    font: font,
    color: color,
    window: {
        width: dimensions.width,
        height: dimensions.height,
    },
    header: {
        height: 55,
        paddingTop: 25,
        backgroundColor: color.secondaryBackground,
    },
    headerTitle: {
        color: color.headerText,
        fontSize: 18,
        fontWeight: '600',
        fontFamily: font.regular,
    },
    backgroundColor: color.secondaryBackground,
};
