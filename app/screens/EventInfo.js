import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native'
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons'
import { useNavigation, useRoute } from '@react-navigation/native'

import EventSelectedStar from '../components/EventSelectedStar'
import EventComparedToNow from '../components/EventComparedToNow'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import EventListContext from '../context/EventListContext'
import { getDisplayStringDateTimeForEvent } from '../utils/Utils'

import theme from '../style/theme'
import i18n from '../i18n/i18n'
import EventCard, { EventCardHeader } from '../components/EventCard'
import * as logger from '../utils/logger'

function EventInfo(props) {

  const eventListContext = useContext(EventListContext);
  const route = useRoute();
  const navigation = useNavigation();

  /* The passed in event param can get stale.
    If something about the event changes (such as selected)
    we need to get the current event object (not what was passed
      when first navigated to this screen)
  */
  const passedEvent = route.params?.event ?? '';
  // Use the current version of the event object
  const event = eventListContext.getEventWithTitle(passedEvent.title);
  if (!event) {
    return null;
  }

  const onPressEditItem = () => {
    navigation.navigate("EditEvent", { oldEvent: event });
  }

  const onRequestRemove = () => {

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
            navigation.navigate("EventsScreen");

          }
        },
      ],
      // On Android, cancelable: true allows them to tap outside the box to get rid of alert without doing anything
      { cancelable: true }
    );

  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => {
        return !event.isCustom ? (
          <EventSelectedStar event={event} containerStyle={styles.headerButton} />
        ) : (
            <View style={styles.headerRightComponent}>
              <TouchableOpacity onPress={onRequestRemove} style={styles.headerButton}>
                <FontAwesome name="trash-o" size={30} style={{ color: theme.PRIMARY_HEADER_BUTTONS_COLOR }} />
              </TouchableOpacity>
              <EventSelectedStar event={event} containerStyle={styles.headerButton} />
              <TouchableOpacity onPress={onPressEditItem} style={styles.headerButton}>
                <MaterialIcons name="edit" size={30} style={{ color: theme.PRIMARY_HEADER_BUTTONS_COLOR }} />
              </TouchableOpacity>
            </View>
          );
      },
    });
  }, [navigation, event]);


  const now = new Date();
  const nowMillis = now.getTime();
  const i18nKeyNow = (nowMillis > event.epochMillis) ? "timeSinceEventTitle" : "timeUntilEventTitle";
  const cardHeaderTitleNow = i18n.t(i18nKeyNow, { someValue: getDisplayStringDateTimeForEvent(event) });

  const i18nKeyUpcoming = (nowMillis > event.epochMillis) ? "upcomingPastEventMilestoneTitle" : "upcomingFutureEventCountdownTitle";
  const cardHeaderTitleUpcoming = i18n.t(i18nKeyUpcoming, { someValue: getDisplayStringDateTimeForEvent(event) });

  const upcomingMilestoneListHeader = (
    <React.Fragment>
      <EventCard event={event}>
        <EventCardHeader event={event}>{cardHeaderTitleNow}</EventCardHeader>
        <EventComparedToNow event={event} nowMillis={nowMillis} />
      </EventCard>

      <Text style={styles.upcomingHeader}>{cardHeaderTitleUpcoming}</Text>
    </React.Fragment>
  );



  /* jmr - if event is within N days (see other code that sets that limit and get it from there),
    then have a message "Event within N days
    Use i18n
    jmr - if title is really long, looks bad in EventInfo screen */
  return (
    <View style={styles.container}>
      <View style={styles.titleWrapper}><Text style={styles.title}>{event.title}</Text></View>
      <UpcomingMilestonesList listHeaderComponent={upcomingMilestoneListHeader}
        showHeaderIfListEmpty={true} events={[event]} verboseDescription={false} />
    </View>
  );

}

export default EventInfo;

EventInfo.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleWrapper: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: theme.PRIMARY_TEXT_COLOR,
    fontSize: theme.FONT_SIZE_XLARGE,
    fontWeight: 'bold',
    paddingTop: 15, // If we make body and header same with no border, we'd change this
    paddingHorizontal: 10,
  },
  headerRightComponent: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerButton: {// jmr - figure out padding
    // padding is so touching close to it works too
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: theme.PRIMARY_BACKGROUND_COLOR,
    borderRadius: 5, // jmr ??
  },
  upcomingHeader: {
    fontSize: theme.FONT_SIZE_MEDIUM + 2,
    padding: 10,
    marginTop: 20,
  },
});

