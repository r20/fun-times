import React from 'react'
import PropTypes from 'prop-types'
import { Text, StyleSheet, FlatList, View } from 'react-native'

import i18n from '../i18n/i18n'
import theme from '../style/theme'
import EventListItem from '../components/EventListItem'
import { withEventListContext } from '../context/EventListContext'
import { withSingleScreenInStackNavigator } from '../navigation/NavUtils'


function BuiltinEvents(props) {


  const onPressEventInfo = (event) => {
    // Passed param will be accessible via props.navigation.getParam()
    props.navigation.navigate("EventInfo", { event: event });
  }

  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={{ padding: 15 }}
        data={props.eventListContext.standardEvents}
        keyExtractor={item => item.title}
        renderItem={({ item }) =>
          <EventListItem event={item} onPressEventInfo={() => { onPressEventInfo(item) }} />
        }
      />
    </View>
  );
}

const BuiltinEventsWithContext = withEventListContext(BuiltinEvents);
export default withSingleScreenInStackNavigator(BuiltinEventsWithContext, i18n.t("headerBuiltinEventsTitle"));

BuiltinEvents.propTypes = {
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
  }
});
