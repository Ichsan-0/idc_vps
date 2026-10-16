import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Container,
    Chip,
    Button,
    Paper,
    Avatar,
    AvatarGroup,
    alpha,
    Fade,
    Zoom,
    CircularProgress,
} from "@mui/material";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useState } from "react";
import { Head, router } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import Footer from "@/Components/frontpage/Footer";
import Navigation from "@/Components/Mahasiswa/Navigation";
import {
    Class,
    Assignment,
    School,
    Groups,
    CalendarMonth,
    ArrowForward,
    TrendingUp,
    LocationOn,
    CheckCircle,
} from "@mui/icons-material";
import ButtomFooter from "@/Components/frontpage/ButtomFooter";


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
        info: {
            main: "#0288d1",
            light: "#03a9f4",
        },
        warning: {
            main: "#ed6c02",
            light: "#ff9800",
        },
        background: {
            default: "#f8fafc",
            paper: "#ffffff",
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
        borderRadius: 16,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 16,
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                },
            },
        },
    },
});

// Styled Components
const GradientCard = styled(Card)(({ theme, color = "primary" }) => ({
    position: "relative",
    overflow: "hidden",
    background: `linear-gradient(135deg, ${theme.palette[color].light}20, ${theme.palette[color].main}10)`,
    border: `1px solid ${theme.palette[color].light}30`,
    "&:hover": {
        transform: "translateY(-8px)",
        boxShadow: `0 12px 40px ${alpha(theme.palette[color].main, 0.15)}`,
        borderColor: theme.palette[color].main,
        "& .MuiCardMedia-root": {
            transform: "scale(1.05)",
        },
        "& .enter-button": {
            opacity: 1,
            transform: "translateY(0)",
        },
    },
}));

const StyledCardMedia = styled(CardMedia)(({ theme }) => ({
    height: 160,
    position: "relative",
    transition: "transform 0.6s ease",
    "&::after": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.4))",
    },
}));

const ProgramBadge = ({ type }) => {
    const config = {
        kpm: {
            label: "KPM",
            color: "secondary",
            icon: <Groups />,
        },
        ppl: {
            label: "PPL",
            color: "info",
            icon: <School />,
        },
    };

    const { label, color, icon } = config[type] || config.kpm;

    return (
        <Chip
            icon={icon}
            label={label}
            color={color}
            size="small"
            sx={{
                borderRadius: 2,
                fontWeight: 600,
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                boxShadow: 2,
            }}
        />
    );
};

const ClassroomCard = ({ classroom, type }) => {
    const isKPM = type === "kpm";
    const programColor = isKPM ? "secondary" : "info";
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = () => {
        if (isNavigating) return;
        setIsNavigating(true);
        if (isKPM) {
            router.visit(`/student/classroom/${classroom.id}/task`, {
                onFinish: () => setIsNavigating(false),
            });
        } else {
            router.visit(`/student/classroom-ppl/tasks`, {
                onFinish: () => setIsNavigating(false),
            });
        }
    };

    return (
        <Zoom in={true}>
            <GradientCard color={programColor} elevation={2} sx={{ position: "relative" }}>
                {/* Local Card Loading Overlay */}
                {isNavigating && (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 10,
                            backgroundColor: "rgba(255, 255, 255, 0.8)",
                            backdropFilter: "blur(2px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                        }}
                    >
                        <CircularProgress size={32} color={programColor} />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                            Membuka Kelas...
                        </Typography>
                    </Box>
                )}

                {/* Badge */}
                <ProgramBadge type={type} />

                {/* Card Media */}
                <Box sx={{ position: "relative", overflow: "hidden" }}>
                    <StyledCardMedia
                        image="/assets/img_backtoschool.jpg"
                        title={classroom.nama_tempat}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 2,
                                background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)",
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "white",
                                    fontWeight: 600,
                                    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                                }}
                            >
                                {classroom.nama_tempat}
                            </Typography>
                        </Box>
                    </StyledCardMedia>
                </Box>

                {/* Card Content */}
                <CardContent sx={{ p: 3 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                            }}
                        >
                            <CalendarMonth fontSize="small" />
                            {classroom.nama_gelombang}
                        </Typography>

                        {classroom.lokasi && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 2,
                                }}
                            >
                                <LocationOn fontSize="small" />
                                {classroom.lokasi}
                            </Typography>
                        )}

                        {/* Stats */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                mt: 2,
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Assignment
                                    sx={{
                                        fontSize: 20,
                                        color: `${programColor}.main`,
                                    }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    {classroom.jumlah_tugas || 0} Tugas
                                </Typography>
                            </Box>

                            {classroom.jumlah_peserta && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <AvatarGroup
                                        max={3}
                                        sx={{
                                            "& .MuiAvatar-root": {
                                                width: 28,
                                                height: 28,
                                                fontSize: 12,
                                            },
                                        }}
                                    >
                                        {[...Array(Math.min(classroom.jumlah_peserta, 3))].map(
                                            (_, i) => (
                                                <Avatar
                                                    key={i}
                                                    sx={{
                                                        bgcolor: `${programColor}.light`,
                                                        color: `${programColor}.contrastText`,
                                                    }}
                                                >
                                                    {i + 1}
                                                </Avatar>
                                            )
                                        )}
                                    </AvatarGroup>
                                    <Typography variant="body2" color="text.secondary">
                                        {classroom.jumlah_peserta} Peserta
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* Enter Button */}
                    <Box sx={{ mt: 2 }}>
                        <Button
                            fullWidth
                            variant="contained"
                            disabled={isNavigating}
                            endIcon={!isNavigating ? <ArrowForward /> : null}
                            onClick={handleClick}
                            sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                py: 1.2,
                                background: `linear-gradient(135deg, ${theme.palette[programColor].main}, ${theme.palette[programColor].dark})`,
                                "&:hover": {
                                    background: `linear-gradient(135deg, ${theme.palette[programColor].dark}, ${theme.palette[programColor].main})`,
                                    boxShadow: `0 4px 20px ${alpha(theme.palette[programColor].main, 0.3)}`,
                                },
                            }}
                        >
                            {isNavigating ? "Membuka Kelas..." : "Masuk Kelas"}
                        </Button>
                    </Box>
                </CardContent>
            </GradientCard>
        </Zoom>
    );
};

