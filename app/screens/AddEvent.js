import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet, Text, View, TextInput, DatePickerAndroid, DatePickerIOS,
  Button, TouchableWithoutFeedback, TouchableOpacity, Keyboard, Alert
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import ColorPickerModal from '../components/ColorPickerModal'
import { colors, getRandomColor } from '../style/theme'

import { withEventListContext } from '../context/EventListContext'
import * as Utils from '../utils/Utils'
import Event from '../utils/Event'
import * as logger from '../utils/logger'

/**
 * TBD The date picker only supports Android right now.
 * Would like to support setting the time of day also.
 * I've updgraded expo to 36, and can try to use 
 *  RNDateTimePicker now.
 * 
 */
function AddEvent(props) {

  const [title, setTitle] = useState('');
  /* 
    selectedDate is object with date property holding a Date javascript object 
    because we can't seem to put date object directly in state 
   */
  const [selectedDate, setSelectedDate] = useState({ date: null });

  const eventPlaceholders = {
    title: "Title (e.g. Maria's birthday)",
  }


  const [selectedColor, setSelectedColor] = useState(getRandomColor);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const onPressDatePicker = async () => {
    Keyboard.dismiss();
    try {

      /* 
        Start on a date that makes it convenient for using the spinner.
        Also, using a time in middle of the day (12:00) because otherwise
        picking a day, closing the picker, and reopening will sometimes
        have the previous day
       */
      const startingDate = selectedDate.date ? selectedDate.date : new Date(2000, 5, 15, 12, 0, 0);

      /*
        For prototype, this supports only within a certain range.
      */
      const theMaxDate = new Date();
      theMaxDate.setFullYear(theMaxDate.getFullYear() + 25);

      const theMinDate = new Date();
      theMinDate.setFullYear(theMaxDate.getFullYear() - 200);

      const { action, year, month, day } = await DatePickerAndroid.open({
        date: startingDate,
        maxDate: theMaxDate,
        minDate: theMinDate,
        /* Use spinner since it's not obvious to some users on Android how to 
          change year in 'calendar' mode which is the default mode. */
        mode: 'spinner',
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        const newDate = new Date(year, month, day, 12, 0, 0);
        setSelectedDate({ date: newDate });
      }
    } catch ({ code, message }) {
      logger.warn('Cannot open date picker', message);
    }
  }


  /**
   * Save event if there's not one by the same title.
   * If there is, throw an Alert informing them.
   */
  const onPressSave = () => {

    Keyboard.dismiss();

    const event = new Event({ title, epochMillis: selectedDate.date.getTime(), color: selectedColor, isCustom: true });

    if (props.eventListContext.getCustomEventWithTitle(title)) {
      Alert.alert(
        'Unable To Add Event',
        'The event "' + title + '" already exists',
        [
          { text: 'OK' },
        ],
        { cancelable: true }
      )
    } else {

      logger.log("Saving event ", title, "--", selectedDate.date);

      props.eventListContext.addCustomEvent(event);

      // Go back to CustomEvents screen when push save
      props.navigation.navigate("CustomEvents");
    }

  }

  const datePickerTitle = selectedDate.date ? Utils.getDisplayStringForDate(selectedDate.date) : "Select Date";

  /* 
    Wrapped with TouchableWithoutFeedback so when they click outside of the text input
    (such as pressing a button), the keyboard closes.

    TBD - React-native's Button doesn't allow much styling, so make own component or
       use another library for better styled buttons.
   */
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <TextInput
          style={{
            height: 50, borderColor: 'gray', borderWidth: 1, padding: 5
          }}
          onChangeText={text => setTitle(text)}
          placeholder={eventPlaceholders.title}
          maxLength={50}
          value={title ? title : ''}
        />
        <Button onPress={onPressDatePicker} title={datePickerTitle} accessibilityLabel="Open date picker for this event" />
        <TouchableOpacity style={styles.colorPicker} onPress={() => setColorPickerVisible(true)}>
          <Text>Select Color</Text>
          <MaterialCommunityIcons
            name="palette"
            style={{ fontSize: 50, color: selectedColor }}
          />
          <ColorPickerModal
            visible={colorPickerVisible}
            colors={colors}
            selectedColor={selectedColor}
            text=""
            onSelect={newColor => {
              setSelectedColor(newColor);
              setColorPickerVisible(false);
            }}
          />

        </TouchableOpacity>
        <Button disabled={!selectedDate.date || !title} onPress={onPressSave} title="Save" accessibilityLabel="Save new event" />
      </View>
    </TouchableWithoutFeedback>
  );
}

export default withEventListContext(AddEvent);

AddEvent.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 75,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'space-around',
  },
  colorPicker: {
    alignItems: 'center',
    justifyContent: 'center',
  },

});
