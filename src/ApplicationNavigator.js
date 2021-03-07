import {
    createStackNavigator,
    createBottomTabNavigator,
    createAppContainer,
} from 'react-navigation';

import LoginScreen from './screens/Login';
import OtpScreen from './screens/OTP';
import TabBar from './components/TabBar';
import InitialLoggedInScreen from './screens/InitialLoggedInScreen';

import { default as DeliveryProfileScreen } from './screens/DeliveryProfile';
import { default as DeliveryParcelDetailsScreen } from './screens/DeliveryProfile/ParcelDetails';
import { default as DeliveryEarningDetailsScreen } from './screens/DeliveryProfile/EarningDetails';
import { default as DeliveryPayslipsDetailsScreen } from './screens/DeliveryProfile/PayslipsDetails';
import { default as DeliveryMonthWiseEarningDetailsScreen } from './screens/DeliveryProfile/MonthWiseEarningDetails';

import { default as PickupProfileScreen } from './screens/PickupProfile';
import { default as PickupParcelDetailsScreen } from './screens/PickupProfile/ParcelDetails';
import { default as PickupEarningDetailsScreen } from './screens/PickupProfile/EarningDetails';
import { default as PickupPayslipsDetailsScreen } from './screens/PickupProfile/PayslipsDetails';
import { default as PickupMonthWiseEarningDetailsScreen } from './screens/PickupProfile/MonthWiseEarningDetails';
import CallScreen from './components/Call';

import {
    PickupPoint as PickupPointScreen,
    ParcelList as PickupParcelScreen,
    SacnParcel as SacnParcelScreen,
    ScannedParcelList as ScannedParcelListScreen,
} from './screens/pickup';

import {
    DeliveryArea as DeliveryAreaScreen,
    ParcelList as DeliveryParcelScreen,
    Parcel as ParcelScreen,
    IssueList as IssueListScreen,
    IssueDetails as IssueDetailsScreen,
} from './screens/delivery';

import {
    ReturnShop as ReturnShopScreen,
    ReturnParcelList as ReturnParcelListScreen,
    ReturnParcelDetails as ReturnParcelDetailsScreen,
    ReturnParcelByShopStoreId as ReturnByShopStoreIdList,
} from './screens/return';

import styleConst from './constants/Style';
// import { MaterialIcons } from '@expo/vector-icons';

// import * as dataStore from '../src/utils/Store';

