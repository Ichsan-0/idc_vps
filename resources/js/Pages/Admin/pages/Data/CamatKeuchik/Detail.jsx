import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import { Head, Link, router } from "@inertiajs/react";
import {
    Breadcrumbs,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import { NavigateNext } from "@mui/icons-material";
import axios from "axios";
import { useState } from "react";
import { ThreeDot } from "react-loading-indicators";
import AdminLayout from "@/Layouts/Admin/AdminLayout";

const Detail = ({ data, base_url }) => {
    const [keterangan, setKeterangan] = useState(data?.keterangan);
    const [status, setStatus] = useState(data?.status || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const updateStatus = async () => {
        setError(null);
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append("status", status);
            formData.append("keterangan", keterangan);
            const response = await axios.post(
                `${base_url}/api/admin/data/camat-keuchik/update-status/${data?.id}`,
                formData
            );
            console.log(response);
            if (response?.data?.status === "success") {
                router.visit("/admin/data/camat-keuchik");
            }
        } catch (err) {
            setError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <AdminLayout className="main flex">
            <Head title={`${data?.name || "Camat & Keuchik"}`} />

            <div className="flex w-full flex-col">
                {loading && (
                    <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                        <ThreeDot color="#4F61E3" size="medium" />
                    </div>
                )}

                <div className="px-3 ">
                    <section className="flex flex-col gap-y-3">
                        <Breadcrumbs
                            label="breadcrumbs"
                            separator={<NavigateNext />}
                        >
                            <Link href="/admin/data/camat-keuchik">
                                Camat Keuchik
                            </Link>
                            <Link className="text-primary">Detail</Link>
                        </Breadcrumbs>
                        <div className="p-5 bg-white border ">
                            <table className="table-auto">
                                <tbody>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            Nama
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            {data?.name}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            Nama di Buku Rekening
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            {data?.nama_di_buku_rekening}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            Pangkat & Golongan
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            {data?.pangkat_dan_golongan}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            NIP
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            {data?.nip}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            Jabatan
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            {data?.jabatan}
                                        </td>
                                    </tr>

                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            Kecamatan
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            {data?.kecamatan}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            Desa
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            {data?.desa}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            Nama Bank
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            {data?.nama_bank}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            No Rekening
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            {data?.no_rekening}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            No NPWP
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            {data?.no_npwp}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            Dokumen
                                        </td>
                                        <td className="mr-4 text-left align-top">
                                            <a
                                                target="_blank"
                                                href={`${base_url}/storage/${data?.link_document.replace(
                                                    "public/",
                                                    ""
                                                )}`}
                                                className="px-2 bg-primary text-white py-1 rounded-md"
                                            >
                                                dokumen
                                            </a>
                                        </td>
                                    </tr>
                                    <tr className="pt-3">
                                        <td className="pr-3 text-right align-top font-semibold">
                                            Status
                                        </td>
                                        <td className="mr-4 text-left align-top pt-6">
                                            <FormControl
                                                fullWidth
                                                sx={{ width: "300px" }}
                                            >
                                                <InputLabel id="status">
                                                    Status
                                                </InputLabel>
                                                <Select
                                                    labelId="status"
                                                    id="bank-name"
                                                    value={status}
                                                    label="Status"
                                                    onChange={(e) =>
                                                        setStatus(
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <MenuItem
                                                        value={"di-review"}
                                                    >
                                                        Direview
                                                    </MenuItem>
                                                    <MenuItem
                                                        value={"diterima"}
                                                    >
                                                        Diterima
                                                    </MenuItem>
                                                    <MenuItem value={"ditolak"}>
                                                        Ditolak
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold">
                                            Keterangan
                                        </td>
                                        <td className="mr-4 text-left align-top pt-3">
                                            <TextField
                                                fullWidth
                                                value={keterangan}
                                                multiline
                                                rows={3}
                                                label="Keterangan"
                                                onChange={(e) =>
                                                    setKeterangan(
                                                        e.target.value
                                                    )
                                                }
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
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="pr-3 text-right align-top font-semibold"></td>
                                        <td className="mr-4 text-left align-top pt-3">
                                            <div>
                                                <Button
                                                    sx={{
                                                        textTransform:
                                                            "capitalize",
                                                    }}
                                                    variant="contained"
                                                    disableElevation
                                                    disabled={loading}
                                                    onClick={() =>
                                                        updateStatus()
                                                    }
                                                >
                                                    Simpan
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Detail;
