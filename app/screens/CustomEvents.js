import React, { useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View } from 'react-native'
import { withNavigation } from '@react-navigation/compat'

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
      {empty && <Text style={styles.emptyText}>{i18n.t('emptyCustomEventsMesage')}</Text>}
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
