import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, Text, View, Alert, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native'
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons'

import ScreenHeader, { ScreenHeaderTitle } from '../components/ScreenHeader'
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

  const event = props.navigation.getParam("event", '');
  if (!event) {
    return null;
  }

  const onPressEditItem = () => {
    props.navigation.navigate("EditEvent", { oldEvent: event });
  }


  const now = new Date();
  const nowMillis = now.getTime();
  const i18nKeyNow = (nowMillis > event.epochMillis) ? "timeSinceEventTitle" : "timeUntilEventTitle";
  const cardHeaderTitleNow = i18n.t(i18nKeyNow, { someValue: getDisplayStringDateTimeForEvent(event) });

  const i18nKeyUpcoming = (nowMillis > event.epochMillis) ? "upcomingPastEventMilestoneTitle" : "upcomingFutureEventCountdownTitle";
  const cardHeaderTitleUpcoming = i18n.t(i18nKeyUpcoming, { someValue: getDisplayStringDateTimeForEvent(event) });

  const header = (
    <React.Fragment>
      <EventCard event={event}>
        <EventCardHeader event={event}>{cardHeaderTitleNow}</EventCardHeader>
        <EventComparedToNow event={event} nowMillis={nowMillis} />
      </EventCard>

      <Text style={styles.upcomingHeader}>{cardHeaderTitleUpcoming}</Text>
    </React.Fragment>
  );

  // jmr - look in to when event.title is long. In old header it would get truncated ...
  // In new it wraps.  What do we want?

  const isFavorite = event.selected;
  const toggleSelected = () => {
    //jmr - implement this
  }

  const headerLeft = (
    // This was added because on ios the back arrow was missing. See https://github.com/react-navigation/react-navigation/issues/2918
    // On my Android back isn't needed. On iphone 7 it is.  I suppose just leave it.
    <Ionicons
      name={Platform.OS === "ios" ? "ios-arrow-back" : "md-arrow-back"}
      size={Platform.OS === "ios" ? 35 : 24}
      color={theme.PRIMARY_TEXT_COLOR}
      style={
        Platform.OS === "ios"
          ? { marginBottom: -4, width: 25, marginLeft: 10 }
          : { marginBottom: -4, width: 25, marginLeft: 10 }
      }
      onPress={() => {
        props.navigation.goBack();
      }}
    />
  )

  const headerRight = !event.isCustom ? null : (
    <View style={styles.headerRightComponent}>
      <TouchableOpacity onPress={onPressEditItem} style={styles.editButton}>
        <MaterialIcons name="edit" size={30} style={{ color: theme.PRIMARY_TEXT_COLOR }} />
      </TouchableOpacity>
    </View>
  );

  /* jmr - if event is within N days (see other code that sets that limit and get it from there),
    then have a message "Event within N days
    Use i18n
    If there are no upcoming milestones within the time range, have another message for that
    OR show later in the future?? */
  return (
    <View style={styles.container}>
      <ScreenHeader
        leftComponent={headerLeft}
        centerComponent={<ScreenHeaderTitle>{event.title}</ScreenHeaderTitle>}
        rightComponent={headerRight}
      />
      <UpcomingMilestonesList listHeaderComponent={header} events={[event]} verboseDescription={false} />
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
  headerRightComponent: {
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  editButton: {// jmr - figure out padding
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

