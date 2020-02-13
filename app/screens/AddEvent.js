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
import i18n from '../i18n/i18n'

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

    const event = new Event({ title, epochMillis: selectedDate.getTime(), isFullDay: useFullDay, color: selectedColor, isCustom: true, selected: true, ignoreIfPast: false });

    if (props.eventListContext.getCustomEventWithTitle(title)) {

      Alert.alert(
        i18n.t("eventUnableToAddTitle"),
        i18n.t("eventUnableToAddAlreadyExists", { someValue: title }),
        [
          { text: i18n.t("ok") },
        ],
        { cancelable: true }
      )
    } else {

      logger.log("Saving event ", title, "--", selectedDate);

      props.eventListContext.addCustomEvent(event);

      // Go back to events screen when push save
      props.navigation.navigate("EventsScreen");
    }

  }

  /* jmr- TODOs:
  If create event past 2040 or so, app crashes
  Too many time since and upcoming milestones
  (I could by default not show milestones that are within 4 days of an event
    to drastically reduce.  I could make this configurable.
    Perhaps I make a slider thing to show more/less milestones
    and close days is one thing I adjust and I adjust something else?
    Need to decide whether to show pi variables and other types of times too.)
  Improve styling / colors
  */

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
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

