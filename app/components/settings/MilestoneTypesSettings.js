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
import MyText, { MyTextLarge } from '../MyText'
import MySwitch from '../MySwitch'
import MySlider from '../MySlider'
import MyThemeContext from '../../context/MyThemeContext'

function MilestoneTypesSettings(props) {


  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);

  /*
  TBD:  Here's a list of things that could be done to improve app

  Headers for milestones list (by date, like Month YYYY)
  Have line between past and future milestones (possibly by changing MyCard of one of them to put it floating above/below)
  More help and explanation when first open app.
  */

  const appSettingsContext = useContext(AppSettingsContext);

  /* 

  Note: These used to be sliders with values from 0 to 3 for how much to use the constants.
  Now, they are a switch with on/off and depending on the constant on means 1-3.

  OLD COMMENT:
  Things seem a little more responsive if I use local state and then update appSettingsContext
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


          <MyTextLarge style={styles.howMuchTitle}>{i18n.t("settingsHeaderConstants")}</MyTextLarge>

          <View style={styles.switchSelection}>
            <MyText >{i18n.t("settingsUseMathAndScienceConstantsForStandardEvents")}</MyText>
            <MySwitch
              value={appSettingsContext.settingsUseMathAndScienceConstantsForStandardEvents}
              onValueChange={isYes => {
                appSettingsContext.setSettingsUseMathAndScienceConstantsForStandardEvents(isYes);
              }}
            />
          </View>

          <View style={styles.switchSelection}>
            <MyText >{i18n.t("settingsUseMathAndScienceConstantsForCustomEvents")}</MyText>
            <MySwitch
              value={appSettingsContext.settingsUseMathAndScienceConstantsForCustomEvents}
              onValueChange={isYes => {
                appSettingsContext.setSettingsUseMathAndScienceConstantsForCustomEvents(isYes);
              }}
            />
          </View>

          <MyText style={styles.howMuchTitle}>{i18n.t("settingsHeaderWhichConstants")}</MyText>

          <View style={styles.switchSelection}>
            <MyText >{translationKeyMap.pi}</MyText>
            <MySwitch
              value={(howMuchPi > 0)}
              onValueChange={isYes => {
                const newVal = isYes ? 2 : 0;
                setHowMuchPi(newVal);
                appSettingsContext.setUsePi(newVal);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{translationKeyMap.speedOfLight}</MyText>
            <MySwitch
              value={(howMuchSpeedOfLight > 0)}
              onValueChange={isYes => {
                const newVal = isYes ? 2 : 0;
                setHowMuchSpeedOfLight(newVal);
                appSettingsContext.setUseSpeedOfLight(newVal);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{translationKeyMap.gravity}</MyText>
            <MySwitch
              value={(howMuchGravity > 0)}
              onValueChange={isYes => {
                const newVal = isYes ? 2 : 0;
                setHowMuchGravity(newVal);
                appSettingsContext.setUseGravity(newVal);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{translationKeyMap.euler}</MyText>
            <MySwitch
              value={(howMuchEuler > 0)}
              onValueChange={isYes => {
                const newVal = isYes ? 2 : 0;
                setHowMuchEuler(newVal);
                appSettingsContext.setUseEuler(newVal);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{translationKeyMap.phi}</MyText>
            <MySwitch
              value={(howMuchPhi > 0)}
              onValueChange={isYes => {
                const newVal = isYes ? 2 : 0;
                setHowMuchPhi(newVal);
                appSettingsContext.setUsePhi(newVal);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{translationKeyMap.pythagoras}</MyText>
            <MySwitch
              value={(howMuchPythagoras > 0)}
              onValueChange={isYes => {
                const newVal = isYes ? 2 : 0;
                setHowMuchPythagoras(newVal);
                appSettingsContext.setUsePythagoras(newVal);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{translationKeyMap.mole}</MyText>
            <MySwitch
              value={(howMuchMole > 0)}
              onValueChange={isYes => {
                const newVal = isYes ? 2 : 0;
                setHowMuchMole(newVal);
                appSettingsContext.setUseMole(newVal);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{translationKeyMap.rGas}</MyText>
            <MySwitch
              value={(howMuchRGas > 0)}
              onValueChange={isYes => {
                const newVal = isYes ? 2 : 0;
                setHowMuchRGas(newVal);
                appSettingsContext.setUseRGas(newVal);
              }}
            />
          </View>
          <View style={styles.switchSelection}>
            <MyText >{translationKeyMap.faraday}</MyText>
            <MySwitch
              value={(howMuchFaraday > 0)}
              onValueChange={isYes => {
                const newVal = isYes ? 2 : 0;
                setHowMuchFaraday(newVal);
                appSettingsContext.setUseFaraday(newVal);
              }}
            />
          </View>


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

