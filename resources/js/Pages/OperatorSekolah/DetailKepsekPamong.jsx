import OperatorSekolahLayout from "@/Layouts/OperatorSekolahLayout";
import { Head, Link } from "@inertiajs/react";
import { NavigateNext, Download } from "@mui/icons-material";
import { 
    Breadcrumbs, 
    Button,
    Paper,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    Divider,
    Chip
} from "@mui/material";
import axios from "axios";
import React, { useState } from "react";
import { ThreeDot } from "react-loading-indicators";

function DetailKepsekPamong({ data, base_url }) {
    const [loading, setLoading] = useState(false);
    const [certificateLoading, setCertificateLoading] = useState(false);
    const [responseError, setResponseError] = useState(null);

    const downloadCertificate = async () => {
        try {
            setCertificateLoading(true);
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
            let filename = "sertifikat.pdf";

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
            console.error("Download error:", err);
            setResponseError("Gagal mengunduh sertifikat");
        } finally {
            setCertificateLoading(false);
        }
    };

    return (
        <OperatorSekolahLayout>
            <Head title={`Detail ${data?.name || "Kepsek/Pamong"}`} />
            
            <section className="flex flex-col gap-6">
                {/* Breadcrumbs */}
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link 
                        href="/operator-sekolah/data/kepsek-pamong" 
                        className="text-gray-600 hover:text-primary transition-colors"
                    >
                        Kepsek Pamong
                    </Link>
                    <Typography color="text.primary" className="font-medium">
                        Detail {data?.name}
                    </Typography>
                </Breadcrumbs>

                {/* Loading Overlay */}
                {loading && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
                        <ThreeDot color="#4F61E3" size="medium" />
                    </div>
                )}

                {/* Header Section */}
                <Box sx={{ mb: 4 }}>
                    <Paper
                        elevation={0}
                        variant="outlined"
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            background: "#ffffff",
                            borderColor: "divider",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                flexWrap: "wrap",
                                gap: 2,
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="h4"
                                    gutterBottom
                                    sx={{ 
                                        fontWeight: 700,
                                        color: "text.primary"
                                    }}
                                >
                                    Detail {data?.jabatan === "kepsek" ? "Kepala Sekolah" : "Guru Pamong"}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ 
                                        opacity: 0.9, 
                                        maxWidth: "600px",
                                        color: "text.secondary"
                                    }}
                                >
                                    Informasi lengkap tentang {data?.jabatan === "kepsek" ? "kepala sekolah" : "guru pamong"} di sekolah Anda.
                                </Typography>
                            </Box>
                            <Chip 
                                label={data?.jabatan === "kepsek" ? "Kepala Sekolah" : "Guru Pamong"}
                                color={data?.jabatan === "kepsek" ? "primary" : "secondary"}
                                sx={{ 
                                    fontWeight: 600,
                                    px: 1,
                                    height: 32
                                }}
                            />
                        </Box>
                    </Paper>
                </Box>

                {/* Main Content */}
                <Grid container spacing={3}>
                    {/* Left Column - Data Pribadi */}
                    <Grid item xs={12} md={8}>
                        <Paper
                            elevation={0}
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: "100%",
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ 
                                    fontWeight: 600,
                                    mb: 3,
                                    color: "text.primary"
                                }}
                            >
                                Data Pribadi
                            </Typography>

                            <Grid container spacing={3}>
                                {/* Nama */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                color: "text.secondary",
                                                mb: 0.5,
                                                fontWeight: 500
                                            }}
                                        >
                                            Nama Lengkap
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {data?.name || "-"}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Nama di Buku Rekening */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                color: "text.secondary",
                                                mb: 0.5,
                                                fontWeight: 500
                                            }}
                                        >
                                            Nama di Buku Rekening
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {data?.nama_di_buku_rekening || "-"}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* NIP */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                color: "text.secondary",
                                                mb: 0.5,
                                                fontWeight: 500
                                            }}
                                        >
                                            NIP
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {data?.nip || "-"}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Pangkat & Golongan */}
                                <Grid item xs={12} md={6}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                color: "text.secondary",
                                                mb: 0.5,
                                                fontWeight: 500
                                            }}
                                        >
                                            Pangkat & Golongan
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {data?.pangkat_dan_golongan || "-"}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Nama Sekolah */}
                                <Grid item xs={12}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                color: "text.secondary",
                                                mb: 0.5,
                                                fontWeight: 500
                                            }}
                                        >
                                            Nama Sekolah
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {data?.nama_sekolah || "-"}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Right Column - Data Keuangan */}
                    <Grid item xs={12} md={4}>
                        <Paper
                            elevation={0}
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                height: "100%",
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ 
                                    fontWeight: 600,
                                    mb: 3,
                                    color: "text.primary"
                                }}
                            >
                                Data Keuangan
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Nama Bank */}
                                <Grid item xs={12}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                color: "text.secondary",
                                                mb: 0.5,
                                                fontWeight: 500
                                            }}
                                        >
                                            Nama Bank
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {data?.nama_bank || "-"}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* No Rekening */}
                                <Grid item xs={12}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                color: "text.secondary",
                                                mb: 0.5,
                                                fontWeight: 500
                                            }}
                                        >
                                            No Rekening
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {data?.no_rekening || "-"}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* No NPWP */}
                                <Grid item xs={12}>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                color: "text.secondary",
                                                mb: 0.5,
                                                fontWeight: 500
                                            }}
                                        >
                                            No NPWP
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {data?.no_npwp || "-"}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Dokumen Section */}
                    <Grid item xs={12}>
                        <Paper
                            elevation={0}
                            variant="outlined"
                            sx={{
                                p: 3,
                                borderRadius: 3,
                            }}
                        >
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ 
                                    fontWeight: 600,
                                    mb: 3,
                                    color: "text.primary"
                                }}
                            >
                                Dokumen & Sertifikat
                            </Typography>

                            <Grid container spacing={3} alignItems="center">
                                {/* Dokumen */}
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                color: "text.secondary",
                                                mb: 1,
                                                fontWeight: 500
                                            }}
                                        >
                                            Dokumen Pendukung
                                        </Typography>
                                        {data?.link_document ? (
                                            <Button
                                                component="a"
                                                href={`${base_url}/storage/${data.link_document.replace("public/", "")}`}
                                                target="_blank"
                                                variant="outlined"
                                                color="primary"
                                                startIcon={<Download />}
                                                sx={{ 
                                                    textTransform: "none",
                                                    fontWeight: 500
                                                }}
                                            >
                                                Lihat Dokumen
                                            </Button>
                                        ) : (
                                            <Typography
                                                variant="body2"
                                                sx={{ 
                                                    color: "text.disabled",
                                                    fontStyle: "italic"
                                                }}
                                            >
                                                Tidak ada dokumen
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>

                                {/* Sertifikat */}
                                <Grid item xs={12} md={6}>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{ 
                                                color: "text.secondary",
                                                mb: 1,
                                                fontWeight: 500
                                            }}
                                        >
                                            Sertifikat
                                        </Typography>
                                        <Button
                                            onClick={downloadCertificate}
                                            variant="contained"
                                            color="primary"
                                            startIcon={<Download />}
                                            disabled={certificateLoading}
                                            sx={{ 
                                                textTransform: "none",
                                                fontWeight: 500
                                            }}
                                        >
                                            {certificateLoading ? "Mengunduh..." : "Unduh Sertifikat"}
                                        </Button>
                                        {responseError && (
                                            <Typography
                                                variant="caption"
                                                color="error"
                                                sx={{ mt: 1, display: "block" }}
                                            >
                                                {responseError}
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Action Buttons */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                        mt: 3,
                    }}
                >
                    <Button
                        component={Link}
                        href="/operator-sekolah/data/kepsek-pamong"
                        variant="outlined"
                        sx={{ textTransform: "none" }}
                    >
                        Kembali
                    </Button>
                    
                </Box>
            </section>
        </OperatorSekolahLayout>
    );
}

export default DetailKepsekPamong;