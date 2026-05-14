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

const EditLowonganPPL = ({ closeModal, idLowongan, prodi = [], onFinish }) => {
    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({
        keterangan: "",
        id_sekolah: "",
        id_prodi: "",
        name: "",
        quota: "",
    });

    const [loading, setLoading] = useState(false);
    const [selectedProdi, setSelectedProdi] = useState(null);
    const [validationError, setValidationError] = useState({
        keterangan: null,
        id_prodi: null,
        name: null,
        quota: null,
    });

    const [responseData, setResponseData] = useState({
        message: "",
        severity: "",
        open: true,
    });

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = new FormData();
            payload.append("keterangan", formData.keterangan);
            payload.append("id_prodi", formData.id_prodi);
            payload.append("name", formData.name);
            payload.append("quota", formData.quota);

            const res = await axios.post(
                `${config.base_url}/api/admin/ppl/lowongan/update/${idLowongan}?_method=PATCH`,
                payload,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setLoading(false);
            setResponseData({
                message: res?.data?.message,
                severity: "success",
                open: true,
            });

            await getData();
            closeModal();
        } catch (error) {
            if (error.response?.status === 422) {
                setResponseData({
                    message: error.response.data.message || "Validasi gagal",
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
                console.log('tidak ditemukan ', error);
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
    };

    useEffect(() => {
        onFinish(responseData);
    }, [responseData]);

    const getData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.base_url}/api/admin/ppl/lowongan/detail?x=${idLowongan}`
            );
            const dt = response?.data?.data
            setFormData({...dt, keterangan:dt?.description});
            setSelectedProdi(prodi.find((itm)=> itm.id === dt.id_prodi));

            
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
                            Informasi Lamaran {idLowongan}
                        </h5>
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
                                    <TextField
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        label="Nama"
                                        placeholder="nama"
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                name: e.target.value,
                                            });
                                            setValidationError({
                                                ...validationError,
                                                name: null,
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
                                    {validationError.name && (
                                        <InputError
                                            message={validationError.name}
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col w-full">
                                    <Autocomplete
                                        id="prodi"
                                        name="prodi"
                                        sx={{ width: "100%" }}
                                        value={selectedProdi}
                                        options={prodi}
                                        getOptionLabel={(option) => option.name}
                                        onChange={(e, value) => {
                                            setSelectedProdi(value);
                                            setFormData({
                                                ...formData,
                                                id_prodi: value.id,
                                            });
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Prodi"
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
                                    {validationError.id_prodi && (
                                        <InputError
                                            message={validationError.id_prodi}
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
                                    <TextField
                                        id="quota"
                                        name="quota"
                                        value={formData.quota}
                                        label="Quota"
                                        type="number"
                                        placeholder="Female Quota"
                                        onChange={(e) => {
                                            setFormData({
                                                ...formData,
                                                quota: e.target.value,
                                            });
                                            setValidationError({
                                                ...validationError,
                                                quota: null,
                                            });
                                        }}
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
                                    {validationError.quota && (
                                        <InputError
                                            message={validationError.quota}
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

export default EditLowonganPPL;

const Skeleton = ({ className = "" }) => (
    <div
        className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`}
    ></div>
);
