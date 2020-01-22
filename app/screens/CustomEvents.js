import React from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View } from 'react-native'


import AddEventButton from '../components/AddEventButton'
import theme from '../style/theme'
import EventListItem from '../components/EventListItem'
import { withEventListContext } from '../context/EventListContext'



function CustomEvents(props) {

  const onPressAddEvent = () => {
    props.navigation.navigate("AddEvent");
  }

  const onPressEventInfo = (event) => {
    // Passed param will be accessible via props.navigation.getParam()
    props.navigation.navigate("EventInfo", { event: event });
  }

  const empty = !props.eventListContext.customEvents.length;
  return (
    <View style={styles.container}>
      {!empty && 
        <FlatList
          contentContainerStyle={{ padding: 15 }}
          data={props.eventListContext.customEvents}
          keyExtractor={item => item.title}
          renderItem={({ item }) =>
            <EventListItem event={item} onPressEventInfo={() => { onPressEventInfo(item) }} />
          }
        />
        }
      {empty && <Text style={styles.emptyText}>Add birthdays, anniversaries, and other special occasions to discover interesting upcoming milestones.</Text>}
      <AddEventButton onPress={onPressAddEvent} />
    </View>
  );

}

export default withEventListContext(CustomEvents);

CustomEvents.propTypes = {
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
