import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import { Head, Link, router, useForm } from "@inertiajs/react";
import {
    Alert,
    Button,
    IconButton,
    Snackbar,
    Switch,
    TextField,
} from "@mui/material";

import { useState } from "react";
import { useEffect } from "react";
import Modal from "@/Components/Modal";

const Setting = ({ flash, settings }) => {
    const [notify, setNotify] = useState(flash.message !== null ? true : false);
    const [notifyStatus, setNotifyStatus] = useState("default");
    const [openPendaftaran, setOpenPendaftaran] = useState(
        settings.buka_pendaftaran
    );
    const [openLamaranKPM, setOpenLamranKPM] = useState(
        settings.buka_lamaran_kpm
    );
    const [openLamaranPPL, setOpenLamaranPPL] = useState(
        settings.buka_lamaran_ppl
    );
    const [openBiodata, setOpenBiodata] = useState(
        settings.buka_lengkapi_profil
    );
    const [linkGrup, setLinkGrup] = useState(settings.link_grup);

    const { data, setData, post, processing } = useForm({
        buka_pendaftaran: openPendaftaran,
        buka_lengkapi_profil: openBiodata,
        buka_lamaran_kpm: openLamaranKPM,
        buka_lamaran_ppl: openLamaranPPL,
        link_grup: linkGrup,
    });

    useEffect(() => {
        if (flash.message) {
            console.log("notify");
            if (flash.message.success) {
                setNotifyStatus("success");
            } else {
                setNotifyStatus("error");
            }
        }
        setNotify(true);
    }, [flash.message]);

    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={1} />
                <Head title="Setting" />
            </div>
            <div className="flex w-full ml-72 flex-col">
                <Header></Header>

                <div className="space"></div>
                <div className="px-3 bg-white rounded-md mx-3 shadow-md my-3 py-3">
                    <h1 className="mt-3 font-bold text-lg">Settings</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 p-4 ">
                        <table className="table-auto">
                            <tbody>
                                <tr className="gap-3">
                                    <td className="text-gray-600 text-end align-middle pr-2">
                                        Buka Pendaftaran
                                    </td>
                                    <td className="text-gray-950 font-semibold align-top">
                                        <Switch
                                            checked={openPendaftaran}
                                            onChange={(e) => {
                                                setData(
                                                    "buka_pendaftaran",
                                                    !openPendaftaran
                                                );
                                                setOpenPendaftaran(
                                                    !openPendaftaran
                                                );
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr className="gap-3">
                                    <td className="text-gray-600 text-end align-middle pr-2">
                                        Terima Biodata
                                    </td>
                                    <td className="text-gray-950 font-semibold align-top">
                                        <Switch
                                            checked={openBiodata}
                                            onChange={(e) => {
                                                setData(
                                                    "buka_lengkapi_profil",
                                                    !openBiodata
                                                );
                                                setOpenBiodata(!openBiodata);
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr className="gap-3">
                                    <td className="text-gray-600 text-end align-middle pr-2">
                                        Buka Lamaran PPL
                                    </td>
                                    <td className="text-gray-950 font-semibold align-top">
                                        <Switch
                                            checked={openLamaranPPL}
                                            onChange={(e) => {
                                                setData(
                                                    "buka_lamaran_ppl",
                                                    !openLamaranPPL
                                                );
                                                setOpenLamaranPPL(
                                                    !openLamaranPPL
                                                );
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr className="gap-3">
                                    <td className="text-gray-600 text-end align-middle pr-2">
                                        Buka Lamaran KPM
                                    </td>
                                    <td className="text-gray-950 font-semibold align-top">
                                        <Switch
                                            checked={openLamaranKPM}
                                            onChange={(e) => {
                                                setData(
                                                    "buka_lamaran_kpm",
                                                    !openLamaranKPM
                                                );
                                                setOpenLamranKPM(
                                                    !openLamaranKPM
                                                );
                                            }}
                                        />
                                    </td>
                                </tr>
                                <tr className="gap-3">
                                    <td className="text-gray-600 text-end align-middle pr-2">
                                        Link Grup WhatsApp
                                    </td>
                                    <td className="text-gray-950 font-semibold align-top">
                                        <TextField
                                            label="Link Grup"
                                            fullWidth
                                            value={linkGrup}
                                            onChange={(e) => {
                                                setData(
                                                    "link_grup",
                                                    e.target.value
                                                );
                                                setLinkGrup(e.target.value);
                                            }}
                                        />
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <Button
                        disableElevation
                        size="small"
                        variant="contained"
                        disabled={processing}
                        onClick={(e) => {
                            post("/admin/settings/update");
                        }}
                    >
                        Simpan
                    </Button>
                </div>
            </div>
            <Snackbar
                open={notify}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                autoHideDuration={2000}
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
        </section>
    );
};

export default Setting;
