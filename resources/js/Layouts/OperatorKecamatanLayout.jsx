import React from "react";
import Header from "@/Components/frontpage/Header";
import ButtomFooter from "@/Components/frontpage/ButtomFooter";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        primary: {
            main: "#06359f",
            light: "#3d5fb3",
            dark: "#042574",
        },
        secondary: {
            main: "#008a01",
            light: "#66b967",
            dark: "#006e01",
        },
        info: {
            main: "#0288d1",
            light: "#03a9f4",
        },
        background: {
            default: "#f8fafc",
            paper: "#ffffff",
        },
    },
    typography: {
        fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
    },
});

const OperatorKecamatanLayout = ({ children }) => {
    return (
        <ThemeProvider theme={theme}>
            <div className="min-h-screen flex flex-col bg-[#f8fafc] font-satoshi text-slate-800">
                <Header />
                <main className="flex-1 w-full flex flex-col items-center">
                    <div className="mx-auto max-w-screen-xl p-4 md:p-6 2xl:p-10 flex-1 w-full relative">
                        {children}
                    </div>
                </main>
                <ButtomFooter />
            </div>
        </ThemeProvider>
    );
};

export default OperatorKecamatanLayout;
