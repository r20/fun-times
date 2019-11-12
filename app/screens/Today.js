import React from 'react'
import PropTypes from 'prop-types'
import { FlatList, StyleSheet, Text, View } from 'react-native'

import i18n from '../i18n/i18n'
import { withEventListContext } from '../context/EventListContext'
import EventComparedToNow from '../components/EventComparedToNow'
import { withSingleScreenInStackNavigator } from '../navigation/NavUtils'
import theme, { getEventStyle } from '../style/theme'
import EventCard, { EventCardHeader, EventCardBodyText } from '../components/EventCard'


function Today(props) {

  return (<View style={styles.container} >

    <FlatList
      contentContainerStyle={{ padding: 15 }}
      data={props.eventListContext.events}
      keyExtractor={item => item.title}
      renderItem={({ item }) => {

        const title = item.title;

        return (<EventCard event={item}>
          <EventCardHeader event={item}>{title}</EventCardHeader>
          <EventComparedToNow event={item} />
        </EventCard>
        );
      }
      }
    />
  </View>
  );
}

const TodayWithContext = withEventListContext(Today);
export default withSingleScreenInStackNavigator(TodayWithContext, i18n.t("headerTodayTitle"));


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  }
});
