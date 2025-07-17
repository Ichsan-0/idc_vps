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
    const [page, setPage] = useState(1);
    const [searchKey, setSearchKey] = useState("");
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
            .get(`/api/lowonganppl`, {
                params: { page, ...filters_a },
            })
            .then((response) => {
                const { data } = response;
                setDataLowongan((prev) => [...prev, ...data.data]);
                setRawData(data);
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
    }, [page]);

    // useEffect(() => {
    //     if (inView && rawData.current_page < rawData.last_page) {
    //         setPage((prev) => prev + 1);
    //     }
    // }, [inView]);
    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
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

                    <section className="bg-white w-full rounded-md px-4 pt-3 max-w-5xl">
                        <div className="py-5">
                            <p className="text-neutral-600 font-bold text-lg">
                                Pilihan Tempat PPL
                            </p>
                            <div className="flex flex-col w-full gap-y-3">
                                <div class="max-w-md ">
                                    <label
                                        for="default-search"
                                        class="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
                                    >
                                        Search
                                    </label>
                                    <div class="relative">
                                        <div class="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                                            <svg
                                                class="w-4 h-4 text-gray-500 dark:text-gray-400"
                                                aria-hidden="true"
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 20 20"
                                            >
                                                <path
                                                    stroke="currentColor"
                                                    stroke-linecap="round"
                                                    stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                                />
                                            </svg>
                                        </div>
                                        <input
                                            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                            placeholder="Cari Sekolah"
                                            onChange={(e) => {
                                                setSearchKey(e.target.value);
                                            }}
                                        />
                                        <button
                                            class="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                            onClick={() => {
                                                setDataLowongan([]);
                                                const fl = {
                                                    ...filters,
                                                    search: searchKey,
                                                };
                                                fetchData(fl);
                                            }}
                                        >
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col gap-y-3">
                                {dataLowongan.map((ppl, index) => {
                                    let locationDetails = "null";

                                    if (
                                        ppl.sekolah.regency !== null &&
                                        ppl.sekolah.sub_district !== null &&
                                        ppl.sekolah.village !== null
                                    ) {
                                        const kab =
                                            kabupaten("11").find(
                                                (itm) =>
                                                    itm.kode ===
                                                    ppl.sekolah.regency
                                            )?.nama || "Unknown Regency";
                                        const kec =
                                            kecamatan(ppl.sekolah.regency).find(
                                                (itm) =>
                                                    itm.kode ===
                                                    ppl.sekolah.sub_district
                                            )?.nama || "Unknown Sub-district";
                                        const des =
                                            desa(ppl.sekolah.sub_district).find(
                                                (itm) =>
                                                    itm.kode ===
                                                    ppl.sekolah.village
                                            )?.nama || "Unknown Village";

                                        locationDetails = `${kab}, ${kec}, ${des}`;
                                    }

                                    return (
                                        <div
                                            key={`${ppl.id} - ${index}`}
                                            className="flex w-full bg-white ring-1 ring-gray-400 rounded-md py-5 px-3 shadow-md"
                                        >
                                            <div className="flex w-full justify-between items-end">
                                                <div className="flex w-full flex-col">
                                                    <p className="font-bold">
                                                        {ppl?.name}
                                                    </p>
                                                    <div className="flex flex-row gap-x-2 items-center">
                                                        <FaBuilding />

                                                        <span>
                                                            {ppl?.sekolah?.name}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-500">
                                                        {locationDetails}
                                                    </p>
                                                    <div>
                                                        <p className="flex px-2 py-1 w-fit  rounded-md bg-tertiary/30 text-tertiary ">
                                                            Kuota{" "}
                                                            <span className="font-bold  ml-2">
                                                                {ppl?.quota}
                                                            </span>
                                                        </p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <Button
                                                        size="small"
                                                        disableElevation
                                                        variant="contained"
                                                        onClick={(e) => {
                                                            e.preventDefault();

                                                            router.visit(
                                                                `/lowonganppl/detail/${ppl.id}`
                                                            );
                                                        }}
                                                        sx={{
                                                            color: "white",
                                                            textTransform:
                                                                "capitalize",
                                                        }}
                                                    >
                                                        Lihat
                                                    </Button>
                                                </div>
                                            </div>
                                            <div></div>
                                        </div>
                                    );
                                })}
                                <div className="flex w-full justify-center">
                                    {loading && <CircularProgress />}
                                </div>
                            </div>
                            <div className="flex w-full justify-center">
                                <Button
                                    variant="contained"
                                    disableElevation
                                    disabled={loading}
                                    sx={{
                                        textTransform: "capitalize",
                                        color: "white",
                                    }}
                                    onClick={() => {
                                        if (
                                            rawData.current_page <
                                            rawData.last_page
                                        ) {
                                            setPage((prev) => prev + 1);
                                        }
                                    }}
                                >
                                    Muat Lebih Banyak
                                </Button>
                            </div>
                        </div>
                    </section>

                    <div className="h-72 w-0"></div>
                </div>
            </main>
            <Footer currentTab={1} />
        </ThemeProvider>
    );
};

export default PPL;
