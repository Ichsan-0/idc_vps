import { Alert, Snackbar, Box, Button, Tabs, Tab } from "@mui/material";
import PropTypes from "prop-types";
import { FaBuilding } from "react-icons/fa6";

import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { Head, router } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";

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
        // backgroundColor: "#635ee7",
        backgroundColor: "#1D4ED8",
    },
});

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
    ({ theme }) => ({
        textTransform: "none",
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.pxToRem(15),
        marginRight: theme.spacing(1),
        color: "#525252",
        "&.Mui-selected": {
            color: "#1D4ED8",
        },
        "&.Mui-focusVisible": {
            // backgroundColor: "rgba(100, 95, 228, 0.32)",
            backgroundColor: "#1D4ED8",
        },
    })
);
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

const RiwayatLamaran = ({ flash, lamaran_kpm, lamaran_ppl }) => {
    const [notify, setNotify] = useState(!!flash.message);
    const [notifyStatus, setNotifyStatus] = useState("default");
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };
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
    // console.log(tempat_ppl);
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

    return (
        <ThemeProvider theme={theme}>
            <Head title="Riwayat Lamaran" />
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
                                Riwayat Lamaran
                            </p>
                            <div className="flex flex-col w-full gap-y-3"></div>
                        </div>
                        <Box>
                            <StyledTabs
                                value={value}
                                onChange={handleChange}
                                aria-label="styled tabs example"
                            >
                                <StyledTab label="KPM"></StyledTab>
                                <StyledTab label="PPL" />
                            </StyledTabs>
                            <Box>
                                <CustomTabPanel value={value} index={0}>
                                    <div className="mt-6 flex flex-col gap-y-3">
                                        {lamaran_kpm.map((kpm) => {
                                            let locationDetails = "null";

                                            if (
                                                kpm.kpm.regency !== null &&
                                                kpm.kpm.sub_district !== null &&
                                                kpm.kpm.village !== null
                                            ) {
                                                const kab =
                                                    kabupaten("11").find(
                                                        (itm) =>
                                                            itm.kode ===
                                                            kpm.kpm.regency
                                                    )?.nama ||
                                                    "Unknown Regency";
                                                const kec =
                                                    kecamatan(
                                                        kpm.kpm.regency
                                                    ).find(
                                                        (itm) =>
                                                            itm.kode ===
                                                            kpm.kpm.sub_district
                                                    )?.nama ||
                                                    "Unknown Sub-district";
                                                const des =
                                                    desa(
                                                        kpm.kpm.sub_district
                                                    ).find(
                                                        (itm) =>
                                                            itm.kode ===
                                                            kpm.kpm.village
                                                    )?.nama ||
                                                    "Unknown Village";

                                                locationDetails = `${kab}, ${kec}, ${des}`;
                                            }

                                            return (
                                                <div
                                                    key={kpm.id}
                                                    className="flex w-full bg-white ring-1 ring-gray-400 rounded-md py-5 px-3 shadow-md"
                                                >
                                                    <div className="flex w-full flex-col">
                                                        <div className="flex w-full justify-between">
                                                            <div className="flex w-full flex-col justify-between">
                                                                <p className="font-bold">
                                                                    {
                                                                        kpm?.kpm
                                                                            ?.name
                                                                    }
                                                                </p>
                                                                <p>
                                                                    {
                                                                        locationDetails
                                                                    }
                                                                </p>
                                                                <div>
                                                                    <p className="flex px-2 py-1 w-fit  rounded-md bg-tertiary/30 text-tertiary ">
                                                                        Kuota{" "}
                                                                        <span className="font-bold  ml-2">
                                                                            {
                                                                                kpm
                                                                                    ?.kpm
                                                                                    ?.qouta
                                                                            }
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="flex flex-col gap-y-4 justify-between items-end">
                                                                    {kpm.status ===
                                                                        "submitted" && (
                                                                        <p className="text-yellow-800 h-full  py-1 px-2 bg-yellow-500/25 rounded-full">
                                                                            {
                                                                                kpm.status
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    {kpm.status ===
                                                                        "rejected" && (
                                                                        <p className="text-red-800 py-1 px-2 bg-red-500/25 rounded-full">
                                                                            {
                                                                                kpm.status
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    {kpm.status ===
                                                                        "accepted" && (
                                                                        <p className="text-green-800 py-1 px-2 bg-green-500/25 rounded-full">
                                                                            {
                                                                                kpm.status
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    <div>
                                                                        <Button
                                                                            size="small"
                                                                            disableElevation
                                                                            variant="contained"
                                                                            onClick={( 
                                                                                e
                                                                            ) => {
                                                                                e.preventDefault();

                                                                                router.visit(
                                                                                    `/lowongankpm/detail/${kpm.id_tempat_kpm}`
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
                                                            </div>
                                                        </div>
                                                        <ol className="mt-3 bg-yellow-600/20 flex-w-full p-2">
                                                            <li className="font-bold text-gray-800">
                                                                Message
                                                            </li>
                                                            {kpm.keterangan && (
                                                                <li className="text-sm text-wrap text-gray-600">
                                                                    {
                                                                        kpm.keterangan
                                                                    }
                                                                </li>
                                                            )}
                                                        </ol>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CustomTabPanel>
                                <CustomTabPanel value={value} index={1}>
                                    <div className="mt-6 flex flex-col gap-y-3">
                                        {lamaran_ppl.map((ppl) => {
                                            let locationDetails = "null";

                                            if (
                                                ppl.ppl.regency !== null &&
                                                ppl.ppl.sub_district !== null &&
                                                ppl.ppl.village !== null
                                            ) {
                                                const kab =
                                                    kabupaten("11").find(
                                                        (itm) =>
                                                            itm.kode ===
                                                            ppl.ppl.sekolah
                                                                .regency
                                                    )?.nama ||
                                                    "Unknown Regency";
                                                const kec =
                                                    kecamatan(
                                                        ppl.ppl.sekolah.regency
                                                    ).find(
                                                        (itm) =>
                                                            itm.kode ===
                                                            ppl.ppl.sekolah
                                                                .sub_district
                                                    )?.nama ||
                                                    "Unknown Sub-district";
                                                const des =
                                                    desa(
                                                        ppl.ppl.sekolah
                                                            .sub_district
                                                    ).find(
                                                        (itm) =>
                                                            itm.kode ===
                                                            ppl.ppl.sekolah
                                                                .village
                                                    )?.nama ||
                                                    "Unknown Village";

                                                locationDetails = `${kab}, ${kec}, ${des}`;
                                            }

                                            return (
                                                <div
                                                    key={ppl.id}
                                                    className="flex w-full bg-white ring-1 ring-gray-400 rounded-md py-5 px-3 shadow-md"
                                                >
                                                    <div className="flex w-full flex-col">
                                                        <div className="flex w-full justify-between">
                                                            <div className="flex w-full flex-col justify-between">
                                                                <p className="font-bold">
                                                                    {
                                                                        ppl?.ppl
                                                                            ?.name
                                                                    }
                                                                </p>
                                                                <div className="flex flex-row gap-x-2 items-center">
                                                                    <FaBuilding />

                                                                    <span>
                                                                        {
                                                                            ppl
                                                                                .ppl
                                                                                ?.sekolah
                                                                                ?.name
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <p className="text-gray-500">
                                                                    {
                                                                        locationDetails
                                                                    }
                                                                </p>
                                                                <div>
                                                                    <p className="flex px-2 py-1 w-fit  rounded-md bg-tertiary/30 text-tertiary ">
                                                                        Kuota{" "}
                                                                        <span className="font-bold  ml-2">
                                                                            {
                                                                                ppl
                                                                                    ?.ppl
                                                                                    ?.quota
                                                                            }
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="flex flex-col gap-y-4 justify-between items-end">
                                                                    {ppl.status ===
                                                                        "submitted" && (
                                                                        <p className="text-yellow-800 h-full  py-1 px-2 bg-yellow-500/25 rounded-full">
                                                                            {
                                                                                ppl.status
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    {ppl.status ===
                                                                        "rejected" && (
                                                                        <p className="text-red-800 py-1 px-2 bg-red-500/25 rounded-full">
                                                                            {
                                                                                ppl.status
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    {ppl.status ===
                                                                        "accepted" && (
                                                                        <p className="text-green-800 py-1 px-2 bg-green-500/25 rounded-full">
                                                                            {
                                                                                ppl.status
                                                                            }
                                                                        </p>
                                                                    )}
                                                                    <div>
                                                                        <Button
                                                                            size="small"
                                                                            disableElevation
                                                                            variant="contained"
                                                                            onClick={(
                                                                                e
                                                                            ) => {
                                                                                e.preventDefault();

                                                                                router.visit(
                                                                                    `/lowonganppl/detail/${ppl.id_lowongan_ppl}`
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
                                                            </div>
                                                        </div>
                                                        <ol className="mt-3 bg-yellow-600/20 flex-w-full p-2">
                                                            <li className="font-bold text-gray-800">
                                                                Message
                                                            </li>
                                                            {ppl.keterangan && (
                                                                <li className="text-sm text-wrap text-gray-600">
                                                                    {
                                                                        ppl.keterangan
                                                                    }
                                                                </li>
                                                            )}
                                                        </ol>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CustomTabPanel>
                            </Box>
                        </Box>
                    </section>

                    <div className="h-72 w-0"></div>
                </div>
            </main>
            <Footer currentTab={2} />
        </ThemeProvider>
    );
};

export default RiwayatLamaran;
