import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import ScreenHeader, { ScreenHeaderTitle } from '../components/ScreenHeader'

function More(props) {
  return (<View style={styles.container} >
    <ScreenHeader />
    <Text>More settings, information, etc.</Text>
  </View>
  );
}

export default More;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
