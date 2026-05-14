import {
    Alert,
    Snackbar,
    Box,
    Button,
    Chip,
    Card,
    CardContent,
    Grid,
    Typography,
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Tooltip,
    LinearProgress,
    IconButton,
    Breadcrumbs,
    Link as MuiLink,
} from "@mui/material";
import PropTypes from "prop-types";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState, useMemo } from "react";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import Navigation from "@/Components/Mahasiswa/Navigation";
import {
    ArrowBack,
    School,
    Work,
    LocationOn,
    Description,
    SupervisorAccount,
    People,
    CheckCircle,
    Warning,
    Info,
    Send,
    Home,
    NavigateNext,
    Male,
    Female,
    EventAvailable,
} from "@mui/icons-material";
import { Link } from "@inertiajs/react";
import ButtomFooter from "@/Components/frontpage/ButtomFooter";


// Custom theme dengan warna UIN Ar-Raniry
const theme = createTheme({
    palette: {
        primary: {
            main: "#06359f", // Biru UIN
            light: "#3d5fb3",
            dark: "#042574",
        },
        secondary: {
            main: "#008a01", // Hijau
            light: "#66b967",
            dark: "#006e01",
        },
        success: {
            main: "#2e7d32",
        },
        warning: {
            main: "#ed6c02",
        },
        error: {
            main: "#d32f2f",
        },
        info: {
            main: "#0288d1",
        },
    },
    typography: {
        fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
        h4: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 500,
        },
        body2: {
            color: "#666",
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                },
            },
        },
    },
});

const StatCard = ({ icon: Icon, label, value, color, tooltip, suffix = "" }) => (
    <Tooltip title={tooltip} arrow placement="top">
        <Card
            elevation={0}
            sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                    borderColor: `${color}.main`,
                },
                height: "100%",
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: `${color}.50`,
                            color: `${color}.main`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <Icon sx={{ fontSize: 24 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                        >
                            {label}
                        </Typography>
                        <Typography 
                            variant="h5" 
                            sx={{ 
                                fontWeight: 700, 
                                mt: 0.5,
                                color: `${color}.main`,
                            }}
                        >
                            {value}{suffix}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    </Tooltip>
);

const DetailSection = ({ title, children, icon: Icon, sx = {} }) => (
    <Box sx={{ mb: 4, ...sx }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            {Icon && (
                <Icon sx={{ color: "primary.main", fontSize: 24 }} />
            )}
            <Typography
                variant="h6"
                sx={{
                    color: "primary.main",
                    fontWeight: 600,
                    pb: 1,
                    borderBottom: "2px solid",
                    borderColor: "primary.light",
                    width: "100%",
                }}
            >
                {title}
            </Typography>
        </Box>
        {children}
    </Box>
);

const DetailItem = ({ label, value, icon: Icon, sx = {} }) => (
    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 2, ...sx }}>
        {Icon && (
            <Icon sx={{ color: "text.secondary", fontSize: 20, mt: 0.5, flexShrink: 0 }} />
        )}
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                {label}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: 500, wordBreak: "break-word" }}>
                {value || "-"}
            </Typography>
        </Box>
    </Box>
);

