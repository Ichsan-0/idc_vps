import {
    Alert,
    Snackbar,
    Box,
    Button,
    Tabs,
    Tab,
    Card,
    CardContent,
    Typography,
    Chip,
    Grid,
    Divider,
    Paper,
    Avatar,
    LinearProgress,
    IconButton,
    Tooltip,
    Badge,
} from "@mui/material";
import PropTypes from "prop-types";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import Navigation from "@/Components/Mahasiswa/Navigation";
import ButtomFooter from "@/Components/frontpage/ButtomFooter";

import {
    History,
    Work,
    School,
    LocationOn,
    CheckCircle,
    Pending,
    Cancel,
    Visibility,
    ArrowForward,
    CalendarMonth,
    Message,
    Warning,
    DoneAll,
    HourglassEmpty,
} from "@mui/icons-material";

// Custom theme dengan warna UIN Ar-Raniry
const theme = createTheme({
    palette: {
        primary: {
            main: "#06359f",
            light: "#3d5fb3",
            dark: "#042574",
        },
        secondary: {
            main: "#008a01",
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
    },
    shape: {
        borderRadius: 12,
    },
});

// Styled Components
const StyledTabs = styled(Tabs)(({ theme }) => ({
    minHeight: 60,
    "& .MuiTabs-indicator": {
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.palette.primary.main,
    },
    "& .MuiTabs-flexContainer": {
        gap: theme.spacing(2),
    },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
    textTransform: "none",
    fontWeight: 600,
    fontSize: "1rem",
    minHeight: 60,
    color: theme.palette.text.secondary,
    "&.Mui-selected": {
        color: theme.palette.primary.main,
    },
    "&:hover": {
        color: theme.palette.primary.main,
        backgroundColor: theme.palette.primary.light + "10",
    },
}));

const StatusChip = ({ status }) => {
    const statusConfig = {
        submitted: {
            label: "Menunggu",
            color: "warning",
            icon: <HourglassEmpty />,
        },
        pending: {
            label: "Diproses",
            color: "info",
            icon: <Pending />,
        },
        accepted: {
            label: "Diterima",
            color: "success",
            icon: <CheckCircle />,
        },
        rejected: {
            label: "Ditolak",
            color: "error",
            icon: <Cancel />,
        },
    };

    const config = statusConfig[status] || statusConfig.submitted;

    return (
        <Chip
            icon={config.icon}
            label={config.label}
            color={config.color}
            variant="outlined"
            sx={{
                borderRadius: 2,
                fontWeight: 600,
                borderWidth: 2,
                "& .MuiChip-icon": {
                    fontSize: 18,
                },
            }}
        />
    );
};

const LamaranCard = ({ lamaran, type, getLocationDetails }) => {
    const isKPM = type === "kpm";
    const lowongan = lamaran[type];
    
    const statusColor = {
        submitted: "#ed6c02",
        pending: "#0288d1",
        accepted: "#2e7d32",
        rejected: "#d32f2f",
    }[lamaran.status] || "#666";

    const getStatusIcon = (status) => {
        switch (status) {
            case "accepted": return <CheckCircle />;
            case "rejected": return <Cancel />;
            case "pending": return <Pending />;
            default: return <HourglassEmpty />;
        }
    };

    return (
        <Card 
            elevation={2}
            sx={{
                borderRadius: 3,
                mb: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                    borderLeft: `4px solid ${statusColor}`,
                },
                borderLeft: `4px solid ${statusColor}`,
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                            <Avatar
                                sx={{
                                    bgcolor: "primary.50",
                                    color: "primary.main",
                                    width: 56,
                                    height: 56,
                                }}
                            >
                                {getStatusIcon(lamaran.status)}
                            </Avatar>
                            <Box sx={{ flex: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {lowongan?.name || "N/A"}
                                </Typography>
                                
                                {isKPM ? (
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        <LocationOn sx={{ fontSize: 16, verticalAlign: "middle", mr: 0.5 }} />
                                        {getLocationDetails(lowongan)}
                                    </Typography>
                                ) : (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                        <School sx={{ fontSize: 16, color: "text.secondary" }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {lowongan?.sekolah?.name || "N/A"}
                                        </Typography>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1 }}>
                                            <LocationOn sx={{ fontSize: 14, color: "text.secondary" }} />
                                            <Typography variant="body2" color="text.secondary">
                                                {getLocationDetails(lowongan?.sekolah)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                                
                                {lamaran.keterangan && (
                                    <Paper 
                                        elevation={0}
                                        sx={{ 
                                            mt: 2, 
                                            p: 2, 
                                            bgcolor: "warning.50",
                                            border: "1px solid",
                                            borderColor: "warning.100",
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                            <Message sx={{ fontSize: 18, color: "warning.main" }} />
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "warning.dark" }}>
                                                Pesan dari Admin
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            {lamaran.keterangan}
                                        </Typography>
                                    </Paper>
                                )}
                            </Box>
                        </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: { xs: "flex-start", md: "flex-end" }, gap: 2 }}>
                            <StatusChip status={lamaran.status} />
                            
                            <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                    Diajukan pada
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {lamaran.created_at ? new Date(lamaran.created_at).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    }) : 'N/A'}
                                </Typography>
                            </Box>
                            
                            <Button
                                variant="outlined"
                                endIcon={<ArrowForward />}
                                onClick={() => router.visit(
                                    isKPM 
                                        ? `/kpm-vacancies/detail/${lamaran.id_tempat_kpm}`
                                        : `/ppl-vacancies/detail/${lamaran.id_lowongan_ppl}`
                                )}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                }}
                            >
                                Lihat Detail
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                Kuota
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                                {lowongan?.quota || lowongan?.qouta || 0}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                Program
                            </Typography>
                            <Chip
                                label={isKPM ? "KPM" : "PPL"}
                                size="small"
                                color={isKPM ? "secondary" : "primary"}
                                sx={{ borderRadius: 1, fontWeight: 600 }}
                            />
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                ID Lamaran
                            </Typography>
                            <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                                #{lamaran.id.toString().padStart(6, '0')}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                        <Box sx={{ textAlign: "center" }}>
                            <Typography variant="body2" color="text.secondary">
                                Terakhir Diupdate
                            </Typography>
                            <Typography variant="body2">
                                {lamaran.updated_at ? new Date(lamaran.updated_at).toLocaleDateString('id-ID') : 'N/A'}
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};

const CustomTabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`lamaran-tabpanel-${index}`}
            aria-labelledby={`lamaran-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>{children}</Box>
            )}
        </div>
    );
};

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const RiwayatLamaran = ({ flash, lamaran_kpm, lamaran_ppl }) => {
    const [notify, setNotify] = useState(false);
    const [notifyStatus, setNotifyStatus] = useState("info");
    const [tabValue, setTabValue] = useState(0);

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

    const handleCloseNotify = () => {
        setNotify(false);
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    // Optimize wilayah lookup dengan cache
    const getLocationDetails = useMemo(() => {
        const kabupatenCache = {};
        const kecamatanCache = {};
        const desaCache = {};

        return (sekolahOrKpm) => {
            if (!sekolahOrKpm) return "Lokasi tidak tersedia";
            
            try {
                const { regency, sub_district, village } = sekolahOrKpm;
                
                // Get kabupaten
                if (!kabupatenCache[regency]) {
                    const kabupatenList = kabupaten("11") || [];
                    kabupatenCache[regency] = kabupatenList.find(item => item.kode === regency)?.nama;
                }
                
                // Get kecamatan
                const kecKey = `${regency}_${sub_district}`;
                if (!kecamatanCache[kecKey]) {
                    const kecamatanList = regency ? kecamatan(regency) : [];
                    kecamatanCache[kecKey] = kecamatanList.find(item => item.kode === sub_district)?.nama;
                }
                
                // Get desa
                const desaKey = `${sub_district}_${village}`;
                if (!desaCache[desaKey]) {
                    const desaList = sub_district ? desa(sub_district) : [];
                    desaCache[desaKey] = desaList.find(item => item.kode === village)?.nama;
                }
                
                const parts = [
                    kabupatenCache[regency],
                    kecamatanCache[kecKey],
                    desaCache[desaKey]
                ].filter(Boolean);
                
                return parts.length > 0 ? parts.join(", ") : "Lokasi tidak tersedia";
            } catch (error) {
                console.error("Error getting location:", error);
                return "Lokasi tidak tersedia";
            }
        };
    }, []);

    // Calculate stats
    const stats = useMemo(() => {
        const allLamaran = [...lamaran_kpm, ...lamaran_ppl];
        return {
            total: allLamaran.length,
            accepted: allLamaran.filter(l => l.status === 'accepted').length,
            pending: allLamaran.filter(l => l.status === 'submitted' || l.status === 'pending').length,
            rejected: allLamaran.filter(l => l.status === 'rejected').length,
        };
    }, [lamaran_kpm, lamaran_ppl]);

    return (
        <ThemeProvider theme={theme}>
            <Head title="Riwayat Lamaran" />
            <Header />
            
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
                            borderRadius: 2,
                            fontWeight: 500,
                        }}
                    >
                        {flash.message[notifyStatus] || flash.message}
                    </Alert>
                </Snackbar>
            )}
            
            <main className="min-h-screen  pt-20 pb-20">
                <div className="container mx-auto px-4 lg:px-6 max-w-6xl">
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                                    Riwayat Lamaran
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Lacak status lamaran KPM dan PPL Anda
                                </Typography>
                            </Box>
                        </Box>
                        
                        {/* Stats Cards */}
                        <Grid container spacing={2} sx={{ mb: 4 }}>
                            <Grid item xs={6} sm={3}>
                                <Card elevation={2} sx={{ borderRadius: 3 }}>
                                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                                            {stats.total}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Total Lamaran
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Card elevation={2} sx={{ borderRadius: 3 }}>
                                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: "success.main" }}>
                                            {stats.accepted}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Diterima
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Card elevation={2} sx={{ borderRadius: 3 }}>
                                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: "warning.main" }}>
                                            {stats.pending}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Diproses
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Card elevation={2} sx={{ borderRadius: 3 }}>
                                    <CardContent sx={{ p: 2, textAlign: "center" }}>
                                        <Typography variant="h4" sx={{ fontWeight: 700, color: "error.main" }}>
                                            {stats.rejected}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Ditolak
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Main Content */}
                    <Card elevation={3} sx={{ borderRadius: 3 }}>
                        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                            {/* Tabs */}
                            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                                <StyledTabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    aria-label="lamaran tabs"
                                >
                                    <StyledTab
                                        icon={<Work />}
                                        iconPosition="start"
                                        label={
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <span>Kuliah Pengabdian Masyarakat</span>
                                                {lamaran_kpm.length > 0 && (
                                                    <Chip
                                                        label={lamaran_kpm.length}
                                                        size="small"
                                                        color="secondary"
                                                        sx={{ height: 20 }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                    />
                                    <StyledTab
                                        icon={<School />}
                                        iconPosition="start"
                                        label={
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <span>Praktik Pengalaman Lapangan</span>
                                                {lamaran_ppl.length > 0 && (
                                                    <Chip
                                                        label={lamaran_ppl.length}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ height: 20 }}
                                                    />
                                                )}
                                            </Box>
                                        }
                                    />
                                </StyledTabs>
                            </Box>

                            {/* KPM Tab */}
                            <CustomTabPanel value={tabValue} index={0}>
                                {lamaran_kpm.length > 0 ? (
                                    lamaran_kpm.map((lamaran) => (
                                        <LamaranCard
                                            key={lamaran.id}
                                            lamaran={lamaran}
                                            type="kpm"
                                            getLocationDetails={getLocationDetails}
                                        />
                                    ))
                                ) : (
                                    <Box sx={{ textAlign: "center", py: 8 }}>
                                        <Work sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            Belum ada lamaran KPM
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Anda belum mengajukan lamaran untuk Kuliah Pengabdian Masyarakat
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={() => router.visit('/kpm-vacancies')}
                                            startIcon={<Work />}
                                        >
                                            Lihat Lowongan KPM
                                        </Button>
                                    </Box>
                                )}
                            </CustomTabPanel>

                            {/* PPL Tab */}
                            <CustomTabPanel value={tabValue} index={1}>
                                {lamaran_ppl.length > 0 ? (
                                    lamaran_ppl.map((lamaran) => (
                                        <LamaranCard
                                            key={lamaran.id}
                                            lamaran={lamaran}
                                            type="ppl"
                                            getLocationDetails={getLocationDetails}
                                        />
                                    ))
                                ) : (
                                    <Box sx={{ textAlign: "center", py: 8 }}>
                                        <School sx={{ fontSize: 80, color: "text.disabled", mb: 2 }} />
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            Belum ada lamaran PPL
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                            Anda belum mengajukan lamaran untuk Praktik Pengalaman Lapangan
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            onClick={() => router.visit('/ppl-vacancies')}
                                            startIcon={<School />}
                                        >
                                            Lihat Lowongan PPL
                                        </Button>
                                    </Box>
                                )}
                            </CustomTabPanel>
                        </CardContent>
                    </Card>

                    {/* Tips Section */}
                    <Card elevation={2} sx={{ mt: 4, borderRadius: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
                                Tips Melamar
                            </Typography>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                        <CheckCircle sx={{ color: "success.main", mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Periksa Kuota
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Pastikan masih ada kuota tersedia sebelum melamar
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                        <CalendarMonth sx={{ color: "info.main", mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Perhatikan Waktu
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Lamaran hanya bisa diajukan dalam periode tertentu
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                        <Warning sx={{ color: "warning.main", mt: 0.5 }} />
                                        <Box>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                Satu Lowongan
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Anda hanya bisa diterima di satu lowongan PPL atau KPM
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <ButtomFooter/>

            <Navigation />
            <Box sx={{ height: 80, display: { xs: "block", md: "none" } }} />
        </ThemeProvider>
    );
};

RiwayatLamaran.propTypes = {
    flash: PropTypes.object,
    lamaran_kpm: PropTypes.array,
    lamaran_ppl: PropTypes.array,
};

export default RiwayatLamaran;