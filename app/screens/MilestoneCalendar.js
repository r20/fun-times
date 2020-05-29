import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, Button } from 'react-native'
import { Slider, ButtonGroup } from "react-native-elements"
import * as Calendar from 'expo-calendar'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import AppSettingsContext from '../context/AppSettingsContext'
import CalendarContext from '../context/CalendarContext'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import theme from '../style/theme'
import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'


function MilestoneCalendar(props) {

  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
  const appSettingsContext = useContext(AppSettingsContext);

  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);


  const NoFilterIcon = <MaterialCommunityIcons name="filter-remove" size={20} />
  const RemoveFromCalendarIcon = <MaterialCommunityIcons name="calendar-check" size={20} />
  const AddToCalendarIcon = <MaterialCommunityIcons name="calendar-blank" size={20} />


  const buttons = [NoFilterIcon, AddToCalendarIcon, RemoveFromCalendarIcon];

  let filtered = eventsAndMilestonesContext.allEvents.filter(function (value, index, arr) {
    return eventsAndMilestonesContext.isEventSelected(value);
  });

  // It seems a little more responsive to use a local state variable, and then also set the context one.
  const [sliderValue, setSliderValue] = useState((appSettingsContext.calendarMaxNumberMilestonesPerEvent || 3));

  const empty = !filtered.length;

  const onSliderValueChange = (newVal) => {
    setSliderValue(newVal);
  }

  const onSlidingComplete = (newVal) => {
    setSliderValue(newVal);
    appSettingsContext.setCalendarMaxNumberMilestonesPerEvent(newVal);
  }

  /* The UpcomingMilestoneList is repeated separately for each filter button (all, not calendar, on calendar)
    because otherwise the rendering was weird.  The FlatList would get re-rendered if the data changed
    based on the fitler but new items wouldn't be drawn until you scrolled.
    This also has the benefit of making it go back to the initial scroll index position.
  */

  // jmr - move slider to settings, or have slider and 3 buttons on a filter icon
  return (<View style={styles.container} >
    <View style={styles.sliderWrapper} >
      <Text style={styles.maxMilestoneLabel}>{i18n.t('calendarMaxNumMilestonesPerEventLabel', { someValue: sliderValue })}</Text>
      <Slider value={sliderValue} step={1} minimumValue={1} maximumValue={20}
        thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={onSliderValueChange} onSlidingComplete={onSlidingComplete} />
    </View>
    <ButtonGroup
      onPress={setSelectedButtonIndex}
      selectedIndex={selectedButtonIndex}
      buttons={buttons}
    />
    {!empty && selectedButtonIndex === 0 &&
      <UpcomingMilestonesList filterNumber={selectedButtonIndex} maxNumMilestonesPerEvent={appSettingsContext.calendarMaxNumberMilestonesPerEvent} events={filtered} verboseDescription={true} />
    }
    {!empty && selectedButtonIndex === 1 &&
      <UpcomingMilestonesList filterNumber={selectedButtonIndex} maxNumMilestonesPerEvent={appSettingsContext.calendarMaxNumberMilestonesPerEvent} events={filtered} verboseDescription={true} />
    }
    {!empty && selectedButtonIndex === 2 &&
      <UpcomingMilestonesList filterNumber={selectedButtonIndex} maxNumMilestonesPerEvent={appSettingsContext.calendarMaxNumberMilestonesPerEvent} events={filtered} verboseDescription={true} />
    }
    {empty && <View style={styles.container} ><Text style={styles.emptyText}>{i18n.t('emptyCalendarMesage')}</Text></View>}
  </View>
  );
}


export default MilestoneCalendar;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  sliderWrapper: {
    flex: 0,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: theme.FONT_SIZE_LARGE,
    padding: 15,
  },
  maxMilestoneLabel: {
    fontSize: theme.FONT_SIZE_SMALL,
  },
});
