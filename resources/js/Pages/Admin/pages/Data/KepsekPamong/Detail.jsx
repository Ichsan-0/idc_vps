import React from "react";
import {
    Alert,
    AlertTitle,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Paper,
    Box,
    Stack,
    Divider,
    IconButton
} from "@mui/material";
import { NavigateNext, Download, Description, Save } from "@mui/icons-material";
import { useState } from "react";
import axios from "axios";
import { ThreeDot } from "react-loading-indicators";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import { Head, Link, router } from "@inertiajs/react";

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
                `${base_url}/api/admin/data/kepsek-pamong/update-status/${data?.id}`,
                formData
            );
            if (response?.data?.status === "success") {
                router.visit("/admin/data/kepsek-pamong");
            }
        } catch (err) {
            setError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadCertificate = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                "/api/certificate/teacher/download",
                {
                    id: data?.id,
                },
                {
                    responseType: "blob",
                }
            );

            const blob = new Blob([response.data], {
                type: "application/pdf",
            });

            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            let filename = "";

            const contentDisposition = response.headers["content-disposition"];
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?([^"]+)"?/);
                if (match) {
                    filename = match[1];
                }
            }

            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fieldGroups = [
        {
            title: "Informasi Pribadi",
            fields: [
                { label: "Nama", value: data?.name },
                { label: "Nama di Buku Rekening", value: data?.nama_di_buku_rekening },
                { label: "Pangkat & Golongan", value: data?.pangkat_dan_golongan },
                { label: "NIP", value: data?.nip },
                { label: "Jabatan", value: data?.jabatan },
            ]
        },
        {
            title: "Informasi Sekolah & Keuangan",
            fields: [
                { label: "Nama Sekolah", value: data?.nama_sekolah },
                { label: "Nama Bank", value: data?.nama_bank },
                { label: "No Rekening", value: data?.no_rekening },
                { label: "No NPWP", value: data?.no_npwp },
            ]
        }
    ];

    return (
        <AdminLayout>
            <Head title={`Detail - ${data?.name || "Kepsek & Pamong"}`} />

            <Box sx={{ position: "relative" }}>
                {loading && (
                    <Box
                        sx={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            zIndex: 9999,
                        }}
                    >
                        <ThreeDot color="#4F61E3" size="medium" />
                    </Box>
                )}

                <Box sx={{ p: 3 }}>
                    {/* Breadcrumb */}
                    <Box sx={{ mb: 3 }}>
                        <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                            <Link
                                href="/admin/data/kepsek-pamong"
                                style={{ textDecoration: "none", color: "inherit" }}
                            >
                                <Typography color="textSecondary">Kepsek Pamong</Typography>
                            </Link>
                            <Typography color="textPrimary" fontWeight="medium">
                                Detail
                            </Typography>
                            <Typography color="textPrimary" fontWeight="medium">
                                {data?.name}
                            </Typography>
                        </Breadcrumbs>
                    </Box>

                    {/* Page Title */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" fontWeight="bold">
                            Detail Kepala Sekolah / Pamong
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Informasi lengkap dan pengelolaan data
                        </Typography>
                    </Box>

                    {/* Error Alert */}
                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            <AlertTitle>Error</AlertTitle>
                            {error}
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        {/* Left Column - Data Display */}
                        <Grid item xs={12} md={8}>
                            <Card elevation={1}>
                                <CardContent>
                                    <Box sx={{ mb: 3 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                                            Data Individu
                                        </Typography>
                                        <Divider sx={{ mb: 3 }} />
                                    </Box>

                                    {fieldGroups.map((group, groupIndex) => (
                                        <Box key={groupIndex} sx={{ mb: 4 }}>
                                            <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                                                {group.title}
                                            </Typography>
                                            <Grid container spacing={2}>
                                                {group.fields.map((field, index) => (
                                                    <Grid item xs={12} sm={6} key={index}>
                                                        <Box sx={{ mb: 2 }}>
                                                            <Typography variant="caption" color="textSecondary" display="block">
                                                                {field.label}
                                                            </Typography>
                                                            <Typography variant="body1" fontWeight="medium">
                                                                {field.value || "-"}
                                                            </Typography>
                                                        </Box>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        </Box>
                                    ))}

                                    {/* Dokumen Section */}
                                    <Box sx={{ mt: 4 }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="primary" gutterBottom>
                                            Dokumen & Sertifikat
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Stack direction="row" spacing={2}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<Description />}
                                                href={`${base_url}/storage/${data?.link_document?.replace("public/", "")}`}
                                                target="_blank"
                                                sx={{ textTransform: "capitalize" }}
                                            >
                                                Lihat Dokumen
                                            </Button>
                                            {/* <Button
                                                variant="contained"
                                                startIcon={<Download />}
                                                onClick={downloadCertificate}
                                                sx={{ textTransform: "capitalize" }}
                                            >
                                                Cetak Sertifikat
                                            </Button> */}
                                        </Stack>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Right Column - Action Panel */}
                        <Grid item xs={12} md={4}>
                            <Card elevation={1}>
                                <CardContent>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                                        Verifikasi & Status
                                    </Typography>
                                    <Divider sx={{ mb: 3 }} />

                                    <Stack spacing={3}>
                                        <FormControl fullWidth>
                                            <InputLabel id="status-label">Status</InputLabel>
                                            <Select
                                                labelId="status-label"
                                                value={status}
                                                label="Status"
                                                onChange={(e) => setStatus(e.target.value)}
                                                size="small"
                                            >
                                                <MenuItem value={"di-review"}>Direview</MenuItem>
                                                <MenuItem value={"diterima"}>Diterima</MenuItem>
                                                <MenuItem value={"ditolak"}>Ditolak</MenuItem>
                                            </Select>
                                        </FormControl>

                                        <TextField
                                            fullWidth
                                            label="Keterangan"
                                            multiline
                                            rows={4}
                                            value={keterangan}
                                            onChange={(e) => setKeterangan(e.target.value)}
                                            size="small"
                                        />

                                        <Button
                                            variant="contained"
                                            startIcon={<Save />}
                                            onClick={updateStatus}
                                            disabled={loading}
                                            sx={{
                                                textTransform: "capitalize",
                                                py: 1.5,
                                                fontWeight: "bold"
                                            }}
                                            fullWidth
                                        >
                                            Simpan Perubahan
                                        </Button>
                                    </Stack>

                                    {/* Current Status Badge */}
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            mt: 4,
                                            p: 2,
                                            bgcolor: status === "diterima" ? "success.light" :
                                                    status === "ditolak" ? "error.light" :
                                                    "warning.light",
                                            borderRadius: 1
                                        }}
                                    >
                                        <Typography variant="caption" display="block" color="textSecondary">
                                            Status Saat Ini
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {status === "diterima" ? "Diterima" :
                                             status === "ditolak" ? "Ditolak" :
                                             "Dalam Review"}
                                        </Typography>
                                    </Paper>
                                </CardContent>
                            </Card>

                            {/* Back Button */}
                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                                onClick={() => router.visit("/admin/data/kepsek-pamong")}
                            >
                                Kembali ke Daftar
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>
        </AdminLayout>
    );
};

export default Detail;