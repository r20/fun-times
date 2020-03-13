import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View } from 'react-native'

import EventListContext from '../context/EventListContext'
import ScreenHeader, { ScreenHeaderTitle } from '../components/ScreenHeader'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import theme from '../style/theme'
import i18n from '../i18n/i18n'


function Calendar(props) {

  const eventListContext = useContext(EventListContext);
  let filtered = eventListContext.allEvents.filter(function (value, index, arr) {
    return eventListContext.isEventSelected(value);
  });

  const empty = !filtered.length;

  return (<View style={styles.container} >
    <ScreenHeader
      centerComponent={<ScreenHeaderTitle>{i18n.t("headerUpcomingCalendarScreenTitle")}</ScreenHeaderTitle>}
    />
    {!empty &&
      <UpcomingMilestonesList events={filtered} verboseDescription={true} />
    }
    {empty && <View style={styles.container} ><Text style={styles.emptyText}>{i18n.t('emptyCalendarMesage')}</Text></View>}
  </View>
  );
}


export default Calendar;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: theme.FONT_SIZE_LARGE,
    padding: 15,
  },
});
