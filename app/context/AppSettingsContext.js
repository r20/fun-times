import React, { createContext } from 'react'
import { AsyncStorage, Platform, Alert } from 'react-native'
import { Appearance } from 'react-native-appearance'

import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import { INTERESTING_TYPES, INTERESTING_CONSTANTS } from '../utils/interestingNumbersFinder'

const STORAGE_KEY_DATEPICKER_YEAR_TIP_STATE = '@datepicker_year_tip_state';
const STORAGE_KEY_calendarMaxNumberMilestonesPerEvent = '@calendarMaxNumberMilestonesPerEvent';
const STORAGE_KEY_numberTypeUseMap = '@numberTypeUseMap';
const STORAGE_KEY_isThemeDefault = '@isThemeDefault';


const DATEPICKER_YEAR_TIP_STATES = {
  FIRST_TIME: 'first',
  SHOW_AGAIN: 'showAgain',
  DO_NOT_SHOW_AGAIN: 'doNotShowAgain',
}

// These are created with defaults.  The provider sets the real values using value prop.
const AppSettingsContext = createContext({
  helpWithDatePicker: () => { },
  setCalendarMaxNumberMilestonesPerEvent: (maxNum) => { },
  // These are on or off
  setUseRound: () => { },
  setUseCount: () => { },
  setUseRepDigits: () => { },
  setUsePowers: () => { },
  setUseBinary: () => { },
  // These can be 0, 1, 2, or 3
  setUsePi: () => { },
  setUseEuler: () => { },
  setUsePhi: () => { },
  setUsePythagoras: () => { },
  setUseSpeedOfLight: () => { },
  setUseGravity: () => { },
  setUseMole: () => { },
  setUseRGas: () => { },
  setUseFaraday: () => { },
  setIsThemeDefault: () => { },
});



/**
 * Uses AsyncStorage to track things.
 */
export class AppSettingsContextProvider extends React.Component {

  constructor(props) {
    super(props);

    // For debug, this is how to remove keys
    //AsyncStorage.multiRemove([STORAGE_KEY_numberTypeUseMap, STORAGE_KEY_calendarMaxNumberMilestonesPerEvent, STORAGE_KEY_DATEPICKER_YEAR_TIP_STATE]);

    this.state = {
      // Default values
      datePickerYearTipState: DATEPICKER_YEAR_TIP_STATES.FIRST_TIME,
      calendarMaxNumberMilestonesPerEvent: 3,
      numberTypeUseMap: {}, // has usePowers, useBinary, useGravity, etc. attributes. 
      isThemeDefault: true,
      isInitialSettingsLoaded: false,
    };
  }

  async componentDidMount() {
    try {
      // If first time using app, set to FIRST_TIME
      let datePickerYearTipState = await AsyncStorage.getItem(STORAGE_KEY_DATEPICKER_YEAR_TIP_STATE) || DATEPICKER_YEAR_TIP_STATES.FIRST_TIME;
      if (typeof datePickerYearTipState !== "string") {
        datePickerYearTipState = JSON.parse(datePickerYearTipState);
      }

      this.setState({ datePickerYearTipState });
    } catch (e) {
      logger.warn("Error from failing to load datePickerYearTipState: ", e);
    }
    try {
      let calendarMaxNumberMilestonesPerEvent = await AsyncStorage.getItem(STORAGE_KEY_calendarMaxNumberMilestonesPerEvent) || 3;
      if (typeof calendarMaxNumberMilestonesPerEvent !== "number") {
        calendarMaxNumberMilestonesPerEvent = JSON.parse(calendarMaxNumberMilestonesPerEvent);
      }
      this.setState({ calendarMaxNumberMilestonesPerEvent });
    } catch (e) {
      logger.warn("Error from failing to load calendarMaxNumberMilestonesPerEvent: ", e);
    }
    try {
      // If not in async storage, use empty object and we'll set defaults  just below
      let numberTypeUseMap = await AsyncStorage.getItem(STORAGE_KEY_numberTypeUseMap) || {};
      if (typeof numberTypeUseMap !== "object") {
        numberTypeUseMap = JSON.parse(numberTypeUseMap);
      }

      /* If defaults weren't saved, set them and save them */
      let saveToAsyncStorage = false;
      for (let typeKey in INTERESTING_TYPES) {
        if (numberTypeUseMap[INTERESTING_TYPES[typeKey]] === undefined) {
          saveToAsyncStorage = true;

          if (INTERESTING_CONSTANTS[typeKey] !== undefined) {
            // If this is a constant (e.g. pi), use it's default or 0
            numberTypeUseMap[INTERESTING_TYPES[typeKey]] = INTERESTING_CONSTANTS[typeKey].defaultUse || 0;
          } else {
            // This is not a constant (e.g. round)
            numberTypeUseMap[INTERESTING_TYPES[typeKey]] = true; // default to true
          }
        }
      }


      this.setState({ numberTypeUseMap });
      if (saveToAsyncStorage) {
        AsyncStorage.setItem(STORAGE_KEY_numberTypeUseMap, JSON.stringify(numberTypeUseMap));
      }

    } catch (e) {
      logger.warn("Error from failing to load use* number types: ", e);
    }

    try {

      let isThemeDefault = await AsyncStorage.getItem(STORAGE_KEY_isThemeDefault) || "true";
      isThemeDefault = JSON.parse(isThemeDefault);

      this.setState({ isThemeDefault: isThemeDefault });
    } catch (e) {
      logger.warn("Error from failing to load isThemeDefault: ", e);
    }

    // After all settings are initially loaded set this
    setTimeout(() => {
      this.setState({ isInitialSettingsLoaded: true });
    }, 10);


  }


