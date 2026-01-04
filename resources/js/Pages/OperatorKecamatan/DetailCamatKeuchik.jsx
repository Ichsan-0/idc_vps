import OperatorKecamatanLayout from "@/Layouts/OperatorKecamatanLayout";
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
import React from "react";

function DetailCamatKeuchik({ data, base_url }) {
    return (
        <OperatorKecamatanLayout>
            <Head title={`Detail ${data?.name || "Camat/Keuchik"}`} />
            
            <section className="flex flex-col gap-6">
                {/* Breadcrumbs */}
                <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                    <Link 
                        href="/operator-kecamatan/data/camat-keuchik" 
                        className="text-gray-600 hover:text-primary transition-colors"
                    >
                        Camat & Keuchik
                    </Link>
                    <Typography color="text.primary" className="font-medium">
                        Detail {data?.name}
                    </Typography>
                </Breadcrumbs>

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
                                    Detail {data?.jabatan === "camat" ? "Camat" : "Keuchik"}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    sx={{ 
                                        opacity: 0.9, 
                                        maxWidth: "600px",
                                        color: "text.secondary"
                                    }}
                                >
                                    Informasi lengkap tentang {data?.jabatan === "camat" ? "Camat" : "Keuchik"} di wilayah {data?.kecamatan || ""}.
                                </Typography>
                            </Box>
                            <Chip 
                                label={data?.jabatan === "camat" ? "Camat" : "Keuchik"}
                                color={data?.jabatan === "camat" ? "primary" : "secondary"}
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

                                {/* Jabatan */}
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
                                            Jabatan
                                        </Typography>
                                        <Chip
                                            label={data?.jabatan === "camat" ? "Camat" : "Keuchik"}
                                            color={data?.jabatan === "camat" ? "primary" : "secondary"}
                                            size="small"
                                            sx={{ mt: 0.5 }}
                                        />
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Right Column - Data Wilayah */}
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
                                Data Wilayah
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Kecamatan */}
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
                                            Kecamatan
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {data?.kecamatan || "-"}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {/* Desa */}
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
                                            Desa/Kelurahan
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            sx={{ fontWeight: 500 }}
                                        >
                                            {data?.desa || "-"}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Middle Column - Data Keuangan */}
                    <Grid item xs={12} md={8}>
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
                                Data Keuangan
                            </Typography>

                            <Grid container spacing={3}>
                                {/* Nama Bank */}
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
                                Dokumen
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
                            </Grid>
                        </Paper>
                    </Grid>

                    {/* Status & Keterangan (jika ada) */}
                    {(data?.status || data?.keterangan) && (
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
                                    Status & Keterangan
                                </Typography>

                                <Grid container spacing={3}>
                                    {/* Status */}
                                    {data?.status && (
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
                                                    Status Verifikasi
                                                </Typography>
                                                {data?.status === "diterima" && (
                                                    <Chip
                                                        label="Diterima"
                                                        color="success"
                                                        size="small"
                                                    />
                                                )}
                                                {data?.status === "ditolak" && (
                                                    <Chip
                                                        label="Ditolak"
                                                        color="error"
                                                        size="small"
                                                    />
                                                )}
                                                {data?.status === "di-review" && (
                                                    <Chip
                                                        label="Di-review"
                                                        color="warning"
                                                        size="small"
                                                    />
                                                )}
                                                {!["diterima", "ditolak", "di-review"].includes(data?.status) && (
                                                    <Chip
                                                        label={data?.status}
                                                        color="default"
                                                        size="small"
                                                    />
                                                )}
                                            </Box>
                                        </Grid>
                                    )}

                                    {/* Keterangan */}
                                    {data?.keterangan && (
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
                                                    Keterangan
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: 500 }}
                                                >
                                                    {data?.keterangan || "-"}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>
                        </Grid>
                    )}
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
                        href="/operator-kecamatan/data/camat-keuchik"
                        variant="outlined"
                        sx={{ textTransform: "none" }}
                    >
                        Kembali
                    </Button>
             
                </Box>
            </section>
        </OperatorKecamatanLayout>
    );
}

export default DetailCamatKeuchik;