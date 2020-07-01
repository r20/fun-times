import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet, View, ScrollView, TouchableWithoutFeedback, Keyboard, Platform, TouchableOpacity, Alert,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useScrollToTop } from '@react-navigation/native'

import AppSettingsContext from '../../context/AppSettingsContext'
import MyThemeContext from '../../context/MyThemeContext'
import ColorPickerModal from '../../components/ColorPickerModal'
import * as Utils from '../../utils/Utils'
import * as logger from '../../utils/logger'
import i18n from '../../i18n/i18n'
import MyText from '../MyText'
import MySwitch from '../MySwitch'
import CalendarContext from '../../context/CalendarContext'
import MyActivityIndicatorWithFullScreenSemiTransparent from '../../components/MyActivityIndicatorWithFullScreenSemiTransparent'

function GeneralSettings(props) {

  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);

  const appSettingsContext = useContext(AppSettingsContext);
  const myThemeContext = useContext(MyThemeContext);
  const calendarContext = useContext(CalendarContext);


  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [isActivityIndicatorOn, setIsActivityIndicatorOn] = useState(false);

  const onSelectCalendarColor = (newColor) => {

    if (calendarContext.areAnyMilestonesOnCalendar()) {

      Alert.alert(
        i18n.t('calendarChangeColorTitle'),
        i18n.t('calendarChangeColorConfirmation'),
        [
          {
            text: i18n.t('cancel'),
            onPress: () => {
              logger.log('Cancel Pressed');
            },
            style: 'cancel',
          },
          {
            text: i18n.t('ok'), onPress: async () => {
              logger.log('OK Pressed');
              // this can take a while, so show ActivityIndicator
              setIsActivityIndicatorOn(true);
              await calendarContext.changeCalendarColorAsync(newColor);
              setIsActivityIndicatorOn(false);
            }
          },
        ],
        // On Android, cancelable: true allows them to tap outside the box to get rid of alert without doing anything
        { cancelable: true }
      );
    } else {
      // No milestones are on calendar.  Just change it without the warning.
      calendarContext.changeCalendarColorAsync(newColor);
    }
  }



  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <React.Fragment>
        <ScrollView ref={ref} contentContainerStyle={styles.container}>

          <View style={styles.container}>
            <View style={styles.section}>
              <MyText >{i18n.t("settingsDefaultTheme")}</MyText>
              <MySwitch
                value={appSettingsContext.isThemeDefault}
                onValueChange={isYes => {
                  appSettingsContext.setIsThemeDefault(isYes);
                }}
              />
            </View>
            <View style={styles.section}>
              <MyText>{i18n.t("selectColor")}</MyText>
              <TouchableOpacity onPress={() => setColorPickerVisible(true)}>

                <MaterialCommunityIcons
                  name="palette"
                  style={{ fontSize: 40, color: myThemeContext.colors.calendar }}
                />
              </TouchableOpacity>
            </View>
            <ColorPickerModal
              visible={colorPickerVisible}
              colors={myThemeContext.calendarColorPallete}
              selectedColor={myThemeContext.colors.calendar}
              text=""
              onSelect={newColor => {
                if (newColor !== myThemeContext.colors.calendar) {
                  onSelectCalendarColor(newColor);
                }
                setColorPickerVisible(false);
              }}
            />
          </View>

        </ScrollView>
        {isActivityIndicatorOn && <MyActivityIndicatorWithFullScreenSemiTransparent />}
      </React.Fragment>
    </TouchableWithoutFeedback >
  );
}

export default GeneralSettings;

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  section: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
});

