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

const Add = ({ daftarprodi, flash, message, base_url }) => {
    const [responseError, setResponseError] = useState(null);
    const [loading, setLoading] = useState(null);
    const [name, setName] = useState(null);
    const [email, setEmail] = useState(null);
    const [password, setPassword] = useState(null);
    const [username, setUsername] = useState(null);

    const submit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", name);
            formData.append("email", email);
            formData.append("password", password);
            formData.append("username", username);
            formData.append("role", "supervisor_kpm");

            const response = await axios.post(
                `${base_url}/api/admin/daftarsupervisor`,
                formData
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
    return (
        <AdminLayout className="main flex">
            <Head title="Add tugas" />
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

                    <Typography sx={{ color: "text.primary" }}>Add</Typography>
                </Breadcrumbs>

                <div className="flex border flex-col gap-3 bg-white p-5">
                    <div className="flex flex-col gap-3">
                        <TextField
                            label="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                width: "100%",
                            }}
                        ></TextField>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                width: "100%",
                            }}
                        ></TextField>
                        <TextField
                            label="Username"
                            type="email"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                width: "100%",
                            }}
                        ></TextField>
                        <TextField
                            label="Password"
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                                width: "100%",
                            }}
                        ></TextField>
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

export default Add;
