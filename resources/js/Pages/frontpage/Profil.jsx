import {
    Alert,
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Button,
    Snackbar,
    Tab,
    Tabs,
} from "@mui/material";
import PropTypes from "prop-types";

import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import React, { useEffect, useState } from "react";
import PlaceIcon from "@mui/icons-material/Place";
import SubjectIcon from "@mui/icons-material/Subject";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { data_tempat_ppl } from "../../data";
import { Head, router } from "@inertiajs/react";
import { PiListStarBold } from "react-icons/pi";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3, bgcolor: "#fcfcfc" }}>{children}</Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

const StyledTabs = styled((props) => (
    <Tabs
        {...props}
        TabIndicatorProps={{
            children: <span className="MuiTabs-indicatorSpan" />,
        }}
    />
))({
    "& .MuiTabs-indicator": {
        display: "flex",
        justifyContent: "center",
        backgroundColor: "transparent",
    },
    "& .MuiTabs-indicatorSpan": {
        maxWidth: 40,
        width: "100%",
        backgroundColor: "#008A01",
    },
});

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
    ({ theme }) => ({
        textTransform: "none",
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.pxToRem(15),
        marginRight: theme.spacing(1),
        color: "#b2b2b2",
        "&.Mui-selected": {
            color: "#008A01",
        },
        "&.Mui-focusVisible": {
            backgroundColor: "#006e01",
        },
        "&:hover": {
            color: "#008A01",
            opacity: 1,
        },
    })
);

const theme = createTheme({
    palette: {
        primary: {
            main: "#008a01",
            light: "#66b967",
            dark: "#006e01",
            contrastText: "fff",
        },
    },
});

const Frontpage = ({ lowongan_ppl, flash }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(0);
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleClose = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }

        setOpen(false);
    };

    useEffect(() => {
        if (flash.status === "gagal") {
            setOpen(true);
        } else {
            setOpen(false);
        }
    }, [flash.status]);

    return (
        <ThemeProvider theme={theme}>
            <Head title="Home" />
            <header className="fixed z-[100] flex w-full ">
                <div className="flex w-full h-20 lg:px-20 md:px-5 bg-white shadow-md justify-between sm:px-2 backdrop-blur-sm bg-opacity-50">
                    <div className="flex py-3">
                        <div className="flex items-center">
                            <img
                                className="w-20 min-w-20"
                                src="https://upload.wikimedia.org/wikipedia/commons/a/af/Lambang_UIN_Ar-Raniry.png"
                                alt="logo"
                            ></img>
                        </div>

                        <div className="w-[0.5px] bg-neutral-400"></div>
                        <div className="flex h-full items-center">
                            <span className="ml-3 text-xl font-semibold">
                                IDC
                            </span>
                        </div>
                    </div>
                </div>
            </header>
            <main className="flex justify-center flex-col items-center w-full px-6  lg:px-10">
                <div className="container">
                    <div className="h-32"></div>

                    <section className="bg-white w-full rounded-md px-4 pt-3">
                        <div className="">
                            <p className="text-neutral-600 font-bold text-lg">
                                Selamat Datang
                            </p>
                            <p className="text-neutral-600 font-normal text-xs">
                                Welcome back, Rifa! We've missed you 👋
                            </p>
                            <hr className="my-5" />
                        </div>
                        <div className="w-full pb-8">
                            PPKPM Sedang berlangsung silakan cek berkala untuk
                            mengetahui nilai
                        </div>
                    </section>
                </div>
            </main>
            <footer className="z-[100] ">
                <Box
                    sx={{
                        width: "100%",
                        position: "fixed",
                        bottom: 0,
                        boxShadow: "10",
                    }}
                    className="shadow-md "
                >
                    <BottomNavigation
                        showLabels
                        value={value}
                        onChange={(event, newValue) => {
                            setValue(newValue);
                        }}
                    >
                        <BottomNavigationAction
                            label="Home"
                            icon={<PlaceIcon />}
                        />

                        <BottomNavigationAction
                            color="primary"
                            label="Nilai"
                            // onClick={() => router.visit("lamaranku")}
                            icon={<PiListStarBold />}
                        />
                        <BottomNavigationAction
                            label="Profil"
                            onClick={() => router.visit("profil")}
                            icon={<PermIdentityIcon />}
                        />
                    </BottomNavigation>
                </Box>
            </footer>
        </ThemeProvider>
    );
};

export default Frontpage;
