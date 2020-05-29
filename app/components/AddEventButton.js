import React from 'react'
import PropTypes from 'prop-types'
import { Icon, Fab } from 'native-base'
import theme, { getContrastFontColor } from '../style/theme'

const AddEventButton = ({ onPress }) => {

  return (
    <Fab
      direction="up"
      style={{ backgroundColor: theme.ADD_EVENT_BUTTON_BACKGROUND_COLOR, color: getContrastFontColor(theme.ADD_EVENT_BUTTON_BACKGROUND_COLOR) }}
      position="bottomRight"
      onPress={onPress}
    >
      <Icon name="add" />
    </Fab>
  );
}

AddEventButton.propTypes = {
  onPress: PropTypes.func.isRequired,
};

export default AddEventButton;

