import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Platform } from 'react-native'
import { Button } from 'react-native-elements'


import MyThemeContext from '../context/MyThemeContext'



/* This was created in case need to style all dividers
(such as based on dark/light theme).  We can just do styling here. */
const MyPrimaryButton = (props) => {
    const myThemeContext = useContext(MyThemeContext);

    let newProps;
    if (props.type === 'clear') {
        newProps = {
            disabledTitleStyle: { color: myThemeContext.colors.unselected },
            titleStyle: { color: myThemeContext.colors.primary },
        };
    } else {
        newProps = {
            buttonStyle: { backgroundColor: myThemeContext.colors.primary },
            titleStyle: { color: myThemeContext.colors.primaryContrast },
            disabledStyle: { backgroundColor: myThemeContext.colors.unselected },
            disabledTitleStyle: { color: myThemeContext.getContrastFontColor(myThemeContext.colors.unselected) },
        };
    }

    /* Don't set backgroundColor for titleStyle. It's inherited. Otherwise the affect when button is pushed doesn't look right. */
    return (<Button {...newProps} {...props} />);
}
export default MyPrimaryButton;


