import Button from "@/Components/Button";
import LoaderOnButton from "@/Components/LoaderOnButtn";
import { config } from "@/config/config";
import {
    Autocomplete,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";

const EditLamaranPPL = ({ closeModal, idLamaran, lowonganPPL = [], onFinish }) => {
    const [formData, setFormData] = useState({
        username_mahasiswa: "",
        keterangan: "",
        status: "",
        id_lowongan_ppl: "",
    });

    const [loading, setLoading] = useState(false);
    const [validationError, setValidationError] = useState({
        username_mahasiswa: null,
        keterangan: null,
        status: null,
        id_lowongan_ppl: null,
    });

    const [responseData, setResponseData] = useState({
        message: "",
        severity: "",
        open: false,
    });

    const [selectedLowonganPPL, setSelectedLowonganPPL] = useState(null);

    const handleSave = async (e) => {
        e.preventDefault();
        if (isValid()) {
            try {
                setLoading(true);
                const payload = new FormData();
                payload.append(
                    "username_mahasiswa",
                    formData.username_mahasiswa
                );
                payload.append("id_lowongan_ppl", formData.id_lowongan_ppl);
                payload.append("keterangan", formData.keterangan);
                payload.append("status", formData.status);

                const res = await axios.post(
                    `${config.base_url}/api/admin/ppl/lowongan/mahasiswa/update/${idLamaran}?_method=PATCH`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                setResponseData({
                    message: res?.data?.message,
                    severity: "success",
                    open: true,
                });

                setTimeout(() => {
                    closeModal();
                }, 1000);

            } catch (error) {
                console.log("error", error);
                if (error.response?.status === 422) {
                    setResponseData({
                        message:
                            error.response.data.message || "Validasi gagal",
                        severity: "error",
                        open: true,
                    });
                } else if (error.response?.status === 400) {
                    setResponseData({
                        message: error.response.data.error || "Bad Request",
                        severity: "error",
                        open: true,
                    });
                } else if (error.response?.status === 404) {
                    setResponseData({
                        message: error.response?.data?.message,
                        severity: "error",
                        open: true,
                    });
                } else {
                    setResponseData({
                        message: "Terjadi kesalahan saat menyimpan data",
                        severity: "error",
                        open: true,
                    });
                }
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(()=>{

        console.log('responseData', responseData);

    }, [responseData])

    const isValid = () => {
        const errors = {
            keterangan: null,
            id_lowongan_ppl: null,
            username_mahasiswa: null,
            status: null,
        };

        if (!formData.keterangan) {
            errors.keterangan = "Keterangan wajib diisi";
        }

        if (!formData.id_lowongan_ppl) {
            errors.id_lowongan_ppl = "Lowongan PPL Wajib Diisi";
        }

        if (!formData.username_mahasiswa) {
            errors.username_mahasiswa = "Mahasiswa Wajib Diisi";
        }
        if (!formData.status) {
            errors.status = "Status Wajib Diisi";
        }

        setValidationError(errors);
        console.log("validation :", errors);

        const hasError = Object.values(errors).some((value) => value !== null);

        return !hasError;
    };

    useEffect(() => {
        onFinish(responseData);
    }, [responseData]);

    const getData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.base_url}/api/admin/ppl/lowongan/mahasiswa/detail?x=${idLamaran}`
            );
            const dt = response?.data?.data;
            setFormData(dt);
            setSelectedLowonganPPL(lowonganPPL.find((item) => item.id === dt.id_lowongan_ppl));
        } catch (e) {
            setLoading(false);
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
            <div className="px-2 pr-14">
                <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                    Edit Lamaran
                </h4>
            </div>
            <form className="flex flex-col" onSubmit={handleSave}>
                <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                    <div className="mt-7">
                        <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                            Informasi Lamaran {idLamaran}
                        </h5>
                        <div className="mt-2 mb-5 font-normal">
                            <p className="text-md">{formData?.nama_mahasiswa}</p>
                            <p className="text-md">{formData?.username_mahasiswa}</p>
                        </div>
                        {loading ? (
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                <Skeleton className="h-[55px]" />
                                <Skeleton className="h-[55px]" />
                                <Skeleton className="h-[55px]" />
                                <Skeleton className="h-[55px]" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                
                                <div className="flex flex-col w-full">
                                    <Autocomplete
                                        id="lowongan-ppl"
                                        name="lowongan-ppl"
                                        sx={{ width: "100%" }}
                                        value={selectedLowonganPPL}
                                        options={lowonganPPL}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(e, value) => {
                                            setSelectedLowonganPPL(value);
                                            setFormData({
                                                ...formData,
                                                id_lowongan_ppl: value.id,
                                            });
                                            setValidationError({
                                                ...validationError,
                                                id_lowongan_ppl: null,
                                            });
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Lowongan PPL"
                                                sx={{
                                                    "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                    "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                }}
                                            />
                                        )}
                                    ></Autocomplete>
                                    {validationError.id_lowongan_ppl && (
                                        <InputError
                                            message={
                                                validationError.id_lowongan_ppl
                                            }
                                        />
                                    )}
                                </div>

                                <div className="flex flex-col w-full">
                                    <TextField
                                        id="keterangan"
                                        name="keterangan"
                                        value={formData.keterangan}
                                        label="Keterangan"
                                        placeholder="Keterangan"
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                keterangan: e.target.value,
                                            });
                                            setValidationError({
                                                ...validationError,
                                                keterangan: null,
                                            });
                                        }}
                                        multiline
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
                                    ></TextField>
                                    {validationError.keterangan && (
                                        <InputError
                                            message={validationError.keterangan}
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col w-full">
                                    <FormControl fullWidth>
                                        <InputLabel id="status">
                                            Status
                                        </InputLabel>
                                        <Select
                                            labelId="status"
                                            id="status"
                                            value={formData.status}
                                            label="Status"
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    status: e.target.value,
                                                });
                                                setValidationError({
                                                    ...validationError,
                                                    status: null,
                                                });
                                            }}
                                        >
                                            <MenuItem value={"submitted"}>
                                                Direview
                                            </MenuItem>
                                            <MenuItem value={"accepted"}>
                                                Diterima
                                            </MenuItem>
                                            <MenuItem value={"rejected"}>
                                                Ditolak
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                    {validationError.status && (
                                        <InputError
                                            message={validationError.status}
                                        />
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                    <Button size="sm" variant="outline" onClick={closeModal}>
                        Close
                    </Button>
                    <Button
                        disabled={loading}
                        className="relative"
                        size="sm"
                        type="submit"
                    >
                        {loading ? <LoaderOnButton /> : "Save Changes"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default EditLamaranPPL;

const Skeleton = ({ className = "" }) => (
    <div
        className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
    ></div>
);
