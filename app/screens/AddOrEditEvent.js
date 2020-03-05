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
import Event, { cloneEvent } from '../utils/Event'
import * as logger from '../utils/logger'
import i18n from '../i18n/i18n'

function AddOrEditEvent(props) {

  const oldEvent = props.navigation.getParam("oldEvent", null);
  const newEvent = oldEvent ? cloneEvent(oldEvent) : null;
  const isCreate = !oldEvent;

  const [title, setTitle] = useState(newEvent ? newEvent.title : '');
  const [selectedDate, setSelectedDate] = useState(newEvent ? (new Date(newEvent.epochMillis)) : null);
  const [useFullDay, setUseFullDay] = useState(newEvent ? newEvent.isFullDay : true);
  const [selectedColor, setSelectedColor] = useState(newEvent ? newEvent.color : getRandomColor);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const eventPlaceholders = {
    title: i18n.t("eventNameInputPlaceholder"),
  }


  /**
   * Save event if there's not one by the same title.
   * If there is, throw an Alert informing them.
   */
  const onPressSave = () => {

    Keyboard.dismiss();

    let event;
    if (isCreate) {
      event = new Event({ title, epochMillis: selectedDate.getTime(), isFullDay: useFullDay, color: selectedColor, isCustom: true, selected: true, ignoreIfPast: false });
    } else {
      event = newEvent;
      event.title = title;
      event.epochMillis = selectedDate.getTime();
      event.isFullDay = useFullDay;
      event.color = selectedColor;
    }

    if (props.eventListContext.getCustomEventWithTitle(title)
      && (isCreate || event.title !== oldEvent.title)) {

      Alert.alert(
        i18n.t("eventUnableToSaveTitle"),
        i18n.t("eventUnableToSaveAlreadyExists", { someValue: title }),
        [
          { text: i18n.t("ok") },
        ],
        { cancelable: true }
      )
    } else {


      logger.log("Saving event ", title, "--", selectedDate);

      if (isCreate) {
        props.eventListContext.addCustomEvent(event);
        // Go back to events screen when push save
        props.navigation.navigate("EventsScreen");
      } else {
        props.eventListContext.modifyEvent(oldEvent, event);
        // Go back to EventInfo with the new event
        props.navigation.navigate("EventInfo", { event: event });
      }


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

        <EventDateTimePicker date={selectedDate} useFullDay={useFullDay}
          onSelectDate={setSelectedDate} onSetUseFullDay={setUseFullDay}
          onShowPicker={Keyboard.dismiss}
        />


        <TouchableOpacity style={styles.colorPicker} onPress={() => setColorPickerVisible(true)}>
          <Text>{i18n.t("selectColor")}</Text>
          <MaterialCommunityIcons
            name="palette"
            style={{ fontSize: 50, color: selectedColor }}
          />
        </TouchableOpacity>
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

        <Button disabled={!selectedDate || !title} onPress={onPressSave} title={i18n.t("save")} accessibilityLabel="Save new event" />
      </View>
    </TouchableWithoutFeedback>
  );
}

export default withEventListContext(AddOrEditEvent);

AddOrEditEvent.propTypes = {
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
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

