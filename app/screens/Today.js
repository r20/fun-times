import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { FlatList, StyleSheet, Text, View } from 'react-native'

import i18n from '../i18n/i18n'
import EventListContext from '../context/EventListContext'
import EventComparedToNow from '../components/EventComparedToNow'
import theme from '../style/theme'
import EventCard, { EventCardHeader } from '../components/EventCard'

function Today(props) {

  const eventListContext = useContext(EventListContext);
  let filtered = eventListContext.allEvents.filter(function (value, index, arr) {
    return eventListContext.isEventSelected(value);
  });

  const empty = !filtered.length;
  return (<View style={styles.container} >
    {!empty &&
      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={filtered}
        keyExtractor={item => item.title}
        renderItem={({ item }) => {
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
    }
    {empty && <View style={styles.container} ><Text style={styles.emptyText}>{i18n.t('emptyTodayMesage')}</Text></View>}
  </View>
  );
}

export default Today;

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