const DetailLowonganPPL = ({ flash, lowongan_ppl, pelamar, meta }) => {
    const [notify, setNotify] = useState(false);
    const [notifyStatus, setNotifyStatus] = useState("info");

    const { data, setData, post, processing } = useForm({
        id: lowongan_ppl?.id,
    });

    useEffect(() => {
        if (flash?.message) {
            if (flash.message.success) {
                setNotifyStatus("success");
            } else {
                setNotifyStatus("error");
            }
            setNotify(true);
        }
    }, [flash]);

    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") return;
        setNotify(false);
    };

    // Optimize wilayah lookup dengan useMemo
    const locationDetails = useMemo(() => {
        try {
            const kabupatenList = kabupaten("11") || [];
            const kabupatenName = kabupatenList.find(
                (item) => item.kode === lowongan_ppl?.sekolah?.regency
            )?.nama || "Tidak diketahui";

            const kecamatanList = lowongan_ppl?.sekolah?.regency ? 
                kecamatan(lowongan_ppl.sekolah.regency) : [];
            const kecamatanName = kecamatanList.find(
                (item) => item.kode === lowongan_ppl?.sekolah?.sub_district
            )?.nama || "Tidak diketahui";

            const desaList = lowongan_ppl?.sekolah?.sub_district ? 
                desa(lowongan_ppl.sekolah.sub_district) : [];
            const desaName = desaList.find(
                (item) => item.kode === lowongan_ppl?.sekolah?.village
            )?.nama || "Tidak diketahui";

            return { kabupatenName, kecamatanName, desaName };
        } catch (error) {
            console.error("Error loading location:", error);
            return { 
                kabupatenName: "Tidak diketahui", 
                kecamatanName: "Tidak diketahui", 
                desaName: "Tidak diketahui" 
            };
        }
    }, [lowongan_ppl]);

    // Calculate stats
    const isQuotaFull = useMemo(() => {
        return (lowongan_ppl?.accepted_pelamar_count || 0) >= (lowongan_ppl?.quota || 0);
    }, [lowongan_ppl]);

    const quotaPercentage = useMemo(() => {
        if (!lowongan_ppl?.quota || lowongan_ppl.quota === 0) return 0;
        return Math.round((lowongan_ppl.accepted_pelamar_count / lowongan_ppl.quota) * 100);
    }, [lowongan_ppl]);

    const sisaKuota = useMemo(() => {
        return Math.max(0, (lowongan_ppl?.quota || 0) - (lowongan_ppl?.accepted_pelamar_count || 0));
    }, [lowongan_ppl]);

    // Format gender untuk display
    const formatGender = (jk) => {
        if (!jk) return "N/A";
        return jk === "L" ? "Laki-laki" : jk === "P" ? "Perempuan" : jk;
    };

    return (
        <ThemeProvider theme={theme}>
            <Head 
                title={meta?.title || `Detail Lowongan PPL - ${lowongan_ppl?.name || ""}`}
            />
            <Header />
            
            {/* Notification Snackbar */}
            {flash?.message && (
                <Snackbar
                    open={notify}
                    anchorOrigin={{ vertical: "top", horizontal: "right" }}
                    autoHideDuration={4000}
                    onClose={handleCloseNotify}
                >
                    <Alert
                        onClose={handleCloseNotify}
                        severity={notifyStatus}
                        variant="filled"
                        elevation={6}
                        sx={{
                            width: "100%",
                            borderRadius: 2,
                            fontWeight: 500,
                        }}
                        iconMapping={{
                            success: <CheckCircle fontSize="inherit" />,
                            error: <Warning fontSize="inherit" />,
                            info: <Info fontSize="inherit" />,
                        }}
                    >
                        {flash.message[notifyStatus] || flash.message}
                    </Alert>
                </Snackbar>
            )}

            <main className="min-h-screen  pt-20 pb-16 md:pb-0">
                <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
                    {/* Breadcrumbs Navigation */}
                    <Box sx={{ mb: 4 }}>
                        <Breadcrumbs 
                            separator={<NavigateNext fontSize="small" />}
                            aria-label="breadcrumb"
                        >
                            <MuiLink
                                component={Link}
                                href="/ppl-vacancies"
                                color="inherit"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    textDecoration: "none",
                                    "&:hover": { textDecoration: "underline" },
                                }}
                            >
                                <Home sx={{ fontSize: 20 }} />
                                Lowongan PPL
                            </MuiLink>
                            <Typography color="text.primary" sx={{ fontWeight: 500 }}>
                                Detail Lowongan
                            </Typography>
                        </Breadcrumbs>
                    </Box>

                    {/* Status Alert */}
                    {isQuotaFull && (
                        <Alert
                            severity="warning"
                            sx={{ 
                                mb: 3, 
                                borderRadius: 2,
                                "& .MuiAlert-icon": { alignItems: "center" }
                            }}
                            icon={<Warning />}
                            action={
                                <Button 
                                    color="inherit" 
                                    size="small"
                                    onClick={() => router.get('/ppl-vacancies')}
                                >
                                    Cari Lainnya
                                </Button>
                            }
                        >
                            Kuota tempat ini sudah terpenuhi. Tidak dapat menerima lamaran baru.
                        </Alert>
                    )}

                    {/* Main Header Card */}
                    <Card sx={{ mb: 4, overflow: "visible" }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 4 }, position: "relative" }}>
                            {/* Floating Apply Button on Desktop */}
                            <Box sx={{ 
                                display: { xs: "none", md: "block" },
                                position: "absolute", 
                                top: 24, 
                                right: 24 
                            }}>
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<Send />}
                                    onClick={() => post("/lowonganppl/lamar")}
                                    disabled={processing || isQuotaFull}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: "none",
                                        px: 4,
                                        py: 1.2,
                                        fontWeight: 600,
                                        boxShadow: 3,
                                        "&:hover": {
                                            boxShadow: 6,
                                            transform: "translateY(-2px)",
                                        },
                                        transition: "all 0.3s ease",
                                        minWidth: 180,
                                    }}
                                >
                                    {processing ? (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <span>Mengajukan...</span>
                                        </Box>
                                    ) : (
                                        "Ajukan Lamaran"
                                    )}
                                </Button>
                            </Box>

                            <Box sx={{ maxWidth: { md: "calc(100% - 200px)" } }}>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        fontWeight: 700,
                                        color: "primary.main",
                                        mb: 1.5,
                                        lineHeight: 1.3,
                                    }}
                                >
                                    {lowongan_ppl?.name || "Nama Lowongan"}
                                </Typography>
                                
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
                                    <Chip
                                        icon={<School />}
                                        label={lowongan_ppl?.sekolah?.nama_sekolah || "Sekolah"}
                                        size="medium"
                                        variant="outlined"
                                        sx={{ borderRadius: 1, fontWeight: 500 }}
                                    />
                                    <Chip
                                        icon={<LocationOn />}
                                        label={`${locationDetails.kabupatenName}, ${locationDetails.kecamatanName}`}
                                        size="medium"
                                        variant="outlined"
                                        sx={{ borderRadius: 1 }}
                                    />
                                    {isQuotaFull ? (
                                        <Chip
                                            label="Kuota Penuh"
                                            color="warning"
                                            size="medium"
                                            sx={{ fontWeight: 600 }}
                                            icon={<Warning />}
                                        />
                                    ) : (
                                        <Chip
                                            label={`Sisa ${sisaKuota} Kuota`}
                                            color="success"
                                            size="medium"
                                            sx={{ fontWeight: 600 }}
                                            icon={<CheckCircle />}
                                        />
                                    )}
                                </Box>

                                {/* Progress Bar */}
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Status Pengisian Kuota
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600}>
                                            {lowongan_ppl?.accepted_pelamar_count || 0} / {lowongan_ppl?.quota || 0} ({quotaPercentage}%)
                                        </Typography>
                                    </Box>
                                    <LinearProgress 
                                        variant="determinate" 
                                        value={Math.min(quotaPercentage, 100)}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            backgroundColor: "action.hover",
                                            "& .MuiLinearProgress-bar": {
                                                borderRadius: 5,
                                                backgroundColor: quotaPercentage >= 100 ? "warning.main" : "primary.main",
                                            }
                                        }}
                                    />
                                </Box>

                                {/* Stats Grid */}
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid item xs={6} sm={3}>
                                        <StatCard
                                            icon={People}
                                            label="Kuota Total"
                                            value={lowongan_ppl?.quota || 0}
                                            color="primary"
                                            tooltip="Total kuota yang tersedia"
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <StatCard
                                            icon={CheckCircle}
                                            label="Telah Terisi"
                                            value={lowongan_ppl?.accepted_pelamar_count || 0}
                                            color="success"
                                            tooltip="Mahasiswa yang telah diterima"
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <StatCard
                                            icon={Male}
                                            label="Laki-laki"
                                            value={lowongan_ppl?.jumlah_pria || 0}
                                            color="info"
                                            tooltip="Jumlah laki-laki diterima"
                                        />
                                    </Grid>
                                    <Grid item xs={6} sm={3}>
                                        <StatCard
                                            icon={Female}
                                            label="Perempuan"
                                            value={lowongan_ppl?.jumlah_wanita || 0}
                                            color="secondary"
                                            tooltip="Jumlah perempuan diterima"
                                        />
                                    </Grid>
                                </Grid>
                            </Box>

                            {/* Mobile Apply Button */}
                            <Box sx={{ 
                                display: { xs: "block", md: "none" },
                                mt: 3,
                                pt: 2,
                                borderTop: "1px solid",
                                borderColor: "divider"
                            }}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    startIcon={<Send />}
                                    onClick={() => post("/lowonganppl/lamar")}
                                    disabled={processing || isQuotaFull}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: "none",
                                        py: 1.5,
                                        fontWeight: 600,
                                    }}
                                >
                                    {processing ? "Mengajukan..." : "Ajukan Lamaran"}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>

                    <Grid container spacing={3}>
                        {/* Left Column - Sekolah & Lokasi */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                    <DetailSection title="Informasi Sekolah" icon={School}>
                                        <DetailItem
                                            label="Nama Sekolah"
                                            value={lowongan_ppl?.sekolah?.nama_sekolah}
                                            icon={School}
                                        />
                                        <DetailItem
                                            label="Alamat"
                                            value={lowongan_ppl?.sekolah?.address}
                                            icon={LocationOn}
                                        />
                                        <DetailItem
                                            label="Supervisor"
                                            value={lowongan_ppl?.sekolah?.username_supervisor}
                                            icon={SupervisorAccount}
                                        />
                                    </DetailSection>

                                    <DetailSection title="Lokasi Sekolah" icon={LocationOn}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <DetailItem
                                                    label="Kabupaten"
                                                    value={locationDetails.kabupatenName}
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <DetailItem
                                                    label="Kecamatan"
                                                    value={locationDetails.kecamatanName}
                                                />
                                            </Grid>
                                            <Grid item xs={12}>
                                                <DetailItem
                                                    label="Desa/Kelurahan"
                                                    value={locationDetails.desaName}
                                                />
                                            </Grid>
                                        </Grid>
                                    </DetailSection>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Right Column - Lowongan Details */}
                        <Grid item xs={12} md={6}>
                            <Card>
                                <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                                    <DetailSection title="Detail Lowongan" icon={Work}>
                                        <DetailItem
                                            label="Nama Lowongan"
                                            value={lowongan_ppl?.name}
                                            icon={Work}
                                        />
                                        <DetailItem
                                            label="Deskripsi"
                                            value={lowongan_ppl?.description}
                                            icon={Description}
                                            sx={{ 
                                                "& .MuiTypography-body1": { 
                                                    whiteSpace: "pre-line",
                                                    lineHeight: 1.7 
                                                } 
                                            }}
                                        />
                                        <Box sx={{ mt: 3 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6}>
                                                    <DetailItem
                                                        label="Program Studi"
                                                        value={lowongan_ppl?.prodi?.name}
                                                    />
                                                </Grid>
                                                <Grid item xs={6}>
                                                    <DetailItem
                                                        label="Status"
                                                        value={isQuotaFull ? "Kuota Penuh" : "Masih Tersedia"}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    </DetailSection>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Daftar Pelamar */}
                    <Card sx={{ mt: 3 }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                            <DetailSection title="Daftar Mahasiswa Diterima" icon={People}>
                                {pelamar?.length > 0 ? (
                                    <TableContainer 
                                        component={Paper} 
                                        elevation={0} 
                                        sx={{ 
                                            borderRadius: 2, 
                                            border: "1px solid", 
                                            borderColor: "divider",
                                            overflow: "auto"
                                        }}
                                    >
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ backgroundColor: "action.hover" }}>
                                                    <TableCell sx={{ fontWeight: 600, width: 60 }}>No</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Nama Mahasiswa</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>NIM</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Program Studi</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Jenis Kelamin</TableCell>
                                                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {pelamar.map((item, index) => (
                                                    <TableRow 
                                                        key={item.id || index}
                                                        hover
                                                        sx={{ 
                                                            "&:last-child td, &:last-child th": { border: 0 },
                                                            transition: "background-color 0.2s",
                                                        }}
                                                    >
                                                        <TableCell>{index + 1}</TableCell>
                                                        <TableCell sx={{ fontWeight: 500 }}>
                                                            {item.nama_mahasiswa}
                                                        </TableCell>
                                                        <TableCell>{item.nim}</TableCell>
                                                        <TableCell>{item.nama_prodi}</TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={formatGender(item.jk)}
                                                                size="small"
                                                                color={item.jk === "L" ? "info" : "secondary"}
                                                                sx={{ borderRadius: 1, minWidth: 100 }}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={item.status || "Diterima"}
                                                                size="small"
                                                                color="success"
                                                                variant="outlined"
                                                                sx={{ borderRadius: 1 }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                ) : (
                                    <Box sx={{ 
                                        textAlign: "center", 
                                        py: 8,
                                        border: "2px dashed",
                                        borderColor: "divider",
                                        borderRadius: 2
                                    }}>
                                        <People sx={{ fontSize: 60, color: "text.disabled", mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            Belum ada mahasiswa yang diterima
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Jadilah yang pertama melamar lowongan ini
                                        </Typography>
                                    </Box>
                                )}
                            </DetailSection>
                        </CardContent>
                    </Card>

                    {/* Mobile Bottom Spacer */}
                    <Box sx={{ height: 100, display: { xs: "block", md: "none" } }} />
                </div>
            </main>

            <ButtomFooter />
            <Navigation />
        </ThemeProvider>
    );
};

DetailLowonganPPL.propTypes = {
    flash: PropTypes.object,
    lowongan_ppl: PropTypes.object.isRequired,
    pelamar: PropTypes.array,
    meta: PropTypes.object,
};

export default DetailLowonganPPL;