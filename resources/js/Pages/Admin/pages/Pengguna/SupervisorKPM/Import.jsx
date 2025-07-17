import React from "react";

import { Head, Link, router } from "@inertiajs/react";

import AdminLayout from "@/Layouts/Admin/AdminLayout";
import {
    Breadcrumbs,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useState } from "react";
import axios from "axios";
import { ThreeDot } from "react-loading-indicators";
import { useEffect } from "react";
import InputError from "@/Components/InputError";
import { IoCloudUploadOutline } from "react-icons/io5";
import { RiAttachment2 } from "react-icons/ri";
import styled from "@emotion/styled";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const Import = ({ base_url }) => {
    const [responseError, setResponseError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [username, setUsername] = useState(null);
    const [dokumen, setDokumen] = useState(null);
    const [error, setError] = useState(null);

    const submit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("daftarsupervisor", dokumen);

            const response = await axios.post(
                `${base_url}/api/admin/importsupervisor`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (response?.data?.success === true) {
                router.visit("/admin/users/supervisor-kpm");
            }
        } catch (err) {
            setResponseError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };
    const handleDokumenChange = (e) => {
        const file = e.target.files[0];

        if (file) {
            if (
                file.type !==
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ) {
                setError("Only .xlsx files are allowed");
                return;
            }
            if (file.size > 200 * 1024) {
                setError("Ukuran file tidak boleh melebihi 200KB");
                return;
            }

            setDokumen(file);
            setError(null);
        }
    };

    return (
        <AdminLayout className="main flex">
            <Head title="Edit Supervisor KPM" />
            {loading && (
                <div className="absolute z-10 w-screen h-screen flex items-center justify-center bg-white/70">
                    <ThreeDot color="#4F61E3" size="medium" />
                </div>
            )}
            <div className="flex w-full gap-y-3 flex-col">
                <Breadcrumbs aria-label="breadcrumb">
                    <Link
                        underline="hover"
                        color="inherit"
                        href="/admin/users/supervisor-kpm"
                    >
                        Home
                    </Link>

                    <Typography sx={{ color: "text.primary" }}>Edit</Typography>
                </Breadcrumbs>

                <div className="flex border flex-col gap-3 bg-white p-5">
                    <p>{responseError}</p>
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-y-2">
                            {dokumen && (
                                <a
                                    href="#"
                                    className="font-normal flex items-center gap-x-2 border w-full  h-10 px-3 py-1 rounded-md cursor-pointer"
                                >
                                    {dokumen.name}
                                    <RiAttachment2 className="text-lg" />
                                </a>
                            )}

                            <Button
                                variant="outlined"
                                sx={{
                                    textTransform: "capitalize",
                                    width: "100%",
                                }}
                                component="label"
                                startIcon={<IoCloudUploadOutline />}
                            >
                                Upload File
                                <VisuallyHiddenInput
                                    type="file"
                                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                    onChange={(event) =>
                                        handleDokumenChange(event)
                                    }
                                />
                            </Button>
                            {error && <InputError message={error} />}
                        </div>
                    </div>
                    <div>
                        <Button
                            sx={{ textTransform: "capitalize" }}
                            variant="contained"
                            disableElevation
                            disabled={loading}
                            onClick={() => submit()}
                        >
                            Sumbit
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Import;
