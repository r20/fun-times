import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

import * as Utils from '../utils/Utils'
import * as logger from '../utils/logger'
import i18n from '../i18n/i18n'
import AppSettingsContext from '../context/AppSettingsContext'
import { maxNumberOfYearsAway } from '../utils/interestingNumbersFinder'
import MyText from './MyText'
import MyPrimaryButton from './MyPrimaryButton'
import MySwitch from './MySwitch'

/* 
  This used to try to start on a date that makes it convenient for changing the year,
  but users were confused and expected it to start on today's date.
 */
const defaultStartingDate = new Date();


function EventDateTimePickerAndroid(props) {

  const appSettingsContext = useContext(AppSettingsContext);
  const startingDate = props.date ? props.date : defaultStartingDate;

  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);


  const onChange = (event, selectedDate) => {

    setShow(false);

    if (selectedDate) {
      const theDate = props.date || defaultStartingDate;
      const newDate = new Date(theDate.getTime());
      if (mode == 'date') {
        // keep time and change date
        newDate.setFullYear(selectedDate.getFullYear());
        newDate.setMonth(selectedDate.getMonth());
        newDate.setDate(selectedDate.getDate());

      } else {
        // keep date and change time
        newDate.setHours(selectedDate.getHours());
        newDate.setMinutes(selectedDate.getMinutes());
      }
      props.onSelectDate(newDate);
    }

  };

  const showMode = currentMode => {
    if (props.onShowPicker) {
      props.onShowPicker();
    }
    setShow(true);
    setMode(currentMode);
  };


  const showDatePicker = () => {
    showMode('date');
    appSettingsContext.helpWithDatePicker(); // Many people don't know how to set year, so help them
  };

  const showTimePicker = () => {
    showMode('time');
  };

  /* TBD - although the library doens't crash anymore when picking old dates, when re-opening the picker
    when setting to an old date the date shown is 1900.  You can still change and pick an older date, but
    that's a bug withthe library. */


  // NOTE: must have dates within maxNumberOfYearsAway
  const theMaxDate = new Date();
  theMaxDate.setFullYear(theMaxDate.getFullYear() + maxNumberOfYearsAway);
  const theMinDate = new Date();
  theMinDate.setFullYear(theMinDate.getFullYear() - maxNumberOfYearsAway);

  const datePickerTitle = props.date ? Utils.getDisplayStringForDate(props.date) : i18n.t("selectDate");

  const timePickerTitle = (!props.useAllDay && props.date) ? Utils.getDisplayStringForTime(props.date) : i18n.t("selectTime");



  /* I tried using DeviceContext and a 3rd party library to get the device setting for
    this, but it didn't work.  Probably won't work in Expo without ejecting.
    Just only support 24 hour format for now.  It could be made an app setting
    later if desired. */
  const is24HourFormat = true;

  return (
    <React.Fragment>
      <View style={{ marginBottom: props.spaceBetweenDateAndTime }}>
        <MyPrimaryButton onPress={showDatePicker} title={datePickerTitle} accessibilityLabel="Open date picker for this event" />
      </View>
      <View style={styles.allDaySelection}>
        <MyText>{i18n.t("allDay")}</MyText>
        <MySwitch
          value={props.useAllDay}
          onValueChange={isYes => {
            props.onSetUseAllDay(isYes);
          }}
        />
      </View>
      <View style={{ marginTop: 20 }}>
        <MyPrimaryButton disabled={props.useAllDay} onPress={showTimePicker} title={timePickerTitle} accessibilityLabel="Open time picker for this event" />
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          maximumDate={theMaxDate}
          minimumDate={theMinDate}
          value={startingDate}
          mode={mode}
          is24Hour={is24HourFormat}
          display="default"
          onChange={onChange}
          minuteInterval={1}
        />
      )}
    </React.Fragment>
  );
};

EventDateTimePickerAndroid.propTypes = {
  date: PropTypes.object,
  useAllDay: PropTypes.bool.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  onSetUseAllDay: PropTypes.func.isRequired,
  onShowAndroidPicker: PropTypes.func, // If picker is shown, this gets called
  spaceBetweenDateAndTime: PropTypes.number.isRequired, // How much space to put between select date button and time controls
};

export default EventDateTimePickerAndroid;

const styles = StyleSheet.create({
  allDaySelection: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
