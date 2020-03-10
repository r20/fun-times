import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'

import EventListContext from '../context/EventListContext'
import ScreenHeader, { ScreenHeaderTitle } from '../components/ScreenHeader'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import i18n from '../i18n/i18n'

function Calendar(props) {

  const eventListContext = useContext(EventListContext);
  let filtered = eventListContext.allEvents.filter(function (value, index, arr) {
    return eventListContext.isEventSelected(value);
  });

  return (<View style={styles.container} >
    <ScreenHeader
      centerComponent={<ScreenHeaderTitle>{i18n.t("headerUpcomingCalendarScreenTitle")}</ScreenHeaderTitle>}
    />
    <UpcomingMilestonesList events={filtered} verboseDescription={true} />
  </View>
  );
}


export default Calendar;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
});
