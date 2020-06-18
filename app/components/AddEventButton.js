import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { Icon, Fab } from 'native-base'
import MyThemeContext from '../context/MyThemeContext'

const AddEventButton = ({ onPress }) => {

  const myThemeContext = useContext(MyThemeContext);

  return (
    <Fab
      direction="up"
      style={{ backgroundColor: myThemeContext.colors.secondary }}
      position="bottomRight"
      onPress={onPress}
    >
      <Icon name="add" style={{ color: myThemeContext.colors.secondaryContrast }}
        position="bottomRight" />
    </Fab>
  );
}

AddEventButton.propTypes = {
  onPress: PropTypes.func.isRequired,
};

export default AddEventButton;

