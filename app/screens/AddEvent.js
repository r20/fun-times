import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet, Text, View, TextInput, DatePickerAndroid, DatePickerIOS,
  Button, TouchableWithoutFeedback, TouchableOpacity, Keyboard, Alert
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import EventDateTimePicker from '../components/EventDateTimePicker'
import ColorPickerModal from '../components/ColorPickerModal'
import { colors, getRandomColor } from '../style/theme'

import { withEventListContext } from '../context/EventListContext'
import * as Utils from '../utils/Utils'
import Event from '../utils/Event'
import * as logger from '../utils/logger'

function AddEvent(props) {

  const [title, setTitle] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [useFullDay, setUseFullDay] = useState(true);
  const [selectedColor, setSelectedColor] = useState(getRandomColor);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const eventPlaceholders = {
    title: "Title (e.g. Maria's birthday)",
  }


  /**
   * Save event if there's not one by the same title.
   * If there is, throw an Alert informing them.
   */
  const onPressSave = () => {

    Keyboard.dismiss();

    const event = new Event({ title, epochMillis: selectedDate.getTime(), isFullDay: useFullDay, color: selectedColor, isCustom: true });

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

      logger.log("Saving event ", title, "--", selectedDate);

      props.eventListContext.addCustomEvent(event);

      // Go back to CustomEvents screen when push save
      props.navigation.navigate("CustomEvents");
    }

  }


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

        <EventDateTimePicker date={selectedDate} useFullDay={useFullDay} onSelectDate={setSelectedDate} onSetUseFullDay={setUseFullDay} />

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
        <Button disabled={!selectedDate || !title} onPress={onPressSave} title="Save" accessibilityLabel="Save new event" />
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
