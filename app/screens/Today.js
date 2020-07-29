import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { FlatList, StyleSheet, View } from 'react-native'
import { useFocusEffect, useScrollToTop, useNavigation } from '@react-navigation/native'

import i18n from '../i18n/i18n'
import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import EventComparedToNow from '../components/EventComparedToNow'
import MyText, { MyTextLarge } from '../components/MyText'
import MyScreenHeader from '../components/MyScreenHeader'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  contentContainerStyle: {
    padding: 15,
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
    padding: 15,
  },
});


function Today(props) {

  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);

  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
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

  let filtered = eventsAndMilestonesContext.allEvents.filter(function (value, index, arr) {
    return eventsAndMilestonesContext.isEventSelected(value);
  });
  const empty = !filtered.length;

  const renderItem = ({ item }) => {

    return <EventComparedToNow event={item} />
  }

  const keyExtractor = item => item.title + nowMillis;

  return (<View style={styles.container} >
    <MyScreenHeader title={i18n.t('headerTodayTitle')} />
    {!empty &&
      <FlatList
        ref={ref}
        contentContainerStyle={styles.contentContainerStyle}
        data={filtered}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        initialNumToRender={4}
      />
    }
    {empty && <View style={styles.container} ><MyTextLarge style={styles.emptyText}>{i18n.t('emptyTodayMessage')}</MyTextLarge></View>}
  </View>
  );
}

export default Today;

