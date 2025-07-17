import React from "react";

import { Head, Link, router } from "@inertiajs/react";
import dayjs, { Dayjs } from "dayjs";

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

const Edit = ({ daftarprodi, flash, message, base_url, id }) => {
    const [tenggat, setTenggat] = useState(null);
    const [title, setTitle] = useState(null);
    const [tipe, setTipe] = useState("");
    const [responseError, setResponseError] = useState(null);
    const [loading, setLoading] = useState(null);

    const updateTask = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("name", title);
            formData.append("tenggat", tenggat);
            formData.append("tipe", tipe);

            const response = await axios.post(
                `${base_url}/api/student/classroom/task/${id}`,
                formData
            );

            if (response?.data?.success === true) {
                router.visit("/admin/classroom-kpm/tugas");
            }
        } catch (err) {
            setResponseError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${base_url}/api/admin/classroom-kpm/task/${id}`
            );

            if (response?.data?.success === true) {
                setTitle(response?.data?.data?.name);
                setTipe(response?.data?.data?.tipe);
                setTenggat(dayjs(response.data?.data?.tenggat));
            }
        } catch (err) {
            setResponseError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);
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
                        href="/admin/classroom-kpm/tugas"
                    >
                        Tugas
                    </Link>

                    <Typography sx={{ color: "text.primary" }}>Edit</Typography>
                </Breadcrumbs>

                <div className="flex border flex-col gap-3 bg-white p-5">
                    <div className="flex flex-col gap-3">
                        <TextField
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
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
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                label="Tenggat"
                                value={tenggat}
                                onChange={(value) => {
                                    setTenggat(value);
                                    console.log(value);
                                    // setPayload({ ...payload, booking_date: value });
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root.Mui-focused": {
                                        outline: "none",
                                        boxShadow: "none",
                                    },
                                    "& .MuiInputBase-input:focus": {
                                        outline: "none",
                                        boxShadow: "none",
                                    },
                                }}
                            />
                        </LocalizationProvider>
                        <FormControl fullWidth>
                            <InputLabel id="tipe-tugas">Tipe</InputLabel>
                            <Select
                                labelId="tipe-tugas"
                                id="bank-tugas"
                                value={tipe}
                                onChange={(e) => setTipe(e.target.value)}
                            >
                                <MenuItem value={"Link"}>Link</MenuItem>
                                <MenuItem value={"File"}>File</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                    <div>
                        <Button
                            sx={{ textTransform: "capitalize" }}
                            variant="contained"
                            disableElevation
                            disabled={loading}
                            onClick={() => updateTask()}
                        >
                            Sumbit
                        </Button>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Edit;
