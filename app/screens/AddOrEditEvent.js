import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet, Text, View, ScrollView, TextInput, DatePickerAndroid, DatePickerIOS,
  TouchableWithoutFeedback, TouchableOpacity, Keyboard, Alert, Platform
} from 'react-native'
import { Button } from 'react-native-elements'
import { useNavigation, useRoute } from '@react-navigation/native'
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'

import EventDateTimePickerAndroid from '../components/EventDateTimePickerAndroid'
import EventDateTimePickerIos from '../components/EventDateTimePickerIos'
import ColorPickerModal from '../components/ColorPickerModal'
import theme, { getContrastFontColor, colors, getRandomColor } from '../style/theme'

import EventListContext from '../context/EventListContext'
import * as Utils from '../utils/Utils'
import Event, { cloneEvent } from '../utils/Event'
import * as logger from '../utils/logger'
import i18n from '../i18n/i18n'

function AddOrEditEvent(props) {

  const eventListContext = useContext(EventListContext);
  const route = useRoute();
  const navigation = useNavigation();

  const oldEvent = route.params?.oldEvent ?? null;
  const newEvent = oldEvent ? cloneEvent(oldEvent) : null;
  const isCreate = !oldEvent;

  const [titleInputHeight, setTitleInputHeight] = useState(50);

  const [title, setTitle] = useState(newEvent ? newEvent.title : '');
  const [selectedDate, setSelectedDate] = useState(newEvent ? (new Date(newEvent.epochMillis)) : null);
  // If it was undefined, use true
  const initialIsFullDay = (newEvent && newEvent.isFullDay === false) ? newEvent.isFullDay : true;
  const [useFullDay, setUseFullDay] = useState(initialIsFullDay);
  const [selectedColor, setSelectedColor] = useState(newEvent ? newEvent.color : getRandomColor);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const isIos = Platform.OS === 'ios';

  const eventPlaceholders = {
    title: i18n.t("eventNameInputPlaceholder"),
  }


  /**
   * Save event if there's not one by the same title.
   * If there is, throw an Alert informing them.
   */
  const onPressSave = () => {

    Keyboard.dismiss();

    const newTitle = title.trim();

    let event;
    if (isCreate) {
      event = new Event({
        title: newTitle, epochMillis: selectedDate.getTime(), isFullDay: useFullDay,
        color: selectedColor, isCustom: true, selected: true, ignoreIfPast: false
      });
    } else {
      event = newEvent;
      event.title = newTitle;
      event.epochMillis = selectedDate.getTime();
      event.isFullDay = useFullDay;
      event.color = selectedColor;
    }

    if (eventListContext.getCustomEventWithTitle(newTitle)
      && (isCreate || event.title !== oldEvent.title)) {

      Alert.alert(
        i18n.t("eventUnableToSaveTitle"),
        i18n.t("eventUnableToSaveAlreadyExists", { someValue: newTitle }),
        [
          { text: i18n.t("ok") },
        ],
        { cancelable: true }
      )
    } else {

      logger.log("Saving event ", title, "--", selectedDate);

      if (isCreate) {
        eventListContext.addCustomEvent(event);
        // Go back to events screen when push save
        navigation.navigate("EventsScreen");
      } else {
        eventListContext.modifyEvent(oldEvent, event);
        // Go back to EventInfo with the new event
        navigation.navigate("EventInfo", { event: event });
      }
    }
  }


  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <View style={styles.headerButton}>
          <Button onPress={() => { navigation.goBack(); }}
            title={i18n.t("cancel")} type="clear" accessibilityLabel="cancel" />
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerButton}>
          <Button disabled={!selectedDate || !title || (title && !title.trim())} onPress={onPressSave}
            title={i18n.t("save")} type="clear" accessibilityLabel="Save event" />
        </View>
      ),
    });
  }, [navigation, title, selectedDate, useFullDay, selectedColor]);




  /* 
    Wrapped with TouchableWithoutFeedback so when they click outside of the text input
    (such as pressing a button), the keyboard closes.
   */
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

      <ScrollView contentContainerStyle={styles.container}>
        <TextInput
          style={[styles.titleInput, titleInputHeight]}
          multiline={true}
          onChangeText={text => setTitle(text)}
          onContentSizeChange={(event) => {
            setTitleInputHeight(event.nativeEvent.contentSize.height);
          }}
          placeholder={eventPlaceholders.title}
          maxLength={50}
          value={title ? title : ''}
        />
        <View style={styles.eventDateTimePickerWrapper} >
          {isIos &&
            <EventDateTimePickerIos date={selectedDate} useFullDay={useFullDay}
              onSelectDate={setSelectedDate} onSetUseFullDay={setUseFullDay}
              spaceBetweenDateAndTime={spaceAmount}
            />
          }
          {!isIos &&
            <EventDateTimePickerAndroid date={selectedDate} useFullDay={useFullDay}
              onSelectDate={setSelectedDate} onSetUseFullDay={setUseFullDay}
              onShowAndroidPicker={Keyboard.dismiss} spaceBetweenDateAndTime={spaceAmount}
            />
          }
        </View>
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
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

export default AddOrEditEvent;

AddOrEditEvent.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const spaceAmount = 60;

const styles = StyleSheet.create({
  container: {
    flex: 0,
    paddingRight: 45,
    paddingLeft: 45, // Needs to leave enough room for ios picker
    flexDirection: 'column',
    justifyContent: 'flex-start',
  },
  titleInput: {
    fontSize: theme.FONT_SIZE_XLARGE,
    borderColor: 'gray',
    borderWidth: 0,
    borderRadius: 3,
    padding: 5,
    marginTop: 20,
  },
  eventDateTimePickerWrapper: {
    marginTop: Platform.OS === 'ios' ? 40 : spaceAmount,
  },
  colorPicker: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spaceAmount,
    marginBottom: spaceAmount,
  },
  headerButton: {// jmr - figure out padding
    // padding is so touching close to it works too
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5, // jmr ??
  },
});

