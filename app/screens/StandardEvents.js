import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View } from 'react-native'

import i18n from '../i18n/i18n'
import theme from '../style/theme'
import EventListItem from '../components/EventListItem'
import EventListContext from '../context/EventListContext'
import * as logger from '../utils/logger'

function StandardEvents(props) {

  const eventListContext = useContext(EventListContext);
  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={eventListContext.standardEvents}
        keyExtractor={item => item.title}
        renderItem={({ item }) =>
          <EventListItem event={item} />
        }
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
});
