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
    Zoom,
    CircularProgress,
    Tabs,
    Tab,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { Head, router, Link } from "@inertiajs/react";
import OperatorSekolahLayout from "@/Layouts/OperatorSekolahLayout";
import {
    School,
    CalendarMonth,
    ArrowForward,
    LocationOn,
    CheckCircleOutline,
    History,
    PlayCircleOutline,
    SupervisorAccount,
    Badge,
    Groups,
    MenuBook,
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

const SekolahPPLCard = ({ item, isLatest }) => {
    const theme = useTheme();
    const [isNavigating, setIsNavigating] = useState(false);

    const handleClick = () => {
        if (isNavigating) return;
        setIsNavigating(true);
        router.visit(`/operator-sekolah/classroom/${item.id}`, {
            onFinish: () => setIsNavigating(false),
        });
    };

    return (
        <Zoom in={true}>
            <GradientCard color="primary" elevation={1}>
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
                        <CircularProgress size={30} color="primary" />
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                            Membuka Kelas PPL...
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
                        color="primary"
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
                                    lineHeight: 1.25,
                                    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                                }}
                            >
                                {item.name}
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                <LocationOn sx={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }} />
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "rgba(255,255,255,0.9)",
                                        fontSize: "0.75rem",
                                    }}
                                >
                                    Sekolah Mitra PPL
                                </Typography>
                            </Box>
                        </Box>
                    </StyledCardMedia>
                </Box>

                {/* Card Body */}
                <CardContent sx={{ p: 2.25, display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {/* Gelombang / Periode */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CalendarMonth color="action" sx={{ fontSize: 16 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem" }}>
                            {item.gelombang?.name || "Semester Aktif"}
                        </Typography>
                    </Box>

                    {/* Dosen Supervisor */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <SupervisorAccount sx={{ fontSize: 16, color: "#06359f" }} />
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                color: "text.primary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Supervisor: {item.nama_supervisor || "Belum Ditugaskan"}
                        </Typography>
                    </Box>

                    {/* Kepala Sekolah */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Badge sx={{ fontSize: 16, color: "#0288d1" }} />
                        <Typography
                            variant="body2"
                            sx={{
                                fontSize: "0.82rem",
                                color: item.nama_kepsek ? "text.primary" : "text.secondary",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                            }}
                        >
                            Kepsek: {item.nama_kepsek || "Belum Ada Data Ampraham"}
                        </Typography>
                    </Box>

                    {/* Stats Box: Mahasiswa & Pamong */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            bgcolor: alpha(theme.palette.primary.main, 0.06),
                            borderRadius: 2,
                            px: 1.5,
                            py: 0.75,
                            mt: 0.5,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <Groups sx={{ fontSize: 18, color: "primary.main" }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                Mahasiswa: <strong style={{ color: "#06359f" }}>{item.total_mahasiswa || 0}</strong>
                            </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                            <MenuBook sx={{ fontSize: 16, color: "#008a01" }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
                                Pamong: <strong style={{ color: "#008a01" }}>{item.total_pamong || 0}</strong>
                            </Typography>
                        </Box>
                    </Box>

                    {/* Open Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        endIcon={<ArrowForward />}
                        onClick={handleClick}
                        disabled={isNavigating}
                        sx={{
                            mt: 0.75,
                            borderRadius: 2.5,
                            textTransform: "none",
                            fontWeight: 700,
                            py: 0.9,
                            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                        }}
                    >
                        {isNavigating ? "Membuka..." : "Buka Monitoring & Kelas"}
                    </Button>
                </CardContent>
            </GradientCard>
        </Zoom>
    );
};

const Dashboard = ({
    kelas_ppl = [],
    sekolahInfo,
    latestGelombang,
    data_opt,
    totalPamong = 0,
    totalMahasiswa = 0,
}) => {
    const theme = useTheme();
    const [tabFilter, setTabFilter] = useState("all");

    // Filter Active vs Finished
    const activeClasses = (kelas_ppl || []).filter(
        (item) => item.id_gelombang === latestGelombang?.id || item.gelombang?.active === 1
    );
    const finishedClasses = (kelas_ppl || []).filter(
        (item) => item.id_gelombang !== latestGelombang?.id && item.gelombang?.active !== 1
    );

    const totalActive = activeClasses.length;
    const totalFinished = finishedClasses.length;
    const totalAll = (kelas_ppl || []).length;

    const schoolName = sekolahInfo?.name || "Sekolah Mitra";

    return (
        <OperatorSekolahLayout>
            <Head title={`Portal Admin Sekolah - ${schoolName}`} />

            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pb: 6 }}>
                {/* Hero / Welcome Banner */}
                <Paper
                    elevation={0}
                    sx={{
                        p: { xs: 3, md: 4 },
                        borderRadius: 4,
                        background: "linear-gradient(135deg, #06359f 0%, #1545b5 60%, #0288d1 100%)",
                        color: "white",
                        boxShadow: "0 10px 30px rgba(6, 53, 159, 0.2)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            position: "absolute",
                            right: -20,
                            bottom: -20,
                            opacity: 0.12,
                            transform: "rotate(-10deg)",
                            pointerEvents: "none",
                        }}
                    >
                        <School sx={{ fontSize: 260 }} />
                    </Box>

                    <Box sx={{ position: "relative", zIndex: 1, maxWidth: "750px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                            <Chip
                                label="Admin Sekolah Portal"
                                size="small"
                                sx={{
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: "0.75rem",
                                    backdropFilter: "blur(4px)",
                                }}
                            />
                            {latestGelombang && (
                                <Chip
                                    label={latestGelombang.name}
                                    size="small"
                                    sx={{
                                        bgcolor: "rgba(0, 200, 83, 0.25)",
                                        color: "#b9f6ca",
                                        fontWeight: 700,
                                        fontSize: "0.75rem",
                                        border: "1px solid rgba(185, 246, 202, 0.4)",
                                    }}
                                />
                            )}
                        </Box>

                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: "1.75rem", md: "2.25rem" },
                                letterSpacing: "-0.02em",
                                mb: 1,
                            }}
                        >
                            Portal {schoolName}
                        </Typography>

                        <Typography
                            variant="body1"
                            sx={{
                                color: "rgba(255,255,255,0.9)",
                                fontSize: { xs: "0.92rem", md: "1rem" },
                                lineHeight: 1.6,
                                mb: 3,
                            }}
                        >
                            Pantau mahasiswa Praktik Pengalaman Lapangan (PPL) yang ditempatkan di sekolah ini,
                            monitoring tugas dan laporan, serta kelola administrasi Kepala Sekolah dan Guru Pamong.
                        </Typography>

                        {/* Quick Stats Grid */}
                        <Grid container spacing={2}>
                            <Grid item xs={6} sm={3}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2.5,
                                        bgcolor: "rgba(255,255,255,0.12)",
                                        backdropFilter: "blur(6px)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                                        Periode Kelas PPL
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
                                        {totalAll}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={6} sm={3}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2.5,
                                        bgcolor: "rgba(255,255,255,0.12)",
                                        backdropFilter: "blur(6px)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                                        Mahasiswa PPL
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
                                        {totalMahasiswa}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={6} sm={3}>
                                <Box
                                    sx={{
                                        p: 1.5,
                                        borderRadius: 2.5,
                                        bgcolor: "rgba(255,255,255,0.12)",
                                        backdropFilter: "blur(6px)",
                                        border: "1px solid rgba(255,255,255,0.2)",
                                    }}
                                >
                                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>
                                        Guru Pamong
                                    </Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 800, mt: 0.25 }}>
                                        {totalPamong}
                                    </Typography>
                                </Box>
                            </Grid>

                            <Grid item xs={6} sm={3}>
                                <Link href="/operator-sekolah/data/kepsek-pamong" style={{ textDecoration: "none" }}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2.5,
                                            bgcolor: "rgba(255,255,255,0.9)",
                                            color: "#06359f",
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            height: "100%",
                                            cursor: "pointer",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                                bgcolor: "white",
                                                transform: "translateY(-2px)",
                                            },
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: "#06359f" }}>
                                            Kelola Pamong &rarr;
                                        </Typography>
                                        <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "text.secondary" }}>
                                            Data Kepsek & Pamong
                                        </Typography>
                                    </Box>
                                </Link>
                            </Grid>
                        </Grid>
                    </Box>
                </Paper>

                {/* Filter Tabs */}
                {totalAll > 0 && (
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs
                            value={tabFilter}
                            onChange={(e, val) => setTabFilter(val)}
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    minHeight: 48,
                                    px: 2.5,
                                },
                            }}
                        >
                            <Tab
                                value="all"
                                label={`Semua Periode (${totalAll})`}
                            />
                            <Tab
                                value="active"
                                icon={<PlayCircleOutline sx={{ fontSize: 18 }} />}
                                iconPosition="start"
                                label={`Tahun Berjalan (${totalActive})`}
                            />
                            <Tab
                                value="finished"
                                icon={<History sx={{ fontSize: 18 }} />}
                                iconPosition="start"
                                label={`Selesai (${totalFinished})`}
                            />
                        </Tabs>
                    </Box>
                )}

                {/* Cards Sections */}
                {totalAll > 0 ? (
                    <>
                        {/* SECTION 1: Tahun Berjalan (Aktif) */}
                        {(tabFilter === "all" || tabFilter === "active") && (
                            <Box
                                component="section"
                                sx={{
                                    p: { xs: 2.5, md: 3.5 },
                                    borderRadius: 4,
                                    backgroundColor: "#ffffff",
                                    border: "1px solid",
                                    borderColor: "rgba(6, 53, 159, 0.18)",
                                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
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
                                                bgcolor: alpha("#06359f", 0.1),
                                                color: "#06359f",
                                            }}
                                        >
                                            <PlayCircleOutline sx={{ fontSize: 26 }} />
                                        </Box>
                                        <Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                                                    Kelas PPL Berjalan (Tahun Berjalan)
                                                </Typography>
                                                <Chip
                                                    label={`${totalActive} Aktif`}
                                                    size="small"
                                                    color="primary"
                                                    sx={{ fontWeight: 700, fontSize: "0.75rem", height: 24 }}
                                                />
                                            </Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {latestGelombang
                                                    ? `Periode Aktif: ${latestGelombang.name}`
                                                    : "Periode dan kelas PPL yang sedang aktif berjalan"}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {totalActive > 0 ? (
                                    <Grid container spacing={3}>
                                        {activeClasses.map((item) => (
                                            <Grid item xs={12} sm={6} md={4} key={`ppl-act-${item.id}`}>
                                                <SekolahPPLCard item={item} isLatest={true} />
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
                                            Tidak ada kelas PPL untuk periode berjalan saat ini di sekolah ini.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* SECTION 2: Sudah Selesai (Arsip Periode) */}
                        {(tabFilter === "all" || tabFilter === "finished") && (
                            <Box
                                component="section"
                                sx={{
                                    p: { xs: 2.5, md: 3.5 },
                                    borderRadius: 4,
                                    backgroundColor: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
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
                                                    Riwayat Kelas PPL Selesai
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
                                                Arsip kelas dan mahasiswa PPL dari periode gelombang sebelumnya
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>

                                {totalFinished > 0 ? (
                                    <Grid container spacing={3}>
                                        {finishedClasses.map((item) => (
                                            <Grid item xs={12} sm={6} md={4} key={`ppl-fin-${item.id}`}>
                                                <SekolahPPLCard item={item} isLatest={false} />
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
                                            Belum ada riwayat kelas PPL yang sudah selesai.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}
                    </>
                ) : (
                    <Box
                        sx={{
                            p: 6,
                            textAlign: "center",
                            bgcolor: "white",
                            borderRadius: 4,
                            border: "1px dashed #cbd5e1",
                        }}
                    >
                        <School sx={{ fontSize: 60, color: "#94a3b8", mb: 1.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                            Belum Ada Data Kelas PPL
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: "auto", mt: 0.5 }}>
                            Belum ada periode kelas PPL yang terdaftar untuk sekolah ini.
                        </Typography>
                    </Box>
                )}
            </Box>
        </OperatorSekolahLayout>
    );
};

export default Dashboard;
