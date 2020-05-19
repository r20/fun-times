import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet, Text, View, ScrollView, Switch,
  TouchableWithoutFeedback, Keyboard, Alert, Platform, Button
} from 'react-native'
import { Slider } from 'react-native-elements'

import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'

import theme, { getContrastFontColor, colors, getRandomColor } from '../style/theme'

import AppSettingsContext from '../context/AppSettingsContext'
import CalendarContext from '../context/CalendarContext'
import * as Utils from '../utils/Utils'
import * as logger from '../utils/logger'
import Divider from '../components/Divider'
import i18n from '../i18n/i18n'
import { INTERESTING_CONSTANTS, getDecimalDisplayValueForKey } from '../utils/interestingNumbersFinder'


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
  const calendarContext = useContext(CalendarContext);


  /* Things seem a little more responsive if I use local state and then update appSettingsContext
  when the slider is done changing rather than only use appSettingsContext for
  value and onValueChange in the slider */
  const [howMuchPi, setHowMuchPi] = useState(appSettingsContext.numberTypeUseMap.pi);
  const [howMuchEuler, setHowMuchEuler] = useState(appSettingsContext.numberTypeUseMap.euler);
  const [howMuchPhi, setHowMuchPhi] = useState(appSettingsContext.numberTypeUseMap.phi);
  const [howMuchPythagoras, setHowMuchPythagoras] = useState(appSettingsContext.numberTypeUseMap.Pythagoras);
  const [howMuchSpeedOfLight, setHowMuchSpeedOfLight] = useState(appSettingsContext.numberTypeUseMap.speedOfLight);
  const [howMuchGravity, setHowMuchGravity] = useState(appSettingsContext.numberTypeUseMap.gravity);
  const [howMuchMole, setHowMuchMole] = useState(appSettingsContext.numberTypeUseMap.mole);
  const [howMuchRGas, setHowMuchRGas] = useState(appSettingsContext.numberTypeUseMap.rGas);
  const [howMuchFaraday, setHowMuchFaraday] = useState(appSettingsContext.numberTypeUseMap.faraday);


  const translationKeyMap = {};
  for (numberKey in INTERESTING_CONSTANTS) {
    const capitalKey = Utils.capitalize(numberKey);
    // Get display for constants
    if (numberKey === INTERESTING_CONSTANTS.pi) {
      translationKeyMap[numberKey] = i18n.t("numberName" + capitalKey) + " (" + getDecimalDisplayValueForKey(numberKey) + ")";
    } else {
      translationKeyMap[numberKey] = i18n.t("numberName" + capitalKey) + " = " + getDecimalDisplayValueForKey(numberKey);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <React.Fragment>

        <ScrollView contentContainerStyle={styles.container}>
          <Divider style={styles.divider} />
          <Text style={styles.header}>{i18n.t("settingsHeaderShowAdditionalMilestonesForNumberTypes")}</Text>

          <View style={[styles.switchSelection]}>
            <Text>{i18n.t("useRound")}</Text>
            <Switch
              value={appSettingsContext.numberTypeUseMap.round}
              onValueChange={isYes => {
                appSettingsContext.setUseRound(isYes);
              }}
            />
          </View>
          <View style={[styles.switchSelection]}>
            <Text>{i18n.t("useCount")}</Text>
            <Switch
              value={appSettingsContext.numberTypeUseMap.count}
              onValueChange={isYes => {
                appSettingsContext.setUseCount(isYes);
              }}
            />
          </View>
          <View style={[styles.switchSelection]}>
            <Text>{i18n.t("useRepDigits")}</Text>
            <Switch
              value={appSettingsContext.numberTypeUseMap.repDigits}
              onValueChange={isYes => {
                appSettingsContext.setUseRepDigits(isYes);
              }}
            />
          </View>
          <View style={[styles.switchSelection]}>
            <Text>{i18n.t("usePowers")}</Text>
            <Switch
              value={appSettingsContext.numberTypeUseMap.superPower}
              onValueChange={isYes => {
                appSettingsContext.setUsePowers(isYes);
              }}
            />
          </View>
          <View style={[styles.switchSelection]}>
            <Text>{i18n.t("useBinary")}</Text>
            <Switch
              value={appSettingsContext.numberTypeUseMap.binary}
              onValueChange={isYes => {
                appSettingsContext.setUseBinary(isYes);
              }}
            />
          </View>

          <Divider style={styles.divider} />
          <Text style={styles.header}>{i18n.t("settingsHeaderHowMuchConstants")}</Text>

          <Text style={styles.sliderTitle}>{translationKeyMap.pi}</Text>
          <Slider value={howMuchPi} step={1} minimumValue={0} maximumValue={3}
            thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={setHowMuchPi}
            onSlidingComplete={(newVal) => {
              setHowMuchPi(newVal);
              appSettingsContext.setUsePi(newVal);
            }}
          />
          <Text style={styles.sliderTitle}>{translationKeyMap.speedOfLight}</Text>
          <Slider value={howMuchSpeedOfLight} step={1} minimumValue={0} maximumValue={3}
            thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={setHowMuchSpeedOfLight}
            onSlidingComplete={(newVal) => {
              setHowMuchSpeedOfLight(newVal);
              appSettingsContext.setUseSpeedOfLight(newVal);
            }}
          />
          <Text style={styles.sliderTitle}>{translationKeyMap.gravity}</Text>
          <Slider value={howMuchGravity} step={1} minimumValue={0} maximumValue={3}
            thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={setHowMuchGravity}
            onSlidingComplete={(newVal) => {
              setHowMuchGravity(newVal);
              appSettingsContext.setUseGravity(newVal);
            }}
          />
          <Text style={styles.sliderTitle}>{translationKeyMap.euler}</Text>
          <Slider value={howMuchEuler} step={1} minimumValue={0} maximumValue={3}
            thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={setHowMuchEuler}
            onSlidingComplete={(newVal) => {
              setHowMuchEuler(newVal);
              appSettingsContext.setUseEuler(newVal);
            }}
          />
          <Text style={styles.sliderTitle}>{translationKeyMap.phi}</Text>
          <Slider value={howMuchPhi} step={1} minimumValue={0} maximumValue={3}
            thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={setHowMuchPhi}
            onSlidingComplete={(newVal) => {
              setHowMuchPhi(newVal);
              appSettingsContext.setUsePhi(newVal);
            }}
          />
          <Text style={styles.sliderTitle}>{translationKeyMap.pythagoras}</Text>
          <Slider value={howMuchPythagoras} step={1} minimumValue={0} maximumValue={3}
            thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={setHowMuchPythagoras}
            onSlidingComplete={(newVal) => {
              setHowMuchPythagoras(newVal);
              appSettingsContext.setUsePythagoras(newVal);
            }}
          />
          <Text style={styles.sliderTitle}>{translationKeyMap.mole}</Text>
          <Slider value={howMuchMole} step={1} minimumValue={0} maximumValue={3}
            thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={setHowMuchMole}
            onSlidingComplete={(newVal) => {
              setHowMuchMole(newVal);
              appSettingsContext.setUseMole(newVal);
            }}
          />
          <Text style={styles.sliderTitle}>{translationKeyMap.rGas}</Text>
          <Slider value={howMuchRGas} step={1} minimumValue={0} maximumValue={3}
            thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={setHowMuchRGas}
            onSlidingComplete={(newVal) => {
              setHowMuchRGas(newVal);
              appSettingsContext.setUseRGas(newVal);
            }}
          />
          <Text style={styles.sliderTitle}>{translationKeyMap.faraday}</Text>
          <Slider value={howMuchFaraday} step={1} minimumValue={0} maximumValue={3}
            thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={setHowMuchFaraday}
            onSlidingComplete={(newVal) => {
              setHowMuchFaraday(newVal);
              appSettingsContext.setUseFaraday(newVal);
            }}
          />

          <Divider style={styles.divider} />


          <Button onPress={()=> {logger.warn("jmr == Not deleting calendar"); /*calendarContext.removeFunTimesCalendar();*/}} title="Remove All Calendar Entries" ></Button>
        </ScrollView>
      </React.Fragment>
    </TouchableWithoutFeedback>
  );
}

/* jmr - should get confirmation first before deleting calendar */

export default Settings;

Settings.propTypes = {

}

const styles = StyleSheet.create({
  container: {
    flex: 0,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  header: {
    paddingVertical: 10,
  },
  sliderTitle: {
    paddingTop: 15,
  },
  divider: {
    marginVertical: 10,
    height: 2,
  },
  switchSelection: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
});

