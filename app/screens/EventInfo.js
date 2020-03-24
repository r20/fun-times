import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, Alert, TouchableOpacity } from 'react-native'
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons'

import ScreenHeader, { ScreenHeaderTitle } from '../components/ScreenHeader'
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
  const navigation = props.navigation;

  /* The passed in event param can get stale.
    If something about the event changes (such as selected)
    we need to get the current event object (not what was passed
      when first navigated to this screen)
  */
  const passedEvent = navigation.getParam("event", '');
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

  const headerLeft = (
    // This was added because on ios the back arrow was missing. See https://github.com/react-navigation/react-navigation/issues/2918
    // On my Android back isn't needed. On iphone 7 it is.  I suppose just leave it.
    <Ionicons
      name={Platform.OS === "ios" ? "ios-arrow-back" : "md-arrow-back"}
      size={Platform.OS === "ios" ? 35 : 24}
      color={theme.PRIMARY_HEADER_BUTTONS_COLOR}
      style={
        Platform.OS === "ios"
          ? { marginBottom: -4, width: 25, marginLeft: 10 }
          : { marginBottom: -4, width: 25, marginLeft: 10 }
      }
      onPress={() => {
        navigation.goBack();
      }}
    />
  )

  const headerRight = !event.isCustom ? null : (
    <View style={styles.headerRightComponent}>
      <TouchableOpacity onPress={onRequestRemove} style={styles.headerButton}>
        <FontAwesome name="trash-o" size={30} style={{ color: theme.PRIMARY_HEADER_BUTTONS_COLOR }} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressEditItem} style={styles.headerButton}>
        <EventSelectedStar event={event} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressEditItem} style={styles.headerButton}>
        <MaterialIcons name="edit" size={30} style={{ color: theme.PRIMARY_HEADER_BUTTONS_COLOR }} />
      </TouchableOpacity>
    </View>
  );

  /* jmr - if event is within N days (see other code that sets that limit and get it from there),
    then have a message "Event within N days
    Use i18n
    jmr - if title is really long, looks bad in EventInfo screen */
  return (
    <View style={styles.container}>
      <ScreenHeader
        leftComponent={headerLeft}
        rightComponent={headerRight}
      />
      <View style={styles.title}><ScreenHeaderTitle>{event.title}</ScreenHeaderTitle></View>
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
  title: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
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

