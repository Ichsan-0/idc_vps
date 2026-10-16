import React, { useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CardMedia,
    Typography,
    Grid,
    Chip,
    Button,
    Paper,
    alpha,
    Fade,
    Zoom,
    CircularProgress,
    Tabs,
    Tab,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Head, router } from "@inertiajs/react";
import HomeClassroomLayout from "@/Layouts/SupervisorKPM/Classroom/HomeClassroomLayout";
import {
    Groups,
    School,
    CalendarMonth,
    ArrowForward,
    Class as ClassIcon,
    LocationOn,
    CheckCircleOutline,
    History,
    PlayCircleOutline,
} from "@mui/icons-material";

const GradientCard = styled(Card)(({ theme, color = "primary" }) => ({
    position: "relative",
    overflow: "hidden",
    borderRadius: 16,
    border: `1px solid ${theme.palette[color].light}30`,
    background: `linear-gradient(135deg, ${theme.palette[color].light}15, ${theme.palette[color].main}08)`,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    "&:hover": {
        transform: "translateY(-6px)",
        boxShadow: `0 12px 36px ${alpha(theme.palette[color].main, 0.16)}`,
        borderColor: theme.palette[color].main,
        "& .MuiCardMedia-root": {
            transform: "scale(1.04)",
        },
    },
}));

const StyledCardMedia = styled(CardMedia)({
    height: 150,
    position: "relative",
    transition: "transform 0.5s ease",
    "&::after": {
        content: '""',
        position: "absolute",
        inset: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.65))",
    },
});

const SupervisorKPMCard = ({ item, isLatest }) => {
    const theme = useTheme();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = () => {
        if (isNavigating) return;
        setIsNavigating(true);
        router.visit(`/supervisor-kpm/classroom/${item.id}/task`, {
            onFinish: () => setIsNavigating(false),
        });
    };

    return (
        <Zoom in={true}>
            <GradientCard color="secondary" elevation={1}>
                {/* Local Loading Overlay */}
                {isNavigating && (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 20,
                            backgroundColor: "rgba(255, 255, 255, 0.85)",
                            backdropFilter: "blur(2px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                        }}
                    >
                        <CircularProgress size={30} color="secondary" />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                            Membuka Kelas...
                        </Typography>
                    </Box>
                )}

                {/* Top Badges */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        display: "flex",
                        gap: 1,
                    }}
                >
                    <Chip
                        icon={isLatest ? <CheckCircleOutline /> : <History />}
                        label={isLatest ? "Aktif" : "Selesai"}
                        size="small"
                        color={isLatest ? "success" : "default"}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            boxShadow: 1,
                            backgroundColor: isLatest ? undefined : "rgba(255,255,255,0.92)",
                        }}
                    />
                    <Chip
                        icon={<Groups />}
                        label="KPM"
                        color="secondary"
                        size="small"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            boxShadow: 1,
                        }}
                    />
                </Box>

                {/* Media Banner */}
                <Box sx={{ position: "relative", overflow: "hidden" }}>
                    <StyledCardMedia
                        image="/assets/img_backtoschool.jpg"
                        title={item.name}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 2,
                                zIndex: 1,
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: "1.05rem",
                                    lineHeight: 1.3,
                                    textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                                }}
                            >
                                {item.name}
                            </Typography>
                        </Box>
                    </StyledCardMedia>
                </Box>

                {/* Card Content */}
                <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                                fontSize: "0.85rem",
                            }}
                        >
                            <CalendarMonth fontSize="small" sx={{ color: "secondary.main" }} />
                            <span>{item?.gelombang?.name || "Periode KPM"}</span>
                        </Typography>

                        {item.lokasi && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    fontSize: "0.85rem",
                                }}
                            >
                                <LocationOn fontSize="small" sx={{ color: "secondary.main" }} />
                                <span>{item.lokasi}</span>
                            </Typography>
                        )}
                    </Box>

                    {/* Action Button */}
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
                            py: 1,
                            background: isLatest
                                ? `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`
                                : `linear-gradient(135deg, #64748b, #475569)`,
                            "&:hover": {
                                background: isLatest
                                    ? `linear-gradient(135deg, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`
                                    : `linear-gradient(135deg, #475569, #334155)`,
                                boxShadow: `0 4px 16px ${alpha(isLatest ? theme.palette.secondary.main : "#64748b", 0.35)}`,
                            },
                        }}
                    >
                        {isNavigating
                            ? "Membuka Kelas..."
                            : isLatest
                            ? "Buka Kelas KPM"
                            : "Lihat Riwayat Kelas"}
                    </Button>
                </CardContent>
            </GradientCard>
        </Zoom>
    );
};

