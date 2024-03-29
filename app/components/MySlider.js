import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Slider } from 'react-native'

import MyThemeContext from '../context/MyThemeContext'


/* This was created for styling (such as based on dark/light theme).  */
const MySlider = (props) => {
    const myThemeContext = useContext(MyThemeContext);


    let trackProps = {};
    // This component was made for styling, but it shows green when at zero instead of the right style
    // if (props.value) {
    //     trackProps = {
    //         minimumTrackTintColor: myThemeContext.colors.secondary,
    //         thumbTintColor: myThemeContext.colors.secondary,
    //     }
    // }

    return (<Slider  {...trackProps} {...props} />);
}
export default MySlider;


