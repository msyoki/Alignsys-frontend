import React from "react";

const AnimatedAndroidIcon = () => {
  const iconStyle = {
    fontSize: '120px',
    color: '#2757aa',
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
      <i className="fa-brands fa-android my-2" style={iconStyle}></i>
    </>
  );
};

export default AnimatedAndroidIcon;
