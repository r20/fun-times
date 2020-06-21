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
import { getInterestingNumbersForTime } from '../utils/milestones'


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


  // const getSampleNumbers = (isFullDay, epochTime) => {
  //   let theMoment = moment(epochTime);


  //   /* Some of these might be unneeded for some months and days
  //   (e.g. MDYYYY and MMDYYYY and MDDYYYY could all be 10192020),
  //   but to get all possibilities we try everything and store it in a 
  //   map so duplicates are not present.
  //   */
  //   let extraDecimals = {};

  //   let tmpDecimal;
  //   tmpDecimal = (new Decimal(parseInt(theMoment.format('YYYY')))).div(parseInt(theMoment.format('M'))).div(parseInt(theMoment.format('D')));
  //   extraDecimals[theMoment.format('YYYY/M/D') + '=' + tmpDecimal.valueOf()] = tmpDecimal;

  //   tmpDecimal = (new Decimal(parseInt(theMoment.format('M')))).div(parseInt(theMoment.format('D')));
  //   extraDecimals[theMoment.format('M/D') + '=' + tmpDecimal.valueOf()] = tmpDecimal;

  //   tmpDecimal = (new Decimal(parseInt(theMoment.format('D')))).div(parseInt(theMoment.format('M')));
  //   extraDecimals[theMoment.format('D/M') + '=' + tmpDecimal.valueOf()] = tmpDecimal;

  //   tmpDecimal = (new Decimal(parseInt(theMoment.format('YYYY')))).minus(parseInt(theMoment.format('M'))).minus(parseInt(theMoment.format('D')));
  //   extraDecimals[theMoment.format('YYYY-M-D') + '=' + tmpDecimal.valueOf()] = tmpDecimal;

  //   tmpDecimal = (new Decimal(parseFloat(theMoment.format('M.D'))));
  //   extraDecimals[theMoment.format('M.D')] = tmpDecimal;

  //   tmpDecimal = (new Decimal(parseFloat(theMoment.format('D.M'))));
  //   extraDecimals[theMoment.format('D.M')] = tmpDecimal;

  //   const dateFormats = [
  //     'YYYYMD', 'YYYYMMDD', 'YYYYMDD', 'YYYYMMD',
  //     'MDYYYY', 'MMDDYYYY', 'MDDYYYY', 'MMDYYYY',
  //     'MDYY', 'MMDDYY', 'MDDYY', 'MMDYY',
  //     'DMYYYY', 'DDMMYYYY', 'DDMYYYY', 'DMMYYYY',
  //   ];
  //   for (let idx = 0; idx < dateFormats.length; idx++) {
  //     // Doing parseInt and then myInt.toString() will get rid of leading zero
  //     let myInt = parseInt(theMoment.format(dateFormats[idx]), 10);
  //     extraDecimals[myInt.toString()] = new Decimal(myInt);

  //     if (!isFullDay) {
  //       /* Use year, month, and day combinations with time combinations */
  //       myInt = parseInt(theMoment.format(dateFormats[idx] + 'hhmm'), 10);
  //       extraDecimals[myInt.toString()] = new Decimal(myInt);
  //       myInt = parseInt(theMoment.format(dateFormats[idx] + 'Hmm'), 10);
  //       extraDecimals[myInt.toString()] = new Decimal(myInt);
  //     }
  //   }



  //   return "jmr " + Object.keys(extraDecimals);
  // }



  let sampleNumbers = selectedDate ? getInterestingNumbersForTime(selectedDate.getTime(), useFullDay, undefined) : null;

  
  // if (sampleNumbers) {
  //   const keys = Object.keys(sampleNumbers);
    
  //   sampleNumbers = sampleNumbers.filter((value, index, arr) => {
  //     // jmr - only show the description
  //   });
  //   let filtered = prevState.allMilestones.filter(function (value, index, arr) {
  //     return (value.event && value.event.title !== event.title);
  //   });

  // } else {
  //   sampleNumbers = "JMR: Enter date to find out";
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

