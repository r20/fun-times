import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

import * as Utils from '../utils/Utils'
import * as logger from '../utils/logger'
import i18n from '../i18n/i18n'
import AppSettingsContext from '../context/AppSettingsContext'
import MyDivider from '../components/MyDivider'
import MyText from './MyText'
import MySlider from './MySlider'
import MyPrimaryButton from './MyPrimaryButton'
import { maxNumberOfYearsAway } from '../utils/interestingNumbersFinder'

/* 
  Start on a date that makes it convenient for using the spinner.
 */
const defaultStartingDate = new Date(2005, 5, 15, 0, 0, 0);


function EventDateTimePickerIos(props) {

  const appSettingsContext = useContext(AppSettingsContext);
  const startingDate = props.date ? props.date : defaultStartingDate;

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);

  const onChangeDate = (event, selectedDate) => {

    if (selectedDate) {
      const theDate = props.date || defaultStartingDate;
      const newDate = new Date(theDate.getTime());

      // keep time and change date
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());

      props.onSelectDate(newDate);
    }

  };


  const onChangeTime = (event, selectedDate) => {

    if (selectedDate) {
      const theDate = props.date || defaultStartingDate;
      const newDate = new Date(theDate.getTime());

      // keep date and change time
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());

      props.onSelectDate(newDate);
    }

  };


  // NOTE: must have dates within maxNumberOfYearsAway
  const theMaxDate = new Date();
  theMaxDate.setFullYear(theMaxDate.getFullYear() + maxNumberOfYearsAway);
  const theMinDate = new Date();
  theMinDate.setFullYear(theMinDate.getFullYear() - maxNumberOfYearsAway);


  const datePickerTitle = props.date ? Utils.getDisplayStringForDate(props.date) : i18n.t("selectDate");
  const timePickerTitle = (!props.useAllDay && props.date) ? Utils.getDisplayStringForTime(props.date) : i18n.t("selectTime");

  const toggleShowDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  const toggleShowTimePicker = () => {
    setShowTimePicker(!showTimePicker);

  };

  /* I tried using DeviceContext and a 3rd party library to get the device setting for
    this, but it didn't work.  Probably won't work in Expo without ejecting.
    Just don't support 24 hour format for now.  It could be made an app setting
    later if desired. */
  const is24HourFormat = true;

  /* TBD -look at use of spaceBetweenDateAndTime
  Use MyDivider ?? */
  return (
    <React.Fragment>
      <View >
        <MyPrimaryButton onPress={toggleShowDatePicker} title={datePickerTitle} accessibilityLabel="Open date picker for this event" />
      </View>
      {showDatePicker &&
        <React.Fragment>
          <MyDivider />
          <DateTimePicker
            testID="dateTimePicker"
            value={startingDate}
            mode='date'
            is24Hour={is24HourFormat}
            display="default"
            onChange={onChangeDate}
            minuteInterval={1}
            maximumDate={theMaxDate}
            minimumDate={theMinDate} />
          <MyDivider />
        </React.Fragment>
      }

      <View style={[styles.allDaySelection, { marginTop: props.spaceBetweenDateAndTime }]}>
        <MyText>{i18n.t("allDay")}</MyText>
        <MySwitch
          value={props.useAllDay}
          onValueChange={isYes => {
            props.onSetUseAllDay(isYes);
          }}
        />
      </View>
      {!props.useAllDay && (
        <React.Fragment>

          <View >
            <MyPrimaryButton disabled={props.useAllDay} onPress={toggleShowTimePicker} title={timePickerTitle} accessibilityLabel="Open time picker for this event" />
          </View>
          {showTimePicker &&
            <React.Fragment>
              <MyDivider />
              <DateTimePicker
                testID="dateTimePicker"
                value={startingDate}
                mode='time'
                is24Hour={is24HourFormat}
                display="default"
                onChange={onChangeTime}
                minuteInterval={1}
                maximumDate={theMaxDate}
                minimumDate={theMinDate} />
              <MyDivider />
            </React.Fragment>
          }

        </React.Fragment>
      )}
    </React.Fragment>
  );
};

EventDateTimePickerIos.propTypes = {
  date: PropTypes.object,
  useAllDay: PropTypes.bool.isRequired,
  onSelectDate: PropTypes.func.isRequired,
  onSetUseAllDay: PropTypes.func.isRequired,
  spaceBetweenDateAndTime: PropTypes.number.isRequired, // How much space to put between select date button and time controls
};

export default EventDateTimePickerIos;

const styles = StyleSheet.create({
  allDaySelection: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

});