const SupervisorPPLCard = ({ item, isLatest }) => {
    const theme = useTheme();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = () => {
        if (isNavigating) return;
        setIsNavigating(true);
        router.visit(`/supervisor-ppl/classroom/${item.id}`, {
            onFinish: () => setIsNavigating(false),
        });
    };

    return (
        <Zoom in={true}>
            <GradientCard color="info" elevation={1}>
                {/* Local Loading Overlay */}
                {isNavigating && (
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 20,
                            backgroundColor: "rgba(255, 255, 255, 0.85)",
                            backdropFilter: "blur(2px)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1,
                        }}
                    >
                        <CircularProgress size={30} color="info" />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                            Membuka Sekolah...
                        </Typography>
                    </Box>
                )}

                {/* Top Badges */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        zIndex: 2,
                        display: "flex",
                        gap: 1,
                    }}
                >
                    <Chip
                        icon={isLatest ? <CheckCircleOutline /> : <History />}
                        label={isLatest ? "Aktif" : "Selesai"}
                        size="small"
                        color={isLatest ? "success" : "default"}
                        sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            boxShadow: 1,
                            backgroundColor: isLatest ? undefined : "rgba(255,255,255,0.92)",
                        }}
                    />
                    <Chip
                        icon={<School />}
                        label="PPL"
                        color="info"
                        size="small"
                        sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            boxShadow: 1,
                        }}
                    />
                </Box>

                {/* Media Banner */}
                <Box sx={{ position: "relative", overflow: "hidden" }}>
                    <StyledCardMedia
                        image="/assets/img_backtoschool.jpg"
                        title={item.name}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                p: 2,
                                zIndex: 1,
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: "1.05rem",
                                    lineHeight: 1.3,
                                    textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                                }}
                            >
                                {item.name}
                            </Typography>
                        </Box>
                    </StyledCardMedia>
                </Box>

                {/* Card Content */}
                <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ mb: 2 }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                                fontSize: "0.85rem",
                            }}
                        >
                            <CalendarMonth fontSize="small" sx={{ color: "info.main" }} />
                            <span>{item?.gelombang?.name || "Periode PPL"}</span>
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                fontSize: "0.85rem",
                            }}
                        >
                            <School fontSize="small" sx={{ color: "info.main" }} />
                            <span>
                                {item?.alamat_sekolah || "Sekolah Mitra Praktik Pengalaman Lapangan"}
                            </span>
                        </Typography>
                    </Box>

                    {/* Action Button */}
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
                            py: 1,
                            background: isLatest
                                ? `linear-gradient(135deg, ${theme.palette.info.main}, ${theme.palette.info.dark})`
                                : `linear-gradient(135deg, #64748b, #475569)`,
                            "&:hover": {
                                background: isLatest
                                    ? `linear-gradient(135deg, ${theme.palette.info.dark}, ${theme.palette.info.main})`
                                    : `linear-gradient(135deg, #475569, #334155)`,
                                boxShadow: `0 4px 16px ${alpha(isLatest ? theme.palette.info.main : "#64748b", 0.35)}`,
                            },
                        }}
                    >
                        {isNavigating
                            ? "Membuka..."
                            : isLatest
                            ? "Lihat Mahasiswa PPL"
                            : "Lihat Riwayat & Nilai"}
                    </Button>
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
                borderRadius: 4,
                border: "1px dashed #cbd5e1",
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
            }}
        >
            <ClassIcon sx={{ fontSize: 72, color: "primary.light", mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}>
                Belum Ada Kelas Bimbingan
            </Typography>
            <Typography variant="body2" color="text.secondary">
                Anda belum ditugaskan sebagai supervisor untuk kelas KPM atau sekolah PPL saat ini.
            </Typography>
        </Paper>
    </Fade>
);

