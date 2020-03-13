import React, { createContext } from 'react'
import { AsyncStorage, Platform, Alert } from 'react-native'

import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'


const STORAGE_KEY_DATEPICKER_YEAR_TIP_STATE = '@datepicker_year_tip_state';


const DATEPICKER_YEAR_TIP_STATES = {
  FIRST_TIME: 'first',
  SHOW_AGAIN: 'showAgain',
  DO_NOT_SHOW_AGAIN: 'doNotShowAgain',
}

// These are created with defaults.  The provider sets the real values using value prop.
const AppSettingsContext = createContext({
  helpWithDatePicker: () => { },
});

/**
 * Uses AsyncStorage to track things.
 */
export class AppSettingsContextProvider extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      // Default value
      datePickerYearTipState: DATEPICKER_YEAR_TIP_STATES.FIRST_TIME,
    };
  }

  async componentDidMount() {
    try {
      // If first time using app, set to FIRST_TIME
      let datePickerYearTipState = await AsyncStorage.getItem(STORAGE_KEY_DATEPICKER_YEAR_TIP_STATE) || DATEPICKER_YEAR_TIP_STATES.FIRST_TIME;
      this.setState({ datePickerYearTipState });
    } catch (e) {
      logger.log("Error from failing to load datePickerYearTipState: ", e);
    }

  }

  /**
 * Save the datePickerYearTipState
 */
  _saveDatePickerYearTipState = async (theState) => {
    this.setState({ datePickerYearTipState: theState });
    try {
      await AsyncStorage.setItem(STORAGE_KEY_DATEPICKER_YEAR_TIP_STATE, theState);
    } catch (e) {
      logger.log("Error from trying to save datePickerYearTipState: ", theState, e);
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

  render() {
    /* Make some functions available
    */
    return (
      <AppSettingsContext.Provider value={{
        helpWithDatePicker: this.helpWithDatePicker,
      }}>
        {this.props.children}
      </AppSettingsContext.Provider>
    );
  }
}

export default AppSettingsContext;
