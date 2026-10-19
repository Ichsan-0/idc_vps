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
} from "@mui/material";
import {
    Link as LinkIcon,
    OpenInNew,
    KeyboardArrowDown,
    KeyboardArrowUp,
    CheckCircle,
    Schedule,
    Send,
    ChatBubbleOutline,
    Edit,
    Undo,
} from "@mui/icons-material";
import { ThreeDot } from "react-loading-indicators";

const TaskInlineItem = ({
    task,
    idKelas,
    tipe = "kpm",
    baseUrl = "",
    usernameMahasiswa,
    isExpanded,
    onToggle,
}) => {
    const [submission, setSubmission] = useState(null);
    const [loadingSubmission, setLoadingSubmission] = useState(false);
    const [linkInput, setLinkInput] = useState("");
    const [isEditingLink, setIsEditingLink] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null); // { type: 'success' | 'error', text: '' }

    // Private Comments
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [sendingComment, setSendingComment] = useState(false);

    // Fetch submission data when expanded
    const fetchSubmission = async () => {
        if (!usernameMahasiswa || !idKelas || !task?.id) return;
        setLoadingSubmission(true);
        try {
            if (tipe === "kpm") {
                const res = await axios.get(`${baseUrl}/api/student/classroom/submission`, {
                    params: {
                        id_kelas: idKelas,
                        id_tugas: task.id,
                        username_mahasiswa: usernameMahasiswa,
                    },
                });
                if (res?.data?.data) {
                    setSubmission(res.data.data);
                    setLinkInput(res.data.data?.link || "");
                }
            } else {
                // PPL
                const res = await axios.get(`${baseUrl}/api/student/classroom-ppl/task/submission`, {
                    params: {
                        id_kelas: idKelas,
                        id_tugas: task.id,
                        username_mahasiswa: usernameMahasiswa,
                    },
                });
                if (res?.data?.data) {
                    setSubmission(res.data.data);
                    setLinkInput(res.data.data?.link || "");
                }
            }
        } catch (err) {
            console.error("Gagal memuat submission tugas:", err);
        } finally {
            setLoadingSubmission(false);
        }
    };

    // Fetch private comments
    const fetchComments = async () => {
        if (!usernameMahasiswa || !idKelas || !task?.id) return;
        setLoadingComments(true);
        try {
            if (tipe === "kpm") {
                const res = await axios.get(`${baseUrl}/api/student/classroom/privatecomment`, {
                    params: {
                        id_kelas: idKelas,
                        id_tugas: task.id,
                        created_by: usernameMahasiswa,
                    },
                });
                if (res?.data?.success && Array.isArray(res.data.data)) {
                    setComments(res.data.data);
                }
            } else {
                // PPL
                const res = await axios.get(`${baseUrl}/api/student/classroom-ppl/task/comment`, {
                    params: {
                        id_kelas: idKelas,
                        id_tugas: task.id,
                        created_by: usernameMahasiswa,
                        tipe: "private",
                    },
                });
                if (res?.data?.success && Array.isArray(res.data.data)) {
                    setComments(res.data.data);
                }
            }
        } catch (err) {
            console.error("Gagal memuat komentar:", err);
        } finally {
            setLoadingComments(false);
        }
    };

    useEffect(() => {
        if (isExpanded) {
            fetchSubmission();
        }
    }, [isExpanded]);

    useEffect(() => {
        if (isExpanded && showComments) {
            fetchComments();
        }
    }, [showComments, isExpanded]);

    // Handle Submit / Update Link
    const handleSubmitLink = async (e) => {
        e.preventDefault();
        setAlertMessage(null);

        let finalLink = linkInput.trim();
        if (!finalLink) {
            setAlertMessage({ type: "error", text: "Tautan / link tugas tidak boleh kosong." });
            return;
        }

        // Add https:// if user didn't specify protocol
        if (!/^https?:\/\//i.test(finalLink)) {
            finalLink = `https://${finalLink}`;
            setLinkInput(finalLink);
        }

        setSubmitting(true);
        try {
            if (tipe === "kpm") {
                const payload = new FormData();
                payload.append("id_kelas", idKelas);
                payload.append("id_tugas", task.id);
                payload.append("status", "diserahkan");
                payload.append("link", finalLink);
                payload.append("username_mahasiswa", usernameMahasiswa);

                const endpoint = submission?.id
                    ? `${baseUrl}/api/student/classroom/submission/update`
                    : `${baseUrl}/api/student/classroom/submission`;

                await axios.post(endpoint, payload);
            } else {
                // PPL
                await axios.post(`${baseUrl}/api/student/classroom-ppl/task/submission/create`, {
                    id_kelas: idKelas,
                    id_tugas: task.id,
                    username_mahasiswa: usernameMahasiswa,
                    status: "diserahkan",
                    link: finalLink,
                });
            }

            setAlertMessage({
                type: "success",
                text: "Tautan tugas berhasil disimpan dan diserahkan ke dosen supervisor!",
            });
            setIsEditingLink(false);
            fetchSubmission();
        } catch (err) {
            setAlertMessage({
                type: "error",
                text: err?.response?.data?.message || "Gagal menyimpan tautan tugas. Silakan coba lagi.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Cancel Submission (Batal Serahkan)
    const handleCancelSubmission = async () => {
        if (!window.confirm("Apakah Anda yakin ingin membatalkan penyerahan tugas ini?")) return;
        setSubmitting(true);
        setAlertMessage(null);
        try {
            if (tipe === "kpm") {
                await axios.delete(`${baseUrl}/api/student/classroom/submission`, {
                    params: {
                        id_kelas: idKelas,
                        id_tugas: task.id,
                        username_mahasiswa: usernameMahasiswa,
                    },
                });
            } else {
                // PPL: reset submission link
                await axios.post(`${baseUrl}/api/student/classroom-ppl/task/submission/create`, {
                    id_kelas: idKelas,
                    id_tugas: task.id,
                    username_mahasiswa: usernameMahasiswa,
                    status: "ditugaskan",
                    link: "",
                });
            }

            setAlertMessage({
                type: "success",
                text: "Penyerahan tugas dibatalkan. Anda dapat menempelkan link baru.",
            });
            setIsEditingLink(true);
            setLinkInput("");
            fetchSubmission();
        } catch (err) {
            setAlertMessage({
                type: "error",
                text: err?.response?.data?.message || "Gagal membatalkan penyerahan tugas.",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Send Private Comment
    const handleSendComment = async (e) => {
        e.preventDefault();
        const msg = commentText.trim();
        if (!msg) return;

        setSendingComment(true);
        try {
            if (tipe === "kpm") {
                const formData = new FormData();
                formData.append("tipe", "private");
                formData.append("id_tugas", task.id);
                formData.append("id_kelas", idKelas);
                formData.append("created_by", usernameMahasiswa);
                formData.append("message", msg);

                await axios.post(`${baseUrl}/api/student/classroom/privatecomment`, formData);
            } else {
                // PPL
                await axios.post(`${baseUrl}/api/student/classroom-ppl/task/comment`, {
                    tipe: "private",
                    id_tugas: task.id,
                    id_kelas: idKelas,
                    created_by: usernameMahasiswa,
                    message: msg,
                });
            }

            setCommentText("");
            fetchComments();
        } catch (err) {
            console.error("Gagal mengirim komentar:", err);
        } finally {
            setSendingComment(false);
        }
    };

    const isSubmitted = submission?.status === "diserahkan" || submission?.status === "dinilai";
    const isGraded = submission?.status === "dinilai";
    const rawLink = submission?.link;
    const isExternalLink = rawLink && (rawLink.startsWith("http://") || rawLink.startsWith("https://"));
    const finalOpenUrl = isExternalLink
        ? rawLink
        : rawLink
        ? `${baseUrl}/storage/${rawLink.replace(/^public\//, "")}`
        : null;

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
                    <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isGraded
                                ? "bg-emerald-600 text-white"
                                : isSubmitted
                                ? "bg-blue-600 text-white"
                                : "bg-[#129eaf] text-white"
                        }`}
                    >
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
                            Tenggat: {task?.tenggat || "-"}
                        </p>
                    </div>
                </div>

                {/* Right: Status Badge & Chevron */}
                <div className="flex items-center gap-2 shrink-0">
                    {submission && (
                        <>
                            {isGraded ? (
                                <Chip
                                    label={`Dinilai: ${submission.score ?? 0}/100`}
                                    size="small"
                                    color="success"
                                    sx={{ fontWeight: 700, borderRadius: 2 }}
                                />
                            ) : isSubmitted ? (
                                <Chip
                                    label="Diserahkan"
                                    size="small"
                                    color="primary"
                                    sx={{
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        bgcolor: "#06359f",
                                    }}
                                />
                            ) : (
                                <Chip
                                    label="Ditugaskan"
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                        fontWeight: 600,
                                        borderRadius: 2,
                                        borderColor: "#cbd5e1",
                                        color: "#64748b",
                                    }}
                                />
                            )}
                        </>
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
                    {loadingSubmission ? (
                        <div className="py-6 flex flex-col items-center justify-center">
                            <ThreeDot color="#06359f" size="small" />
                            <span className="text-xs text-slate-500 mt-2 font-medium">
                                Memuat status pengumpulan tugas...
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

                            {/* Status Card Banner */}
                            {isGraded ? (
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: alpha("#008a01", 0.08),
                                        border: "1px solid",
                                        borderColor: alpha("#008a01", 0.3),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        flexWrap: "wrap",
                                        gap: 1.5,
                                    }}
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle sx={{ color: "success.main", fontSize: 24 }} />
                                        <div>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "success.dark" }}>
                                                Tugas Telah Dinilai
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                Tugas ini telah dinilai oleh dosen / supervisor dan sudah tidak dapat diubah.
                                            </Typography>
                                        </div>
                                    </div>
                                    <Chip
                                        label={`Nilai: ${submission.score ?? 0} / 100`}
                                        color="success"
                                        sx={{ fontWeight: 800, fontSize: "0.95rem", px: 1, py: 2, borderRadius: 2 }}
                                    />
                                </Box>
                            ) : isSubmitted && !isEditingLink ? (
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: alpha("#06359f", 0.06),
                                        border: "1px dashed",
                                        borderColor: alpha("#06359f", 0.35),
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1.5,
                                    }}
                                >
                                    <div className="flex items-center justify-between flex-wrap gap-2">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle sx={{ color: "#06359f", fontSize: 22 }} />
                                            <div>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#06359f" }}>
                                                    Tugas Sudah Diserahkan
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                    Tautan tugas Anda sudah tersimpan dan dapat diakses oleh dosen supervisor.
                                                </Typography>
                                            </div>
                                        </div>
                                        <Chip
                                            label="Diserahkan"
                                            size="small"
                                            color="primary"
                                            sx={{ fontWeight: 700, borderRadius: 1.5, bgcolor: "#06359f" }}
                                        />
                                    </div>

                                    {/* Display Current Link */}
                                    <Box
                                        sx={{
                                            p: 1.5,
                                            px: 2,
                                            borderRadius: 2,
                                            bgcolor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "space-between",
                                            flexWrap: "wrap",
                                            gap: 1.5,
                                        }}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1">
                                            <LinkIcon sx={{ color: "#06359f", fontSize: 20, shrink: 0 }} />
                                            <span className="font-mono text-sm text-slate-700 truncate select-all">
                                                {rawLink}
                                            </span>
                                        </div>
                                        {finalOpenUrl && (
                                            <Button
                                                variant="contained"
                                                size="small"
                                                href={finalOpenUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                endIcon={<OpenInNew sx={{ fontSize: 16 }} />}
                                                sx={{
                                                    borderRadius: 2,
                                                    textTransform: "none",
                                                    fontWeight: 600,
                                                    bgcolor: "#06359f",
                                                    "&:hover": { bgcolor: "#042574" },
                                                    shrink: 0,
                                                }}
                                            >
                                                Buka Tautan
                                            </Button>
                                        )}
                                    </Box>

                                    {/* Action Buttons: Edit Link or Cancel Submission */}
                                    <div className="flex items-center gap-2 pt-1 justify-end">
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="inherit"
                                            onClick={() => setIsEditingLink(true)}
                                            startIcon={<Edit sx={{ fontSize: 16 }} />}
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                borderColor: "#cbd5e1",
                                                color: "#334155",
                                            }}
                                        >
                                            Ubah Tautan
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="outlined"
                                            color="error"
                                            onClick={handleCancelSubmission}
                                            disabled={submitting}
                                            startIcon={<Undo sx={{ fontSize: 16 }} />}
                                            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                                        >
                                            Batal Serahkan
                                        </Button>
                                    </div>
                                </Box>
                            ) : null}

                            {/* Link Submission Input Form (Shown if not submitted, or when user clicks 'Ubah Tautan') */}
                            {(!isSubmitted || isEditingLink) && !isGraded && (
                                <form onSubmit={handleSubmitLink} className="flex flex-col gap-y-3">
                                    <Box
                                        sx={{
                                            p: 2.5,
                                            borderRadius: 2.5,
                                            bgcolor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                                        }}
                                    >
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                                            {isEditingLink ? "Perbarui Tautan Tugas" : "Tempelkan Link Tugas"}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                                            Tempelkan link tugas Anda (misal: tautan Google Drive, YouTube, atau dokumen daring).
                                            Pastikan izin tautan disetel agar dapat dibuka oleh dosen supervisor.
                                        </Typography>

                                        <TextField
                                            fullWidth
                                            size="small"
                                            label="Link / URL Tugas"
                                            placeholder="https://drive.google.com/... atau tautan berkas tugas Anda"
                                            value={linkInput}
                                            onChange={(e) => setLinkInput(e.target.value)}
                                            required
                                            disabled={submitting}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LinkIcon sx={{ color: "#06359f", fontSize: 20 }} />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            helperText="Contoh: https://drive.google.com/file/d/... atau https://youtu.be/..."
                                        />

                                        <div className="flex items-center justify-end gap-2 mt-3 pt-2">
                                            {isEditingLink && (
                                                <Button
                                                    size="small"
                                                    variant="text"
                                                    color="inherit"
                                                    onClick={() => {
                                                        setIsEditingLink(false);
                                                        setLinkInput(submission?.link || "");
                                                    }}
                                                    disabled={submitting}
                                                    sx={{ textTransform: "none", fontWeight: 600 }}
                                                >
                                                    Batal
                                                </Button>
                                            )}
                                            <Button
                                                type="submit"
                                                variant="contained"
                                                size="small"
                                                disabled={submitting || !linkInput.trim()}
                                                sx={{
                                                    borderRadius: 2,
                                                    textTransform: "none",
                                                    fontWeight: 700,
                                                    px: 3,
                                                    bgcolor: "#06359f",
                                                    "&:hover": { bgcolor: "#042574" },
                                                }}
                                            >
                                                {submitting
                                                    ? "Menyimpan..."
                                                    : isEditingLink
                                                    ? "Simpan Perubahan Link"
                                                    : "Serahkan Tugas"}
                                            </Button>
                                        </div>
                                    </Box>
                                </form>
                            )}

                            {/* Section: Private Comments / Catatan Tugas */}
                            <Box sx={{ mt: 1 }}>
                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => setShowComments(!showComments)}
                                    startIcon={<ChatBubbleOutline sx={{ fontSize: 16 }} />}
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        color: "#475569",
                                        "&:hover": { bgcolor: "transparent", color: "#06359f" },
                                    }}
                                >
                                    {showComments
                                        ? "Sembunyikan Komentar Pribadi"
                                        : `Komentar Pribadi (${comments.length})`}
                                </Button>

                                <Collapse in={showComments}>
                                    <Box
                                        sx={{
                                            mt: 1.5,
                                            p: 2,
                                            borderRadius: 2.5,
                                            bgcolor: "#ffffff",
                                            border: "1px solid #e2e8f0",
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 2,
                                        }}
                                    >
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary" }}>
                                            Pesan pribadi antara Anda dan Dosen Supervisor untuk tugas ini:
                                        </Typography>

                                        {loadingComments ? (
                                            <div className="py-2 text-center text-xs text-slate-400">
                                                Memuat komentar...
                                            </div>
                                        ) : comments.length > 0 ? (
                                            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
                                                {comments.map((c, idx) => {
                                                    const isMe = c.created_by === usernameMahasiswa;
                                                    return (
                                                        <div
                                                            key={c.id || idx}
                                                            className={`p-2.5 rounded-xl max-w-[85%] text-sm ${
                                                                isMe
                                                                    ? "ml-auto bg-blue-50 text-blue-950 border border-blue-100"
                                                                    : "mr-auto bg-slate-100 text-slate-800"
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-3 mb-0.5">
                                                                <span className="font-bold text-xs">
                                                                    {isMe ? "Anda" : c.created_by_name || "Supervisor"}
                                                                </span>
                                                                {c.created_at && (
                                                                    <span className="text-[10px] text-slate-400">
                                                                        {new Date(c.created_at).toLocaleDateString("id-ID", {
                                                                            day: "numeric",
                                                                            month: "short",
                                                                        })}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="whitespace-pre-line text-xs">{c.message}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: "#94a3b8", fontStyle: "italic", fontSize: "0.8rem" }}>
                                                Belum ada komentar pribadi. Anda dapat mengirimkan catatan untuk supervisor di bawah.
                                            </Typography>
                                        )}

                                        {/* Send Comment Input */}
                                        <form onSubmit={handleSendComment} className="flex items-center gap-1.5 mt-1">
                                            <TextField
                                                fullWidth
                                                size="small"
                                                placeholder="Tulis pesan pribadi untuk supervisor..."
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                disabled={sendingComment}
                                                sx={{
                                                    "& .MuiOutlinedInput-root": { borderRadius: 2 },
                                                    fontSize: "0.85rem",
                                                }}
                                            />
                                            <IconButton
                                                type="submit"
                                                color="primary"
                                                disabled={sendingComment || !commentText.trim()}
                                                sx={{
                                                    bgcolor: "#06359f",
                                                    color: "white",
                                                    borderRadius: 2,
                                                    "&:hover": { bgcolor: "#042574" },
                                                    "&.Mui-disabled": { bgcolor: "#cbd5e1", color: "white" },
                                                }}
                                            >
                                                <Send sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </form>
                                    </Box>
                                </Collapse>
                            </Box>
                        </>
                    )}
                </div>
            </Collapse>
        </li>
    );
};

export default TaskInlineItem;
