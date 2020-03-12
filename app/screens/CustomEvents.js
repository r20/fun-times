import React, { useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View, Alert, Animated } from 'react-native'
import { withNavigation } from 'react-navigation'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { RectButton } from 'react-native-gesture-handler'
import { FontAwesome } from '@expo/vector-icons'

import i18n from '../i18n/i18n'
import AddEventButton from '../components/AddEventButton'
import theme from '../style/theme'
import SwipeableEventListItem from '../components/SwipeableEventListItem'
import EventListContext from '../context/EventListContext'
import * as logger from '../utils/logger'



function CustomEvents(props) {

  const navigation = props.navigation;
  const eventListContext = useContext(EventListContext);
  const onPressAddEvent = () => {
    navigation.navigate("AddEvent");
  }

  const empty = !eventListContext.customEvents.length;

  /* jmr - might need ref to close open swipeable
  
  See https://www.reddit.com/r/reactjs/comments/ay5ace/react_useref_in_map/
  */

  return (
    <View style={styles.container}>
      {!empty &&
        <FlatList
          contentContainerStyle={{ padding: 15, paddingBottom: 100, }}
          data={eventListContext.customEvents}
          keyExtractor={item => item.title}
          renderItem={({ item }) => {
            return (
              <SwipeableEventListItem event={item} />
            );
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
  },
});
