import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet, View, ScrollView, TouchableWithoutFeedback, Keyboard
} from 'react-native'

import { useScrollToTop } from '@react-navigation/native'

import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'

import AppSettingsContext from '../../context/AppSettingsContext'
import * as Utils from '../../utils/Utils'
import * as logger from '../../utils/logger'
import i18n from '../../i18n/i18n'
import { INTERESTING_CONSTANTS, getDecimalDisplayValueForKey } from '../../utils/interestingNumbersFinder'
import MyText from '../MyText'
import MySwitch from '../MySwitch'
import MySlider from '../MySlider'
import MyThemeContext from '../../context/MyThemeContext'

function MilestoneTypesSettings(props) {


  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);

  /*
  jmr:  Here's a list of things that could be done to improve app

  sharing dates (to send text, add to calendar, etc.)

  Headers for milestones list (by date, like Month YYYY)
  star (explain) what it's for.
  Sort by favorites? If Today things aren't clickable make them different

  Event groups, with color? (birthdays, holidays)
  */

  const appSettingsContext = useContext(AppSettingsContext);


  /* Things seem a little more responsive if I use local state and then update appSettingsContext
  when the slider is done changing rather than only use appSettingsContext for
  value and onValueChange in the slider */
  const [howMuchPi, setHowMuchPi] = useState(appSettingsContext.numberTypeUseMap.pi);
  const [howMuchEuler, setHowMuchEuler] = useState(appSettingsContext.numberTypeUseMap.euler);
  const [howMuchPhi, setHowMuchPhi] = useState(appSettingsContext.numberTypeUseMap.phi);
  const [howMuchPythagoras, setHowMuchPythagoras] = useState(appSettingsContext.numberTypeUseMap.pythagoras);
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

        <ScrollView ref={ref} contentContainerStyle={styles.container}>

          <View style={styles.switchSelection}>
            <MyText >{i18n.t("useRound")}</MyText>
            <MySwitch
              value={appSettingsContext.numberTypeUseMap.round}
              onValueChange={isYes => {
                appSettingsContext.setUseRound(isYes);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{i18n.t("useCount")}</MyText>
            <MySwitch
              value={appSettingsContext.numberTypeUseMap.count}
              onValueChange={isYes => {
                appSettingsContext.setUseCount(isYes);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{i18n.t("useRepDigits")}</MyText>
            <MySwitch
              value={appSettingsContext.numberTypeUseMap.repDigits}
              onValueChange={isYes => {
                appSettingsContext.setUseRepDigits(isYes);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{i18n.t("usePowers")}</MyText>
            <MySwitch
              value={appSettingsContext.numberTypeUseMap.superPower}
              onValueChange={isYes => {
                appSettingsContext.setUsePowers(isYes);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{i18n.t("useBinary")}</MyText>
            <MySwitch
              value={appSettingsContext.numberTypeUseMap.binary}
              onValueChange={isYes => {
                appSettingsContext.setUseBinary(isYes);
              }}
            />
          </View>


          <MyText style={styles.howMuchTitle}>{i18n.t("settingsHeaderHowMuchConstants")}</MyText>

          <MyText style={styles.sliderTitle}>{translationKeyMap.pi}</MyText>
          <MySlider value={howMuchPi} step={1} minimumValue={0} maximumValue={3}
            onValueChange={setHowMuchPi}
            onSlidingComplete={(newVal) => {
              setHowMuchPi(newVal);
              appSettingsContext.setUsePi(newVal);
            }}
          />
          <MyText style={styles.sliderTitle}>{translationKeyMap.speedOfLight}</MyText>
          <MySlider value={howMuchSpeedOfLight} step={1} minimumValue={0} maximumValue={3}
            onValueChange={setHowMuchSpeedOfLight}
            onSlidingComplete={(newVal) => {
              setHowMuchSpeedOfLight(newVal);
              appSettingsContext.setUseSpeedOfLight(newVal);
            }}
          />
          <MyText style={styles.sliderTitle}>{translationKeyMap.gravity}</MyText>
          <MySlider value={howMuchGravity} step={1} minimumValue={0} maximumValue={3}
            onValueChange={setHowMuchGravity}
            onSlidingComplete={(newVal) => {
              setHowMuchGravity(newVal);
              appSettingsContext.setUseGravity(newVal);
            }}
          />
          <MyText style={styles.sliderTitle}>{translationKeyMap.euler}</MyText>
          <MySlider value={howMuchEuler} step={1} minimumValue={0} maximumValue={3}
            onValueChange={setHowMuchEuler}
            onSlidingComplete={(newVal) => {
              setHowMuchEuler(newVal);
              appSettingsContext.setUseEuler(newVal);
            }}
          />
          <MyText style={styles.sliderTitle}>{translationKeyMap.phi}</MyText>
          <MySlider value={howMuchPhi} step={1} minimumValue={0} maximumValue={3}
            onValueChange={setHowMuchPhi}
            onSlidingComplete={(newVal) => {
              setHowMuchPhi(newVal);
              appSettingsContext.setUsePhi(newVal);
            }}
          />
          <MyText style={styles.sliderTitle}>{translationKeyMap.pythagoras}</MyText>
          <MySlider value={howMuchPythagoras} step={1} minimumValue={0} maximumValue={3}
            onValueChange={setHowMuchPythagoras}
            onSlidingComplete={(newVal) => {
              setHowMuchPythagoras(newVal);
              appSettingsContext.setUsePythagoras(newVal);
            }}
          />
          <MyText style={styles.sliderTitle}>{translationKeyMap.mole}</MyText>
          <MySlider value={howMuchMole} step={1} minimumValue={0} maximumValue={3}
            onValueChange={setHowMuchMole}
            onSlidingComplete={(newVal) => {
              setHowMuchMole(newVal);
              appSettingsContext.setUseMole(newVal);
            }}
          />
          <MyText style={styles.sliderTitle}>{translationKeyMap.rGas}</MyText>
          <MySlider value={howMuchRGas} step={1} minimumValue={0} maximumValue={3}
            onValueChange={setHowMuchRGas}
            onSlidingComplete={(newVal) => {
              setHowMuchRGas(newVal);
              appSettingsContext.setUseRGas(newVal);
            }}
          />
          <MyText style={styles.sliderTitle}>{translationKeyMap.faraday}</MyText>
          <MySlider value={howMuchFaraday} step={1} minimumValue={0} maximumValue={3}
            onValueChange={setHowMuchFaraday}
            onSlidingComplete={(newVal) => {
              setHowMuchFaraday(newVal);
              appSettingsContext.setUseFaraday(newVal);
            }}
          />

        </ScrollView>
      </React.Fragment>
    </TouchableWithoutFeedback>
  );
}


export default MilestoneTypesSettings;



const styles = StyleSheet.create({
  sliderTitle: {
    paddingTop: 10,
  },
  howMuchTitle: {
    paddingTop: 20,
    paddingBottom: 5,
  },
  switchSelection: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 5,
  },
});

