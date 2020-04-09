import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect, usenavigation, useNavigation } from '@react-navigation/native'

import i18n from '../i18n/i18n'
import EventListContext from '../context/EventListContext'
import EventComparedToNow from '../components/EventComparedToNow'
import theme from '../style/theme'
import EventCard, { EventCardHeader } from '../components/EventCard'

function Today(props) {

  const eventListContext = useContext(EventListContext);
  const navigation = useNavigation();

  const now = new Date();
  const [nowMillis, setNowMillis] = useState(now.getTime());

  // This done to make sure if navigate away and back, we get new times
  useFocusEffect(
    React.useCallback(() => {
      const anotherdate = new Date();
      setNowMillis(anotherdate.getTime());
    }, [navigation])
  );

  let filtered = eventListContext.allEvents.filter(function (value, index, arr) {
    return eventListContext.isEventSelected(value);
  });
  const empty = !filtered.length;

  return (<View style={styles.container} >
    {!empty &&
      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={filtered}
        keyExtractor={item => item.title + nowMillis}
        renderItem={({ item }) => {

          const i18nKey = (item.epochMillis < nowMillis) ? "timeSinceEventTitle" : "timeUntilEventTitle";
          const title = i18n.t(i18nKey, { someValue: item.title });

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
