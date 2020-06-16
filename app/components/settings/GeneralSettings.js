import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet, View, ScrollView, Switch, Slider,
  TouchableWithoutFeedback, Keyboard, Platform, Button
} from 'react-native'

import { useScrollToTop } from '@react-navigation/native'

import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'

import AppSettingsContext from '../../context/AppSettingsContext'
import * as Utils from '../../utils/Utils'
import * as logger from '../../utils/logger'
import i18n from '../../i18n/i18n'
import MyText from '../MyText'

function GeneralSettings(props) {

  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);

  const appSettingsContext = useContext(AppSettingsContext);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <React.Fragment>

        <ScrollView ref={ref} contentContainerStyle={styles.container}>

          <View style={styles.switchSelection}>
            <MyText >{i18n.t("settingsDefaultTheme")}</MyText>
            <Switch
              value={appSettingsContext.isThemeDefault}
              onValueChange={isYes => {
                appSettingsContext.setIsThemeDefault(isYes);
              }}
            />
          </View>
         
        </ScrollView>
      </React.Fragment>
    </TouchableWithoutFeedback>
  );
}

export default GeneralSettings;

const styles = StyleSheet.create({
  switchSelection: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
});

