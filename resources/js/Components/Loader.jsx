import React from "react";



const Loader = ({className}) => {
  return (
    <div className={`loading ${className}`}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
};

export default Loader;