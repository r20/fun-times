import React, { useContext, useState } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'

import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import AppSettingsContext from '../context/AppSettingsContext'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import MyThemeContext from '../context/MyThemeContext'
import i18n from '../i18n/i18n'
import * as logger from '../utils/logger'
import MyText, { MyTextSmall, MyTextLarge, MyTextXLarge } from '../components/MyText'
import MySlider from '../components/MySlider'
import MyScreenHeader from '../components/MyScreenHeader'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  sliderWrapper: {
    flex: 0,
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  subtitle: {
    paddingHorizontal: 15,
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
    padding: 15,
  },
});



function Milestones(props) {

  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
  const appSettingsContext = useContext(AppSettingsContext);

  const myThemeContext = useContext(MyThemeContext);


  let filtered = eventsAndMilestonesContext.allEvents.filter(function (value, index, arr) {
    return eventsAndMilestonesContext.isEventSelected(value);
  });

  /* It seems a little more responsive to use a local state variable, and then also set the context one.
  Plus it allows uer to see the number as they make slide adjustments. */
  const [sliderValue, setSliderValue] = useState((appSettingsContext.calendarMaxNumberMilestonesPerEvent || 3));

  const empty = !filtered.length;

  const onSliderValueChange = (newVal) => {
    setSliderValue(newVal);
  }

  const onSlidingComplete = (newVal) => {
    setSliderValue(newVal);
    appSettingsContext.setCalendarMaxNumberMilestonesPerEvent(newVal);
  }

  // TBD - move slider to settings??
  return (<View style={styles.container} >
    <MyScreenHeader title={i18n.t('headerUpcomingMilestonesScreenTitle')} />
    <View style={styles.sliderWrapper} >
      <MyTextSmall >{i18n.t('calendarMaxNumMilestonesPerEventLabel', { someValue: sliderValue })}</MyTextSmall>
      <MySlider value={sliderValue} step={1} minimumValue={1} maximumValue={20}
        onValueChange={onSliderValueChange} onSlidingComplete={onSlidingComplete} />
    </View>
    <MyTextSmall style={styles.subtitle}>{i18n.t('subtitleMilestonesScreen')}</MyTextSmall>
    {!empty &&
      <UpcomingMilestonesList maxNumMilestonesPerEvent={appSettingsContext.calendarMaxNumberMilestonesPerEvent} events={filtered} verboseDescription={true} />
    }
    {empty && <View style={styles.container} ><MyTextLarge style={styles.emptyText}>{i18n.t('emptyMilestonesMessage')}</MyTextLarge></View>}
  </View>
  );
}

export default Milestones;
