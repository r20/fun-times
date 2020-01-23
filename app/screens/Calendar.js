import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'

import { withEventListContext } from '../context/EventListContext'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import { withSingleScreenInStackNavigator } from '../navigation/NavUtils'
import i18n from '../i18n/i18n'

function Calendar(props) {

  let filtered = props.eventListContext.allEvents.filter(function (value, index, arr) {
    return props.eventListContext.isEventSelected(value);
  });

  return (<View style={styles.container} >
    <UpcomingMilestonesList events={filtered} renderEventCardBodyTextOnly={false} />
  </View>
  );
}

const CalendarWithContext = withEventListContext(Calendar);

export default withSingleScreenInStackNavigator(CalendarWithContext, i18n.t("headerUpcomingCalendarScreenTitle"));


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
