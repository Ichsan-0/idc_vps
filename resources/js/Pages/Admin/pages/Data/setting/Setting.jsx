import React, { useState, useEffect } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Switch,
    TextField,
    Button,
    Snackbar,
    Alert,
    Grid,
    Paper,
    Divider,
    FormControlLabel,
    Chip,
    Stack,
    CircularProgress,
    alpha,
    Fade,
    Zoom,
} from "@mui/material";
import { Head, router, useForm } from "@inertiajs/react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import {
    Settings,
    Group,
    Assignment,
    PersonAdd,
    Link as LinkIcon,
    Save,
    Refresh,
    CheckCircle,
    Warning,
    Info,
    NotificationsActive,
    Lock,
    LockOpen,
} from "@mui/icons-material";

const StatusChip = ({ isActive, label }) => (
    <Chip
        label={label}
        color={isActive ? "success" : "error"}
        variant="outlined"
        size="small"
        sx={{
            borderRadius: 2,
            fontWeight: 600,
            borderWidth: 2,
        }}
    />
);

const SettingCard = ({
    title,
    description,
    icon: Icon,
    children,
    color = "primary",
}) => (
    <Zoom in={true}>
        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha("#06359f", 0.1)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 4,
                },
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                    }}
                >
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
                    <Box>
                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, color: "text.primary" }}
                        >
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                    </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                {children}
            </CardContent>
        </Card>
    </Zoom>
);

