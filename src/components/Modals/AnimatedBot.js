import React from "react";
import { THEME_COLORS } from '../../constants/themeColors';
import { FaAndroid } from "react-icons/fa";


const AnimatedAndroidIcon = () => {
  const iconStyle = {
    fontSize: '120px',
    color: THEME_COLORS.primary,
    display: 'inline-block',
    animation: 'pulse 1.5s infinite',
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
          }
        `}
      </style>
      <FaAndroid className=" my-2" style={iconStyle}/>
    </>
  );
};

export default AnimatedAndroidIcon;
