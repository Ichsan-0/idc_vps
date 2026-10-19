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
    InputAdornment,
    Divider,
    alpha,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from "@mui/material";
import {
    CheckCircle,
    HourglassEmpty,
    ErrorOutline,
    Search,
    Person,
    CalendarMonth,
    Assignment,
    ThumbUp,
    RateReview,
    ExpandMore,
    Check,
    Close,
    School,
    Groups,
    DoneAll,
} from "@mui/icons-material";
import { ThreeDot } from "react-loading-indicators";

const SupervisorBimbinganPanel = ({ tipe, idKelas, base_url = "" }) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Filter & Search
    const [searchKey, setSearchKey] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'pending', 'fulfilled', 'unfulfilled'

    // Accordion expanded students
    const [expandedStudent, setExpandedStudent] = useState(null);

    // Validation Dialog State
    const [validationDialog, setValidationDialog] = useState({
        open: false,
        item: null,
        status: "approved", // 'approved' or 'rejected'
        catatan: "",
        submitting: false,
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${base_url}/api/supervisor/bimbingan/${tipe}/${idKelas}`
            );
            if (res.data?.success) {
                setData(res.data.data);
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Gagal memuat data bimbingan kelas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (idKelas && tipe) {
            fetchData();
        }
    }, [idKelas, tipe]);

    const handleOpenValidation = (item, newStatus) => {
        setValidationDialog({
            open: true,
            item,
            status: newStatus,
            catatan: item.catatan_supervisor || "",
            submitting: false,
        });
    };

    const handleConfirmValidation = async () => {
        if (!validationDialog.item) return;

        setValidationDialog((prev) => ({ ...prev, submitting: true }));
        setError(null);
        setSuccessMessage(null);

        try {
            const res = await axios.post(
                `${base_url}/api/supervisor/bimbingan/${validationDialog.item.id}/validate`,
                {
                    status: validationDialog.status,
                    catatan_supervisor: validationDialog.catatan,
                }
            );

            if (res.data?.success) {
                setSuccessMessage(res.data.message || "Validasi bimbingan berhasil disimpan");
                setValidationDialog((prev) => ({ ...prev, open: false }));
                fetchData();
            }
        } catch (err) {
            setError(err?.response?.data?.message || "Gagal memproses validasi bimbingan");
            setValidationDialog((prev) => ({ ...prev, submitting: false }));
        }
    };

    const stats = data?.stats || {
        total_students: 0,
        fulfilled_students: 0,
        pending_validations: 0,
        min_required: 4,
    };

    const students = data?.students || [];

    // Filter students
    const filteredStudents = students.filter((s) => {
        const matchSearch =
            s.nama?.toLowerCase().includes(searchKey.toLowerCase()) ||
            s.nim?.toLowerCase().includes(searchKey.toLowerCase()) ||
            s.prodi?.toLowerCase().includes(searchKey.toLowerCase());

        if (!matchSearch) return false;

        if (filterStatus === "pending") return s.pending_count > 0;
        if (filterStatus === "fulfilled") return s.is_fulfilled;
        if (filterStatus === "unfulfilled") return !s.is_fulfilled;
        return true;
    });

    if (loading && !data) {
        return (
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 280,
                    p: 4,
                }}
            >
                <ThreeDot color="#06359f" size="medium" />
                <Typography variant="body2" sx={{ mt: 2, color: "text.secondary", fontWeight: 600 }}>
                    Memuat data bimbingan mahasiswa...
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

            {/* Stat Summary Row */}
            <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                    <Card
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            border: "1px solid #e2e8f0",
                            bgcolor: "#ffffff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Total Mahasiswa di Kelas
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main" }}>
                                {stats.total_students}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Mahasiswa
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            border: "1px solid",
                            borderColor: stats.pending_validations > 0 ? "rgba(237, 108, 2, 0.3)" : "#e2e8f0",
                            bgcolor: stats.pending_validations > 0 ? alpha("#ed6c02", 0.04) : "#ffffff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Menunggu Validasi Supervisor
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 800,
                                    color: stats.pending_validations > 0 ? "warning.main" : "text.primary",
                                }}
                            >
                                {stats.pending_validations}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Tahapan Bimbingan
                            </Typography>
                        </Box>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card
                        elevation={0}
                        sx={{
                            p: 2.5,
                            borderRadius: 3.5,
                            border: "1px solid",
                            borderColor: "rgba(0, 138, 1, 0.2)",
                            bgcolor: alpha("#008a01", 0.04),
                            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            Memenuhi Syarat (≥ 4 Bimbingan)
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 0.5 }}>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: "success.main" }}>
                                {stats.fulfilled_students}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                / {stats.total_students} Mahasiswa
                            </Typography>
                        </Box>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter and Search Bar */}
            <Box
                sx={{
                    p: 2,
                    borderRadius: 3.5,
                    bgcolor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: { xs: "column", md: "row" },
                    justifyContent: "space-between",
                    gap: 2,
                    alignItems: { xs: "stretch", md: "center" },
                }}
            >
                {/* Search Field */}
                <TextField
                    placeholder="Cari nama mahasiswa, NIM, atau prodi..."
                    size="small"
                    value={searchKey}
                    onChange={(e) => setSearchKey(e.target.value)}
                    sx={{ width: { xs: "100%", md: 340 } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search sx={{ color: "text.secondary", fontSize: 20 }} />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Filter Chips */}
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                        label={`Semua (${students.length})`}
                        size="small"
                        clickable
                        onClick={() => setFilterStatus("all")}
                        color={filterStatus === "all" ? "primary" : "default"}
                        variant={filterStatus === "all" ? "filled" : "outlined"}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                    <Chip
                        label={`Menunggu Validasi (${students.filter((s) => s.pending_count > 0).length})`}
                        size="small"
                        clickable
                        onClick={() => setFilterStatus("pending")}
                        color={filterStatus === "pending" ? "warning" : "default"}
                        variant={filterStatus === "pending" ? "filled" : "outlined"}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                    <Chip
                        label={`Memenuhi Syarat (${stats.fulfilled_students})`}
                        size="small"
                        clickable
                        onClick={() => setFilterStatus("fulfilled")}
                        color={filterStatus === "fulfilled" ? "success" : "default"}
                        variant={filterStatus === "fulfilled" ? "filled" : "outlined"}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                    <Chip
                        label={`Belum Memenuhi (${students.length - stats.fulfilled_students})`}
                        size="small"
                        clickable
                        onClick={() => setFilterStatus("unfulfilled")}
                        color={filterStatus === "unfulfilled" ? "default" : "default"}
                        variant={filterStatus === "unfulfilled" ? "filled" : "outlined"}
                        sx={{ fontWeight: 600, borderRadius: 2 }}
                    />
                </Box>
            </Box>

            {/* Students List */}
            {filteredStudents.length === 0 ? (
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
                    <Assignment sx={{ fontSize: 52, color: "#94a3b8", mb: 1.5 }} />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                        Tidak Ada Mahasiswa Ditemukan
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tidak ada mahasiswa yang cocok dengan kriteria pencarian atau filter saat ini.
                    </Typography>
                </Paper>
            ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {filteredStudents.map((student) => {
                        const isExpanded = expandedStudent === student.nim;

                        return (
                            <Accordion
                                key={student.nim}
                                expanded={isExpanded}
                                onChange={() => setExpandedStudent(isExpanded ? null : student.nim)}
                                elevation={0}
                                sx={{
                                    borderRadius: "16px !important",
                                    border: "1px solid",
                                    borderColor: student.pending_count > 0
                                        ? "rgba(237, 108, 2, 0.35)"
                                        : student.is_fulfilled
                                        ? "rgba(0, 138, 1, 0.25)"
                                        : "#e2e8f0",
                                    bgcolor: "#ffffff",
                                    overflow: "hidden",
                                    "&::before": { display: "none" },
                                    boxShadow: isExpanded ? "0 4px 20px rgba(0,0,0,0.06)" : "none",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <AccordionSummary
                                    expandIcon={<ExpandMore />}
                                    sx={{
                                        px: 3,
                                        py: 1,
                                        bgcolor: isExpanded ? "#f8fafc" : "#ffffff",
                                        "&:hover": { bgcolor: "#f8fafc" },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: { xs: "column", sm: "row" },
                                            alignItems: { xs: "flex-start", sm: "center" },
                                            justifyContent: "space-between",
                                            width: "100%",
                                            pr: 2,
                                            gap: 1.5,
                                        }}
                                    >
                                        {/* Student Info */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: "12px",
                                                    bgcolor: student.is_fulfilled ? "rgba(0, 138, 1, 0.1)" : "rgba(6, 53, 159, 0.1)",
                                                    color: student.is_fulfilled ? "#008a01" : "#06359f",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {student.nama?.charAt(0) || "M"}
                                            </Box>
                                            <Box>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                                                    {student.nama}
                                                </Typography>
                                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center", mt: 0.3 }}>
                                                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                                        NIM: {student.nim}
                                                    </Typography>
                                                    {student.prodi && (
                                                        <>
                                                            <span className="text-slate-300">•</span>
                                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                                {student.prodi}
                                                            </Typography>
                                                        </>
                                                    )}
                                                </Box>
                                            </Box>
                                        </Box>

                                        {/* Badges & Status */}
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                            {student.pending_count > 0 && (
                                                <Chip
                                                    icon={<HourglassEmpty sx={{ fontSize: 15 }} />}
                                                    label={`${student.pending_count} Perlu Validasi`}
                                                    size="small"
                                                    color="warning"
                                                    sx={{ fontWeight: 700, borderRadius: 2 }}
                                                />
                                            )}

                                            <Chip
                                                icon={student.is_fulfilled ? <CheckCircle sx={{ fontSize: 16 }} /> : undefined}
                                                label={`${student.approved_count} / ${stats.min_required} Disetujui`}
                                                size="small"
                                                color={student.is_fulfilled ? "success" : "default"}
                                                sx={{
                                                    fontWeight: 700,
                                                    borderRadius: 2,
                                                    bgcolor: student.is_fulfilled ? undefined : "#f1f5f9",
                                                    color: student.is_fulfilled ? undefined : "#475569",
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                </AccordionSummary>

                                <AccordionDetails sx={{ px: 3, pb: 3, pt: 1, borderTop: "1px solid #f1f5f9" }}>
                                    {/* Submissions by this student */}
                                    {student.bimbingans.length === 0 ? (
                                        <Box sx={{ py: 3, textAlign: "center", color: "text.secondary" }}>
                                            <Typography variant="body2">
                                                Mahasiswa ini belum mengajukan tahapan bimbingan.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
                                            {student.bimbingans.map((bimbingan) => {
                                                const isApproved = bimbingan.status === "approved";
                                                const isRejected = bimbingan.status === "rejected";
                                                const isPending = bimbingan.status === "pending";

                                                return (
                                                    <Paper
                                                        key={bimbingan.id}
                                                        elevation={0}
                                                        sx={{
                                                            p: 2.5,
                                                            borderRadius: 3,
                                                            border: "1px solid",
                                                            borderColor: isApproved
                                                                ? "rgba(0, 138, 1, 0.2)"
                                                                : isRejected
                                                                ? "rgba(211, 47, 47, 0.2)"
                                                                : "#e2e8f0",
                                                            bgcolor: isPending ? alpha("#ed6c02", 0.02) : "#ffffff",
                                                        }}
                                                    >
                                                        {/* Stage Header */}
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "space-between",
                                                                alignItems: "center",
                                                                flexWrap: "wrap",
                                                                gap: 1,
                                                                mb: 1.5,
                                                            }}
                                                        >
                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                                <Chip
                                                                    label={`Bimbingan Ke-${bimbingan.bimbingan_ke}`}
                                                                    size="small"
                                                                    sx={{
                                                                        fontWeight: 800,
                                                                        bgcolor: "#06359f",
                                                                        color: "white",
                                                                        borderRadius: 1.5,
                                                                    }}
                                                                />
                                                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary" }}>
                                                                    <CalendarMonth sx={{ fontSize: 16 }} />
                                                                    <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                                                        {bimbingan.tanggal ? new Date(bimbingan.tanggal).toLocaleDateString("id-ID", {
                                                                            weekday: "short",
                                                                            day: "numeric",
                                                                            month: "short",
                                                                            year: "numeric",
                                                                        }) : "-"}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>

                                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                                <Chip
                                                                    label={
                                                                        isApproved
                                                                            ? "Disetujui"
                                                                            : isRejected
                                                                            ? "Perlu Revisi"
                                                                            : "Menunggu Validasi"
                                                                    }
                                                                    size="small"
                                                                    color={
                                                                        isApproved
                                                                            ? "success"
                                                                            : isRejected
                                                                            ? "error"
                                                                            : "warning"
                                                                    }
                                                                    sx={{ fontWeight: 700, borderRadius: 2 }}
                                                                />
                                                            </Box>
                                                        </Box>

                                                        {/* Stage Content */}
                                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 0.5 }}>
                                                            {bimbingan.judul}
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
                                                            {bimbingan.deskripsi}
                                                        </Typography>

                                                        {/* Status Alert for Pending Validation */}
                                                        {isPending && (
                                                            <Box
                                                                sx={{
                                                                    mt: 1.5,
                                                                    mb: 2,
                                                                    p: 1.5,
                                                                    px: 2,
                                                                    borderRadius: 2.5,
                                                                    bgcolor: alpha("#ed6c02", 0.08),
                                                                    border: "1px dashed",
                                                                    borderColor: alpha("#ed6c02", 0.4),
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    gap: 1.5,
                                                                }}
                                                            >
                                                                <HourglassEmpty sx={{ color: "warning.main", fontSize: 20 }} />
                                                                <Typography variant="body2" sx={{ color: "#9a3412", fontWeight: 600 }}>
                                                                    Mahasiswa telah mengisi detail bimbingan. Menunggu validasi / persetujuan Anda.
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {/* Supervisor Feedback Note */}
                                                        {bimbingan.catatan_supervisor && (
                                                            <Box
                                                                sx={{
                                                                    p: 1.5,
                                                                    borderRadius: 2,
                                                                    bgcolor: isApproved ? alpha("#008a01", 0.05) : alpha("#d32f2f", 0.05),
                                                                    borderLeft: "3px solid",
                                                                    borderLeftColor: isApproved ? "success.main" : "error.main",
                                                                    mb: 2,
                                                                }}
                                                            >
                                                                <Typography variant="caption" sx={{ fontWeight: 700, display: "block" }}>
                                                                    Catatan Anda ({isApproved ? "Disetujui" : "Revisi"}):
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ fontStyle: "italic", color: "#1e293b" }}>
                                                                    "{bimbingan.catatan_supervisor}"
                                                                </Typography>
                                                            </Box>
                                                        )}

                                                        {/* Actions: Validate */}
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                justifyContent: "flex-end",
                                                                gap: 1.5,
                                                                pt: 1,
                                                                borderTop: "1px dashed #e2e8f0",
                                                            }}
                                                        >
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="error"
                                                                startIcon={<Close />}
                                                                onClick={() => handleOpenValidation(bimbingan, "rejected")}
                                                                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                                                            >
                                                                {isRejected ? "Ubah Catatan Revisi" : "Minta Revisi"}
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                color="success"
                                                                startIcon={<Check />}
                                                                onClick={() => handleOpenValidation(bimbingan, "approved")}
                                                                sx={{
                                                                    borderRadius: 2,
                                                                    textTransform: "none",
                                                                    fontWeight: 700,
                                                                    bgcolor: isApproved ? "#008a01" : "#008a01",
                                                                    "&:hover": { bgcolor: "#006e01" },
                                                                }}
                                                            >
                                                                {isApproved ? "Perbarui Persetujuan" : "Setujui Bimbingan"}
                                                            </Button>
                                                        </Box>
                                                    </Paper>
                                                );
                                            })}
                                        </Box>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </Box>
            )}

            {/* Dialog: Validasi / Setujui / Revisi Bimbingan */}
            <Dialog
                open={validationDialog.open}
                onClose={() => !validationDialog.submitting && setValidationDialog((prev) => ({ ...prev, open: false }))}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 800, color: validationDialog.status === "approved" ? "success.dark" : "error.dark" }}>
                    {validationDialog.status === "approved" ? "Setujui Bimbingan Mahasiswa" : "Minta Revisi Bimbingan"}
                </DialogTitle>
                <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, py: 2.5 }}>
                    <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: "#f8fafc", border: "1px solid #e2e8f0" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block" }}>
                            Bimbingan Ke-{validationDialog.item?.bimbingan_ke}
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                            {validationDialog.item?.judul}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {validationDialog.item?.deskripsi}
                        </Typography>
                    </Box>

                    <TextField
                        fullWidth
                        label={
                            validationDialog.status === "approved"
                                ? "Catatan / Arahan Tambahan (Opsional)"
                                : "Catatan / Poin yang Harus Direvisi (Wajib)"
                        }
                        placeholder={
                            validationDialog.status === "approved"
                                ? "Contoh: Bimbingan disetujui. Lanjutkan dengan penyusunan laporan kegiatan."
                                : "Tuliskan apa yang perlu diperbaiki atau ditambahkan oleh mahasiswa..."
                        }
                        multiline
                        rows={3}
                        value={validationDialog.catatan}
                        onChange={(e) => setValidationDialog((prev) => ({ ...prev, catatan: e.target.value }))}
                        required={validationDialog.status === "rejected"}
                        helperText={
                            validationDialog.status === "approved"
                                ? "Bimbingan ini akan dihitung ke dalam syarat minimal 4 kali bimbingan."
                                : "Mahasiswa akan menerima catatan ini dan dapat memperbarui bimbingannya."
                        }
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setValidationDialog((prev) => ({ ...prev, open: false }))}
                        disabled={validationDialog.submitting}
                        sx={{ textTransform: "none" }}
                    >
                        Batal
                    </Button>
                    <Button
                        onClick={handleConfirmValidation}
                        variant="contained"
                        color={validationDialog.status === "approved" ? "success" : "error"}
                        disabled={validationDialog.submitting || (validationDialog.status === "rejected" && !validationDialog.catatan?.trim())}
                        sx={{ textTransform: "none", fontWeight: 700, px: 3 }}
                    >
                        {validationDialog.submitting
                            ? "Memproses..."
                            : validationDialog.status === "approved"
                            ? "Setujui Bimbingan"
                            : "Kirim Permintaan Revisi"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SupervisorBimbinganPanel;