const EmptyState = () => (
    <Fade in={true}>
        <Paper
            elevation={0}
            sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 3,
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            }}
        >
            <Class sx={{ fontSize: 80, color: "primary.light", mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
                Belum ada kelas yang tersedia
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Anda belum terdaftar dalam kelas KPM atau PPL
            </Typography>
            <Button
                variant="outlined"
                onClick={() => router.visit("/kpm-vacancies")}
                startIcon={<TrendingUp />}
                sx={{ borderRadius: 2 }}
            >
                Lihat Lowongan Tersedia
            </Button>
        </Paper>
    </Fade>
);

const ClassroomKPM = ({ flash, data }) => {
    const hasClassrooms = (data?.classroom_kpm?.length || 0) + (data?.classroom_ppl?.length || 0) > 0;

    return (
        <ThemeProvider theme={theme}>
            <Head title="Kelas - PPKPM" />
            <Header />

            <Box className="min-h-screen  pt-20 pb-20">
                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {/* Header */}
                    <Box sx={{ mb: 6 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: "primary.main" }}>
                                    Kelas Virtual
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                    Akses materi, tugas, dan aktivitas pembelajaran
                                </Typography>
                            </Box>
                        </Box>

                        {/* Stats */}
                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                            <Chip
                                icon={<Groups />}
                                label={`${data?.classroom_kpm?.length || 0} Kelas KPM`}
                                color="secondary"
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                            />
                            <Chip
                                icon={<School />}
                                label={`${data?.classroom_ppl?.length || 0} Kelas PPL`}
                                color="info"
                                variant="outlined"
                                sx={{ borderRadius: 2 }}
                            />
                        </Box>
                    </Box>

                    {/* Classroom Grid */}
                    {hasClassrooms ? (
                        <Grid container spacing={3}>
                            {/* KPM Classrooms */}
                            {data?.classroom_kpm?.map((classroom, index) => (
                                <Grid item xs={12} sm={6} md={4} key={`kpm-${classroom.id}-${index}`}>
                                    <ClassroomCard classroom={classroom} type="kpm" />
                                </Grid>
                            ))}

                            {/* PPL Classrooms */}
                            {data?.classroom_ppl?.map((classroom, index) => (
                                <Grid item xs={12} sm={6} md={4} key={`ppl-${classroom.id}-${index}`}>
                                    <ClassroomCard classroom={classroom} type="ppl" />
                                </Grid>
                            ))}
                        </Grid>
                    ) : (
                        <EmptyState />
                    )}

                    {/* Info Section */}
                    {/* {hasClassrooms && (
                        <Fade in={true}>
                            <Paper
                                elevation={0}
                                sx={{
                                    mt: 6,
                                    p: 3,
                                    borderRadius: 3,
                                    background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                                    border: "1px solid",
                                    borderColor: "primary.light",
                                }}
                            >
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={12} md={8}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                                            Informasi Kelas Virtual
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Akses semua materi pembelajaran, kumpulkan tugas, dan pantau progress
                                            pembelajaran Anda melalui kelas virtual ini.
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <Box sx={{ display: "flex", justifyContent: { md: "flex-end" } }}>
                                            <Button
                                                variant="outlined"
                                                startIcon={<CheckCircle />}
                                                onClick={() => router.visit("/student/guide")}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Panduan Penggunaan
                                            </Button>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>
                        </Fade>
                    )} */}
                </Container>
            </Box>

            <ButtomFooter />
            <Navigation />
        </ThemeProvider>
    );
};

export default ClassroomKPM;