import { NavigationActions } from 'react-navigation';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
  _navigator = navigatorRef;
}

function navigate(routeName, params) {
  _navigator.dispatch(
    NavigationActions.navigate({
      routeName,
      params,
    })
  );
}

export default {
  navigate,
  setTopLevelNavigator,
};

/*
Docs: 2.x
https://reactnavigation.org/docs/2.x/navigating-without-navigation-prop

Usage:
    import NavigationSrv from 'path-to-NavigationService.js';
    NavigationSrv.navigate('ChatScreen', { userName: 'Lucy' });
*/