import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { withNavigation } from '@react-navigation/compat'

import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import { getDisplayStringDateTimeForEvent } from '../utils/Utils'
import EventSelectedStar from '../components/EventSelectedStar'
import MyCard, { MyCardHeader, MyCardBodyText } from '../components/MyCard'
import * as logger from '../utils/logger'
import MyThemeContext from '../context/MyThemeContext'

function EventListItem(props) {

  const myThemeContext = useContext(MyThemeContext);
  const colorStyle = {
    color: myThemeContext.colors.eventContrast,
    backgroundColor: myThemeContext.colors.event,
  }


  const title = props.event.title;

  const onPressEventInfo = (event) => {
    if (props.navigation) {
      // Pass param
      props.navigation.navigate("EventInfo", { event: event });
    }
  }

  return (
    <View style={styles.container}>
      <EventSelectedStar event={props.event} containerStyle={styles.starStyle} />
      <TouchableOpacity style={styles.card} onPress={() => onPressEventInfo(props.event)}>
        <MyCard style={colorStyle}>
          <MyCardHeader style={colorStyle}>{title}</MyCardHeader>
          <MyCardBodyText style={colorStyle}>{getDisplayStringDateTimeForEvent(props.event)}</MyCardBodyText>
        </MyCard>
      </TouchableOpacity>
    </View>
  );
}


const EventListItemWithNavigation = withNavigation(EventListItem);
export default EventListItemWithNavigation;

EventListItemWithNavigation.propTypes = {
  event: PropTypes.object.isRequired,
  /* If required is specified for navigation, it gives a warning.
  Perhaps it's not hooked up right away when component is created.*/
  navigation: PropTypes.func,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  card: {
    flex: 1, // So it will stretch out and take up rest of space
  },
  starStyle: {
    paddingRight: 5
  }
});
