import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, FlatList, View, Platform } from 'react-native'
import { ButtonGroup } from 'react-native-elements'

import i18n from '../i18n/i18n'
import StandardEvents from '../screens/StandardEvents'
import CustomEvents from '../screens/CustomEvents'
import MyText from '../components/MyText'
import MyThemeContext from '../context/MyThemeContext'
import MyScreenHeader from '../components/MyScreenHeader'
import AppSettingsContext from '../context/AppSettingsContext'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
});

function EventsScreen(props) {

  const myThemeContext = useContext(MyThemeContext);
  const appSettingsContext = useContext(AppSettingsContext);

  const selectedIndex = appSettingsContext.eventsLastSelectedScreen === 'custom' ? 1 : 0;

  const handleChangeScreen = (newIdx) => {
    if (newIdx === 1) {
      appSettingsContext.setEventsLastSelectedScreen('custom');
    } else {
      appSettingsContext.setEventsLastSelectedScreen('standard');
    }
  }
  const buttons = [i18n.t('standard'), i18n.t('custom')];
  return (

    <View style={styles.container}>

      <MyScreenHeader title={i18n.t('headerEventsTitle')} />
      <ButtonGroup
        onPress={handleChangeScreen}
        selectedIndex={selectedIndex}
        buttons={buttons}
        innerBorderStyle={{ width: 0 }}
        containerStyle={{ borderWidth: 1, borderColor: myThemeContext.colors.primary }}
        selectedTextStyle={{
          color: myThemeContext.colors.primaryContrast,
          backgroundColor: myThemeContext.colors.primary,
        }}
        textStyle={{
          color: myThemeContext.colors.text,
          backgroundColor: myThemeContext.colors.background,
        }}
        buttonStyle={{
          backgroundColor: myThemeContext.colors.background,
        }}
        selectedButtonStyle={{
          backgroundColor: myThemeContext.colors.primary,
        }}
      />
      {selectedIndex ?
        <CustomEvents /> :
        <StandardEvents />
      }
    </View>
  );
}

export default EventsScreen;


