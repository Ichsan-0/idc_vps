import {
    Avatar,
    BottomNavigation,
    BottomNavigationAction,
    Box,
    Button,
    Tab,
    Tabs,
} from "@mui/material";
import PropTypes from "prop-types";

import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import React, { useState } from "react";
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

const Lamaranku = ({ lamarankuppl }) => {
    const [value, setValue] = useState(1);
    const [tabValue, setTabValue] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <ThemeProvider theme={theme}>
            <Head title="Lamaran Ku" />
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
                    <div className="flex justify-center items-center">
                        <form>
                            <input
                                type="search"
                                placeholder="search"
                                className="ring-1 bg-secondary/5 ring-secondary rounded-md focus:ring-secondary focus:border-secondary"
                            ></input>
                        </form>
                    </div>
                </div>
            </header>
            <main className="flex justify-center flex-col items-center w-full px-6  lg:px-10">
                <div className="container">
                    <div className="h-32"></div>

                    <section className="bg-white w-full rounded-md px-4 pt-3">
                        <div>
                            <p className="text-neutral-600 font-bold text-lg">
                                Riwayat lamaran PPKPM
                            </p>

                            <hr className="my-5" />
                        </div>
                        <div className="shadow-md rounded-md w-full">
                            <Box sx={{ width: "100%" }}>
                                <Box
                                    sx={{
                                        borderBottom: 1,
                                        borderColor: "divider",
                                    }}
                                >
                                    <StyledTabs
                                        value={tabValue}
                                        onChange={handleTabChange}
                                    >
                                        <StyledTab
                                            label="PPL"
                                            {...a11yProps(0)}
                                        />
                                        <StyledTab
                                            label="KPM"
                                            {...a11yProps(0)}
                                        />
                                    </StyledTabs>
                                </Box>
                                <CustomTabPanel value={tabValue} index={0}>
                                    <div className="flex h-full w-full flex-col gap-y-3">
                                        {lamarankuppl.map((item) => (
                                            <div className="h-full bg-white shadow-md w-full rounded-md p-2 flex gap-x-3 ">
                                                {/* <Avatar
                                                    src="https://upload.wikimedia.org/wikipedia/commons/a/af/Lambang_UIN_Ar-Raniry.png"
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                    }}
                                                ></Avatar> */}
                                                <div className="flex flex-col lg:flex-row gap-y-3 w-full">
                                                    <div className="flex w-full flex-col ">
                                                        <p>
                                                            {`${item.name} ${item.nama}`}
                                                        </p>
                                                        <div className="flex gap-2">
                                                            <PlaceIcon
                                                                className="text-neutral-500"
                                                                sx={{
                                                                    fontSize:
                                                                        "medium",
                                                                }}
                                                            />
                                                            <span className="font-normal text-xs text-neutral-500">
                                                                {`${item.desa},${item.kecamatan},${item.kabupaten},${item.provinsi}`}
                                                            </span>
                                                        </div>
                                                        {/* <div className="flex gap-2">
                                                            <AcademicCapIcon className="text-neutral-500 size-4" />
                                                            <span className="font-normal text-xs text-neutral-500">
                                                                IPK. 4
                                                            </span>
                                                        </div> */}
                                                    </div>
                                                    <div className="flex w-full flex-wrap gap-y-3 gap-x-3">
                                                        <div>
                                                            <span className="bg-green-500/15 rounded-md py-1 px-2 text-secondary text-sm">
                                                                {`quota ${item.qouta}`}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="bg-blue-500/15 rounded-md py-1 px-2 text-blue-900 text-sm">
                                                                {`terisi ${item.terisi}`}
                                                            </span>
                                                        </div>
                                                        <div>
                                                            <span className="bg-blue-500/15 rounded-md py-1 px-2 text-blue-900 text-sm">
                                                                {`pelamar ${item.jumlahpelamar}`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="w-full flex-[0.1]">
                                                        <span className="bg-orange-500/15 rounded-md py-1 px-2 text-gray-00 text-sm">
                                                            {`${item.status}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="h-44"></div>
                                    </div>
                                </CustomTabPanel>
                                <CustomTabPanel value={tabValue} index={1}>
                                    Item Two
                                </CustomTabPanel>
                            </Box>
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
                            label="PPKPM"
                            onClick={() => router.visit("/")}
                            icon={<PlaceIcon />}
                        />
                        <BottomNavigationAction
                            color="primary"
                            label="Lamaran ku"
                            icon={<SubjectIcon />}
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

export default Lamaranku;
