import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Platform } from 'react-native'
import { Header } from 'react-native-elements'


import MyThemeContext, { getContrast } from '../context/MyThemeContext'
import * as logger from '../utils/logger'
import MyText, { MyTextSmall, MyTextLarge, MyTextXLarge } from '../components/MyText'




/* This was created in case need to style all dividers
(such as based on dark/light theme).  We can just do styling here. */
const MyScreenHeader = (props) => {
    const myThemeContext = useContext(MyThemeContext);

    const headerCenterComponent = <MyTextXLarge >{props.title}</MyTextXLarge>

    // So the status icons can show
    const barStyle = myThemeContext.isThemeDark ? 'light-content' : 'dark-content';

    return (<Header statusBarProps={{ barStyle: barStyle, translucent: true, backgroundColor: 'transparent' }}
        containerStyle={Platform.select({
            android: Platform.Version <= 20 ? { paddingTop: 0, height: 56 } : {},
        })}
        backgroundColor={myThemeContext.colors.headerBackground}
        centerComponent={headerCenterComponent}
        containerStyle={{ borderBottomWidth: 0, borderColor: myThemeContext.colors.headerBackground }}
    />);
}
export default MyScreenHeader;


MyScreenHeader.propTypes = {
    title: PropTypes.string,
}
