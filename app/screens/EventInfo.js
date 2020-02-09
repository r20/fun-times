import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, Alert, TouchableOpacity, ScrollView } from 'react-native'
import { FontAwesome } from '@expo/vector-icons'

import EventComparedToNow from '../components/EventComparedToNow'
import UpcomingMilestonesList from '../components/UpcomingMilestonesList'
import { withEventListContext } from '../context/EventListContext'
import { getDisplayStringDateTimeForEvent } from '../utils/Utils'

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
      i18n.t('eventRemoveTitle'),
      i18n.t('eventRemoveConfirmation', { someValue: event.title }),
      [
        {
          text: i18n.t('cancel'),
          onPress: () => logger.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: i18n.t('ok'), onPress: () => {
            logger.log('OK Pressed');
            props.eventListContext.removeCustomEvent(event);
            // Go back to events screen when push save
            props.navigation.navigate("EventsScreen");
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