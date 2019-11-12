import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { withSingleScreenInStackNavigator } from '../navigation/NavUtils'

// TBD
function More(props) {
  return (<View style={styles.container} >
    <Text>More settings, information, etc.</Text>
  </View>
  );
}

export default withSingleScreenInStackNavigator(More, "");


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
