import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, Alert, TouchableOpacity, ScrollView } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'
import { moment } from 'moment'

import EventComparedToNow from '../components/EventComparedToNow'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import { withEventListContext } from '../context/EventListContext'
import { getEventDisplayDate } from '../utils/Event'
import * as Utils from '../utils/Utils'
import theme from '../style/theme'
import i18n from '../i18n/i18n'
import EventCard, { EventCardHeader } from '../components/EventCard'
import * as logger from '../utils/logger'

function EventInfo(props) {

  const event = props.navigation.getParam("event", '');
  if (!event) {
    return null;
  }

  const onPressRemoveItem = () => {

    Alert.alert(
      'Remove Event ',
      "Do you want to remove event " + event.title + "?",
      [
        {
          text: 'Cancel',
          onPress: () => logger.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK', onPress: () => {
            logger.log('OK Pressed');
            props.eventListContext.removeCustomEvent(event);
            // Go back to CustomEvents screen when push save
            props.navigation.navigate("CustomEvents");
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
  const cardHeaderTitleNow = i18n.t(i18nKeyNow, { someValue: getEventDisplayDate(event) });

  const i18nKeyUpcoming = (nowMillis > event.epochMillis) ? "upcomingPastEventMilestoneTitle" : "upcomingFutureEventCountdownTitle";
  const cardHeaderTitleUpcoming = i18n.t(i18nKeyUpcoming, { someValue: getEventDisplayDate(event) });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        <View style={{ alignSelf: 'flex-end', paddingBottom: 10, }}>
          {event.isCustom &&
          <TouchableOpacity onPress={onPressRemoveItem} style={styles.deleteButton}>
            <FontAwesome name="trash" size={30} style={{ color: theme.TRASH_ICON_COLOR }} />
          </TouchableOpacity>
          }
        </View>
        <EventCard event={event}>
          <EventCardHeader event={event}>{cardHeaderTitleNow}</EventCardHeader>
          <EventComparedToNow event={event} nowMillis={nowMillis} />
        </EventCard>

        <EventCard event={event}>
          <EventCardHeader event={event}>{cardHeaderTitleUpcoming}</EventCardHeader>
          <UpcomingMilestonesList events={[event]} renderEventCardBodyTextOnly={true} />
        </EventCard>
      </ScrollView>
    </View>
  );

}

export default withEventListContext(EventInfo);

EventInfo.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  deleteButton: {
    // padding is so touching close to it works too
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: theme.TRASH_BACKGROUND_COLOR,
    borderRadius: 5,
  },
});