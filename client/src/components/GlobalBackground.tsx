import React from 'react';
import './GlobalBackground.css';

const GlobalBackground: React.FC = () => {
  return (
    <div className="global-bg">
      <div className="glow"></div>
      <div className="stars"></div>
      <div className="waves"></div>
    </div>
  );
};

export default GlobalBackground;
