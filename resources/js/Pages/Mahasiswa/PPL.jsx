import {
    Alert,
    Snackbar,
    Box,
    Button,
    CircularProgress,
    LinearProgress,
} from "@mui/material";
import PropTypes from "prop-types";
import { FaBuilding } from "react-icons/fa6";

import { ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import axios from "axios";
import { useInView } from "react-intersection-observer";
import Navigation from "@/Components/Mahasiswa/Navigation";
import ButtomFooter from "@/Components/frontpage/ButtomFooter";
import LowonganList from "@/Components/Mahasiswa/LowonganPPL/LowonganList";
import Search from "@/Components/Search";
import { SettingsSystemDaydream } from "@mui/icons-material";
import PaginationControls from "@/Components/Mahasiswa/LowonganKPM/PaginationControlls";
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

const PPL = ({ flash, tempat_ppl, auth }) => {
    // const { ref, inView, entry } = useInView({});
    const [notify, setNotify] = useState(!!flash.message);
    const [notifyStatus, setNotifyStatus] = useState("default");
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(null);

    const [searchKey, setSearchKey] = useState(null);
    const [searchInput, setSearchInput] = useState(null);

    const [dataLowongan, setDataLowongan] = useState([]);
    const [rawData, setRawData] = useState([]);
    const [filters, setFilters] = useState({
        nim: auth?.user?.username,
        search: "",
    });

    useEffect(() => {
        if (flash.message !== null) {
            console.log("notify=> ", notify);
            if (flash.message.success) {
                setNotifyStatus("success");
            } else {
                setNotifyStatus("error");
            }
        }
        setNotify(true);
    }, [flash.message]);

    const fetchData = async (filters_a = filters) => {
        setLoading(true);
        setError(null);

        axios
            .get(`/api/user/ppl/vacancies`, {
                params: { 
                    page: currentPage, 
                    nim:auth?.user?.username,
                    search : searchKey || ""
                 },
            })
            .then((response) => {
                const { data } = response;
                setDataLowongan(data.data);
                setRawData(data);
                setTotalPages(data?.last_page);
            })
            .catch((err) => {
                setError(err.response?.data?.message || "An error occurred");
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, searchKey]);

    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
        setTimeout(()=>{
            setSearchKey(e.target.value);
            setCurrentPage(1);

        },2500);
    };

    return (
        <ThemeProvider theme={theme}>
            <Head title="Lowngan PPL" />
            <Header />
            {flash.message && (
                <Snackbar
                    open={notify}
                    anchorOrigin={{
                        vertical: "top",
                        horizontal: "right",
                    }}
                    autoHideDuration={3000}
                    onClose={handleCloseNotify}
                >
                    <Alert
                        onClose={handleCloseNotify}
                        severity={notifyStatus}
                        variant="filled"
                        sx={{ width: "100%" }}
                    >
                        {flash.message && flash.message[notifyStatus]}
                    </Alert>
                </Snackbar>
            )}
            <main className="flex justify-center flex-col items-center w-full px-6  lg:px-10 z-[0]">
                <div className="flex justify-center items-center w-full mt-4 flex-col">
                    <div className="h-5"></div>

                    <section className="bg-white w-full rounded-xl ring-gray-200 px-4 pt-3 max-w-5xl">
                        <div className="py-5">
                            <p className="text-neutral-600 font-bold text-lg">
                                Pilihan Tempat PPL
                            </p>
                            <div className="flex flex-col w-full gap-y-3">
                                <Search
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                />
                                <LowonganList
                                    data={dataLowongan}
                                    loading={loading}
                                />
                            </div>
                            <PaginationControls currentPage={currentPage} totalPages={totalPages} onChange={setCurrentPage}/>
                        </div>
                    </section>

                </div>
            </main>
            <ButtomFooter />

            <Navigation />
        </ThemeProvider>
    );
};

export default PPL;
