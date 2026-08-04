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
    Avatar,
    AvatarGroup,
    Tooltip,
    IconButton,
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
    People,
    LocationOn,
    Description,
    SupervisorAccount,
    Male,
    Female,
    EventAvailable,
    Send,
    CheckCircle,
    Warning,
    Info,
} from "@mui/icons-material";
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
    },
    typography: {
        fontFamily: "'Inter', 'Segoe UI', Roboto, sans-serif",
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
});

const StatCard = ({ icon: Icon, label, value, color, tooltip }) => (
    <Tooltip title={tooltip} arrow>
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
                },
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
                        }}
                    >
                        <Icon />
                    </Box>
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                        >
                            {label}
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{ fontWeight: 700, mt: 0.5 }}
                        >
                            {value}
                        </Typography>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    </Tooltip>
);

const DetailSection = ({ title, children, icon: Icon }) => (
    <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            {Icon && <Icon sx={{ color: "primary.main", fontSize: 24 }} />}
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

const DetailLowonganKPM = ({ flash, tempat_kpm, pelamar }) => {
    const [notify, setNotify] = useState(false);
    const [notifyStatus, setNotifyStatus] = useState("info");

    const { data, setData, post, processing } = useForm({
        id: tempat_kpm?.id,
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
            const kabupatenName =
                kabupatenList.find((item) => item.kode === tempat_kpm?.regency)
                    ?.nama || "Tidak diketahui";

            const kecamatanList = tempat_kpm?.regency
                ? kecamatan(tempat_kpm.regency)
                : [];
            const kecamatanName =
                kecamatanList.find(
                    (item) => item.kode === tempat_kpm?.sub_district
                )?.nama || "Tidak diketahui";

            const desaList = tempat_kpm?.sub_district
                ? desa(tempat_kpm.sub_district)
                : [];
            const desaName =
                desaList.find((item) => item.kode === tempat_kpm?.village)
                    ?.nama || "Tidak diketahui";

            return { kabupatenName, kecamatanName, desaName };
        } catch (error) {
            console.error("Error loading location:", error);
            return {
                kabupatenName: "Error",
                kecamatanName: "Error",
                desaName: "Error",
            };
        }
    }, [tempat_kpm]);

    // Calculate stats
    const isQuotaFull = useMemo(() => {
        return tempat_kpm?.accepted_pelamar_count >= tempat_kpm?.qouta;
    }, [tempat_kpm]);

    const quotaPercentage = useMemo(() => {
        if (!tempat_kpm?.qouta) return 0;
        return Math.round(
            (tempat_kpm.accepted_pelamar_count / tempat_kpm.qouta) * 100
        );
    }, [tempat_kpm]);

    return (
        <ThemeProvider theme={theme}>
            <Head title={`Detail KPM - ${tempat_kpm?.name || ""}`} />
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
                    {/* Header dengan back button */}
                    <Box sx={{ mb: 4 }}>
                        <Button
                            startIcon={<ArrowBack />}
                            onClick={() => router.get("/kpm-vacancies")}
                            sx={{
                                textTransform: "none",
                                color: "text.secondary",
                                "&:hover": {
                                    backgroundColor: "action.hover",
                                },
                            }}
                        >
                            Kembali ke Lowongan
                        </Button>
                    </Box>

                    {/* Status Alert */}
                    {isQuotaFull && (
                        <Alert
                            severity="warning"
                            sx={{ mb: 3, borderRadius: 2 }}
                            icon={<Warning />}
                        >
                            Kuota tempat ini sudah terpenuhi. Tidak dapat
                            menerima lamaran baru.
                        </Alert>
                    )}

                    {/* Main Card */}
                    <Card elevation={2} sx={{ borderRadius: 3, mb: 4 }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                            {/* Header dengan judul dan status */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", md: "row" },
                                    justifyContent: "space-between",
                                    alignItems: "flex-start",
                                    mb: 4,
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 700,
                                            color: "primary.main",
                                            mb: 1,
                                        }}
                                    >
                                        {tempat_kpm?.name || "Tidak ada nama"}
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <Chip
                                            icon={<LocationOn />}
                                            label={`${locationDetails.kabupatenName}, ${locationDetails.kecamatanName}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ borderRadius: 1 }}
                                        />
                                        {isQuotaFull && (
                                            <Chip
                                                label="Kuota Penuh"
                                                color="warning"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        )}
                                    </Box>
                                </Box>

                                {/* Apply Button */}
                                <Button
                                    variant="contained"
                                    size="large"
                                    startIcon={<Send />}
                                    onClick={() => post("/lowongankpm/lamar")}
                                    disabled={processing || isQuotaFull}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: "none",
                                        px: 4,
                                        py: 1.2,
                                        fontWeight: 600,
                                        boxShadow: 2,
                                        "&:hover": {
                                            boxShadow: 4,
                                            transform: "translateY(-2px)",
                                        },
                                        transition: "all 0.3s ease",
                                    }}
                                >
                                    {processing
                                        ? "Mengajukan..."
                                        : "Ajukan Lamaran"}
                                </Button>
                            </Box>

                            {/* Stats Grid */}
                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={6} sm={3}>
                                    <StatCard
                                        icon={People}
                                        label="Kuota"
                                        value={tempat_kpm?.qouta || 0}
                                        color="primary"
                                        tooltip="Jumlah kuota tersedia"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <StatCard
                                        icon={CheckCircle}
                                        label="Terisi"
                                        value={
                                            tempat_kpm?.accepted_pelamar_count ||
                                            0
                                        }
                                        color="success"
                                        tooltip="Mahasiswa yang telah diterima"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <StatCard
                                        icon={Male}
                                        label="Laki-laki"
                                        value={tempat_kpm?.jumlah_pria || 0}
                                        color="info"
                                        tooltip="Jumlah laki-laki diterima"
                                    />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <StatCard
                                        icon={Female}
                                        label="Perempuan"
                                        value={tempat_kpm?.jumlah_wanita || 0}
                                        color="secondary"
                                        tooltip="Jumlah perempuan diterima"
                                    />
                                </Grid>
                            </Grid>

                            {/* Progress Bar */}
                            <Box sx={{ mb: 4 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        mb: 1,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Pengisian Kuota
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {quotaPercentage}%
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        height: 8,
                                        backgroundColor: "action.hover",
                                        borderRadius: 4,
                                        overflow: "hidden",
                                    }}
                                >
                                    <Box
                                        sx={{
                                            height: "100%",
                                            width: `${Math.min(
                                                quotaPercentage,
                                                100
                                            )}%`,
                                            backgroundColor:
                                                quotaPercentage >= 100
                                                    ? "warning.main"
                                                    : "primary.main",
                                            borderRadius: 4,
                                            transition: "width 0.5s ease",
                                        }}
                                    />
                                </Box>
                            </Box>

                            <Divider sx={{ my: 4 }} />

                            {/* Detail Sections */}
                            <Grid container spacing={4}>
                                <Grid item xs={12} md={6}>
                                    <DetailSection
                                        title="Informasi Lokasi"
                                        icon={LocationOn}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 1.5,
                                            }}
                                        >
                                            <Box
                                                sx={{ display: "flex", gap: 2 }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        minWidth: 100,
                                                        color: "text.secondary",
                                                    }}
                                                >
                                                    Kabupaten
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    fontWeight={500}
                                                >
                                                    {
                                                        locationDetails.kabupatenName
                                                    }
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{ display: "flex", gap: 2 }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        minWidth: 100,
                                                        color: "text.secondary",
                                                    }}
                                                >
                                                    Kecamatan
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    fontWeight={500}
                                                >
                                                    {
                                                        locationDetails.kecamatanName
                                                    }
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{ display: "flex", gap: 2 }}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        minWidth: 100,
                                                        color: "text.secondary",
                                                    }}
                                                >
                                                    Desa
                                                </Typography>
                                                <Typography
                                                    variant="body1"
                                                    fontWeight={500}
                                                >
                                                    {locationDetails.desaName}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </DetailSection>

                                    <DetailSection
                                        title="Supervisor"
                                        icon={SupervisorAccount}
                                    >
                                        <Typography
                                            variant="body1"
                                            fontWeight={500}
                                        >
                                            {tempat_kpm?.username_supervisor ||
                                                "Belum ditentukan"}
                                        </Typography>
                                    </DetailSection>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <DetailSection
                                        title="Deskripsi"
                                        icon={Description}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                whiteSpace: "pre-line",
                                                lineHeight: 1.7,
                                            }}
                                        >
                                            {tempat_kpm?.description ||
                                                "Tidak ada deskripsi tersedia."}
                                        </Typography>
                                    </DetailSection>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Daftar Pelamar */}
                    <Card elevation={2} sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                            <DetailSection title="Daftar Pelamar" icon={People}>
                                <TableContainer
                                    component={Paper}
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2,
                                        border: "1px solid",
                                        borderColor: "divider",
                                    }}
                                >
                                    <Table>
                                        <TableHead>
                                            <TableRow
                                                sx={{
                                                    backgroundColor:
                                                        "action.hover",
                                                }}
                                            >
                                                <TableCell
                                                    sx={{
                                                        fontWeight: 600,
                                                        width: 60,
                                                    }}
                                                >
                                                    No
                                                </TableCell>
                                                <TableCell
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    Nama Mahasiswa
                                                </TableCell>
                                                <TableCell
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    NIM
                                                </TableCell>
                                                <TableCell
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    Program Studi
                                                </TableCell>
                                                <TableCell
                                                    sx={{ fontWeight: 600 }}
                                                >
                                                    Jenis Kelamin
                                                </TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {pelamar?.length > 0 ? (
                                                pelamar.map((item, index) => (
                                                    <TableRow
                                                        key={item.id || index}
                                                        hover
                                                        sx={{
                                                            "&:last-child td, &:last-child th":
                                                                { border: 0 },
                                                            transition:
                                                                "background-color 0.2s",
                                                        }}
                                                    >
                                                        <TableCell>
                                                            {index + 1}
                                                        </TableCell>
                                                        <TableCell
                                                            sx={{
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            {
                                                                item.nama_mahasiswa
                                                            }
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.nim}
                                                        </TableCell>
                                                        <TableCell>
                                                            {item.nama_prodi}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={
                                                                    item.jk ===
                                                                        "Pria"
                                                                        ? "Laki-laki"
                                                                        : "Perempuan"
                                                                }
                                                                size="small"
                                                                color={
                                                                    (item.jk === "Pria" || item.jk === "L")
                                                                        ? "info"
                                                                        : "secondary"
                                                                }
                                                                sx={{
                                                                    borderRadius: 1,
                                                                }}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        align="center"
                                                        sx={{ py: 4 }}
                                                    >
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                flexDirection:
                                                                    "column",
                                                                alignItems:
                                                                    "center",
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <People
                                                                sx={{
                                                                    fontSize: 48,
                                                                    color: "text.disabled",
                                                                }}
                                                            />
                                                            <Typography color="text.secondary">
                                                                Belum ada
                                                                pelamar untuk
                                                                lowongan ini
                                                            </Typography>
                                                        </Box>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </DetailSection>
                        </CardContent>
                    </Card>

                    {/* Spacer untuk mobile navigation */}
                    <Box
                        sx={{
                            height: 80,
                            display: { xs: "block", md: "none" },
                        }}
                    />
                </div>
            </main>

            <ButtomFooter />

            <Navigation />
        </ThemeProvider>
    );
};

DetailLowonganKPM.propTypes = {
    flash: PropTypes.object,
    tempat_kpm: PropTypes.object.isRequired,
    pelamar: PropTypes.array,
};

export default DetailLowonganKPM;
