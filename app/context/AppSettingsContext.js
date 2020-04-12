import React, { createContext } from 'react'
import { AsyncStorage, Platform, Alert } from 'react-native'

import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'


const STORAGE_KEY_DATEPICKER_YEAR_TIP_STATE = '@datepicker_year_tip_state';
const STORAGE_KEY_calendarMaxNumberMilestonesPerEvent = '@calendarMaxNumberMilestonesPerEvent';
const STORAGE_KEY_numberTypeUseMap = '@numberTypeUseMap';

const DATEPICKER_YEAR_TIP_STATES = {
  FIRST_TIME: 'first',
  SHOW_AGAIN: 'showAgain',
  DO_NOT_SHOW_AGAIN: 'doNotShowAgain',
}

// These are created with defaults.  The provider sets the real values using value prop.
const AppSettingsContext = createContext({
  helpWithDatePicker: () => { },
  setCalendarMaxNumberMilestonesPerEvent: (maxNum) => { },
  setUsePowers: () => { },
  setUseBinary: () => { },
  setUsePi: () => { },
});

/**
 * Uses AsyncStorage to track things.
 */
export class AppSettingsContextProvider extends React.Component {

  constructor(props) {
    super(props);

    // For debug, this is how to remove keys
    //AsyncStorage.multiRemove([STORAGE_KEY_calendarMaxNumberMilestonesPerEvent,STORAGE_KEY_DATEPICKER_YEAR_TIP_STATE]);

    this.state = {
      // Default value
      datePickerYearTipState: DATEPICKER_YEAR_TIP_STATES.FIRST_TIME,
      calendarMaxNumberMilestonesPerEvent: 3,
      numberTypeUseMap: {}, // has usePowers, useBinary, usePi attributes. All default to false/undefined.
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
      // can have empty object as default since all of these default to false
      let numberTypeUseMap = await AsyncStorage.getItem(STORAGE_KEY_numberTypeUseMap) || {};
      if (typeof numberTypeUseMap !== "object") {
        numberTypeUseMap = JSON.parse(numberTypeUseMap);
      }
      this.setState({ numberTypeUseMap });
    } catch (e) {
      logger.warn("Error from failing to load use* number types: ", e);
    }

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


  setUsePowers = async (isYes) => {
    const numberTypeUseMap = Object.assign({}, this.state.numberTypeUseMap, { usePowers: isYes });
    this.setState({ numberTypeUseMap });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_numberTypeUseMap, JSON.stringify(numberTypeUseMap));
    } catch (e) {
      logger.warn("Error from trying to save numberTypeUseMap: ", numberTypeUseMap, e);
    }
  }
  setUseBinary = async (isYes) => {
    const numberTypeUseMap = Object.assign({}, this.state.numberTypeUseMap, { useBinary: isYes });
    this.setState({ numberTypeUseMap });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_numberTypeUseMap, JSON.stringify(numberTypeUseMap));
    } catch (e) {
      logger.warn("Error from trying to save numberTypeUseMap: ", numberTypeUseMap, e);
    }
  }
  setUsePi = async (isYes) => {
    const numberTypeUseMap = Object.assign({}, this.state.numberTypeUseMap, { usePi: isYes });
    this.setState({ numberTypeUseMap });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_numberTypeUseMap, JSON.stringify(numberTypeUseMap));
    } catch (e) {
      logger.warn("Error from trying to save numberTypeUseMap: ", numberTypeUseMap, e);
    }
  }


  render() {
    /* Make some functions available
    */
    return (
      <AppSettingsContext.Provider value={{
        ...this.state,
        helpWithDatePicker: this.helpWithDatePicker,
        setCalendarMaxNumberMilestonesPerEvent: this.setCalendarMaxNumberMilestonesPerEvent,
        setUsePowers: this.setUsePowers,
        setUseBinary: this.setUseBinary,
        setUsePi: this.setUsePi,
      }}>
        {this.props.children}
      </AppSettingsContext.Provider>
    );
  }
}

export default AppSettingsContext;
