import React from 'react'
import { StyleSheet, Text, View, Platform } from 'react-native'
import { Header } from "react-native-elements"

import Settings from '../components/Settings'
import i18n from '../i18n/i18n'
import theme from '../style/theme'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    color: theme.PRIMARY_TEXT_COLOR,
    fontSize: theme.FONT_SIZE_XLARGE
  },
});



const headerCenterComponent = <Text style={styles.header}>{i18n.t('headerMoreTitle')}</Text>


function More(props) {
  return (<View style={styles.container} >
    <Header statusBarProps={{ barStyle: 'dark-content', translucent: true, backgroundColor: 'transparent' }}
      containerStyle={Platform.select({
        android: Platform.Version <= 20 ? { paddingTop: 0, height: 56 } : {},
      })}
      backgroundColor={theme.PRIMARY_BACKGROUND_COLOR}
      centerComponent={headerCenterComponent}
    />
    <Settings />
  </View>
  );
}

export default More;

