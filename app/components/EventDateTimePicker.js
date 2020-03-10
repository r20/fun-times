import React, { useState } from 'react';
import PropTypes from 'prop-types'
import { StyleSheet, View, Button, Platform, Switch, Text, Keyboard } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import * as Utils from '../utils/Utils'
import * as logger from '../utils/logger'
import i18n from '../i18n/i18n'

export const maxNumberOfYearsAway = 200; // If you ever change this, search for it's use and read about implications

// jmr - people don't know how to change the year on android's date picker.  Need to help them.

/* 
  Start on a date that makes it convenient for using the spinner.
 */
const defaultStartingDate = new Date(2005, 5, 15, 0, 0, 0);


function EventDateTimePicker(props) {

  const startingDate = props.date ? props.date : defaultStartingDate;

  const [date, setDate] = useState(startingDate);
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);


  const onChange = (event, selectedDate) => {

    setShow(Platform.OS === 'ios');
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

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  /*
  For prototype, this supports only within a certain range.
  jmr - The DateTimePicker library crashes if value is 2039 or beyond.
  Until I figure that out, restrict selecting date to end of 2038.
  It also crashes if less than Jan 1, 1900.
  (However, right now nothing is stopping code from using this component and 
    passing a props.date past that.)
*/
  const theMaxDate = new Date(2038, 11, 31);

  // const theMinDate = new Date();
  // theMinDate.setFullYear(theMinDate.getFullYear() - maxNumberOfYearsAway);
  const theMinDate = new Date(1900, 0, 1); // app crashes when date older than this

  const datePickerTitle = props.date ? Utils.getDisplayStringForDate(props.date) : i18n.t("selectDate");

  const timePickerTitle = (!props.useFullDay && props.date) ? Utils.getDisplayStringForTime(props.date) : i18n.t("selectTime");



  /* I tried using DeviceContext and a 3rd party library to get the device setting for
    this, but it didn't work.  Probably won't work in Expo without ejecting.
    Just don't support 24 hour format for now.  It could be made an app setting
    later if desired. */
  const is24HourFormat = true;

  return (
    <React.Fragment>
      <View style={{ marginBottom: props.spaceBetweenDateAndTime }}>
        <Button onPress={showDatepicker} title={datePickerTitle} accessibilityLabel="Open date picker for this event" />
      </View>
      <View style={styles.fullDaySelection}>
        <Text>{i18n.t("fullDay")}</Text>
        <Switch
          value={props.useFullDay}
          onValueChange={isYes => {
            props.onSetUseFullDay(isYes);
          }}
        />
      </View>
      <View style={{ marginTop: 20 }}>
        <Button disabled={props.useFullDay} onPress={showTimepicker} title={timePickerTitle} accessibilityLabel="Open time picker for this event" />
      </View>
      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={startingDate}
          mode={mode}
          is24Hour={is24HourFormat}
          display="default"
          onChange={onChange}
          minuteInterval={1}
          maximumDate={theMaxDate}
          minimumDate={theMinDate}
        />
      )}
    </React.Fragment>
  );
};

EventDateTimePicker.propTypes = {
  date: PropTypes.object,
  useFullDay: PropTypes.bool.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  onSetUseFullDay: PropTypes.func.isRequired,
  onShowPicker: PropTypes.func, // If a picker is shown, this gets called
  spaceBetweenDateAndTime: PropTypes.number.isRequired, // How much space to put between select date button and time controls
};

export default EventDateTimePicker;

const styles = StyleSheet.create({
  fullDaySelection: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
