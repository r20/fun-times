import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet } from 'react-native'
import MyThemeContext from '../context/MyThemeContext'

import MyText, { MyTextLarge } from './MyText'
import * as logger from '../utils/logger'


/**
 * Cards to hold information.
 * MyCard can have a MyCardHeader and one or more MyCardBodyText components within it.
 */

const MyCard = (props) => {

    const myThemeContext = useContext(MyThemeContext);

    const eventInfoCardStyle = {
        borderWidth: 0,
        borderStyle: 'solid',
        color: myThemeContext.colors.cardContrast,
        backgroundColor: myThemeContext.colors.card,
        borderColor: myThemeContext.colors.card,

    };

    let stylesArray = [styles.card, eventInfoCardStyle];
    if (props.style) {
        if (Array.isArray(props.style)) {
            stylesArray = stylesArray.concat(props.style);
        } else {
            stylesArray = stylesArray.concat([props.style]);
        }
    }
    return (
        <View style={stylesArray} >
            {props.children}
        </View>
    );
}

MyCard.propTypes = {
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]), // more style to apply if desired
};

export default MyCard;

export const MyCardHeader = (props) => {

    const myThemeContext = useContext(MyThemeContext);
    const style = {
        fontSize: myThemeContext.FONT_SIZE_LARGE,
        color: myThemeContext.colors.cardContrast,
        backgroundColor: myThemeContext.colors.card,
    }

    return (
        <MyTextLarge style={[style, styles.header, props.style]}>{props.children}</MyTextLarge>
    );
}

MyCardHeader.propTypes = {
    style: PropTypes.object, // more style to apply if desired
};

export const MyCardBodyText = (props) => {

    const myThemeContext = useContext(MyThemeContext);
    const style = {
        fontSize: myThemeContext.FONT_SIZE_MEDIUM,
        color: myThemeContext.colors.cardContrast,
        backgroundColor: myThemeContext.colors.card,
    }

    return (
        <MyText style={[style, props.style]}>{props.children}</MyText>
    );
}

MyCardBodyText.propTypes = {
    style: PropTypes.object, // more style to apply if desired
};

export const MY_CARD_MARGIN = 5;


const styles = StyleSheet.create({
    header: {
        fontWeight: 'bold',
        paddingBottom: 3,
    },
    card: {
        flex: 0,
        padding: 10,
        margin: MY_CARD_MARGIN,
        borderRadius: 3,
        overflow: 'hidden',
    },
});