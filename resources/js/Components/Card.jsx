import React from "react";

const Card = ({ children, title="Title" }) => {
    return (
        <div className="flex flex-col bg-white rounded-2xl border">
            <div className="p-5 border-b font-semibold">{title}</div>
            
            <div className=" bg-white p-5 rounded-b-2xl ">{children}</div>
        </div>
    );
};

export default Card;
