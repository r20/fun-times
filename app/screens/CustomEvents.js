import React from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View } from 'react-native'

import i18n from '../i18n/i18n'
import AddEventButton from '../components/AddEventButton'
import theme from '../style/theme'
import EventListItem from '../components/EventListItem'
import { withEventListContext } from '../context/EventListContext'
import { withSingleScreenInStackNavigator } from '../navigation/NavUtils'


function CustomEvents(props) {

  const onPressAddEvent = () => {
    props.navigation.navigate("AddEvent");
  }

  const empty = !props.eventListContext.customEvents.length;
  return (
    <View style={styles.container}>
      {!empty && 
        <FlatList
          contentContainerStyle={{ padding: 15, paddingBottom: 100, }}
          data={props.eventListContext.customEvents}
          keyExtractor={item => item.title}
          renderItem={({ item }) =>
            <EventListItem event={item} />
          }
        />
        }
      {empty && <Text style={styles.emptyText}>Add birthdays, anniversaries, and other special occasions to discover interesting upcoming milestones.</Text>}
      <AddEventButton onPress={onPressAddEvent} />
    </View>
  );

}

const CustomEventsWithContext = withEventListContext(CustomEvents);
export default withSingleScreenInStackNavigator(CustomEventsWithContext, i18n.t("headerCustomEventsTitle"));

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
