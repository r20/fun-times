import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { FlatList, StyleSheet, Text, View } from 'react-native'

import i18n from '../i18n/i18n'
import EventListContext from '../context/EventListContext'
import EventComparedToNow from '../components/EventComparedToNow'
import ScreenHeader, { ScreenHeaderTitle } from '../components/ScreenHeader'
import theme, { getEventStyle } from '../style/theme'
import EventCard, { EventCardHeader } from '../components/EventCard'


function Today(props) {

  const eventListContext = useContext(EventListContext);

  return (<View style={styles.container} >

    <ScreenHeader
      centerComponent={<ScreenHeaderTitle>{i18n.t("headerTodayTitle")}</ScreenHeaderTitle>}
    />
    <FlatList
      contentContainerStyle={{ padding: 15 }}
      data={eventListContext.allEvents}
      keyExtractor={item => item.title}
      renderItem={({ item }) => {

        if (!eventListContext.isEventSelected(item)) {
          return null;
        }
        const nowTime = (new Date()).getTime();
        const i18nKey = (item.epochMillis < nowTime) ? "timeSinceEventTitle" : "timeUntilEventTitle";
        const title = i18n.t(i18nKey, { someValue: item.title });

        const now = new Date();
        const nowMillis = now.getTime();

        return (<EventCard event={item}>
          <EventCardHeader event={item}>{title}</EventCardHeader>
          <EventComparedToNow event={item} nowMillis={nowMillis} />
        </EventCard>
        );
      }
      }
    />
  </View>
  );
}

export default Today;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  }
});
