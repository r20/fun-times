import { StyleSheet } from 'react-native'


import theme from '../../style/theme'

const settingsStyles = StyleSheet.create({
    container: {
        flex: 0,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
    },
    divider: {
        marginVertical: 10,
        height: 2,
    },
    settingsSectionHeaderText: {
        color: theme.PRIMARY_ACTIVE_TEXT_COLOR,
        fontSize: theme.FONT_SIZE_LARGE,
        paddingVertical: 5,
    },
    settingsText: {
        color: theme.PRIMARY_TEXT_COLOR,
        fontSize: theme.FONT_SIZE_MEDIUM,
    },
});

export default settingsStyles;