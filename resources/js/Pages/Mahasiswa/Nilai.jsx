import {
    Alert,
    Button,
    Chip,
    Snackbar,
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
    Divider,
    LinearProgress,
    Paper,
    Container,
    IconButton,
    Tooltip,
    Fade,
    Zoom,
} from "@mui/material";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState, useMemo } from "react";
import { Head, router } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import Navigation from "@/Components/Mahasiswa/Navigation";
import {
    School,
    Assignment,
    Grade,
    Download,
    CheckCircle,
    Error,
    Warning,
    EmojiEvents,
    Person,
    SupervisorAccount,
    Home,
    TrendingUp,
    Assessment,
    Print,
} from "@mui/icons-material";
import axios from "axios";
import ButtomFooter from "@/Components/frontpage/ButtomFooter";
import { Info } from "lucide-react";


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
            light: "#4caf50",
        },
        error: {
            main: "#d32f2f",
            light: "#ef5350",
        },
        warning: {
            main: "#ed6c02",
            light: "#ff9800",
        },
        info: {
            main: "#0288d1",
            light: "#03a9f4",
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
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    transition: "all 0.3s ease",
                },
            },
        },
    },
});

const ScoreCard = ({ title, icon: Icon, score, maxScore = 100, color = "primary", details = [] }) => {
    const percentage = useMemo(() => {
        return Math.min(100, Math.round((score / maxScore) * 100));
    }, [score, maxScore]);

    const getColor = () => {
        if (percentage >= 85) return "success";
        if (percentage >= 70) return "info";
        if (percentage >= 60) return "warning";
        return "error";
    };

    return (
        <Card 
            elevation={2}
            sx={{
                height: "100%",
                borderLeft: `4px solid ${theme.palette[color].main}`,
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                },
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
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
                        <Icon sx={{ fontSize: 24 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {title}
                    </Typography>
                </Box>

                <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Typography variant="h2" sx={{ fontWeight: 700, color: `${getColor()}.main` }}>
                        {score}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        dari {maxScore}
                    </Typography>
                </Box>

                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        mb: 2,
                        backgroundColor: `${color}.50`,
                        "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            backgroundColor: theme.palette[getColor()].main,
                        },
                    }}
                />

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                        Persentase
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {percentage}%
                    </Typography>
                </Box>

                {details.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <Divider sx={{ my: 1 }} />
                        {details.map((detail, index) => (
                            <Box key={index} sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                                <Typography variant="body2" color="text.secondary">
                                    {detail.label}
                                </Typography>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {detail.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
};

const StatusIndicator = ({ status, label }) => {
    const config = {
        lulus: {
            color: "success",
            icon: <CheckCircle />,
            text: "Lulus",
        },
        "tidak lulus": {
            color: "error",
            icon: <Error />,
            text: "Tidak Lulus",
        },
        "belum lengkap": {
            color: "warning",
            icon: <Warning />,
            text: "Belum Lengkap",
        },
    };

    const currentConfig = config[status.toLowerCase()] || config["belum lengkap"];

    return (
        <Chip
            icon={currentConfig.icon}
            label={label || currentConfig.text}
            color={currentConfig.color}
            variant="filled"
            sx={{
                borderRadius: 2,
                fontWeight: 600,
                px: 1,
                "& .MuiChip-icon": {
                    fontSize: 18,
                },
            }}
        />
    );
};

const LoadingOverlay = () => (
    <Fade in={true}>
        <Box
            sx={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
            }}
        >
            <Box sx={{ textAlign: "center" }}>
                <Assessment sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" color="primary.main" sx={{ mb: 2 }}>
                    Memuat Nilai...
                </Typography>
                <LinearProgress sx={{ width: 200, borderRadius: 2 }} />
            </Box>
        </Box>
    </Fade>
);

const Nilai = ({ access_token, auth }) => {
    const [loading, setLoading] = useState(false);
    const [dataMahasiswa, setDataMahasiswa] = useState(null);
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const showNotification = (message, severity = "info") => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const handleCloseNotification = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    const getNilai = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/student/nilai", {
                headers: {
                    Authorization: `Bearer ${access_token}`,
                },
                params: {
                    nim: auth?.user?.username,
                },
            });

            setDataMahasiswa(response?.data?.data?.mahasiswa || null);
        } catch (error) {
            console.error("Error fetching nilai:", error);
            showNotification(
                error.response?.data?.message || "Gagal memuat data nilai",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getNilai();
    }, []);

    const handlePrintCertificate = async () => {
        if (!dataMahasiswa?.open_print_certificate) {
            showNotification("Cetak sertifikat belum dibuka", "warning");
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post(
                `/api/certificate/download`,
                { nim: auth?.user?.username },
                {
                    responseType: "blob",
                    headers: {
                        Authorization: `Bearer ${access_token}`,
                    },
                }
            );

            const contentType = response.headers["content-type"];
            if (contentType !== "application/pdf") {
                throw new Error("Format file tidak didukung");
            }

            const blob = new Blob([response.data], { type: contentType });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;

            // Extract filename from headers
            const contentDisposition = response.headers["content-disposition"];
            let filename = "sertifikat_ppkpm.pdf";
            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                if (filenameMatch) {
                    filename = filenameMatch[1];
                }
            }

            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            showNotification("Sertifikat berhasil diunduh", "success");
        } catch (error) {
            console.error("Error downloading certificate:", error);
            showNotification(
                error.response?.data?.message || "Gagal mengunduh sertifikat",
                "error"
            );
        } finally {
            setLoading(false);
        }
    };

    // Calculate overall status
    const isLulus = useMemo(() => {
        return dataMahasiswa?.nilai_ppkpm > 68;
    }, [dataMahasiswa]);

    const getIndexNilai = (score) => {
        if (score >= 85) return "A";
        if (score >= 80) return "A-";
        if (score >= 75) return "B+";
        if (score >= 70) return "B";
        if (score >= 65) return "B-";
        if (score >= 60) return "C+";
        if (score >= 55) return "C";
        if (score >= 50) return "C-";
        if (score >= 45) return "D";
        return "E";
    };

    return (
        <ThemeProvider theme={theme}>
            <Head title="Nilai PPKPM" />
            <Header />

            {/* Notification Snackbar */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                TransitionComponent={Fade}
            >
                <Alert
                    onClose={handleCloseNotification}
                    severity={notification.severity}
                    variant="filled"
                    sx={{
                        borderRadius: 2,
                        fontWeight: 500,
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            {/* Loading Overlay */}
            {loading && <LoadingOverlay />}

            <main className="min-h-screen bg-gray-50 pt-20 pb-20">
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {/* Header Section */}
                    <Box sx={{ mb: 4 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                                    Nilai PPKPM
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Hasil evaluasi pembelajaran dan pengabdian
                                </Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Overall Status Card */}
                    {dataMahasiswa && (
                        <Zoom in={true}>
                            <Card 
                                elevation={3} 
                                sx={{ 
                                    mb: 4, 
                                    backgroundColor: isLulus ? "success.50" : "error.50",
                                    border: "2px solid",
                                    borderColor: isLulus ? "success.200" : "error.200",
                                }}
                            >
                                <CardContent sx={{ p: 3 }}>
                                    <Grid container alignItems="center" spacing={3}>
                                        <Grid item xs={12} md={8}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                <EmojiEvents sx={{ fontSize: 40, color: isLulus ? "success.main" : "error.main" }} />
                                                <Box>
                                                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                                                        Status Kelulusan
                                                    </Typography>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                                        <StatusIndicator 
                                                            status={isLulus ? "lulus" : "tidak lulus"} 
                                                            label={isLulus ? "Selamat! Anda Lulus" : "Anda Tidak Lulus"}
                                                        />
                                                        <Typography variant="body2" color="text.secondary">
                                                            Nilai akhir: {dataMahasiswa.nilai_ppkpm || 0}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
                                                {isLulus && dataMahasiswa.open_print_certificate && (
                                                    <Button
                                                        variant="contained"
                                                        startIcon={<Print />}
                                                        onClick={handlePrintCertificate}
                                                        sx={{
                                                            borderRadius: 2,
                                                            textTransform: "none",
                                                            fontWeight: 600,
                                                            px: 4,
                                                        }}
                                                    >
                                                        Cetak Sertifikat
                                                    </Button>
                                                )}
                                                {isLulus && !dataMahasiswa.open_print_certificate && (
                                                    <Tooltip title="Cetak sertifikat akan dibuka pada waktu yang ditentukan">
                                                        <span>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<Download />}
                                                                disabled
                                                                sx={{
                                                                    borderRadius: 2,
                                                                    textTransform: "none",
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                Belum Dibuka
                                                            </Button>
                                                        </span>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Zoom>
                    )}

                    {/* Nilai Details Grid */}
                    <Grid container spacing={3}>
                        {/* PPL Score Card */}
                        {(dataMahasiswa?.cluster_kegiatan === "PPKPM" || 
                          dataMahasiswa?.cluster_kegiatan === "PPL") && (
                            <Grid item xs={12} md={6}>
                                <ScoreCard
                                    title="Praktik Pengalaman Lapangan"
                                    subtitle={dataMahasiswa?.nama_tempat_ppl}
                                    icon={School}
                                    score={dataMahasiswa?.SM_PPL || 0}
                                    color="primary"
                                    details={[
                                        { label: "Nilai Pamong", value: dataMahasiswa?.nilai_pamong || 0 },
                                        { label: "Nilai Supervisor", value: dataMahasiswa?.nilai_supervisor_ppl || 0 },
                                    ]}
                                />
                            </Grid>
                        )}

                        {/* KPM Score Card */}
                        {(dataMahasiswa?.cluster_kegiatan === "PPKPM" || 
                          dataMahasiswa?.cluster_kegiatan === "KPM") && (
                            <Grid item xs={12} md={6}>
                                <ScoreCard
                                    title="Kuliah Pengabdian Masyarakat"
                                    subtitle={dataMahasiswa?.nama_tempat_kpm}
                                    icon={Home}
                                    score={dataMahasiswa?.SM_KPM || 0}
                                    color="secondary"
                                    details={[
                                        { label: "Nilai Keuchik", value: dataMahasiswa?.nilai_keuchik || 0 },
                                        { label: "Nilai Supervisor", value: dataMahasiswa?.nilai_supervisor_kpm || 0 },
                                    ]}
                                />
                            </Grid>
                        )}

                        {/* Final Score Card */}
                        {dataMahasiswa && (
                            <Grid item xs={12} md={6}>
                                <Card elevation={2} sx={{ height: "100%" }}>
                                    <CardContent sx={{ p: 3 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                                            <Box
                                                sx={{
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    bgcolor: "primary.50",
                                                    color: "primary.main",
                                                }}
                                            >
                                                <Grade sx={{ fontSize: 24 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                                    Nilai Akhir
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Hasil akhir PPKPM
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ textAlign: "center", mb: 3 }}>
                                            <Typography variant="h1" sx={{ 
                                                fontWeight: 700, 
                                                color: isLulus ? "success.main" : "error.main",
                                                mb: 1
                                            }}>
                                                {dataMahasiswa.nilai_ppkpm || 0}
                                            </Typography>
                                            <Typography variant="h5" color="text.secondary">
                                                {getIndexNilai(dataMahasiswa.nilai_ppkpm)}
                                            </Typography>
                                        </Box>

                                        <Divider sx={{ my: 2 }} />

                                        <Grid container spacing={2}>
                                            <Grid item xs={6}>
                                                <Box sx={{ textAlign: "center" }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Status
                                                    </Typography>
                                                    <Box sx={{ mt: 1 }}>
                                                        <StatusIndicator 
                                                            status={isLulus ? "lulus" : "tidak lulus"}
                                                        />
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <Box sx={{ textAlign: "center" }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Batas Kelulusan
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
                                                        68
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {/* Info Panel */}
                        <Grid item xs={12} md={6}>
                            <Card elevation={2}>
                                <CardContent sx={{ p: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "primary.main" }}>
                                        Informasi Penting
                                    </Typography>
                                    
                                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                        <Paper elevation={0} sx={{ p: 2, bgcolor: "info.50", borderRadius: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                                <Info sx={{ color: "info.main", mt: 0.5 }} />
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        Periode Cetak Sertifikat
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Sertifikat hanya dapat dicetak dalam periode yang telah ditentukan
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>

                                        <Paper elevation={0} sx={{ p: 2, bgcolor: "warning.50", borderRadius: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                                <Warning sx={{ color: "warning.main", mt: 0.5 }} />
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        Keabsahan Nilai
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Nilai yang ditampilkan adalah nilai resmi dan final
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>

                                        <Paper elevation={0} sx={{ p: 2, bgcolor: "success.50", borderRadius: 2 }}>
                                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
                                                <CheckCircle sx={{ color: "success.main", mt: 0.5 }} />
                                                <Box>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                        Kriteria Kelulusan
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Minimal nilai 68 untuk dinyatakan lulus
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </main>

            <ButtomFooter />
            <Navigation />
        </ThemeProvider>
    );
};

export default Nilai;