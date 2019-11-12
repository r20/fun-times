import React from 'react';
import { AppLoading } from 'expo';
import * as Font from 'expo-font';

import { Ionicons } from '@expo/vector-icons';

import { EventListProvider } from './app/context/EventListContext';
import AppNavigator from './app/navigation/AppNavigator';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isReady: false,
    };
  }

  async componentDidMount() {
    // Some fonts used in native-base components need to be pre-loaded
    await Font.loadAsync({
      Roboto: require('native-base/Fonts/Roboto.ttf'),
      Roboto_medium: require('native-base/Fonts/Roboto_medium.ttf'),
      ...Ionicons.font,
    });
    this.setState({ isReady: true });
  }

  render() {
    if (!this.state.isReady) {
      return <AppLoading />;
    }
    return <EventListProvider ><AppNavigator /></EventListProvider>
  }
}
