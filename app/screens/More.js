import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

import Settings from '../components/Settings'

function More(props) {
  return (<View style={styles.container} >
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
