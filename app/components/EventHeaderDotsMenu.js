import React, {useContext} from 'react';
import PropTypes from 'prop-types'
import { View, Platform, Alert } from 'react-native'
import { Menu, MenuOptions, MenuOption, MenuTrigger } from 'react-native-popup-menu'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { withNavigation } from 'react-navigation'

import EventListContext from '../context/EventListContext'
import theme from '../style/theme'
import * as logger from '../utils/logger'
import i18n from '../i18n/i18n'



const EventHeaderDotsMenu = (props) => {

  const dots = Platform.OS === "ios" ? "dots-horizontal" : "dots-vertical";
  const favoritesText = props.isFavorite ? i18n.t("removeFromFavorites") : i18n.t("addToFavorites");

  const eventListContext = useContext(EventListContext);

  const onRequestRemove = () => {

    const event = props.event;
    const navigation = props.navigation;

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
            eventListContext.removeCustomEvent(event);
            // Go to events screen when remove
            navigation.navigate("EventsScreen");
          }
        },
      ],
      // On Android, cancelable: true allows them to tap outside the box to get rid of alert without doing anything
      { cancelable: true }
    );
  
  }

  // jmr - figure out the padding on the dots menu and the item to the left of it for both this and AddOrEditEvent
  return (
    <View>
      <Menu>
        <MenuTrigger >
          <MaterialCommunityIcons name={dots} size={30} style={{ paddingLeft: 10, color: theme.PRIMARY_TEXT_COLOR }} />
        </MenuTrigger>
        <MenuOptions>
          <MenuOption onSelect={props.onToggleFavorite} text={favoritesText} />
          <MenuOption onSelect={onRequestRemove} text={i18n.t('delete')} />
        </MenuOptions>
      </Menu>
    </View>
  );
}
export default withNavigation(EventHeaderDotsMenu);

EventHeaderDotsMenu.propTypes = {
  event: PropTypes.object.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  navigation: PropTypes.object.isRequired, // added via withNavigation
};