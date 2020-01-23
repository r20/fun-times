import React from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View } from 'react-native'

import i18n from '../i18n/i18n'
import theme from '../style/theme'
import EventListItem from '../components/EventListItem'
import { withEventListContext } from '../context/EventListContext'
import { withSingleScreenInStackNavigator } from '../navigation/NavUtils'


function StandardEvents(props) {

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={props.eventListContext.standardEvents}
        keyExtractor={item => item.title}
        renderItem={({ item }) =>
          <EventListItem event={item} />
        }
      />
    </View>
  );
}

const StandardEventsWithContext = withEventListContext(StandardEvents);
export default withSingleScreenInStackNavigator(StandardEventsWithContext, i18n.t("headerStandardEventsTitle"));

StandardEvents.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
    fontSize: theme.FONT_SIZE_LARGE,
    padding: 15,
  }
});
