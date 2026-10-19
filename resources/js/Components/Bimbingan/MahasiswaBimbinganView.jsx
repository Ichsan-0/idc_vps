import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Button,
    Paper,
    LinearProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert,
    IconButton,
    Tooltip,
    alpha,
} from "@mui/material";
import {
    CheckCircle,
    HourglassEmpty,
    ErrorOutline,
    Add,
    Edit,
    Delete,
    Person,
    CalendarMonth,
    Assignment,
    ThumbUp,
    RateReview,
} from "@mui/icons-material";
import { ThreeDot } from "react-loading-indicators";

const MahasiswaBimbinganView = ({ tipe, idKelas, base_url = "" }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, item: null });

    // Form state (No file upload needed)
    const [form, setForm] = useState({
        bimbingan_ke: 1,
        tanggal: new Date().toISOString().split("T")[0],
        judul: "",
        deskripsi: "",
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${base_url}/api/bimbingan`, {
                params: { tipe, id_kelas: idKelas },
            });
            if (res.data?.success) {
                setData(res.data.data);
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Gagal memuat data bimbingan");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idKelas) {
            fetchData();
        }
    }, [idKelas, tipe]);

    const handleOpenAddModal = () => {
        const nextKe = data?.stats?.next_bimbingan_ke || 1;
        setEditingItem(null);
        setForm({
            bimbingan_ke: nextKe,
            tanggal: new Date().toISOString().split("T")[0],
            judul: "",
            deskripsi: "",
        });
        setModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingItem(item);
        setForm({
            bimbingan_ke: item.bimbingan_ke,
            tanggal: item.tanggal ? item.tanggal.split("T")[0] : "",
            judul: item.judul || "",
            deskripsi: item.deskripsi || "",
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const payload = {
                tipe,
                id_kelas: idKelas,
                bimbingan_ke: form.bimbingan_ke,
                tanggal: form.tanggal,
                judul: form.judul,
                deskripsi: form.deskripsi,
            };

            let res;
            if (editingItem) {
                res = await axios.post(
                    `${base_url}/api/bimbingan/${editingItem.id}/update`,
                    payload
                );
            } else {
                res = await axios.post(`${base_url}/api/bimbingan`, payload);
            }

            if (res.data?.success) {
                setSuccessMessage(res.data.message || "Detail bimbingan berhasil disimpan. Menunggu validasi supervisor.");
                setModalOpen(false);
                fetchData();
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Gagal menyimpan detail bimbingan");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteDialog.item) return;
        setSubmitting(true);
        try {
            const res = await axios.delete(
                `${base_url}/api/bimbingan/${deleteDialog.item.id}`
            );
            if (res.data?.success) {
                setSuccessMessage("Bimbingan berhasil dihapus");
                setDeleteDialog({ open: false, item: null });
                fetchData();
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Gagal menghapus bimbingan");
        } finally {
            setSubmitting(false);
        }
    };

    const stats = data?.stats || {
        total_submitted: 0,
        total_approved: 0,
        total_pending: 0,
        total_rejected: 0,
        min_required: 4,
        is_fulfilled: false,
        percentage: 0,
    };

    const supervisor = data?.supervisor;
    const bimbinganList = data?.list || [];

    if (loading && !data) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 300,
                    p: 4,
                }}
            >
                <ThreeDot color="#06359f" size="medium" />
                <Typography variant="body2" sx={{ mt: 2, color: "text.secondary", fontWeight: 600 }}>
                    Memuat data bimbingan...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Feedback Alerts */}
            {successMessage && (
                <Alert
                    severity="success"
                    onClose={() => setSuccessMessage(null)}
                    sx={{ borderRadius: 3 }}
                >
                    {successMessage}
                </Alert>
            )}
            {error && (
                <Alert
                    severity="error"
                    onClose={() => setError(null)}
                    sx={{ borderRadius: 3 }}
                >
                    {error}
                </Alert>
            )}

            {/* Header & Stats Card */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: stats.is_fulfilled ? "rgba(0, 138, 1, 0.3)" : "rgba(6, 53, 159, 0.15)",
                    background: stats.is_fulfilled
                        ? "linear-gradient(135deg, rgba(0, 138, 1, 0.04) 0%, rgba(255, 255, 255, 1) 100%)"
                        : "linear-gradient(135deg, rgba(6, 53, 159, 0.03) 0%, rgba(255, 255, 255, 1) 100%)",
                    p: { xs: 2.5, md: 3 },
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.03)",
                }}
            >
                <Grid container spacing={3} alignItems="center">
                    {/* Left: Supervisor & Requirement Info */}
                    <Grid item xs={12} md={7}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: "12px",
                                    bgcolor: "primary.main",
                                    color: "white",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <Person sx={{ fontSize: 28 }} />
                            </Box>
                            <Box>
                                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                    Dosen Pembimbing Lapangan / Supervisor:
                                </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
                                    {supervisor?.name || "Belum Ditentukan"}
                                </Typography>
                                {supervisor?.username && (
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        NIP/ID: {supervisor.username}
                                    </Typography>
                                )}
                            </Box>
                        </Box>

                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Mahasiswa diwajibkan melakukan bimbingan ke dosen supervisor minimal{" "}
                            <strong className="text-slate-800">4 kali</strong>. Cukup isi detail bimbingan Anda,
                            dan status bimbingan akan masuk ke antrean untuk divalidasi oleh dosen supervisor.
                        </Typography>
                    </Grid>

                    {/* Right: Progress Box & Action Button */}
                    <Grid item xs={12} md={5}>
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 3,
                                bgcolor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.5,
                            }}
                        >
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary" }}>
                                    Progress Bimbingan
                                </Typography>
                                <Chip
                                    icon={stats.is_fulfilled ? <CheckCircle sx={{ fontSize: 16 }} /> : <Assignment sx={{ fontSize: 16 }} />}
                                    label={`${stats.total_approved} / ${stats.min_required} Disetujui`}
                                    size="small"
                                    color={stats.is_fulfilled ? "success" : "primary"}
                                    sx={{ fontWeight: 700, borderRadius: 2 }}
                                />
                            </Box>

                            <Box sx={{ width: "100%" }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={stats.percentage}
                                    color={stats.is_fulfilled ? "success" : "primary"}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        bgcolor: "#e2e8f0",
                                    }}
                                />
                                <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                        Target: Minimal 4 Kali
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>
                                        {stats.percentage}%
                                    </Typography>
                                </Box>
                            </Box>

                            {stats.is_fulfilled ? (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "success.main" }}>
                                    <CheckCircle sx={{ fontSize: 20 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 700 }}>
                                        Syarat Minimal 4x Bimbingan Terpenuhi
                                    </Typography>
                                </Box>
                            ) : (
                                <Typography variant="caption" sx={{ color: "warning.dark", fontWeight: 600 }}>
                                    Kurang {Math.max(0, stats.min_required - stats.total_approved)} bimbingan lagi yang disetujui supervisor
                                </Typography>
                            )}

                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleOpenAddModal}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 700,
                                    py: 1,
                                    mt: 0.5,
                                    bgcolor: "#06359f",
                                    "&:hover": { bgcolor: "#042574" },
                                }}
                            >
                                Isi Detail Bimbingan
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Card>

            {/* List of Bimbingan Stages */}
            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                        Riwayat Tahapan Bimbingan ({bimbinganList.length})
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip
                            label={`${stats.total_approved} Disetujui`}
                            size="small"
                            color="success"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                        />
                        <Chip
                            label={`${stats.total_pending} Menunggu Validasi`}
                            size="small"
                            color="warning"
                            variant="outlined"
                            sx={{ fontWeight: 600 }}
                        />
                        {stats.total_rejected > 0 && (
                            <Chip
                                label={`${stats.total_rejected} Perlu Revisi`}
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ fontWeight: 600 }}
                            />
                        )}
                    </Box>
                </Box>

                {bimbinganList.length === 0 ? (
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            textAlign: "center",
                            borderRadius: 4,
                            border: "1px dashed #cbd5e1",
                            bgcolor: "#f8fafc",
                        }}
                    >
                        <Assignment sx={{ fontSize: 56, color: "#94a3b8", mb: 1.5 }} />
                        <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                            Belum Ada Riwayat Bimbingan
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: "auto", mb: 2.5 }}>
                            Anda belum mengisi detail bimbingan. Silakan isi detail bimbingan Anda
                            untuk diverifikasi dan divalidasi oleh dosen supervisor.
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={handleOpenAddModal}
                            sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                bgcolor: "#06359f",
                            }}
                        >
                            Isi Bimbingan Ke-1
                        </Button>
                    </Paper>
                ) : (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        {bimbinganList.map((item) => {
                            const isApproved = item.status === "approved";
                            const isRejected = item.status === "rejected";
                            const isPending = item.status === "pending";

                            let statusColor = "warning";
                            let statusLabel = "Menunggu Validasi Supervisor";
                            let statusIcon = <HourglassEmpty sx={{ fontSize: 16 }} />;

                            if (isApproved) {
                                statusColor = "success";
                                statusLabel = "Disetujui / Valid";
                                statusIcon = <CheckCircle sx={{ fontSize: 16 }} />;
                            } else if (isRejected) {
                                statusColor = "error";
                                statusLabel = "Perlu Revisi";
                                statusIcon = <ErrorOutline sx={{ fontSize: 16 }} />;
                            }

                            return (
                                <Card
                                    key={item.id}
                                    elevation={0}
                                    sx={{
                                        borderRadius: 3.5,
                                        border: "1px solid",
                                        borderColor: isApproved
                                            ? "rgba(0, 138, 1, 0.25)"
                                            : isRejected
                                            ? "rgba(211, 47, 47, 0.25)"
                                            : "rgba(237, 108, 2, 0.3)",
                                        bgcolor: "#ffffff",
                                        overflow: "hidden",
                                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                            boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
                                        },
                                    }}
                                >
                                    {/* Card Header Bar */}
                                    <Box
                                        sx={{
                                            p: 2,
                                            px: 3,
                                            bgcolor: isApproved
                                                ? alpha("#008a01", 0.05)
                                                : isRejected
                                                ? alpha("#d32f2f", 0.05)
                                                : alpha("#ed6c02", 0.05),
                                            borderBottom: "1px solid #f1f5f9",
                                            display: "flex",
                                            flexWrap: "wrap",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            gap: 1.5,
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Chip
                                                label={`Bimbingan Ke-${item.bimbingan_ke}`}
                                                size="small"
                                                sx={{
                                                    fontWeight: 800,
                                                    fontSize: "0.8rem",
                                                    bgcolor: "#06359f",
                                                    color: "white",
                                                    borderRadius: 1.5,
                                                }}
                                            />
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                                                <CalendarMonth sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                    {item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID", {
                                                        weekday: "long",
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                    }) : "-"}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Chip
                                                icon={statusIcon}
                                                label={statusLabel}
                                                size="small"
                                                color={statusColor}
                                                sx={{ fontWeight: 700, borderRadius: 2 }}
                                            />

                                            {!isApproved && (
                                                <>
                                                    <Tooltip title="Edit Detail Bimbingan">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleOpenEditModal(item)}
                                                            sx={{ color: "text.secondary" }}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                    {isPending && (
                                                        <Tooltip title="Hapus Bimbingan">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => setDeleteDialog({ open: true, item })}
                                                                sx={{ color: "error.main" }}
                                                            >
                                                                <Delete fontSize="small" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    )}
                                                </>
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Card Content */}
                                    <CardContent sx={{ p: 3 }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
                                        >
                                            {item.judul}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                whiteSpace: "pre-line",
                                                lineHeight: 1.6,
                                                mb: 2,
                                                color: "#334155",
                                            }}
                                        >
                                            {item.deskripsi}
                                        </Typography>

                                        {/* Status Message Banner for Pending */}
                                        {isPending && (
                                            <Box
                                                sx={{
                                                    mt: 1.5,
                                                    p: 1.5,
                                                    px: 2,
                                                    borderRadius: 2.5,
                                                    bgcolor: alpha("#ed6c02", 0.06),
                                                    border: "1px dashed",
                                                    borderColor: alpha("#ed6c02", 0.35),
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                }}
                                            >
                                                <HourglassEmpty sx={{ color: "warning.main", fontSize: 20 }} />
                                                <Typography variant="body2" sx={{ color: "#9a3412", fontWeight: 500 }}>
                                                    Detail bimbingan telah dikirim dan sedang menunggu validasi dari Dosen Supervisor.
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Supervisor Feedback / Validation Box */}
                                        {(item.catatan_supervisor || isApproved || isRejected) && (
                                            <Box
                                                sx={{
                                                    mt: 2,
                                                    p: 2,
                                                    borderRadius: 2.5,
                                                    bgcolor: isApproved
                                                        ? alpha("#008a01", 0.06)
                                                        : isRejected
                                                        ? alpha("#d32f2f", 0.06)
                                                        : "#f1f5f9",
                                                    borderLeft: "4px solid",
                                                    borderLeftColor: isApproved
                                                        ? "success.main"
                                                        : isRejected
                                                        ? "error.main"
                                                        : "primary.main",
                                                }}
                                            >
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                                    {isApproved ? (
                                                        <ThumbUp sx={{ fontSize: 18, color: "success.main" }} />
                                                    ) : (
                                                        <RateReview sx={{ fontSize: 18, color: isRejected ? "error.main" : "text.secondary" }} />
                                                    )}
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            fontWeight: 700,
                                                            color: isApproved
                                                                ? "success.dark"
                                                                : isRejected
                                                                ? "error.dark"
                                                                : "text.primary",
                                                        }}
                                                    >
                                                        {isApproved
                                                            ? "Validasi Dosen Supervisor (Disetujui)"
                                                            : isRejected
                                                            ? "Catatan Revisi Dosen Supervisor"
                                                            : "Catatan Dosen Supervisor"}
                                                    </Typography>
                                                    {item.validated_at && (
                                                        <Typography variant="caption" sx={{ color: "text.secondary", ml: "auto" }}>
                                                            {new Date(item.validated_at).toLocaleDateString("id-ID", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </Typography>
                                                    )}
                                                </Box>
                                                <Typography variant="body2" sx={{ color: "#1e293b", fontStyle: "italic", mt: 0.5 }}>
                                                    "{item.catatan_supervisor || (isApproved ? "Bimbingan telah disetujui tanpa catatan tambahan." : "Harap perbaiki sesuai arahan.")}"
                                                </Typography>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </Box>
                )}
            </Box>

            {/* Modal: Form Isi / Edit Detail Bimbingan */}
            <Dialog
                open={modalOpen}
                onClose={() => !submitting && setModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3.5, p: 1 },
                }}
            >
                <form onSubmit={handleSubmit}>
                    <DialogTitle sx={{ fontWeight: 800, color: "primary.main", pb: 1 }}>
                        {editingItem ? "Edit Detail Bimbingan" : "Isi Detail Bimbingan"}
                    </DialogTitle>
                    <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2.5, py: 2.5 }}>
                        <Typography variant="body2" color="text.secondary">
                            Isi rincian materi bimbingan yang telah Anda diskusikan dengan Dosen Supervisor{" "}
                            <strong>{supervisor?.name || ""}</strong>. Setelah disimpan, bimbingan akan menunggu validasi supervisor.
                        </Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                                <TextField
                                    fullWidth
                                    label="Bimbingan Ke-"
                                    type="number"
                                    inputProps={{ min: 1 }}
                                    value={form.bimbingan_ke}
                                    onChange={(e) => setForm({ ...form, bimbingan_ke: parseInt(e.target.value) || 1 })}
                                    required
                                    size="small"
                                    helperText="Urutan bimbingan"
                                />
                            </Grid>
                            <Grid item xs={12} sm={8}>
                                <TextField
                                    fullWidth
                                    label="Tanggal Pelaksanaan Bimbingan"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={form.tanggal}
                                    onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                                    required
                                    size="small"
                                />
                            </Grid>
                        </Grid>

                        <TextField
                            fullWidth
                            label="Topik / Materi Bimbingan"
                            placeholder="Contoh: Konsultasi Penyusunan Program Kerja KPM / Modul Ajar"
                            value={form.judul}
                            onChange={(e) => setForm({ ...form, judul: e.target.value })}
                            required
                            size="small"
                        />

                        <TextField
                            fullWidth
                            label="Deskripsi / Catatan Bimbingan"
                            placeholder="Tuliskan poin-poin penting pembahasan, arahan supervisor, atau progress yang Anda konsultasikan..."
                            multiline
                            rows={5}
                            value={form.deskripsi}
                            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                            required
                            helperText="Jelaskan secara detail hasil konsultasi dengan dosen supervisor Anda"
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setModalOpen(false)}
                            disabled={submitting}
                            sx={{ textTransform: "none", fontWeight: 600 }}
                        >
                            Batal
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting}
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                px: 3,
                                bgcolor: "#06359f",
                                "&:hover": { bgcolor: "#042574" },
                            }}
                        >
                            {submitting ? "Menyimpan..." : editingItem ? "Simpan Perubahan" : "Simpan Detail Bimbingan"}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Modal: Konfirmasi Hapus */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => !submitting && setDeleteDialog({ open: false, item: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Hapus Bimbingan?</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">
                        Apakah Anda yakin ingin menghapus catatan{" "}
                        <strong>Bimbingan Ke-{deleteDialog.item?.bimbingan_ke}</strong> ({deleteDialog.item?.judul})?
                        Tindakan ini tidak dapat dibatalkan.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setDeleteDialog({ open: false, item: null })}
                        disabled={submitting}
                        sx={{ textTransform: "none" }}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleDelete}
                        variant="contained"
                        color="error"
                        disabled={submitting}
                        sx={{ textTransform: "none", fontWeight: 700 }}
                    >
                        {submitting ? "Menghapus..." : "Hapus"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MahasiswaBimbinganView;
