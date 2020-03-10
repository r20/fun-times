import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View, Alert } from 'react-native'
import { withNavigation } from 'react-navigation'
import Swipeout from 'react-native-swipeout'

import i18n from '../i18n/i18n'
import AddEventButton from '../components/AddEventButton'
import theme from '../style/theme'
import EventListItem from '../components/EventListItem'
import EventListContext from '../context/EventListContext'
import * as logger from '../utils/logger'



function CustomEvents(props) {

  const eventListContext = useContext(EventListContext);
  const onPressAddEvent = () => {
    props.navigation.navigate("AddEvent");
  }

  const empty = !eventListContext.customEvents.length;

  const onRequestRemove = (event) => {

    const navigation = props.navigation;

    Alert.alert(
      i18n.t('eventRemoveTitle'),
      i18n.t('eventRemoveConfirmation', { someValue: event.title }),
      [
        {
          text: i18n.t('cancel'),
          onPress: () => {
            logger.log('Cancel Pressed')
          },
          style: 'cancel',
        },
        {
          text: i18n.t('ok'), onPress: () => {
            logger.log('OK Pressed');
            eventListContext.removeCustomEvent(event);
            // Go to events screen when remove
            // jmr already there navigation.navigate("EventsScreen");

          }
        },
      ],
      // On Android, cancelable: true allows them to tap outside the box to get rid of alert without doing anything
      { cancelable: true }
    );

  }



  return (
    <View style={styles.container}>
      {!empty &&
        <FlatList
          contentContainerStyle={{ padding: 15, paddingBottom: 100, }}
          data={eventListContext.customEvents}
          keyExtractor={item => item.title}
          renderItem={({ item }) => {

            // Buttons
            var swipeoutBtns = [
              {
                text: i18n.t('delete'),
                backgroundColor: 'red',
                onPress: () => { onRequestRemove(item) },
              }
            ];
            return (
              <Swipeout right={swipeoutBtns} autoClose={true}
                backgroundColor={theme.PRIMARY_BACKGROUND_COLOR}>
                <EventListItem event={item} />
              </Swipeout>)
          }}
        />
      }
      {empty && <Text style={styles.emptyText}>Add birthdays, anniversaries, and other special occasions to discover interesting upcoming milestones.</Text>}
      <AddEventButton onPress={onPressAddEvent} />
    </View>
  );

}

export default withNavigation(CustomEvents);

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
