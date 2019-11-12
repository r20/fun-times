import React from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, View } from 'react-native'

import EventList from '../components/EventList'
import AddEventButton from '../components/AddEventButton'
import theme from '../style/theme'
import { withEventListContext } from '../context/EventListContext'



function Events(props) {

  const onPressAddEvent = () => {
    props.navigation.navigate("AddEvent");
  }

  const empty = !props.eventListContext.events.length;
  return (
    <View style={styles.container}>
      {!empty && <EventList {...props} />}
      {empty && <Text style={styles.emptyText}>Add birthdays, anniversaries, and other special occasions to discover interesting upcoming milestones.</Text>}
      <AddEventButton onPress={onPressAddEvent} />
    </View>
  );
}

export default withEventListContext(Events);

Events.propTypes = {
  navigation: PropTypes.object.isRequired,
}

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
  }
});
