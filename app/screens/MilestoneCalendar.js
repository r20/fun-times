import React, { useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, Button } from 'react-native'
import { Slider, ButtonGroup } from "react-native-elements"
import * as Calendar from 'expo-calendar'

import EventListContext from '../context/EventListContext'
import AppSettingsContext from '../context/AppSettingsContext'
import CalendarContext from '../context/CalendarContext'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import theme from '../style/theme'
import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'




function MilestoneCalendar(props) {

  const eventListContext = useContext(EventListContext);
  const appSettingsContext = useContext(AppSettingsContext);
  const calendarContext = useContext(CalendarContext);

  // jmr - should store which button used last
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const buttons = [i18n.t('milestonesAll'), i18n.t('milestonesNotOnCalendar'), i18n.t('milestonesOnCalendar')];

  let filtered = eventListContext.allEvents.filter(function (value, index, arr) {
    return eventListContext.isEventSelected(value);
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

  // jmr - move slider to settings, or have slider and 3 buttons on a filter icon
  return (<View style={styles.container} >

    <ButtonGroup
      onPress={setSelectedButtonIndex}
      selectedIndex={selectedButtonIndex}
      buttons={buttons}
    />
    {!selectedButtonIndex &&
      <View style={styles.sliderWrapper} >
        <Text style={styles.maxMilestoneLabel}>{i18n.t('calendarMaxNumMilestonesPerEventLabel', { someValue: sliderValue })}</Text>
        <Slider value={sliderValue} step={1} minimumValue={1} maximumValue={20}
          thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={onSliderValueChange} onSlidingComplete={onSlidingComplete} />
      </View>
    }
    {!empty &&
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
