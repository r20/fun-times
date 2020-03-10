import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { withNavigation } from 'react-navigation'
import { FlatList, StyleSheet, View, Dimensions } from 'react-native'
import { Tile, Image } from 'react-native-elements'

import EventListContext from '../context/EventListContext'

import EventListItem from './EventListItem'

const tileWidth = 70; //80;
const tileMargin = 10;

/*
TBD - Depending on how many built in standard events we offer for them to choose from,
we may want to split them in to categories and this component was experimenting with that.
For now, it's not needed.
*/
function EventCategories(props) {

  const eventListContext = useContext(EventListContext);

  const tiles = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  const windowWidth = Dimensions.get('window').width;
  const numColumns = Math.floor(windowWidth / (tileWidth + 2 * tileMargin));

  return (
    <View style={styles.container}>
      <Image style={{ width: 50, height: 50 }} source={require('../../assets/calculator.png')} />

      <FlatList
        columnWrapperStyle={{ padding: 15 }}
        data={tiles}
        numColumns={numColumns}
        keyExtractor={item => item}
        renderItem={({ item }) =>
          <View style={{
            flex: 1 / numColumns, // 1/numColumns so columns line up
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Tile
              imageSrc={require('../../assets/holidayCalendar.png')}
              imageProps={{ resizeMode: 'contain' }}
              width={tileWidth}
              featured
              caption={item}
            />

          </View>
        }
      />
    </View>
  );


  /*
     <View style={styles.wrapper}>
     <View style={styles.container}>
      <View style={styles.tile}>
   <Tile 
         width={tileWidth}
         featured
         caption="Custom"
       /> 
       </View>
       <View style={styles.tile}>
           <Tile 
         width={tileWidth}
         featured
         caption="All"
       /> 
       </View>
       {
     
       tiles.map((item) => {
       return  <View key={item} style={styles.tile}>
       <Tile
         width={tileWidth}
         featured
         caption={String(item)}
       /> 
       </View>   })
       }

     </View>
     </View> */

}

const EventCategoriesWithNavigation = withNavigation(EventCategories);
export default EventCategoriesWithNavigation;

EventCategoriesWithNavigation.propTypes = {
  navigation: PropTypes.object.isRequired,
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'yellow'
  },
});