  /**
 * Save the datePickerYearTipState
 */
  _saveDatePickerYearTipState = async (theState) => {
    this.setState({ datePickerYearTipState: theState });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_DATEPICKER_YEAR_TIP_STATE, JSON.stringify(theState));
    } catch (e) {
      logger.warn("Error from trying to save datePickerYearTipState: ", theState, e);
    }
  }

  /* Many people don't know how to change the year on Android's date picker so we help them. */
  helpWithDatePicker = () => {
    if (Platform.OS === 'android' && (this.state.datePickerYearTipState === DATEPICKER_YEAR_TIP_STATES.FIRST_TIME || this.state.datePickerYearTipState === DATEPICKER_YEAR_TIP_STATES.SHOW_AGAIN)) {
      setTimeout(() => {

        const btns = [];
        if (this.state.datePickerYearTipState !== DATEPICKER_YEAR_TIP_STATES.FIRST_TIME) {
          // Not first time, so offer do not show again option
          btns.push({
            text: i18n.t("doNotShowAgainMessage"),
            onPress: () => {
              logger.log("Datepicker year tip: Don't show again");
              this._saveDatePickerYearTipState(DATEPICKER_YEAR_TIP_STATES.DO_NOT_SHOW_AGAIN);
            }
          });
        }
        btns.push({
          text: i18n.t("ok"),
          onPress: () => {
            logger.log("Datepicker year tip: Show again");
            this._saveDatePickerYearTipState(DATEPICKER_YEAR_TIP_STATES.SHOW_AGAIN);
          }
        });

        Alert.alert(
          i18n.t("datePickerHelpTitle"),
          i18n.t("datePickerHelpMessage"),
          btns,
          { cancelable: true }
        )
      }, 200);
    }
  }

  /**
  * Set and save the calendarMaxNumberMilestonesPerEvent
  */
  setCalendarMaxNumberMilestonesPerEvent = async (maxNum) => {
    if (typeof maxNum === 'number') {
      this.setState({ calendarMaxNumberMilestonesPerEvent: maxNum });
      try {
        await AsyncStorage.setItem(STORAGE_KEY_calendarMaxNumberMilestonesPerEvent, JSON.stringify(maxNum));
      } catch (e) {
        logger.warn("Error from trying to save calendarMaxNumberMilestonesPerEvent: ", maxNum, e);
      }
    } else {
      logger.warn("Error. Expected number for calendarMaxNumberMilestonesPerEvent, but received: ", maxNum);
    }
  }


  /**
   * Set and save isThemeDefault
   */
  setIsThemeDefault = (isYes) => {
    try {
      this.setState({ isThemeDefault: isYes });

      // Don't wait
      AsyncStorage.setItem(STORAGE_KEY_isThemeDefault, JSON.stringify(isYes));
    } catch (e) {
      logger.warn("Error from trying to setIsThemeDefault: ", isYes, e);
    }
  }


  /**
 * Helper function to set attribute in numberTypeUseMap
 */
  _setNumberTypeUseMapAttribute = async (isYes, attr) => {
    let obj = {};
    obj[attr] = isYes;
    const numberTypeUseMap = Object.assign({}, this.state.numberTypeUseMap, obj);
    this.setState({ numberTypeUseMap });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_numberTypeUseMap, JSON.stringify(numberTypeUseMap));
    } catch (e) {
      logger.warn("Error from trying to save numberTypeUseMap: ", numberTypeUseMap, e);
    }
  }

  setUseRound = async (isYes) => {
    await this._setNumberTypeUseMapAttribute(isYes, INTERESTING_TYPES.round);
  }
  setUseCount = async (isYes) => {
    await this._setNumberTypeUseMapAttribute(isYes, INTERESTING_TYPES.count);
  }
  setUseRepDigits = async (isYes) => {
    await this._setNumberTypeUseMapAttribute(isYes, INTERESTING_TYPES.repDigits);
  }
  setUsePowers = async (isYes) => {
    await this._setNumberTypeUseMapAttribute(isYes, INTERESTING_TYPES.superPower);
  }
  setUseBinary = async (isYes) => {
    await this._setNumberTypeUseMapAttribute(isYes, INTERESTING_TYPES.binary);
  }
  setUsePi = async (howMuch) => {
    await this._setNumberTypeUseMapAttribute(howMuch, INTERESTING_TYPES.pi);
  }
  setUseEuler = async (howMuch) => {
    await this._setNumberTypeUseMapAttribute(howMuch, INTERESTING_TYPES.euler);
  }
  setUsePhi = async (howMuch) => {
    await this._setNumberTypeUseMapAttribute(howMuch, INTERESTING_TYPES.phi);
  }
  setUsePythagoras = async (howMuch) => {
    await this._setNumberTypeUseMapAttribute(howMuch, INTERESTING_TYPES.pythagoras);
  }
  setUseSpeedOfLight = async (howMuch) => {
    await this._setNumberTypeUseMapAttribute(howMuch, INTERESTING_TYPES.speedOfLight);
  }
  setUseGravity = async (howMuch) => {
    await this._setNumberTypeUseMapAttribute(howMuch, INTERESTING_TYPES.gravity);
  }
  setUseMole = async (howMuch) => {
    await this._setNumberTypeUseMapAttribute(howMuch, INTERESTING_TYPES.mole);
  }
  setUseRGas = async (howMuch) => {
    await this._setNumberTypeUseMapAttribute(howMuch, INTERESTING_TYPES.rGas);
  }
  setUseFaraday = async (howMuch) => {
    await this._setNumberTypeUseMapAttribute(howMuch, INTERESTING_TYPES.faraday);
  }


  render() {
    /* Make some functions available
    */
    return (
      <AppSettingsContext.Provider value={{
        ...this.state,
        helpWithDatePicker: this.helpWithDatePicker,
        setCalendarMaxNumberMilestonesPerEvent: this.setCalendarMaxNumberMilestonesPerEvent,
        setUseRound: this.setUseRound,
        setUseCount: this.setUseCount,
        setUseRepDigits: this.setUseRepDigits,
        setUsePowers: this.setUsePowers,
        setUseBinary: this.setUseBinary,
        setUsePi: this.setUsePi,
        setUseEuler: this.setUseEuler,
        setUsePhi: this.setUsePhi,
        setUsePythagoras: this.setUsePythagoras,
        setUseSpeedOfLight: this.setUseSpeedOfLight,
        setUseGravity: this.setUseGravity,
        setUseMole: this.setUseMole,
        setUseRGas: this.setUseRGas,
        setUseFaraday: this.setUseFaraday,
        setIsThemeDefault: this.setIsThemeDefault,
      }}>
        {this.props.children}
      </AppSettingsContext.Provider>
    );
  }
}

export default AppSettingsContext;
