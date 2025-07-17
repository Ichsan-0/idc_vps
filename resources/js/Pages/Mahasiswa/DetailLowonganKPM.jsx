import {
    Alert,
    Snackbar,
    Autocomplete,
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import PropTypes from "prop-types";

import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import InputError from "@/Components/InputError";
import { provinsi, kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import { CloudUploadOutlined } from "@mui/icons-material";
import { GrAttachment } from "react-icons/gr";
import MUIDataTable from "mui-datatables";

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

const DetailLowonganKPM = ({ flash, tempat_kpm, pelamar }) => {
    const [notify, setNotify] = useState(!!flash.message);
    const [notifyStatus, setNotifyStatus] = useState("default");

    const { data, sedData, post, processing } = useForm({
        id: tempat_kpm?.id,
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
    // console.log(tempat_ppl);
    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };

    const listOfRegencies = kabupaten("11");

    const columns = [
        {
            name: "No",
            label: "No",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return tableMeta.rowIndex + 1; // Adjust index to be 1-based
                },
            },
        },
        { name: "nama_mahasiswa" },
        { name: "nim", label: "NIM" },

        { name: "nama_prodi", label: "Prodi" },
        { name: "jk", label: "Jenis Kelamin" },
    ];

    const options = {
        filterType: "multiselect",
        selectableRows: false,
    };

    return (
        <ThemeProvider theme={theme}>
            <Head title="Profil" />
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
                <div className="flex justify-center items-center w-full mt-4 flex-col  max-w-5xl">
                    <div className="h-5"></div>

                    <section className="bg-white w-full rounded-md px-4 pt-3 shadow-md">
                        <div className="py-5">
                            <p className="text-neutral-600 font-bold text-lg">
                                Detail Tempat KPM
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="w-full">
                                    <table className="table-auto">
                                        <tbody>
                                            <tr className="gap-3">
                                                <td className="text-gray-600 text-end align-top pr-2">
                                                    Nama Tempat KPM
                                                </td>
                                                <td className="text-gray-950 font-semibold align-top">
                                                    {tempat_kpm.name}
                                                </td>
                                            </tr>
                                            <tr className="gap-3">
                                                <td className="text-gray-600 text-end align-top pr-2">
                                                    Kuota
                                                </td>
                                                <td className="text-gray-950 font-semibold align-top">
                                                    {tempat_kpm.qouta}
                                                </td>
                                            </tr>
                                            <tr className="gap-3">
                                                <td className="text-gray-600 text-end align-top pr-2">
                                                    Jumlah Pelamar
                                                </td>
                                                <td className="text-gray-950 font-semibold align-top">
                                                    {tempat_kpm?.jumlah_pelamar}
                                                </td>
                                            </tr>

                                            <tr className="gap-3">
                                                <td className="text-gray-600 text-end align-top pr-2">
                                                    Terisi
                                                </td>
                                                <td className="text-gray-950 font-semibold align-top">
                                                    {
                                                        tempat_kpm?.accepted_pelamar_count
                                                    }
                                                </td>
                                            </tr>
                                            <tr className="gap-3">
                                                <td className="text-gray-600 text-end align-top pr-2">
                                                    Total Laki-Laki telah
                                                    diterima
                                                </td>
                                                <td className="text-gray-950 font-semibold align-top">
                                                    {tempat_kpm?.jumlah_pria}
                                                </td>
                                            </tr>
                                            <tr className="gap-3">
                                                <td className="text-gray-600 text-end align-top pr-2">
                                                    Total Perempuan telah
                                                    diterima
                                                </td>
                                                <td className="text-gray-950 font-semibold align-top">
                                                    {tempat_kpm?.jumlah_wanita}
                                                </td>
                                            </tr>
                                            <tr className="gap-3">
                                                <td className="text-gray-600 text-end align-top pr-2">
                                                    Kabupaten
                                                </td>
                                                <td className="text-gray-950 font-semibold align-top">
                                                    {
                                                        listOfRegencies.find(
                                                            (item) =>
                                                                item.kode ===
                                                                tempat_kpm.regency
                                                        )?.nama
                                                    }
                                                </td>
                                            </tr>
                                            <tr className="gap-3">
                                                <td className="text-gray-600 text-end align-top pr-2">
                                                    Kecamatan
                                                </td>
                                                <td className="text-gray-950 font-semibold align-top">
                                                    {kecamatan(
                                                        tempat_kpm.regency
                                                    ).find(
                                                        (item) =>
                                                            item.kode ===
                                                            tempat_kpm.sub_district
                                                    )?.nama || null}
                                                </td>
                                            </tr>
                                            <tr className="gap-3">
                                                <td className="text-gray-600 text-end align-top pr-2">
                                                    Desa
                                                </td>
                                                <td className="text-gray-950 font-semibold align-top">
                                                    {desa(
                                                        tempat_kpm.sub_district
                                                    ).find(
                                                        (item) =>
                                                            item.kode ===
                                                            tempat_kpm.village
                                                    )?.nama || null}
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="w-full">
                                    <table className="table-auto">
                                        <tbody>
                                            <tr>
                                                <td className="text-gray-600 align-top text-end pr-2">
                                                    Deskripsi
                                                </td>
                                                <td className="text-gray-950 font-semibold text-wrap">
                                                    {tempat_kpm?.description}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="text-gray-600 align-top text-end pr-2">
                                                    Supervisor
                                                </td>
                                                <td className="text-gray-950 font-semibold text-wrap">
                                                    {
                                                        tempat_kpm?.username_supervisor
                                                    }
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-y-3">
                                <div className="flex justify-end">
                                    <Button
                                        variant="contained"
                                        size="small"
                                        disableElevation
                                        onClick={(e) => {
                                            e.preventDefault();
                                            post("/lowongankpm/lamar");
                                        }}
                                        disabled={processing}
                                        sx={{
                                            color: "white",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        Ajukan Lamaran
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>
                    <div className="w-full max-w-none mt-4">
                        <MUIDataTable
                            title={"Mahasiswa"}
                            data={pelamar}
                            columns={columns}
                            options={options}
                        />
                    </div>
                    <div className="h-72 w-0"></div>
                </div>
            </main>
            <Footer currentTab={0} />
        </ThemeProvider>
    );
};

export default DetailLowonganKPM;