const Setting = ({ flash, settings }) => {
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info",
    });
    const [isLoading, setIsLoading] = useState(false);

    const { data, setData, post, processing } = useForm({
        buka_pendaftaran: settings?.buka_pendaftaran || false,
        buka_lengkapi_profil: settings?.buka_lengkapi_profil || false,
        buka_lamaran_kpm: settings?.buka_lamaran_kpm || false,
        buka_lamaran_ppl: settings?.buka_lamaran_ppl || false,
        link_grup: settings?.link_grup || "",
    });

    useEffect(() => {
        if (flash?.message) {
            let message = "";
            let severity = "info";

            if (typeof flash.message === "string") {
                message = flash.message;
            } else if (typeof flash.message === "object") {
                if (flash.message.success) {
                    message = flash.message.success;
                    severity = "success";
                } else if (flash.message.error) {
                    message = flash.message.error;
                    severity = "error";
                } else if (flash.message.info) {
                    message = flash.message.info;
                    severity = "info";
                }
            }

            if (message) {
                setNotification({
                    open: true,
                    message,
                    severity,
                });
            }
        }
    }, [flash]);

    const handleCloseNotification = () => {
        setNotification((prev) => ({ ...prev, open: false }));
    };

    const handleSubmit = async (e) => {
        e?.preventDefault();
        setIsLoading(true);

        post("/admin/settings/update", {
            onSuccess: () => {
                setNotification({
                    open: true,
                    message: "Pengaturan berhasil disimpan",
                    severity: "success",
                });
            },
            onError: (errors) => {
                setNotification({
                    open: true,
                    message: "Terjadi kesalahan saat menyimpan pengaturan",
                    severity: "error",
                });
            },
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const handleReset = () => {
        setData({
            buka_pendaftaran: settings?.buka_pendaftaran || false,
            buka_lengkapi_profil: settings?.buka_lengkapi_profil || false,
            buka_lamaran_kpm: settings?.buka_lamaran_kpm || false,
            buka_lamaran_ppl: settings?.buka_lamaran_ppl || false,
            link_grup: settings?.link_grup || "",
        });
    };

    const getSystemStatus = () => {
        const activeSettings = [
            data.buka_pendaftaran,
            data.buka_lengkapi_profil,
            data.buka_lamaran_kpm,
            data.buka_lamaran_ppl,
        ].filter(Boolean).length;

        let status = "inactive";
        if (activeSettings >= 3) {
            status = "active";
        } else if (activeSettings >= 2) {
            status = "partial";
        }

        return {
            activeCount: activeSettings,
            totalSettings: 4,
            status: status,
        };
    };

    const systemStatus = getSystemStatus();

    const settingGroups = [
        {
            title: "Pendaftaran Umum",
            description: "Pengaturan pendaftaran dan registrasi",
            icon: PersonAdd,
            color: "primary",
            settings: [
                {
                    label: "Buka Pendaftaran",
                    description: "Aktifkan pendaftaran untuk mahasiswa baru",
                    value: data.buka_pendaftaran,
                    onChange: () =>
                        setData("buka_pendaftaran", !data.buka_pendaftaran),
                },
                {
                    label: "Terima Biodata",
                    description: "Izinkan mahasiswa melengkapi profil",
                    value: data.buka_lengkapi_profil,
                    onChange: () =>
                        setData(
                            "buka_lengkapi_profil",
                            !data.buka_lengkapi_profil
                        ),
                },
            ],
        },
        {
            title: "Lamaran Kegiatan",
            description: "Pengaturan periode lamaran KPM dan PPL",
            icon: Assignment,
            color: "secondary",
            settings: [
                {
                    label: "Buka Lamaran KPM",
                    description: "Aktifkan pengajuan lamaran KPM",
                    value: data.buka_lamaran_kpm,
                    onChange: () =>
                        setData("buka_lamaran_kpm", !data.buka_lamaran_kpm),
                },
                {
                    label: "Buka Lamaran PPL",
                    description: "Aktifkan pengajuan lamaran PPL",
                    value: data.buka_lamaran_ppl,
                    onChange: () =>
                        setData("buka_lamaran_ppl", !data.buka_lamaran_ppl),
                },
            ],
        },
        {
            title: "Komunikasi",
            description: "Pengaturan tautan dan komunikasi",
            icon: Group,
            color: "info",
            settings: [
                {
                    label: "Link Grup WhatsApp",
                    description: "Tautan grup WhatsApp untuk komunikasi",
                    type: "text",
                    value: data.link_grup,
                    onChange: (e) => setData("link_grup", e.target.value),
                    placeholder: "https://chat.whatsapp.com/...",
                },
            ],
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case "active":
                return "#2e7d32";
            case "partial":
                return "#ed6c02";
            case "inactive":
                return "#d32f2f";
            default:
                return "#d32f2f";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "active":
                return (
                    <NotificationsActive
                        sx={{ color: "success.main", fontSize: 32 }}
                    />
                );
            case "partial":
                return <Warning sx={{ color: "warning.main", fontSize: 32 }} />;
            case "inactive":
                return <Lock sx={{ color: "error.main", fontSize: 32 }} />;
            default:
                return <Lock sx={{ color: "error.main", fontSize: 32 }} />;
        }
    };

    return (
        <AdminLayout title="Pengaturan Sistem">
            <Head title="Pengaturan Sistem" />

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
                    iconMapping={{
                        success: <CheckCircle fontSize="inherit" />,
                        error: <Warning fontSize="inherit" />,
                        info: <Info fontSize="inherit" />,
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>

            <Box
                sx={{ minHeight: "100vh", bgcolor: "background.default", p: 3 }}
            >
                {/* Header */}
                <Box sx={{ mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                Pengaturan Sistem
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Kelola pengaturan pendaftaran dan sistem PPKPM
                            </Typography>
                        </Box>
                    </Box>

                    {/* System Status */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            bgcolor: alpha(
                                getStatusColor(systemStatus.status),
                                0.1
                            ),
                            border: "1px solid",
                            borderColor: alpha(
                                getStatusColor(systemStatus.status),
                                0.2
                            ),
                        }}
                    >
                        <Grid container alignItems="center" spacing={2}>
                            <Grid item xs={12} md={8}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 2,
                                    }}
                                >
                                    {getStatusIcon(systemStatus.status)}
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 600, mb: 0.5 }}
                                        >
                                            Status Sistem:{" "}
                                            <StatusChip
                                                isActive={
                                                    systemStatus.status ===
                                                    "active"
                                                }
                                                label={
                                                    systemStatus.status ===
                                                    "active"
                                                        ? "Aktif"
                                                        : systemStatus.status ===
                                                          "partial"
                                                        ? "Parsial"
                                                        : "Nonaktif"
                                                }
                                            />
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {systemStatus.activeCount} dari{" "}
                                            {systemStatus.totalSettings} fitur
                                            aktif
                                        </Typography>
                                    </Box>
                                </Box>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: { md: "flex-end" },
                                        gap: 1,
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        startIcon={<Refresh />}
                                        onClick={handleReset}
                                        disabled={processing || isLoading}
                                        sx={{ borderRadius: 2 }}
                                    >
                                        Reset
                                    </Button>
                                    <Button
                                        variant="contained"
                                        startIcon={
                                            isLoading ? (
                                                <CircularProgress
                                                    size={20}
                                                    color="inherit"
                                                />
                                            ) : (
                                                <Save />
                                            )
                                        }
                                        onClick={handleSubmit}
                                        disabled={processing || isLoading}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 600,
                                            px: 3,
                                        }}
                                    >
                                        {isLoading
                                            ? "Menyimpan..."
                                            : "Simpan Perubahan"}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                {/* Settings Grid */}
                <Grid container spacing={3}>
                    {settingGroups.map((group, groupIndex) => (
                        <Grid item xs={12} md={6} lg={4} key={groupIndex}>
                            <SettingCard
                                title={group.title}
                                description={group.description}
                                icon={group.icon}
                                color={group.color}
                            >
                                <Stack spacing={2}>
                                    {group.settings.map(
                                        (setting, settingIndex) => (
                                            <Box key={settingIndex}>
                                                {setting.type === "text" ? (
                                                    <Box>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                fontWeight: 600,
                                                                mb: 1,
                                                            }}
                                                        >
                                                            {setting.label}
                                                        </Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            sx={{
                                                                "& .MuiOutlinedInput-root.Mui-focused":
                                                                    {
                                                                        outline:
                                                                            "none",
                                                                        boxShadow:
                                                                            "none",
                                                                    },
                                                                "& .MuiInputBase-input:focus":
                                                                    {
                                                                        outline:
                                                                            "none",
                                                                        boxShadow:
                                                                            "none",
                                                                    },
                                                                    "& .MuiOutlinedInput-root":
                                                                    {
                                                                        borderRadius: 2,
                                                                    },
                                                            }}
                                                            value={
                                                                setting.value ||
                                                                ""
                                                            }
                                                            onChange={
                                                                setting.onChange
                                                            }
                                                            placeholder={
                                                                setting.placeholder
                                                            }
                                                            InputProps={{
                                                                startAdornment:
                                                                    (
                                                                        <LinkIcon
                                                                            sx={{
                                                                                mr: 1,
                                                                                color: "text.secondary",
                                                                            }}
                                                                        />
                                                                    ),
                                                            }}
                                                       
                                                        />
                                                        {setting.description && (
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                sx={{
                                                                    mt: 1,
                                                                    display:
                                                                        "block",
                                                                }}
                                                            >
                                                                {
                                                                    setting.description
                                                                }
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                ) : (
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                checked={
                                                                    setting.value ||
                                                                    false
                                                                }
                                                                onChange={
                                                                    setting.onChange
                                                                }
                                                                color="primary"
                                                                size="medium"
                                                            />
                                                        }
                                                        label={
                                                            <Box>
                                                                <Typography
                                                                    variant="subtitle2"
                                                                    sx={{
                                                                        fontWeight: 600,
                                                                    }}
                                                                >
                                                                    {
                                                                        setting.label
                                                                    }
                                                                </Typography>
                                                                {setting.description && (
                                                                    <Typography
                                                                        variant="caption"
                                                                        color="text.secondary"
                                                                    >
                                                                        {
                                                                            setting.description
                                                                        }
                                                                    </Typography>
                                                                )}
                                                            </Box>
                                                        }
                                                        sx={{
                                                            width: "100%",
                                                            m: 0,
                                                            "& .MuiFormControlLabel-label":
                                                                {
                                                                    flex: 1,
                                                                },
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        )
                                    )}
                                </Stack>
                            </SettingCard>
                        </Grid>
                    ))}

                    {/* Quick Actions */}
                </Grid>

                {/* Footer Info */}
                <Fade in={true}>
                    <Paper
                        elevation={0}
                        sx={{
                            mt: 4,
                            p: 3,
                            borderRadius: 3,
                            bgcolor: "info.50",
                            border: "1px solid",
                            borderColor: "info.100",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: 2,
                            }}
                        >
                            <Info sx={{ color: "info.main", mt: 0.5 }} />
                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: 600,
                                        mb: 1,
                                        color: "info.main",
                                    }}
                                >
                                    Informasi Pengaturan
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    • Perubahan pengaturan akan langsung berlaku
                                    setelah disimpan
                                    <br />
                                    • Pastikan untuk menginformasikan perubahan
                                    kepada pengguna terkait
                                    <br />
                                </Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Fade>
            </Box>
        </AdminLayout>
    );
};

export default Setting;
