import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Chip,
    Button,
    TextField,
    InputAdornment,
    Alert,
    Collapse,
    Divider,
    IconButton,
    Avatar,
    alpha,
    Grid,
    Tooltip,
} from "@mui/material";
import {
    Link as LinkIcon,
    OpenInNew,
    KeyboardArrowDown,
    KeyboardArrowUp,
    CheckCircle,
    Schedule,
    Search,
    Person,
    HourglassEmpty,
    Check,
    RateReview,
    Cancel,
} from "@mui/icons-material";
import { ThreeDot } from "react-loading-indicators";

const SupervisorTaskInlineItem = ({
    task,
    idKelas,
    baseUrl = "",
    isExpanded,
    onToggle,
}) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'need_review', 'graded', 'unsubmitted'

    // Scoring states: map of student username -> score input & saving status
    const [scores, setScores] = useState({});
    const [savingScores, setSavingScores] = useState({});
    const [alertMessage, setAlertMessage] = useState(null);

    const fetchSubmissions = async () => {
        if (!idKelas || !task?.id) return;
        setLoading(true);
        try {
            const res = await axios.get(
                `${baseUrl}/api/supervisor-kpm/classroom/${idKelas}/${task.id}/tugas-mahasiswa`
            );
            if (res?.data?.data && Array.isArray(res.data.data)) {
                setSubmissions(res.data.data);

                // Populate initial scores
                const initialScores = {};
                res.data.data.forEach((item) => {
                    if (item.username_mahasiswa) {
                        initialScores[item.username_mahasiswa] =
                            item.score !== null && item.score !== undefined
                                ? item.score
                                : "";
                    }
                });
                setScores(initialScores);
            }
        } catch (err) {
            console.error("Gagal memuat submission tugas mahasiswa:", err);
            setAlertMessage({
                type: "error",
                text: err?.response?.data?.message || "Gagal memuat tugas mahasiswa.",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isExpanded) {
            fetchSubmissions();
        }
    }, [isExpanded]);

    // Handle Save / Update Score for a student
    const handleSaveScore = async (usernameMahasiswa) => {
        const inputScore = scores[usernameMahasiswa];
        if (inputScore === "" || inputScore === undefined || inputScore === null) {
            alert("Harap masukkan nilai (0 - 100).");
            return;
        }

        const numericScore = Number(inputScore);
        if (isNaN(numericScore) || numericScore < 0 || numericScore > 100) {
            alert("Nilai harus berupa angka antara 0 dan 100.");
            return;
        }

        setSavingScores((prev) => ({ ...prev, [usernameMahasiswa]: true }));
        setAlertMessage(null);

        try {
            const payload = {
                id_kelas: idKelas,
                id_tugas: task.id,
                username_mahasiswa: usernameMahasiswa,
                score: numericScore,
                status: "dinilai",
            };

            await axios.post(
                `${baseUrl}/api/supervisor-kpm/classroom/tugas-mahasiswa/nilai/update`,
                payload
            );

            // Update local submission item
            setSubmissions((prev) =>
                prev.map((item) =>
                    item.username_mahasiswa === usernameMahasiswa
                        ? { ...item, score: numericScore, status: "dinilai" }
                        : item
                )
            );

            setAlertMessage({
                type: "success",
                text: `Nilai untuk mahasiswa ${usernameMahasiswa} berhasil disimpan (${numericScore}/100)!`,
            });
        } catch (err) {
            setAlertMessage({
                type: "error",
                text:
                    err?.response?.data?.message ||
                    "Gagal menyimpan nilai mahasiswa. Silakan coba lagi.",
            });
        } finally {
            setSavingScores((prev) => ({ ...prev, [usernameMahasiswa]: false }));
        }
    };

    // Quick Stats Calculation
    const totalStudents = submissions.length;
    const submittedCount = submissions.filter(
        (s) => s.status === "diserahkan" || s.status === "dinilai"
    ).length;
    const needReviewCount = submissions.filter((s) => s.status === "diserahkan").length;
    const gradedCount = submissions.filter((s) => s.status === "dinilai").length;
    const unsubmittedCount = submissions.filter(
        (s) => s.status !== "diserahkan" && s.status !== "dinilai"
    ).length;

    // Filtered Students List
    const filteredSubmissions = submissions.filter((item) => {
        const name = item.mahasiswa?.name?.toLowerCase() || "";
        const nim = item.username_mahasiswa?.toLowerCase() || "";
        const query = searchQuery.toLowerCase().trim();

        const matchesSearch = name.includes(query) || nim.includes(query);
        if (!matchesSearch) return false;

        if (filterStatus === "need_review") return item.status === "diserahkan";
        if (filterStatus === "graded") return item.status === "dinilai";
        if (filterStatus === "unsubmitted")
            return item.status !== "diserahkan" && item.status !== "dinilai";

        return true;
    });

    return (
        <li
            className={`w-full border rounded-2xl transition-all duration-200 overflow-hidden shadow-xs ${
                isExpanded
                    ? "border-[#06359f] ring-2 ring-[#06359f]/10 bg-white"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
            }`}
        >
            {/* Header: Clickable Card Header */}
            <div
                onClick={onToggle}
                className="w-full p-4 flex items-center justify-between gap-x-3 cursor-pointer select-none transition-colors"
            >
                <div className="flex items-center gap-x-3.5 flex-1 min-w-0">
                    {/* Icon */}
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-[#06359f] text-white">
                        <svg
                            focusable="false"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            className="fill-white"
                        >
                            <path d="M7 15h7v2H7zm0-4h10v2H7zm0-4h10v2H7z"></path>
                            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-.14 0-.27.01-.4.04a2.008 2.008 0 0 0-1.44 1.19c-.1.23-.16.49-.16.77v14c0 .27.06.54.16.78s.25.45.43.64c.27.27.62.47 1.01.55.13.02.26.03.4.03h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-.25c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zM19 19H5V5h14v14z"></path>
                        </svg>
                    </div>

                    {/* Task Title & Deadline */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-slate-800 text-base leading-tight truncate">
                                {task?.name}
                            </h3>
                            {task?.tipe && (
                                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                    {task.tipe}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
                            <Schedule sx={{ fontSize: 14, color: "text.secondary" }} />
                            Tenggat: {task?.tenggat || "Tidak ada tenggat"}
                        </p>
                    </div>
                </div>

                {/* Right: Quick Stats & Chevron Indicator */}
                <div className="flex items-center gap-2 shrink-0">
                    {submissions.length > 0 && (
                        <div className="hidden sm:flex items-center gap-1.5">
                            {needReviewCount > 0 && (
                                <Chip
                                    label={`${needReviewCount} Perlu Dinilai`}
                                    size="small"
                                    color="warning"
                                    sx={{ fontWeight: 700, borderRadius: 2 }}
                                />
                            )}
                            <Chip
                                label={`${gradedCount}/${totalStudents} Dinilai`}
                                size="small"
                                color={gradedCount === totalStudents && totalStudents > 0 ? "success" : "default"}
                                sx={{ fontWeight: 600, borderRadius: 2 }}
                            />
                        </div>
                    )}

                    <IconButton size="small" sx={{ color: isExpanded ? "#06359f" : "#94a3b8" }}>
                        {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </div>
            </div>

            {/* Expanded Body: Muncul di bawahnya tanpa redirect */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Divider sx={{ borderColor: "#f1f5f9" }} />

                <div className="p-4 md:p-6 bg-slate-50/60 flex flex-col gap-y-4">
                    {loading ? (
                        <div className="py-8 flex flex-col items-center justify-center">
                            <ThreeDot color="#06359f" size="small" />
                            <span className="text-xs text-slate-500 mt-2 font-medium">
                                Memuat pengumpulan tugas mahasiswa...
                            </span>
                        </div>
                    ) : (
                        <>
                            {/* Alert Notifications */}
                            {alertMessage && (
                                <Alert
                                    severity={alertMessage.type}
                                    onClose={() => setAlertMessage(null)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {alertMessage.text}
                                </Alert>
                            )}

                            {/* Summary Bar */}
                            <Grid container spacing={1.5}>
                                <Grid item xs={6} sm={3}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                            Total Mahasiswa
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#1e293b" }}>
                                            {totalStudents}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: needReviewCount > 0 ? alpha("#ed6c02", 0.08) : "#ffffff",
                                            border: "1px solid",
                                            borderColor: needReviewCount > 0 ? alpha("#ed6c02", 0.4) : "#e2e8f0",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: needReviewCount > 0 ? "warning.dark" : "text.secondary", fontWeight: 600 }}>
                                            Perlu Dinilai
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: needReviewCount > 0 ? "warning.dark" : "#1e293b" }}>
                                            {needReviewCount}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: gradedCount > 0 ? alpha("#008a01", 0.08) : "#ffffff",
                                            border: "1px solid",
                                            borderColor: gradedCount > 0 ? alpha("#008a01", 0.4) : "#e2e8f0",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: gradedCount > 0 ? "success.dark" : "text.secondary", fontWeight: 600 }}>
                                            Sudah Dinilai
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: gradedCount > 0 ? "success.dark" : "#1e293b" }}>
                                            {gradedCount}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2,
                                            bgcolor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            textAlign: "center",
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                                            Belum Mengumpulkan
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: "#64748b" }}>
                                            {unsubmittedCount}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>

                            {/* Search & Filter Controls */}
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: 1.5,
                                    pt: 1,
                                }}
                            >
                                <TextField
                                    size="small"
                                    placeholder="Cari nama atau NIM..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <Search sx={{ fontSize: 18, color: "text.secondary" }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{ minWidth: 240, bgcolor: "#ffffff", borderRadius: 2 }}
                                />

                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                    {[
                                        { key: "all", label: `Semua (${totalStudents})` },
                                        { key: "need_review", label: `Perlu Dinilai (${needReviewCount})` },
                                        { key: "graded", label: `Sudah Dinilai (${gradedCount})` },
                                        { key: "unsubmitted", label: `Belum (${unsubmittedCount})` },
                                    ].map((tab) => (
                                        <Button
                                            key={tab.key}
                                            size="small"
                                            variant={filterStatus === tab.key ? "contained" : "outlined"}
                                            onClick={() => setFilterStatus(tab.key)}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                fontSize: "0.8rem",
                                                bgcolor: filterStatus === tab.key ? "#06359f" : "#ffffff",
                                                borderColor: filterStatus === tab.key ? "#06359f" : "#cbd5e1",
                                                color: filterStatus === tab.key ? "#ffffff" : "#475569",
                                                "&:hover": {
                                                    bgcolor: filterStatus === tab.key ? "#042574" : "#f8fafc",
                                                },
                                            }}
                                        >
                                            {tab.label}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>

                            {/* Student Submissions List */}
                            <div className="flex flex-col gap-y-3 mt-1">
                                {filteredSubmissions.length > 0 ? (
                                    filteredSubmissions.map((student) => {
                                        const username = student.username_mahasiswa;
                                        const studentName = student.mahasiswa?.name || username;
                                        const isSubmitted =
                                            student.status === "diserahkan" || student.status === "dinilai";
                                        const isGraded = student.status === "dinilai";
                                        const rawLink = student.link;
                                        const isExternalLink =
                                            rawLink &&
                                            (rawLink.startsWith("http://") || rawLink.startsWith("https://"));
                                        const openUrl = isExternalLink
                                            ? rawLink
                                            : rawLink
                                            ? `${baseUrl}/storage/${rawLink.replace(/^public\//, "")}`
                                            : null;
                                        const isSaving = savingScores[username];

                                        return (
                                            <Box
                                                key={username}
                                                sx={{
                                                    p: 2.5,
                                                    borderRadius: 2.5,
                                                    bgcolor: "#ffffff",
                                                    border: "1px solid",
                                                    borderColor: isGraded
                                                        ? alpha("#008a01", 0.3)
                                                        : isSubmitted
                                                        ? alpha("#ed6c02", 0.4)
                                                        : "#e2e8f0",
                                                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                                                    display: "flex",
                                                    flexDirection: "column",
                                                    gap: 2,
                                                }}
                                            >
                                                {/* Top Row: Student Identity & Status */}
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <Avatar
                                                            sx={{
                                                                width: 38,
                                                                height: 38,
                                                                bgcolor: "#06359f",
                                                                fontSize: 14,
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {studentName?.charAt(0) || "M"}
                                                        </Avatar>
                                                        <div className="min-w-0">
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{ fontWeight: 700, color: "#1e293b", lineHeight: 1.2 }}
                                                            >
                                                                {studentName}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                                NIM: {username}
                                                            </Typography>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5">
                                                        {isGraded ? (
                                                            <Chip
                                                                icon={<CheckCircle sx={{ fontSize: 16 }} />}
                                                                label={`Dinilai: ${student.score ?? 0}/100`}
                                                                size="small"
                                                                color="success"
                                                                sx={{ fontWeight: 700, borderRadius: 2 }}
                                                            />
                                                        ) : isSubmitted ? (
                                                            <Chip
                                                                icon={<HourglassEmpty sx={{ fontSize: 16 }} />}
                                                                label="Perlu Dinilai"
                                                                size="small"
                                                                color="warning"
                                                                sx={{ fontWeight: 700, borderRadius: 2 }}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                label="Belum Mengumpulkan"
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{
                                                                    fontWeight: 600,
                                                                    borderRadius: 2,
                                                                    borderColor: "#cbd5e1",
                                                                    color: "#94a3b8",
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Middle: Submitted Link Box */}
                                                <Box
                                                    sx={{
                                                        p: 1.5,
                                                        px: 2,
                                                        borderRadius: 2,
                                                        bgcolor: isSubmitted ? "#f8fafc" : "#fafafa",
                                                        border: "1px dashed",
                                                        borderColor: isSubmitted ? "#cbd5e1" : "#e2e8f0",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "space-between",
                                                        flexWrap: "wrap",
                                                        gap: 1.5,
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        <LinkIcon
                                                            sx={{
                                                                color: isSubmitted ? "#06359f" : "#94a3b8",
                                                                fontSize: 18,
                                                                shrink: 0,
                                                            }}
                                                        />
                                                        {isSubmitted ? (
                                                            <span className="font-mono text-xs text-slate-700 truncate select-all">
                                                                {rawLink}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">
                                                                Mahasiswa belum mengumpulkan tautan tugas ini.
                                                            </span>
                                                        )}
                                                    </div>

                                                    {openUrl && (
                                                        <Button
                                                            variant="contained"
                                                            size="small"
                                                            href={openUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            endIcon={<OpenInNew sx={{ fontSize: 15 }} />}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: "none",
                                                                fontWeight: 700,
                                                                fontSize: "0.8rem",
                                                                bgcolor: "#06359f",
                                                                "&:hover": { bgcolor: "#042574" },
                                                                shrink: 0,
                                                            }}
                                                        >
                                                            Buka Link Tugas
                                                        </Button>
                                                    )}
                                                </Box>

                                                {/* Bottom: Penilaian (Score Input & Save Button) */}
                                                <div className="flex items-center justify-between flex-wrap gap-2 pt-1 border-t border-slate-100">
                                                    <span className="text-xs text-slate-500 font-medium">
                                                        Input Penilaian Tugas Mahasiswa (0 - 100):
                                                    </span>

                                                    <div className="flex items-center gap-2">
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            placeholder="0 - 100"
                                                            inputProps={{ min: 0, max: 100 }}
                                                            value={scores[username] ?? ""}
                                                            onChange={(e) =>
                                                                setScores({
                                                                    ...scores,
                                                                    [username]: e.target.value,
                                                                })
                                                            }
                                                            disabled={isSaving}
                                                            sx={{
                                                                width: 105,
                                                                "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                                                "& input": {
                                                                    textAlign: "center",
                                                                    fontWeight: 700,
                                                                    py: 0.8,
                                                                },
                                                            }}
                                                        />

                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            onClick={() => handleSaveScore(username)}
                                                            disabled={isSaving}
                                                            startIcon={
                                                                isGraded ? (
                                                                    <RateReview sx={{ fontSize: 16 }} />
                                                                ) : (
                                                                    <Check sx={{ fontSize: 16 }} />
                                                                )
                                                            }
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: "none",
                                                                fontWeight: 700,
                                                                fontSize: "0.8rem",
                                                                bgcolor: isGraded ? "#008a01" : "#06359f",
                                                                "&:hover": {
                                                                    bgcolor: isGraded ? "#006e01" : "#042574",
                                                                },
                                                            }}
                                                        >
                                                            {isSaving
                                                                ? "Menyimpan..."
                                                                : isGraded
                                                                ? "Perbarui Nilai"
                                                                : "Simpan Nilai"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Box>
                                        );
                                    })
                                ) : (
                                    <div className="p-6 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-200">
                                        <p className="font-medium text-sm">
                                            {searchQuery
                                                ? "Tidak ada mahasiswa yang sesuai dengan pencarian."
                                                : "Belum ada mahasiswa terdaftar pada tugas ini."}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Collapse>
        </li>
    );
};

export default SupervisorTaskInlineItem;