const Home = ({ kelas = [], kelas_ppl = [], latestGelombang }) => {
    const [tabFilter, setTabFilter] = useState("all");

    // Partition classes into Active (Tahun Berjalan) vs Finished (Selesai)
    const activeKpm = kelas.filter((item) => item.id_gelombang == latestGelombang?.id);
    const finishedKpm = kelas.filter((item) => item.id_gelombang != latestGelombang?.id);

    const activePpl = kelas_ppl.filter((item) => item.id_gelombang == latestGelombang?.id);
    const finishedPpl = kelas_ppl.filter((item) => item.id_gelombang != latestGelombang?.id);

    const totalActive = activeKpm.length + activePpl.length;
    const totalFinished = finishedKpm.length + finishedPpl.length;
    const totalAll = (kelas?.length || 0) + (kelas_ppl?.length || 0);

    return (
        <HomeClassroomLayout>
            <Head title="Portal Supervisor - Kelas Bimbingan" />

            <Box sx={{ width: "100%", py: 2 }}>
                {/* Header Title Section */}
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2.5 }}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                color: "primary.main",
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Portal Supervisor
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Kelola bimbingan kelas KPM dan penilaian sekolah mitra PPL mahasiswa Anda
                        </Typography>
                    </Box>

                    {/* Stats & Badge Pills */}
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                        <Chip
                            icon={<Groups />}
                            label={`${kelas?.length || 0} Kelas KPM`}
                            color="secondary"
                            variant="outlined"
                            sx={{ borderRadius: 2, fontWeight: 600 }}
                        />
                        <Chip
                            icon={<School />}
                            label={`${kelas_ppl?.length || 0} Sekolah PPL`}
                            color="info"
                            variant="outlined"
                            sx={{ borderRadius: 2, fontWeight: 600 }}
                        />
                        <Chip
                            icon={<CheckCircleOutline />}
                            label={`${totalActive} Aktif (Tahun Berjalan)`}
                            color="success"
                            variant="filled"
                            sx={{ borderRadius: 2, fontWeight: 600 }}
                        />
                        <Chip
                            icon={<History />}
                            label={`${totalFinished} Selesai`}
                            variant="outlined"
                            sx={{
                                borderRadius: 2,
                                fontWeight: 600,
                                borderColor: "#cbd5e1",
                                color: "text.secondary",
                            }}
                        />
                    </Box>
                </Box>

                {/* Filter Tabs */}
                {totalAll > 0 && (
                    <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
                        <Tabs
                            value={tabFilter}
                            onChange={(e, val) => setTabFilter(val)}
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    minHeight: 48,
                                    px: 2.5,
                                },
                            }}
                        >
                            <Tab
                                label={`Semua Kelas (${totalAll})`}
                                value="all"
                            />
                            <Tab
                                icon={<CheckCircleOutline sx={{ fontSize: 18 }} />}
                                iconPosition="start"
                                label={`Tahun Berjalan (${totalActive})`}
                                value="active"
                            />
                            <Tab
                                icon={<History sx={{ fontSize: 18 }} />}
                                iconPosition="start"
                                label={`Sudah Selesai (${totalFinished})`}
                                value="finished"
                            />
                        </Tabs>
                    </Box>
                )}

                {totalAll > 0 ? (
                    <>
                        {/* SECTION 1: Tahun Berjalan / Belum Selesai (Aktif) */}
                        {(tabFilter === "all" || tabFilter === "active") && (
                            <Box
                                component="section"
                                sx={{
                                    mb: 5,
                                    p: { xs: 2.5, md: 3.5 },
                                    borderRadius: 4,
                                    backgroundColor: "#ffffff",
                                    border: "1px solid",
                                    borderColor: "rgba(0, 138, 1, 0.18)",
                                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                                }}
                            >
                                {/* Section Header */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        alignItems: { xs: "flex-start", sm: "center" },
                                        justifyContent: "space-between",
                                        gap: 1.5,
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: "1px solid #f1f5f9",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                bgcolor: alpha("#008a01", 0.1),
                                                color: "#008a01",
                                            }}
                                        >
                                            <PlayCircleOutline sx={{ fontSize: 26 }} />
                                        </Box>
                                        <Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                    Kelas Berjalan (Tahun Berjalan)
                                                </Typography>
                                                <Chip
                                                    label={`${totalActive} Aktif`}
                                                    size="small"
                                                    color="success"
                                                    sx={{ fontWeight: 700, fontSize: "0.75rem", height: 24 }}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {latestGelombang
                                                    ? `Periode Aktif: ${latestGelombang.name}`
                                                    : "Kelas bimbingan dan sekolah mitra yang sedang berjalan"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Active Grid */}
                                {totalActive > 0 ? (
                                    <Grid container spacing={3}>
                                        {/* Active KPM */}
                                        {activeKpm.map((item) => (
                                            <Grid item xs={12} sm={6} md={4} key={`kpm-act-${item.id}`}>
                                                <SupervisorKPMCard item={item} isLatest={true} />
                                            </Grid>
                                        ))}

                                        {/* Active PPL */}
                                        {activePpl.map((item) => (
                                            <Grid item xs={12} sm={6} md={4} key={`ppl-act-${item.id}`}>
                                                <SupervisorPPLCard item={item} isLatest={true} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Box
                                        sx={{
                                            p: 4,
                                            textAlign: "center",
                                            borderRadius: 3,
                                            bgcolor: "#f8fafc",
                                            border: "1px dashed #e2e8f0",
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Tidak ada kelas bimbingan atau sekolah mitra untuk periode berjalan saat ini.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* SECTION 2: Sudah Selesai (Riwayat Periode Sebelumnya) */}
                        {(tabFilter === "all" || tabFilter === "finished") && (
                            <Box
                                component="section"
                                sx={{
                                    mb: 4,
                                    p: { xs: 2.5, md: 3.5 },
                                    borderRadius: 4,
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                                }}
                            >
                                {/* Section Header */}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: { xs: "column", sm: "row" },
                                        alignItems: { xs: "flex-start", sm: "center" },
                                        justifyContent: "space-between",
                                        gap: 1.5,
                                        mb: 3,
                                        pb: 2,
                                        borderBottom: "1px solid #f1f5f9",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: "12px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                bgcolor: alpha("#64748b", 0.1),
                                                color: "#64748b",
                                            }}
                                        >
                                            <History sx={{ fontSize: 26 }} />
                                        </Box>
                                        <Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                    Riwayat Kelas Selesai
                                                </Typography>
                                                <Chip
                                                    label={`${totalFinished} Selesai`}
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 700,
                                                        fontSize: "0.75rem",
                                                        height: 24,
                                                        bgcolor: "#f1f5f9",
                                                        color: "#475569",
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                Arsip kelas bimbingan KPM dan penilaian sekolah mitra PPL dari periode gelombang sebelumnya
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {/* Finished Grid */}
                                {totalFinished > 0 ? (
                                    <Grid container spacing={3}>
                                        {/* Finished KPM */}
                                        {finishedKpm.map((item) => (
                                            <Grid item xs={12} sm={6} md={4} key={`kpm-fin-${item.id}`}>
                                                <SupervisorKPMCard item={item} isLatest={false} />
                                            </Grid>
                                        ))}

                                        {/* Finished PPL */}
                                        {finishedPpl.map((item) => (
                                            <Grid item xs={12} sm={6} md={4} key={`ppl-fin-${item.id}`}>
                                                <SupervisorPPLCard item={item} isLatest={false} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                ) : (
                                    <Box
                                        sx={{
                                            p: 4,
                                            textAlign: "center",
                                            borderRadius: 3,
                                            bgcolor: "#f8fafc",
                                            border: "1px dashed #e2e8f0",
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Belum ada riwayat kelas bimbingan atau sekolah mitra yang sudah selesai.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </>
                ) : (
                    <EmptyState />
                )}
            </Box>
        </HomeClassroomLayout>
    );
};

export default Home;
