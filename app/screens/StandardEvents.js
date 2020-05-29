import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View } from 'react-native'

import i18n from '../i18n/i18n'
import theme from '../style/theme'
import EventListItem from '../components/EventListItem'
import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import * as logger from '../utils/logger'

function StandardEvents(props) {

  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);

  const renderItem = ({ item }) => <EventListItem event={item} />

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.contentContainerStyle}
        data={eventsAndMilestonesContext.standardEvents}
        keyExtractor={item => item.title}
        renderItem={renderItem}
      />
    </View>
  );
}

export default StandardEvents;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  contentContainerStyle: {
    padding: 15,
  },
});
