import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, Platform } from 'react-native'
import { Slider, Header } from "react-native-elements"

import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import AppSettingsContext from '../context/AppSettingsContext'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import theme from '../style/theme'
import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'



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
  subtitle: {
    fontSize: theme.FONT_SIZE_SMALL,
    paddingHorizontal: 15,
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
  header: {
    color: theme.PRIMARY_TEXT_COLOR,
    fontSize: theme.FONT_SIZE_XLARGE
  },
});


const headerCenterComponent = <Text style={styles.header}>{i18n.t('headerUpcomingMilestonesScreenTitle')}</Text>


function MilestoneCalendar(props) {

  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
  const appSettingsContext = useContext(AppSettingsContext);

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

  // jmr - move slider to settings??
  return (<View style={styles.container} >
    <Header statusBarProps={{ barStyle: 'dark-content', translucent: true, backgroundColor: 'transparent' }}
      containerStyle={Platform.select({
        android: Platform.Version <= 20 ? { paddingTop: 0, height: 56 } : {},
      })}
      backgroundColor={theme.PRIMARY_BACKGROUND_COLOR}
      centerComponent={headerCenterComponent}
    />
    <Text style={styles.subtitle}>{i18n.t('subtitleMilestonesScreen')}</Text>
    <View style={styles.sliderWrapper} >
      <Text style={styles.maxMilestoneLabel}>{i18n.t('calendarMaxNumMilestonesPerEventLabel', { someValue: sliderValue })}</Text>
      <Slider value={sliderValue} step={1} minimumValue={1} maximumValue={20}
        thumbTintColor={theme.PRIMARY_ACTIVE_TEXT_COLOR} onValueChange={onSliderValueChange} onSlidingComplete={onSlidingComplete} />
    </View>
    {!empty &&
      <UpcomingMilestonesList maxNumMilestonesPerEvent={appSettingsContext.calendarMaxNumberMilestonesPerEvent} events={filtered} verboseDescription={true} />
    }
    {empty && <View style={styles.container} ><Text style={styles.emptyText}>{i18n.t('emptyMilestoneCalendarMessage')}</Text></View>}
  </View>
  );
}

export default MilestoneCalendar;
