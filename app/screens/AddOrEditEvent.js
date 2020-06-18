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

/* jmr - After move function, move this ?? */
import Decimal from 'decimal.js-light'

function AddOrEditEvent(props) {

  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
  const myThemeContext = useContext(MyThemeContext);

  const route = useRoute();
  const navigation = useNavigation();

  const oldEvent = route.params?.oldEvent ?? null;
  const newEvent = oldEvent ? cloneEvent(oldEvent) : null;
  const isCreate = !oldEvent;

  const [title, setTitle] = useState(newEvent ? newEvent.title : '');
  const [selectedDate, setSelectedDate] = useState(newEvent ? (new Date(newEvent.epochMillis)) : null);
  // If it was undefined, use true
  const initialIsFullDay = (newEvent && newEvent.isFullDay === false) ? newEvent.isFullDay : true;
  const [useFullDay, setUseFullDay] = useState(initialIsFullDay);


  const [useDateAndTimeInMilestones, setUseDateAndTimeInMilestones] = useState(newEvent ? newEvent.useDateAndTimeInMilestones : false);

  const [extraNumbersForMilestones, setExtraNumbersForMilesteons] = useState(newEvent ? (newEvent.extraNumbersForMilestones || []) : []);

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
        isCustom: true, selected: true, ignoreIfPast: false,
        useDateAndTimeInMilestones: useDateAndTimeInMilestones, extraNumbersForMilestones: extraNumbersForMilestones
      });
    } else {
      event = newEvent;
      event.title = newTitle;
      event.epochMillis = selectedDate.getTime();
      event.isFullDay = useFullDay;
      event.useDateAndTimeInMilestones = useDateAndTimeInMilestones;
      event.extraNumbersForMilestones = extraNumbersForMilestones;
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
        eventsAndMilestonesContext.addCustomEvent(event);
        // Go to EventInfo with the new event
        navigation.replace("EventInfo", { event: event });
      } else {
        eventsAndMilestonesContext.modifyEvent(oldEvent, event);
        // Go back to EventInfo with the new event
        navigation.navigate("EventInfo", { event: event });
      }
    }
  }


  React.useLayoutEffect(() => {
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
  }, [navigation, title, selectedDate, useFullDay, useDateAndTimeInMilestones, extraNumbersForMilestones]);


  const getSampleNumbers = (isFullDay, epochTime) => {
    let theMoment = moment(epochTime);
    const month = theMoment.month() + 1; // moment is zero based so add one
    const day = theMoment.date()
    const yyyy = theMoment.year();
    const yy = theMoment.format('YY');
    const hh = theMoment.format('hh');
    const HH = theMoment.format('HH');
    const mm = theMoment.format('mm');
    const ss = theMoment.format('ss');

    let extraDecimals = {};
    /* Some of these might be unneeded for some months and days
      (e.g. MDYYYY and MMDYYYY and MDDYYYY could all be 10192020),
      but to get all possibilities we try everything and store it in a 
      map so duplicates are not present.
    */
    extraDecimals[theMoment.format('MDYYYY')] = new Decimal(parseInt(theMoment.format('MDYYYY')));
    extraDecimals[theMoment.format('MDYY')] = new Decimal(parseInt(theMoment.format('MDYY')));
    extraDecimals[theMoment.format('YYYY/M/D')] = (new Decimal(parseInt(theMoment.format('YYYY')))).div(parseInt(theMoment.format('M'))).div(parseInt(theMoment.format('D')));
    extraDecimals[theMoment.format('M.D')] = (new Decimal(parseInt(theMoment.format('D')))).div(100).add(parseInt(theMoment.format('M')));
    extraDecimals[theMoment.format('MM.D')] = (new Decimal(parseInt(theMoment.format('D')))).div(100).add(parseInt(theMoment.format('MM')));


    extraDecimals[theMoment.format('MDYYYYhhmm')] = new Decimal(parseInt(theMoment.format('MDYYYYhhmm')));
    extraDecimals[theMoment.format('MDYYYYHmm')] = new Decimal(parseInt(theMoment.format('MDYYYYHmm')));

    return "jmr " + Object.keys(extraDecimals);
  }


  const sampleNumbers = selectedDate ? getSampleNumbers(useFullDay, selectedDate.getTime()) : "JMR: Enter date to find out";



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

        <View style={styles.switch}>
          <MyText>{i18n.t("useNumbersLikeThese", { someValue: sampleNumbers })}</MyText>
          <MySwitch
            value={useDateAndTimeInMilestones}
            onValueChange={isYes => {
              setUseDateAndTimeInMilestones(isYes);
            }}
          />
        </View>

      </ScrollView>
    </TouchableWithoutFeedback>
  );
}
/*
  useNumbersLikeThese: 'Use numbers like these: {{someValue}}',
  ownNumbersForMilestones: "Enter own numbers to be used in milestones",
  */


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
  },
});

