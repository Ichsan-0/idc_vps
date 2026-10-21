import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    Collapse,
    Divider,
    IconButton,
    TextField,
    Typography,
    alpha,
} from "@mui/material";
import {
    CheckCircle,
    Description,
    KeyboardArrowDown,
    KeyboardArrowUp,
    OpenInNew,
    Person,
    Save,
    UploadFile,
} from "@mui/icons-material";
import InputError from "@/Components/InputError";
import LoaderOnButton from "@/Components/LoaderOnButtn";

const toFileUrl = (baseUrl, path) => {
    if (!path) return null;
    if (/^https?:\/\//i.test(path)) return path;
    return `${baseUrl}/storage/${String(path).replace(/^public\//, "")}`;
};

const getInitials = (name) => {
    if (!name) return "M";
    return name
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
};

const StudentAssessmentInlineItem = ({
    student,
    index,
    idKelas,
    baseUrl,
    isExpanded,
    onToggle,
    onSaved,
}) => {
    const [nilaiPamong, setNilaiPamong] = useState(student?.nilai_pamong ?? "");
    const [nilaiSupervisor, setNilaiSupervisor] = useState(
        student?.nilai_supervisor_ppl ?? ""
    );
    const [instrument, setInstrument] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [alertMessage, setAlertMessage] = useState(null);

    useEffect(() => {
        setNilaiPamong(student?.nilai_pamong ?? "");
        setNilaiSupervisor(student?.nilai_supervisor_ppl ?? "");
        setInstrument(null);
        setFieldErrors({});
    }, [
        student?.nim,
        student?.nilai_pamong,
        student?.nilai_supervisor_ppl,
        student?.link_instrument_penilaian,
        student?.link_laporan,
    ]);

    const instrumentUrl = toFileUrl(baseUrl, student?.link_instrument_penilaian);
    const laporanUrl = toFileUrl(baseUrl, student?.link_laporan);
    const isGraded = student?.status === "Sudah Dinilai";

    const handleInstrumentChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            setFieldErrors((prev) => ({
                ...prev,
                instrument: "File instrument harus berformat PDF.",
            }));
            return;
        }

        if (file.size > 500 * 1024) {
            setFieldErrors((prev) => ({
                ...prev,
                instrument: "Ukuran file instrument maksimal 500 KB.",
            }));
            return;
        }

        setInstrument(file);
        setFieldErrors((prev) => ({ ...prev, instrument: null }));
    };

    const validate = () => {
        const errors = {};
        const pamong = Number(nilaiPamong);
        const supervisor = Number(nilaiSupervisor);

        if (String(nilaiPamong).trim() === "" || Number.isNaN(pamong)) {
            errors.nilai_pamong = "Nilai pamong wajib diisi dengan angka.";
        } else if (pamong < 0 || pamong > 100) {
            errors.nilai_pamong = "Nilai pamong harus antara 0 dan 100.";
        }

        if (String(nilaiSupervisor).trim() === "" || Number.isNaN(supervisor)) {
            errors.nilai_supervisor = "Nilai supervisor wajib diisi dengan angka.";
        } else if (supervisor < 0 || supervisor > 100) {
            errors.nilai_supervisor = "Nilai supervisor harus antara 0 dan 100.";
        }

        if (!instrument && !student?.link_instrument_penilaian) {
            errors.instrument = "Instrument penilaian wajib diunggah.";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setSaving(true);
        setAlertMessage(null);

        try {
            const formData = new FormData();
            formData.append("nilai_pamong", nilaiPamong);
            formData.append("nilai_supervisor_ppl", nilaiSupervisor);
            formData.append("id_kelas", idKelas);
            formData.append("id_tugas", 1);
            formData.append("username_mahasiswa", student.nim);

            if (instrument) {
                formData.append("instrument", instrument);
            }

            const response = await axios.post(
                `${baseUrl}/api/supervisor-ppl/classroom/mahasiswa/update/${student.nim}`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            if (response?.data?.success) {
                setAlertMessage({
                    type: "success",
                    text: response.data.message || "Nilai berhasil disimpan.",
                });
                setInstrument(null);
                setFieldErrors({});
                onSaved?.();
            } else {
                setAlertMessage({
                    type: "error",
                    text: response?.data?.message || "Gagal menyimpan nilai.",
                });
            }
        } catch (err) {
            const errors = err.response?.data?.errors || {};
            setFieldErrors({
                nilai_pamong: errors.nilai_pamong?.[0] || null,
                nilai_supervisor: errors.nilai_supervisor_ppl?.[0] || null,
                instrument: errors.instrument?.[0] || null,
            });
            setAlertMessage({
                type: "error",
                text: err.response?.data?.message || "Gagal menyimpan nilai.",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            className={`transition-colors ${
                isExpanded ? "bg-blue-50/40" : "hover:bg-slate-50/80"
            }`}
        >
            {/* Summary row */}
            <div
                role="button"
                tabIndex={0}
                onClick={onToggle}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onToggle();
                    }
                }}
                className="grid cursor-pointer grid-cols-12 items-center gap-3 px-4 py-4"
            >
                <div className="col-span-1 text-center text-sm font-semibold text-slate-500">
                    {index + 1}
                </div>

                <div className="col-span-11 flex items-center gap-3 md:col-span-3">
                    <Avatar
                        sx={{
                            bgcolor: isGraded ? "#059669" : "#06359f",
                            width: 40,
                            height: 40,
                            fontSize: "0.85rem",
                            fontWeight: 700,
                        }}
                    >
                        {getInitials(student?.nama_mahasiswa)}
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                            {student?.nama_mahasiswa}
                        </p>
                        <p className="text-xs text-slate-500">{student?.nim}</p>
                    </div>
                </div>

                <div className="hidden md:col-span-2 md:block text-xs text-slate-600">
                    {student?.nama_prodi || "-"}
                </div>

                <div className="hidden md:col-span-2 md:block text-xs text-slate-600">
                    {student?.nama_sekolah || "-"}
                </div>

                <div className="hidden md:col-span-1 md:block text-center text-sm font-medium text-slate-700">
                    {student?.nilai_pamong ?? "-"}
                </div>

                <div className="hidden md:col-span-1 md:block text-center text-sm font-medium text-slate-700">
                    {student?.nilai_supervisor_ppl ?? "-"}
                </div>

                <div className="hidden md:col-span-1 md:flex md:justify-center">
                    <Chip
                        label={isGraded ? "Sudah Dinilai" : "Belum Dinilai"}
                        size="small"
                        color={isGraded ? "success" : "error"}
                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                    />
                </div>

                <div className="col-span-12 flex justify-end md:col-span-1">
                    <IconButton
                        size="small"
                        sx={{ color: isExpanded ? "#06359f" : "#94a3b8" }}
                    >
                        {isExpanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                </div>
            </div>

            {/* Inline form */}
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Divider sx={{ borderColor: "#f1f5f9" }} />
                <div className="bg-slate-50/60 p-4 md:p-6">
                    {alertMessage && (
                        <Alert
                            severity={alertMessage.type}
                            onClose={() => setAlertMessage(null)}
                            sx={{ mb: 3, borderRadius: 2 }}
                        >
                            {alertMessage.text}
                        </Alert>
                    )}

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                        {/* Student identity */}
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 2.5,
                                bgcolor: "#ffffff",
                                border: "1px solid #e2e8f0",
                                height: "fit-content",
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    fontWeight: 800,
                                    color: "#334155",
                                    mb: 2,
                                }}
                            >
                                <Person fontSize="small" /> Data Mahasiswa
                            </Typography>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">Nama</span>
                                    <span className="text-right font-semibold text-slate-800">
                                        {student?.nama_mahasiswa}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">NIM</span>
                                    <span className="font-mono font-semibold text-slate-800">
                                        {student?.nim}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">Prodi</span>
                                    <span className="text-right text-slate-800">
                                        {student?.nama_prodi || "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="text-slate-500">Tempat PPL</span>
                                    <span className="text-right text-slate-800">
                                        {student?.nama_sekolah || "-"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-slate-500">Status</span>
                                    <Chip
                                        label={isGraded ? "Sudah Dinilai" : "Belum Dinilai"}
                                        size="small"
                                        color={isGraded ? "success" : "error"}
                                        sx={{ fontWeight: 700, borderRadius: 1.5 }}
                                    />
                                </div>
                            </div>
                        </Box>

                        {/* Assessment form */}
                        <Box
                            sx={{
                                p: 2.5,
                                borderRadius: 2.5,
                                bgcolor: "#ffffff",
                                border: "1px solid #e2e8f0",
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    fontWeight: 800,
                                    color: "#334155",
                                    mb: 2,
                                }}
                            >
                                <Description fontSize="small" /> Form Penilaian
                            </Typography>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <TextField
                                        label="Nilai Supervisor"
                                        size="small"
                                        fullWidth
                                        type="text"
                                        inputMode="decimal"
                                        value={nilaiSupervisor}
                                        onChange={(event) =>
                                            setNilaiSupervisor(event.target.value)
                                        }
                                        error={!!fieldErrors.nilai_supervisor}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                    {fieldErrors.nilai_supervisor && (
                                        <InputError
                                            message={fieldErrors.nilai_supervisor}
                                        />
                                    )}
                                </div>

                                <div>
                                    <TextField
                                        label="Nilai Pamong"
                                        size="small"
                                        fullWidth
                                        type="text"
                                        inputMode="decimal"
                                        value={nilaiPamong}
                                        onChange={(event) =>
                                            setNilaiPamong(event.target.value)
                                        }
                                        error={!!fieldErrors.nilai_pamong}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: 2,
                                            },
                                        }}
                                    />
                                    {fieldErrors.nilai_pamong && (
                                        <InputError message={fieldErrors.nilai_pamong} />
                                    )}
                                </div>
                            </div>

                            {/* Laporan PPL */}
                            <div className="mt-4">
                                <p className="mb-1.5 text-xs font-semibold text-slate-600">
                                    Laporan PPL
                                </p>
                                {laporanUrl ? (
                                    <a
                                        href={laporanUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                    >
                                        <CheckCircle fontSize="small" />
                                        Lihat Laporan PPL
                                        <OpenInNew fontSize="small" />
                                    </a>
                                ) : (
                                    <p className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                                        Belum mengupload laporan
                                    </p>
                                )}
                            </div>

                            {/* Instrument Penilaian */}
                            <div className="mt-4">
                                <p className="mb-1.5 text-xs font-semibold text-slate-600">
                                    Instrument Penilaian
                                </p>

                                <div className="flex flex-col gap-2 sm:flex-row">
                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<UploadFile />}
                                        sx={{
                                            borderRadius: 2,
                                            textTransform: "none",
                                            fontWeight: 700,
                                            whiteSpace: "nowrap",
                                            borderColor: "#cbd5e1",
                                            color: "#334155",
                                        }}
                                    >
                                        Pilih File
                                        <input
                                            type="file"
                                            hidden
                                            accept="application/pdf"
                                            onChange={handleInstrumentChange}
                                        />
                                    </Button>

                                    <div className="flex min-w-0 flex-1 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                                        <span className="truncate text-xs text-slate-600">
                                            {instrument
                                                ? instrument.name
                                                : instrumentUrl
                                                ? "File instrument sudah ada"
                                                : "Tidak ada file"}
                                        </span>
                                        {instrumentUrl && !instrument && (
                                            <a
                                                href={instrumentUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                title="Lihat instrument penilaian"
                                                className="shrink-0 text-[#06359f] hover:underline"
                                            >
                                                <OpenInNew fontSize="small" />
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {fieldErrors.instrument && (
                                    <InputError message={fieldErrors.instrument} />
                                )}
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Format PDF, maksimal 500 KB. Kosongkan jika tidak ingin mengganti instrument yang sudah ada.
                                </p>
                            </div>

                            <div className="mt-5 flex justify-end">
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={saving}
                                    startIcon={!saving ? <Save /> : null}
                                    sx={{
                                        borderRadius: 2,
                                        textTransform: "none",
                                        fontWeight: 700,
                                        bgcolor: "#06359f",
                                        "&:hover": { bgcolor: "#042574" },
                                    }}
                                >
                                    {saving ? <LoaderOnButton /> : "Simpan"}
                                </Button>
                            </div>
                        </Box>
                    </div>
                </div>
            </Collapse>
        </div>
    );
};

export default StudentAssessmentInlineItem;
