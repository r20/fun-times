import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { FlatGrid } from 'react-native-super-grid'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import MyThemeContext from '../context/MyThemeContext'


/**
 * Offers a grid of the colors for selection.
 * Doesn't support white or close to white right now
 * (because there's no border and it'd be hard to see).
 */
function ColorPicker(props) {

    const [selectedColor, setSelectedColor] = useState(props.selectedColor);
    const myThemeContext = useContext(MyThemeContext);

    const renderItem = ({ item }) => {
        const fontColor = myThemeContext.getContrastFontColor(item);
        return (
            <TouchableOpacity
                style={[styles.circle, { backgroundColor: item }]}
                onPress={() => {
                    setSelectedColor(item);
                    props.onSelect(item);
                }}>
                {selectedColor === item &&
                    <MaterialCommunityIcons name="check" style={{ color: fontColor, fontSize: 24 }} />}
            </TouchableOpacity>
        )
    };

    return (
        <FlatGrid
            itemDimension={70}
            items={props.colors}
            renderItem={renderItem}
        />
    );

}

ColorPicker.propTypes = {
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    selectedColor: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default ColorPicker;


const styles = StyleSheet.create({
    circle: {
        width: 50,
        height: 50,
        borderRadius: 50,
        margin: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
