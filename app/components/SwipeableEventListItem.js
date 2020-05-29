import React, { useContext, useRef } from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, View, Alert, Animated } from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import { RectButton } from 'react-native-gesture-handler'
import { FontAwesome } from '@expo/vector-icons'

import i18n from '../i18n/i18n'
import theme from '../style/theme'
import EventListItem from '../components/EventListItem'
import EventsAndMilestonesContext from '../context/EventsAndMilestonesContext'
import * as logger from '../utils/logger'



function SwipeableEventListItem(props) {

  const swipeableRef = useRef(null);
  const event = props.event;
  const eventsAndMilestonesContext = useContext(EventsAndMilestonesContext);

  const onRequestRemove = () => {

    Alert.alert(
      i18n.t('eventRemoveTitle'),
      i18n.t('eventRemoveConfirmation', { someValue: event.title }),
      [
        {
          text: i18n.t('cancel'),
          onPress: () => {
            logger.log('Cancel Pressed');
            try {
              swipeableRef.current.close();
            } catch (err) {
              logger.log("Error while trying to close swipeableRef", err);
            }
          },
          style: 'cancel',
        },
        {
          text: i18n.t('ok'), onPress: () => {
            logger.log('OK Pressed');
            eventsAndMilestonesContext.removeCustomEvent(event);
          }
        },
      ],
      // On Android, cancelable: true allows them to tap outside the box to get rid of alert without doing anything
      { cancelable: true }
    );

  }

  const renderRightActions = (progress, dragX) => {
    const trans = dragX.interpolate({
      inputRange: [-50, 0],
      outputRange: [0, 20],
    });

    /* TODO: The button isn't being used as a button any more.
    If it's swiped open, the delete confirmation is presented. */
    return (
      <RectButton style={styles.swipeRightActionButton}  >
        <Animated.Text
          style={[
            styles.swipeRightActionText,
            {
              transform: [{ translateX: trans }],
            },
          ]} ><FontAwesome name="trash-o" size={30} style={styles.trashStyle} />
        </Animated.Text>
      </RectButton>
    );
  };

  return (
    <Swipeable ref={swipeableRef} onSwipeableRightOpen={onRequestRemove} renderRightActions={renderRightActions}>
      <EventListItem event={event} />
    </Swipeable>)

}

export default SwipeableEventListItem;

SwipeableEventListItem.propTypes = {
  event: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  swipeRightActionButton: {
    backgroundColor: 'red',
    margin: 5,
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 3,
  },
  swipeRightActionText: {
    color: '#ffffff',
    fontSize: theme.FONT_SIZE_LARGE,
    marginRight: 20,
  },
  trashStyle: {
    color: '#ffffff',
  }
});
