import React from "react";
import "./GlobalBackground.css";

const GlobalBackground: React.FC = () => {
    return (
        <div className="global-bg">
            <div className="glow"></div>
            <div className="stars"></div>
            <div className="waves"></div>
            <ul className="particles">
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
                <li></li>
            </ul>
        </div>
    );
};

export default GlobalBackground;
