import React from "react";
import { createContext } from "react";

export const SekolahContext = createContext();

const SekolahProvider = ({ children, data }) => {
    return (
        <SekolahContext.Provider value={data}>
            {children}
        </SekolahContext.Provider>
    );
};

export default SekolahProvider;
