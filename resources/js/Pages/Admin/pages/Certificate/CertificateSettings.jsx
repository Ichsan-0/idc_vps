import React from "react";

import { Head } from "@inertiajs/react";
import {
    Alert,
    Button,
    FormControlLabel,
    Snackbar,
    Switch,
    TextField,
} from "@mui/material";
import { useState } from "react";
import { useEffect } from "react";

import AdminLayout from "@/Layouts/Admin/AdminLayout";
import { ThreeDot } from "react-loading-indicators";

const CertificateSettings = ({}) => {
    const [notify, setNotify] = useState(false);
    const [notifyStatus, setNotifyStatus] = useState("default");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [kodeUniv, setKodeUniv] = useState(null);
    const [kodeIDC, setKodeIDC] = useState(null);
    const [kodeJenisSurat, setKodeJenisSurat] = useState(null);
    const [bulanTahun, setBulanTahun] = useState(null);
    const [openPrintCertificate, setOpenPrintCertificate] = useState(false);
    const [notifMsg, setNotifMsg] = useState(null);
    const [baseNumber, setBaseNumber] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `/api/admin/certificate/setting`,
                {}
            );
            console.log("certificate setting: ", response);
            const settingData = response.data?.data?.settings;
            if (settingData) {
                setKodeUniv(settingData?.kode_universitas);
                setKodeIDC(settingData?.kode_idc);
                setKodeJenisSurat(settingData?.kode_jenis_surat);
                setBulanTahun(settingData?.bulan_tahun);
                setOpenPrintCertificate(settingData.open_print_certificate);
                setBaseNumber(settingData?.base_number);
            }
        } catch (err) {
            setError(err.message || "Something went wrong.");
            console.log("error : ", err);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        setLoading(true);
        setError(null);
        setNotifMsg(null);

        try {
            const formData = new FormData();
            formData.append("kode_universitas", kodeUniv);
            formData.append("kode_idc", kodeIDC);
            formData.append("kode_jenis_surat", kodeJenisSurat);
            formData.append("bulan_tahun", bulanTahun);
            formData.append("open_print_certificate", openPrintCertificate ? 1 : 0);
            formData.append('base_number', baseNumber);
            const response = await axios.post(
                `/api/admin/certificate/setting`,
                formData
            );
        } catch (err) {
            setError(err.message || "Something went wrong.");
            setNotifMsg(err.message);
            setNotifyStatus("error");
        } finally {
            setLoading(false);
            fetchData();
            setNotifMsg("Berhasil menyimpan setting");
            setNotifyStatus("success");
        }
    };

    const onDialogClose = () => {
        setOpenDialog(false);
        setIdObjToDelete(null);
    };

    const handleConfirmClick = (e) => {
        console.log(e);
        exportExcel(e);

        onDialogClose();
    };

    useEffect(() => {
        if (notifMsg) {
            setNotify(true);
        }
        setNotify(true);
    }, [notifMsg]);

    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };

    const handleBaseNumberChange = (e) => {
        setBaseNumber(e.target.value);
    };

    const handleKodeUnivChange = (e) => {
        setKodeUniv(e.target.value);
    };

    const handleKodeIDCChange = (e) => {
        setKodeIDC(e.target.value);
    };
    const handleKodeJenisSuratChange = (e) => {
        setKodeJenisSurat(e.target.value);
    };

    const handleMonthYearChange = (e) => {
        setBulanTahun(e.target.value);
    };

    const handleOpenPrintCertificate = (e) => {
        setOpenPrintCertificate(e.target.checked);
    };

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <AdminLayout className="main flex">
            <Head title="Nilai PPL" />
            <div className="flex w-full flex-col">
                <div className="px-3"></div>
                {loading && (
                    <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                        <ThreeDot color="#4F61E3" size="medium" />
                    </div>
                )}

                <div className="flex flex-col px-3 gap-y-3">
                    {error && <Alert severity="error">{error}</Alert>}
                    <div className="flex flex-col bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 w-full rounded-md  gap-3 p-5">
                            <div>
                                <TextField
                                    fullWidth
                                    value={baseNumber}
                                    label="Base Number"
                                    onChange={(e) => handleBaseNumberChange(e)}
                                    sx={{
                                        "& .MuiOutlinedInput-root.Mui-focused":
                                            {
                                                outline: "none",
                                                boxShadow: "none",
                                            },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                />
                            </div>
                            <div>
                                <TextField
                                    fullWidth
                                    value={kodeUniv}
                                    label="Kode Universitas"
                                    onChange={(e) => handleKodeUnivChange(e)}
                                    sx={{
                                        "& .MuiOutlinedInput-root.Mui-focused":
                                            {
                                                outline: "none",
                                                boxShadow: "none",
                                            },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                />
                            </div>
                            <div>
                                <TextField
                                    fullWidth
                                    value={kodeIDC}
                                    label="Kode IDC"
                                    onChange={(e) => handleKodeIDCChange(e)}
                                    sx={{
                                        "& .MuiOutlinedInput-root.Mui-focused":
                                            {
                                                outline: "none",
                                                boxShadow: "none",
                                            },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                />
                            </div>
                            <div>
                                <TextField
                                    fullWidth
                                    value={kodeJenisSurat}
                                    label="Kode Jenis Surat"
                                    onChange={(e) =>
                                        handleKodeJenisSuratChange(e)
                                    }
                                    sx={{
                                        "& .MuiOutlinedInput-root.Mui-focused":
                                            {
                                                outline: "none",
                                                boxShadow: "none",
                                            },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                />
                            </div>
                            <div>
                                <TextField
                                    fullWidth
                                    value={bulanTahun}
                                    label="Bulan & Tahun"
                                    onChange={(e) => handleMonthYearChange(e)}
                                    sx={{
                                        "& .MuiOutlinedInput-root.Mui-focused":
                                            {
                                                outline: "none",
                                                boxShadow: "none",
                                            },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                />
                            </div>
                            <div>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={openPrintCertificate}
                                            onChange={(e) =>
                                                handleOpenPrintCertificate(e)
                                            }
                                        />
                                    }
                                    label="Buka Cetak Sertifikat"
                                />
                            </div>
                        </div>
                        <div className="p-3">
                            <Button
                                sx={{ textTransform: "capitalize" }}
                                disableElevation
                                onClick={() => saveSettings()}
                                variant="contained"
                            >
                                Simpan
                            </Button>
                        </div>
                    </div>
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
                    {notifMsg && notifMsg}
                </Alert>
            </Snackbar>
        </AdminLayout>
    );
};

export default CertificateSettings;
