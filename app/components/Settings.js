import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet, Text, View, ScrollView, Switch,
  TouchableWithoutFeedback, Keyboard, Alert, Platform
} from 'react-native'

import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'

import theme, { getContrastFontColor, colors, getRandomColor } from '../style/theme'

import AppSettingsContext from '../context/AppSettingsContext'
import * as Utils from '../utils/Utils'
import * as logger from '../utils/logger'
import Divider from '../components/Divider'
import i18n from '../i18n/i18n'

function Settings(props) {


  /*
  jmr:  Here's a list of things that could be done to improve app

  sharing dates (to send text, add to calendar, etc.)

  Headers for milestones list (by date, like Month YYYY)
  star (explain) what it's for.
  Sort by favorites? If Today things aren't clickable make them different
  color picker colors?
  Event groups, with color? (birthdays, holidays)
  */

  const appSettingsContext = useContext(AppSettingsContext);


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <React.Fragment>

        <ScrollView contentContainerStyle={styles.container}>
          <Divider style={styles.divider} />
          <Text style={styles.header}>{i18n.t("settingsHeaderShowAdditionalMilestonesForNumberTypes")}</Text>
          <View style={[styles.switchSelection]}>
            <Text>{i18n.t("usePowers")}</Text>
            <Switch
              value={appSettingsContext.numberTypeUseMap.usePowers}
              onValueChange={isYes => {
                appSettingsContext.setUsePowers(isYes);
              }}
            />
          </View>
          <View style={[styles.switchSelection]}>
            <Text>{i18n.t("useBinary")}</Text>
            <Switch
              value={appSettingsContext.numberTypeUseMap.useBinary}
              onValueChange={isYes => {
                appSettingsContext.setUseBinary(isYes);
              }}
            />
          </View>
         
          <Divider style={styles.divider} />
        </ScrollView>
      </React.Fragment>
    </TouchableWithoutFeedback>
  );
}

export default Settings;

Settings.propTypes = {

}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingHorizontal: 20, // jmr - this is used in several places.  DRY.
  },
  header: {
    paddingVertical: 10,
  },
  divider: {
    marginVertical: 10,
  },
  switchSelection: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
});

