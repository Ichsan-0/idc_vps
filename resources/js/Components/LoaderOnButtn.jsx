import React from "react";



const LoaderOnButton = ({className}) => {
  return (
    <div className={`loading-on-btn ${className}`}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default LoaderOnButton;