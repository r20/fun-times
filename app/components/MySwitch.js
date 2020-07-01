import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Switch } from 'react-native'

import MyThemeContext from '../context/MyThemeContext'


/* This was created for styling (such as based on dark/light theme).  */
const MySwitch = (props) => {
    const myThemeContext = useContext(MyThemeContext);


    let trackProps = {};
    // This component was made for styling, but it shows green momentarily whenever you toggle it
    // if (props.value) {
    //     trackProps = {
    //         trackColor: { true: myThemeContext.colors.secondaryLighterOrDarker },
    //         thumbColor: myThemeContext.colors.secondary,
    //     }
    // }

    return (<Switch  {...props} />);
}
export default MySwitch;


