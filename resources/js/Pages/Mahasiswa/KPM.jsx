import {
    Alert,
    Snackbar,
    Autocomplete,
    Box,
    Button,
    TextField,
    CircularProgress,
    LinearProgress,
} from "@mui/material";
import PropTypes from "prop-types";

import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import { provinsi, kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import { useInView } from "react-intersection-observer";
import axios from "axios";

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

const Profil = ({ flash, tempat_kpm }) => {
    const { ref, inView, entry } = useInView({});
    const [notify, setNotify] = useState(!!flash.message);
    const [notifyStatus, setNotifyStatus] = useState("default");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dataLowongan, setDataLowongan] = useState([]);
    const [rawData, setRawData] = useState([]);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        regency: "",
        sub_district: "",
        village: "",
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
    const fetchData = async () => {
        setLoading(true);
        setError(null);

        axios
            .get(`/api/lowongankpm`, {
                params: { page, ...filters },
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
        console.log(filters);
    }, [page]);

    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };
    const [regency, setRegency] = useState();
    const [subDistrict, setSubDistrict] = useState();
    const [village, setVillage] = useState();

    const listOfRegencies = kabupaten("11");
    const [listOfSubdistricts, setListOfSubdistricts] = useState([]);
    const [listOfVillages, setListOfVillages] = useState([]);

    const handleRegencyChange = (e, value) => {
        setListOfSubdistricts(kecamatan(value.kode));
        console.log(value.kode);

        setRegency(value);
    };

    const handleSubDisctrictChange = (e, value) => {
        setListOfVillages(desa(value.kode));
        setSubDistrict(value);
    };

    const handleVillageChange = (e, value) => {
        setVillage(value);
    };
    useEffect(() => {
        setFilters({
            regency: regency?.kode,
            sub_district: subDistrict?.kode,
            village: village,
        });
    }, [regency, subDistrict, village]);

    return (
        <ThemeProvider theme={theme}>
            <Head title="Lowongan KPM" />
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
                                Pilihan Tempat KPM
                            </p>
                            <div className="flex flex-col w-full gap-y-3">
                                <div className="flex flex-col">
                                    <p>Filter berdasarkan wilayah</p>
                                    <div className="flex w-full mt-2 flex-col gap-3 items-end">
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full gap-3">
                                            <div className="flex flex-col">
                                                <Autocomplete
                                                    id="regency"
                                                    value={regency}
                                                    required
                                                    getOptionLabel={(option) =>
                                                        option.nama
                                                    }
                                                    options={listOfRegencies}
                                                    onChange={(e, value) =>
                                                        handleRegencyChange(
                                                            e,
                                                            value
                                                        )
                                                    }
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Kabupaten"
                                                        />
                                                    )}
                                                    fullWidth
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <Autocomplete
                                                    id="subdistrict"
                                                    value={subDistrict}
                                                    required
                                                    getOptionLabel={(option) =>
                                                        option.nama
                                                    }
                                                    options={listOfSubdistricts}
                                                    onChange={(e, value) =>
                                                        handleSubDisctrictChange(
                                                            e,
                                                            value
                                                        )
                                                    }
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Kecamatan"
                                                        />
                                                    )}
                                                    fullWidth
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <Autocomplete
                                                    id="village"
                                                    value={village}
                                                    required
                                                    getOptionLabel={(option) =>
                                                        option.nama
                                                    }
                                                    options={listOfVillages}
                                                    onChange={(e, value) =>
                                                        handleVillageChange(
                                                            e,
                                                            value
                                                        )
                                                    }
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Desa"
                                                        />
                                                    )}
                                                    fullWidth
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <Button
                                                variant="contained"
                                                disableElevation
                                                onClick={(e) => {
                                                    setDataLowongan([]);
                                                    setPage(1);
                                                    // setFilters({
                                                    //     regency: regency?.kode,
                                                    //     sub_district:
                                                    //         subDistrict?.kode,
                                                    //     village: village?.kode,
                                                    // });
                                                    fetchData();
                                                }}
                                                sx={{
                                                    textTransform: "capitalize",
                                                    color: "white",
                                                }}
                                            >
                                                Filter
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col gap-y-3">
                                {dataLowongan.map((kpm, index) => {
                                    let locationDetails = "null";

                                    if (
                                        kpm.regency !== null &&
                                        kpm.sub_district !== null &&
                                        kpm.village !== null
                                    ) {
                                        const kab =
                                            kabupaten("11").find(
                                                (itm) =>
                                                    itm.kode === kpm.regency
                                            )?.nama || "Unknown Regency";
                                        const kec =
                                            kecamatan(kpm.regency).find(
                                                (itm) =>
                                                    itm.kode ===
                                                    kpm.sub_district
                                            )?.nama || "Unknown Sub-district";
                                        const des =
                                            desa(kpm.sub_district).find(
                                                (itm) =>
                                                    itm.kode === kpm.village
                                            )?.nama || "Unknown Village";

                                        locationDetails = `${kab}, ${kec}, ${des}`;
                                    }

                                    return (
                                        <div
                                            key={`${kpm.id}-${index}`}
                                            className="flex w-full bg-white ring-1 ring-gray-400 rounded-md py-5 px-3 shadow-md"
                                        >
                                            <div className="flex w-full justify-between items-end">
                                                <div className="flex w-full flex-col">
                                                    <p className="font-bold">
                                                        {kpm?.name}
                                                    </p>
                                                    <p>{locationDetails}</p>
                                                    <div className="flex flex-row gap-x-2 w-full">
                                                        <p className="flex px-2 py-1 w-fit  rounded-md bg-tertiary/30 text-tertiary ">
                                                            Kuota{" "}
                                                            <span className="font-bold  ml-2">
                                                                {kpm?.qouta}
                                                            </span>
                                                        </p>
                                                        <p className="flex px-2 py-1 w-fit  rounded-md bg-yellow-600/30 text-yellow-800 ">
                                                            Terisi{" "}
                                                            <span className="font-bold  ml-2">
                                                                {kpm?.terisi}
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
                                                                `/lowongankpm/detail/${kpm.id}`
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
                                <div className="flex w-full justify-center h-10">
                                    {loading && (
                                        <Box
                                            sx={{
                                                width: "100%",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                display: "flex",
                                            }}
                                        >
                                            <LinearProgress
                                                style={{
                                                    position: "relative",
                                                    width: "100%",
                                                }}
                                            />
                                        </Box>
                                    )}
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
                        </div>
                    </section>

                    <div className="h-72 w-0"></div>
                </div>
            </main>
            <Footer currentTab={0} />
        </ThemeProvider>
    );
};

export default Profil;
