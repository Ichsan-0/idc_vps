import {
    Alert,
    BottomNavigation,
    BottomNavigationAction,
    Box,
} from "@mui/material";

import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import React, { useEffect, useState } from "react";
import PlaceIcon from "@mui/icons-material/Place";
import { FaSchoolFlag } from "react-icons/fa6";
import { FaMagnifyingGlassChart } from "react-icons/fa6";
import { MdLibraryBooks } from "react-icons/md";

import { Head, router } from "@inertiajs/react";
import { PiListStarBold } from "react-icons/pi";
import PropTypes from "prop-types";
import { MdHolidayVillage } from "react-icons/md";
import { SiGoogleclassroom } from "react-icons/si";

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

const Footer = ({ currentTab }) => {
    const [value, setValue] = useState(currentTab);
    return (
        <footer className="z-[1000]">
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
                        console.log(newValue);
                    }}
                >
                    <BottomNavigationAction
                        label="Classroom"
                        onClick={() => router.visit("/classroom")}
                        icon={<SiGoogleclassroom />}
                    />
                    {/* <BottomNavigationAction
                        label="KPM"
                        onClick={() => router.visit("/")}
                        icon={<MdHolidayVillage />}
                    /> */}
                    <BottomNavigationAction
                        label="PPL"
                        onClick={() => router.visit("/lowonganppl")}
                        icon={<FaSchoolFlag />}
                    />
                    <BottomNavigationAction
                        label="Lamaranku"
                        onClick={() => router.visit("/riwayat")}
                        icon={<FaMagnifyingGlassChart />}
                    />

                    <BottomNavigationAction
                        color="primary"
                        label="Nilai"
                        onClick={() => router.visit("/nilai")}
                        icon={<MdLibraryBooks />}
                    />
                    <BottomNavigationAction
                        label="Profil"
                        onClick={() => router.visit("/profil")}
                        icon={<PermIdentityIcon />}
                    />
                </BottomNavigation>
            </Box>
        </footer>
    );
};

export default Footer;