const PickupScreens = createStackNavigator(
    {
        PickupPoint: {
            screen: PickupPointScreen,
            navigationOptions: {
                title: 'ShopUp pickup',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
        PickupParcel: {
            screen: PickupParcelScreen,
            navigationOptions: {
                title: 'ShopUp pickup',
                headerTintColor: '#FFF',
                tabBarVisible: true,
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
        SacnParcel: {
            screen: SacnParcelScreen,
            navigationOptions: {
                title: 'Scan Parcel',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
                tabBarVisible: false,
            },
        },
        ScannedParcelList: {
            screen: ScannedParcelListScreen,
            navigationOptions: {
                title: 'Scanned Parcel List',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
                tabBarVisible: false,
            },
        },
    },
    {
        headerMode: 'screen',
        initialRouteName: 'PickupPoint',
    }
);

const DeliveryScreens = createStackNavigator(
    {
        DeliveryArea: {
            screen: DeliveryAreaScreen,
            navigationOptions: {
                title: 'ShopUp delivery',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
        DeliveryParcel: {
            screen: DeliveryParcelScreen,
            navigationOptions: {
                title: 'ShopUp delivery',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
        Parcel: {
            screen: ParcelScreen,
            navigationOptions: {
                title: 'ShopUp delivery',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
        IssueList: {
            screen: IssueListScreen,
            navigationOptions: {
                title: 'ShopUp delivery',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
        IssueDetails: {
            screen: IssueDetailsScreen,
            navigationOptions: {
                title: 'ShopUp delivery',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
    },
    {
        headerMode: 'screen',
        initialRouteName: 'DeliveryArea',
    }
);

const ReturnScreens = createStackNavigator(
    {
        ReturnShopList: {
            screen: ReturnShopScreen,
            navigationOptions: {
                title: 'ShopUp delivery',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
        ReturnParcelByShopIdList: {
            screen: ReturnByShopStoreIdList,
            navigationOptions: {
                title: 'ShopUp delivery by shop store',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
        ReturnParcelList: {
            screen: ReturnParcelListScreen,
            navigationOptions: {
                title: 'ShopUp delivery',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
        ReturnParcelDetails: {
            screen: ReturnParcelDetailsScreen,
            navigationOptions: {
                title: 'ShopUp delivery',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
    },
    {
        headerMode: 'screen',
        initialRouteName: 'ReturnShopList',
    }
);

const PickupAgentProfileScreens = createStackNavigator({
    AgentProfile: {
        screen: PickupProfileScreen,
        navigationOptions: {
            title: 'Profile',
            headerTintColor: '#FFF',
            headerStyle: styleConst.header,
            headerTitleStyle: styleConst.headerTitle,
        },
    },
    ParcelDetails: {
        screen: PickupParcelDetailsScreen,

        navigationOptions: {
            title: 'Parcel Details',

            headerTintColor: '#FFF',

            headerStyle: styleConst.header,

            headerTitleStyle: styleConst.headerTitle,
        },
    },
    EarningDetails: {
        screen: PickupEarningDetailsScreen,

        navigationOptions: {
            title: 'Earning Details',

            headerTintColor: '#FFF',

            headerStyle: styleConst.header,

            headerTitleStyle: styleConst.headerTitle,
        },
    },
    PayslipsDetails: {
        screen: PickupPayslipsDetailsScreen,
        navigationOptions: {
            title: 'Payslip',

            headerTintColor: '#FFF',

            headerStyle: styleConst.header,

            headerTitleStyle: styleConst.headerTitle,
        },
    },
    MonthWiseEarningDetails: {
        screen: PickupMonthWiseEarningDetailsScreen,
        navigationOptions: {
            title: 'Monthy Earning Details',

            headerTintColor: '#FFF',

            headerStyle: styleConst.header,

            headerTitleStyle: styleConst.headerTitle,
        },
    },
});

const DeliveryAgentProfileScreens = createStackNavigator({
    AgentProfile: {
        screen: DeliveryProfileScreen,

        navigationOptions: {
            title: 'Profile',

            headerTintColor: '#FFF',

            headerStyle: styleConst.header,

            headerTitleStyle: styleConst.headerTitle,
        },
    },
    ParcelDetails: {
        screen: DeliveryParcelDetailsScreen,

        navigationOptions: {
            title: 'Parcel Details',

            headerTintColor: '#FFF',

            headerStyle: styleConst.header,

            headerTitleStyle: styleConst.headerTitle,
        },
    },
    EarningDetails: {
        screen: DeliveryEarningDetailsScreen,

        navigationOptions: {
            title: 'Earning Details',

            headerTintColor: '#FFF',

            headerStyle: styleConst.header,

            headerTitleStyle: styleConst.headerTitle,
        },
    },
    PayslipsDetails: {
        screen: DeliveryPayslipsDetailsScreen,
        navigationOptions: {
            title: 'Payslip',

            headerTintColor: '#FFF',

            headerStyle: styleConst.header,

            headerTitleStyle: styleConst.headerTitle,
        },
    },
    MonthWiseEarningDetails: {
        screen: DeliveryMonthWiseEarningDetailsScreen,
        navigationOptions: {
            title: 'Monthy Earning Details',

            headerTintColor: '#FFF',

            headerStyle: styleConst.header,

            headerTitleStyle: styleConst.headerTitle,
        },
    },
});

const OtpScreens = createStackNavigator(
    {
        OTP: {
            screen: OtpScreen,
            navigationOptions: {
                title: 'পিন কোড',
                headerTintColor: '#FFF',
                headerStyle: styleConst.header,
                headerTitleStyle: styleConst.headerTitle,
            },
        },
    },
    { headerMode: 'screen' }
);

const LoggedInScreens = createBottomTabNavigator(
    {
        DeliveryProfile: { screen: DeliveryAgentProfileScreens },
        PickupProfile: { screen: PickupAgentProfileScreens },
        Pickup: { screen: PickupScreens },
        Delivery: { screen: DeliveryScreens },
        Return: { screen: ReturnScreens },
        InitialLoggedInScreen: { screen: InitialLoggedInScreen },
    },
    {
        initialRouteName: 'InitialLoggedInScreen',
        tabBarPosition: 'bottom',
        swipeEnabled: false,
        tabBarOptions: {
            upperCaseLabel: false,
            labelStyle: {
                fontSize: 12,
            },
            style: {
                backgroundColor: '#EEE',
            },
            activeTintColor: styleConst.color.secondaryBackground,
            inactiveTintColor: '#566573',
        },
        tabBarComponent: TabBar,
    }
);

export default ApplicationNavigator = (isLoggedIn = false) => {
    return createAppContainer(
        createStackNavigator(
            {
                LogIn: {
                    screen: LoginScreen,
                    navigationOptions: {
                        gesturesEnabled: false,
                        header: null,
                    },
                },
                OTP: {
                    screen: OtpScreens,
                    navigationOptions: {
                        gesturesEnabled: false,
                    },
                },
                LoggedIn: {
                    screen: LoggedInScreens,
                    navigationOptions: {
                        gesturesEnabled: false,
                    },
                },
                Call: {
                    screen: CallScreen,
                    navigationOptions: {
                        gesturesEnabled: false,
                        header: null,
                    },
                },
            },
            {
                headerMode: 'none',
                initialRouteName: isLoggedIn ? 'LoggedIn' : 'LogIn',
            }
        )
    );
};
