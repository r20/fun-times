import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import {
  StyleSheet, View, ScrollView, TextInput, TouchableWithoutFeedback, TouchableOpacity, Keyboard, Alert, Platform
} from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { MaterialCommunityIcons, Ionicons, MaterialIcons } from '@expo/vector-icons'
import moment from 'moment-timezone'


import EventDateTimePickerAndroid from '../components/EventDateTimePickerAndroid'
import EventDateTimePickerIos from '../components/EventDateTimePickerIos'
import MyThemeContext from '../context/MyThemeContext'
import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import * as Utils from '../utils/Utils'
import Event, { cloneEvent } from '../utils/Event'
import * as logger from '../utils/logger'
import i18n from '../i18n/i18n'
import MyText, { MyTextXLarge } from '../components/MyText'
import MySwitch from '../components/MySwitch'
import MyPrimaryButton from '../components/MyPrimaryButton'
import { getInterestingNumbersForEventTime } from '../utils/milestones'

function AddOrEditEvent(props) {

  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
  const myThemeContext = useContext(MyThemeContext);

  const route = useRoute();
  const navigation = useNavigation();

  const oldEvent = route.params?.oldEvent ?? null;
  const clonedEvent = oldEvent ? cloneEvent(oldEvent) : null;
  const isCreate = !oldEvent;

  const [title, setTitle] = useState(clonedEvent ? clonedEvent.title : '');
  const [selectedDate, setSelectedDate] = useState(clonedEvent ? (new Date(clonedEvent.epochMillis)) : null);
  // If it was undefined, use true
  const initialIsAllDay = (clonedEvent && clonedEvent.isAllDay === false) ? clonedEvent.isAllDay : true;
  const [useAllDay, setUseAllDay] = useState(initialIsAllDay);
  const [useDateAndTimeInMilestones, setUseDateAndTimeInMilestones] = useState(clonedEvent ? clonedEvent.useDateAndTimeInMilestones : true);
  const initialManualEntryInput = (clonedEvent && clonedEvent.manualEntryNumbers && clonedEvent.manualEntryNumbers.length > 0) ? String(clonedEvent.manualEntryNumbers[0]) : '';
  const [manualEntryInput, setManualEntryInput] = useState(initialManualEntryInput);
  const [isManualEntryInvalid, setIsManualEntryInvalid] = useState(false);



  const isIos = Platform.OS === 'ios';

  const eventPlaceholders = {
    title: i18n.t("eventNameInputPlaceholder"),
  }

  const titleInputStyle = {
    fontSize: myThemeContext.FONT_SIZE_XLARGE,
    color: myThemeContext.colors.text,
    borderColor: 'gray',
    borderWidth: 0,
    borderRadius: 3,
    padding: 5,
    marginTop: 20,
  };

  const manualInputStyle = {
    fontSize: myThemeContext.FONT_SIZE_LARGE,
    color: (isManualEntryInvalid ? myThemeContext.colors.danger : myThemeContext.colors.text),
    borderColor: myThemeContext.colors.text,
    borderWidth: 0,
    borderRadius: 3,
    padding: 5,
    marginTop: 0,
  };

  /**
   * Save event if there's not one by the same title.
   * If there is, throw an Alert informing them.
   */
  const onPressSave = () => {

    Keyboard.dismiss();

    const newTitle = title.trim();

    /* Right now we only allow adding one manual number.
      If that's ever changed to allow more, be sure they don't duplicate the number and/or 
      check the code for generating the milestone key to be sure keys are unique.
    */
    const manualEntryNumbers = [];
    if (manualEntryInput) {
      try {
        const num = Number(manualEntryInput);
        if (!Number.isNaN(num)) {
          manualEntryNumbers.push(num);
        }
      } catch (err) {
        logger.error("Error while trying to convert manual entry to number ", err);
      }
    }

    let theTime = selectedDate.getTime();

    /* For all day events, set time to beginning or end of day */
    if (useAllDay) {
      theTime = moment(selectedDate.getTime()).startOf('day').toDate().getTime();
      if ((new Date()).getTime() >= theTime) {
        // If it's after the start of the day, set to end of day
        theTime = moment(selectedDate.getTime()).endOf('day').toDate().getTime();
      }
    }

    let event;
    if (isCreate) {
      event = new Event({
        title: newTitle, epochMillis: theTime, isAllDay: useAllDay,
        isCustom: true, selected: true, ignoreIfPast: false,
        useDateAndTimeInMilestones: useDateAndTimeInMilestones,
        useManualEntryInMilestones: (manualEntryNumbers.length > 0),
        manualEntryNumbers: manualEntryNumbers,
      });
    } else {
      event = clonedEvent;
      event.title = newTitle;
      event.epochMillis = theTime;
      event.isAllDay = useAllDay;
      event.useDateAndTimeInMilestones = useDateAndTimeInMilestones;
      event.useManualEntryInMilestones = (manualEntryNumbers.length > 0);
      event.manualEntryNumbers = manualEntryNumbers;
    }

    if (eventsAndMilestonesContext.getCustomEventWithTitle(newTitle)
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
        eventsAndMilestonesContext.addCustomEventAndMilestones(event);
        // Go to EventInfo with the new event
        navigation.replace("EventInfo", { event: event });
      } else {
        eventsAndMilestonesContext.modifyEventAndMilestones(oldEvent, event);
        // Go back to EventInfo with the new event
        navigation.navigate("EventInfo", { event: event });
      }
    }
  }

  navigation.setOptions({
    headerLeft: () => (
      <View style={styles.headerButton}>
        <MyPrimaryButton onPress={() => { navigation.goBack(); }}
          title={i18n.t("cancel")} type="clear" accessibilityLabel="cancel" />
      </View>
    ),
    headerRight: () => (
      <View style={styles.headerButton}>
        <MyPrimaryButton disabled={!selectedDate || !title || (title && !title.trim())} onPress={onPressSave}
          title={i18n.t("save")} type="clear" accessibilityLabel="Save event" />
      </View>
    ),
  });

  // Decided not to show control for using date/time for custom.  It's just always on.
  // let eventDatetimeNumbers = selectedDate ? getInterestingNumbersForEventTime(selectedDate.getTime(), useAllDay, undefined) : null;
  // let useDatetimeLabel = i18n.t("useDatetimeNumbers");
  // if (eventDatetimeNumbers && eventDatetimeNumbers.length > 0) {
  //   // Show one example.
  //   useDatetimeLabel = i18n.t('useDatetimeNumbersWithExample', { someValue: eventDatetimeNumbers[0].descriptor });
  // }

  /* 
    Wrapped with TouchableWithoutFeedback so when they click outside of the text input
    (such as pressing a button), the keyboard closes.
   */
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

      <ScrollView contentContainerStyle={styles.container}>

        <TextInput
          style={[titleInputStyle]}
          multiline={false}
          onChangeText={text => setTitle(text)}
          placeholder={eventPlaceholders.title}
          maxLength={50}
          value={title ? title : ''}
        />
        <View style={styles.eventDateTimePickerWrapper} >
          {isIos &&
            <EventDateTimePickerIos date={selectedDate} useAllDay={useAllDay}
              onSelectDate={setSelectedDate} onSetUseAllDay={setUseAllDay}
              spaceBetweenDateAndTime={spaceAmount}
            />
          }
          {!isIos &&
            <EventDateTimePickerAndroid date={selectedDate} useAllDay={useAllDay}
              onSelectDate={setSelectedDate} onSetUseAllDay={setUseAllDay}
              onShowAndroidPicker={Keyboard.dismiss} spaceBetweenDateAndTime={spaceAmount}
            />
          }
        </View>
        {/* Decided not to show this control anymore.  It's just on for custom events.
        <View style={styles.switch}>
          <MyText style={{ maxWidth: 210 }}>{useDatetimeLabel}</MyText>
          <MySwitch
            value={useDateAndTimeInMilestones}
            onValueChange={isYes => {
              setUseDateAndTimeInMilestones(isYes);
            }}
          />
        </View>*/}

        <View style={styles.manualEntryView}>
          <MyText>{i18n.t("useOwnNumbers")}</MyText>
          <TextInput
            style={[manualInputStyle]}
            multiline={false}
            keyboardType={'decimal-pad'}
            onChangeText={(text) => {

              let isInvalid = false;
              try {
                if (text) {
                  const num = Number(text);
                  if (Number.isNaN(num)) {
                    isInvalid = true;
                  }
                } else {
                  isInvalid = true;
                }
              } catch (err) {
                logger.warn("Not able to convert manualEntryInput to a number", err);
                isInvalid = true;
              }
              setIsManualEntryInvalid(isInvalid);
              text ? setManualEntryInput(text) : setManualEntryInput('');
            }}
            onEndEditing={() => {
              /* Make sure we can convert it to a number.  If not, we'll wipe it out after they leave the textinput */
              try {
                if (manualEntryInput) {
                  const num = Number(manualEntryInput);
                  if (Number.isNaN(num)) {
                    setManualEntryInput('');
                  }
                } else {
                  setManualEntryInput('');
                }
              } catch (err) {
                logger.warn("Not able to convert manualEntryInput to a number", err);
                setManualEntryInput('');
              }
            }}
            placeholder={i18n.t('enterNumber')}
            maxLength={20}
            value={manualEntryInput}
          />
        </View>
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
  eventDateTimePickerWrapper: {
    marginTop: Platform.OS === 'ios' ? 40 : spaceAmount,
  },
  headerButton: {
    // padding is so touching close to it works too
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
  },
  switch: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
  },
  manualEntryView: {
    flex: 0,
    paddingTop: 50,
    paddingBottom: 50,
  },
});

