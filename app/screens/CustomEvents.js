import React, { useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, FlatList, View } from 'react-native'
import { withNavigation } from '@react-navigation/compat'
import { useScrollToTop } from '@react-navigation/native'

import i18n from '../i18n/i18n'
import AddEventButton from '../components/AddEventButton'

import SwipeableEventListItem from '../components/SwipeableEventListItem'
import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import * as logger from '../utils/logger'
import MyText, { MyTextLarge } from '../components/MyText'


function CustomEvents(props) {

  // This allows clicking tab navigator icon causing scroll to top.
  const ref = React.useRef(null);
  useScrollToTop(ref);


  const navigation = props.navigation;
  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);
  const onPressAddEvent = () => {
    navigation.navigate("AddEvent");
  }

  const empty = !eventsAndMilestonesContext.customEvents.length;

  const renderItem = ({ item }) => {
    return (
      <SwipeableEventListItem event={item} />
    );
  }
  const keyExtractor = item => item.title;

  return (
    <View style={styles.container}>
      {!empty &&
        <FlatList
          ref={ref}
          contentContainerStyle={styles.contentContainerStyle}
          data={eventsAndMilestonesContext.customEvents}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          initialNumToRender={10}
        />
      }
      {empty && <MyTextLarge style={styles.emptyText}>{i18n.t('emptyCustomEventsMessage')}</MyTextLarge>}
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
  contentContainerStyle: {
    padding: 15,
    paddingBottom: 100,
  },
  emptyText: {
    alignSelf: 'center',
    textAlign: 'center',
    padding: 15,
  },
});
