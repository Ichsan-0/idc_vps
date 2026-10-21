import { useEffect, useState } from "react";
import axios from "axios";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    Snackbar,
    TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/id";
import InputError from "@/Components/InputError";
import DeveloperCredit from "@/Components/DeveloperCredit";
import {
    ArrowRight,
    BadgeCheck,
    BookOpenCheck,
    CalendarDays,
    RefreshCw,
    Sparkles,
    UserRound,
} from "lucide-react";

dayjs.locale("id");

export default function VerifikasiMahasiswa() {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        nim: "",
        tanggal_lahir: "",
    });

    const [dateValue, setDateValue] = useState(
        data.tanggal_lahir ? dayjs(data.tanggal_lahir) : null
    );
    const [microWarningOpen, setMicroWarningOpen] = useState(false);
    const [warningData, setWarningData] = useState(null);
    const [showFormPertimbangan, setShowFormPertimbangan] = useState(false);
    const [alasanPertimbangan, setAlasanPertimbangan] = useState("");
    const [loadingPertimbangan, setLoadingPertimbangan] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState("success");
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const verificationFeatures = [
        { icon: BadgeCheck, text: "Validasi identitas mahasiswa" },
        { icon: RefreshCw, text: "Sinkronisasi SIAKAD / SEVIMA" },
        { icon: BookOpenCheck, text: "Cek SKS & nilai Micro Teaching" },
    ];

    // Buka popup saat flash micro_warning diterima dari redirect
    useEffect(() => {
        if (flash?.micro_warning) {
            setWarningData(flash.micro_warning);
            setMicroWarningOpen(true);
            setShowFormPertimbangan(false); // Reset form status when opening new warning
        }
    }, [flash?.micro_warning]);

    const handleKirimPertimbangan = async () => {
        if (!alasanPertimbangan.trim()) {
            setStatusMessage("Alasan pertimbangan harus diisi.");
            setStatusType("error");
            setSnackbarOpen(true);
            return;
        }

        try {
            setLoadingPertimbangan(true);
            const res = await axios.post(route("verifikasi.mahasiswa.pertimbangan"), {
                nim: warningData?.nim,
                nama: warningData?.nama,
                alasan: alasanPertimbangan,
                sks_diambil: warningData?.sks_diambil,
                nilai_microteaching: warningData?.nilai || '-',
                program_studi: warningData?.program_studi,
            });

            if (res.data.success) {
                setStatusMessage(res.data.message);
                setStatusType("success");
                setSnackbarOpen(true);
                setShowFormPertimbangan(false);
                setAlasanPertimbangan("");
                setTimeout(() => {
                    setMicroWarningOpen(false);
                }, 2000);
            } else {
                setStatusMessage(res.data.message || "Gagal mengajukan pertimbangan.");
                setStatusType("error");
                setSnackbarOpen(true);
            }
        } catch (error) {
            console.error(error);
            setStatusMessage(error.response?.data?.message || "Terjadi kesalahan sistem.");
            setStatusType("error");
            setSnackbarOpen(true);
        } finally {
            setLoadingPertimbangan(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("verifikasi.mahasiswa.check"), { preserveScroll: true });
    };

    return (
        <>
            <Head title="Verifikasi Mahasiswa" />

            <div className="relative min-h-screen overflow-x-hidden bg-slate-50">
                {/* Dekorasi latar */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#06359f]/10 blur-3xl" />
                    <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
                </div>

                <div className="relative mx-auto grid min-h-screen w-full max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">
                    {/* Panel form */}
                    <div className="flex min-h-screen flex-col px-4 py-8 sm:px-8 lg:px-16 xl:px-24">
                        <div className="flex items-center gap-3">
                            <img
                                src="/Lambang_UIN_Ar-Raniry.png"
                                alt="Lambang UIN Ar-Raniry"
                                className="h-14 w-14 shrink-0 object-contain"
                            />
                            <div className="min-w-0">
                                <p className="text-lg font-extrabold tracking-tight text-[#06359f]">
                                    IDC
                                </p>
                                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500 sm:text-[11px]">
                                    Instructional Development Center
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-1 items-center justify-center py-10">
                            <div className="w-full max-w-md">
                                <div className="mb-8">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-[#06359f]/15 bg-[#06359f]/5 px-3 py-1 text-xs font-semibold text-[#06359f]">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Pendaftaran Mahasiswa
                                    </span>
                                    <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                                        Verifikasi Mahasiswa
                                    </h1>
                                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                                        Masukkan NIM dan tanggal lahir untuk memverifikasi
                                        data Anda sebelum melakukan pendaftaran.
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label
                                            htmlFor="nim"
                                            className="mb-1.5 block text-sm font-semibold text-slate-700"
                                        >
                                            NIM
                                        </label>
                                        <div className="relative">
                                            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                            <input
                                                id="nim"
                                                type="text"
                                                inputMode="numeric"
                                                autoComplete="off"
                                                value={data.nim}
                                                onChange={(e) =>
                                                    setData("nim", e.target.value)
                                                }
                                                placeholder="Contoh: 210101234"
                                                disabled={processing}
                                                className={`h-12 w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:ring-4 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                                                    errors.nim
                                                        ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                                        : "border-slate-200 focus:border-[#06359f] focus:ring-[#06359f]/10"
                                                }`}
                                            />
                                        </div>
                                        <InputError
                                            message={errors.nim}
                                            className="mt-2"
                                        />
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="tanggal_lahir"
                                            className="mb-1.5 block text-sm font-semibold text-slate-700"
                                        >
                                            Tanggal Lahir{" "}
                                            <span className="text-xs font-normal text-slate-400">
                                                (dd/mm/yyyy)
                                            </span>
                                        </label>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                value={dateValue}
                                                format="DD/MM/YYYY"
                                                onChange={(newValue) => {
                                                    setDateValue(newValue);
                                                    if (newValue && newValue.isValid()) {
                                                        setData(
                                                            "tanggal_lahir",
                                                            newValue.format("YYYY-MM-DD")
                                                        );
                                                    } else {
                                                        setData("tanggal_lahir", "");
                                                    }
                                                }}
                                                disabled={processing}
                                                slotProps={{
                                                    textField: {
                                                        id: "tanggal_lahir",
                                                        fullWidth: true,
                                                        placeholder: "dd/mm/yyyy",
                                                        error: !!errors.tanggal_lahir,
                                                        InputProps: {
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <CalendarDays className="h-4 w-4 text-slate-400" />
                                                                </InputAdornment>
                                                            ),
                                                        },
                                                        sx: {
                                                            "& .MuiOutlinedInput-root": {
                                                                height: "48px",
                                                                borderRadius: "12px",
                                                                backgroundColor: "#ffffff",
                                                                fontSize: "0.875rem",
                                                                "& fieldset": {
                                                                    borderColor:
                                                                        errors.tanggal_lahir
                                                                            ? "#fca5a5"
                                                                            : "#e2e8f0",
                                                                },
                                                                "&:hover fieldset": {
                                                                    borderColor: "#cbd5e1",
                                                                },
                                                                "&.Mui-focused fieldset": {
                                                                    borderColor: "#06359f",
                                                                    borderWidth: "1px",
                                                                },
                                                                "&.Mui-disabled": {
                                                                    backgroundColor: "#f8fafc",
                                                                },
                                                            },
                                                            "& .MuiInputBase-input": {
                                                                fontSize: "0.875rem",
                                                                color: "#1e293b",
                                                                padding: "12px 4px",
                                                                "&::placeholder": {
                                                                    color: "#94a3b8",
                                                                    opacity: 1,
                                                                },
                                                            },
                                                            "& .MuiInputAdornment-root": {
                                                                color: "#94a3b8",
                                                            },
                                                            "& .MuiIconButton-root": {
                                                                color: "#64748b",
                                                            },
                                                        },
                                                    },
                                                }}
                                            />
                                        </LocalizationProvider>
                                        <InputError
                                            message={errors.tanggal_lahir}
                                            className="mt-2"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#06359f] text-sm font-bold text-white shadow-[0_14px_30px_-14px_rgba(6,53,159,0.6)] transition hover:bg-[#042574] disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        {processing ? (
                                            <>
                                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                                Memeriksa data...
                                            </>
                                        ) : (
                                            <>
                                                Verifikasi Data
                                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-6 flex flex-col items-center gap-2 text-sm sm:flex-row sm:justify-between">
                                    <span className="text-slate-500">
                                        Sudah punya akun?
                                    </span>
                                    <Link
                                        href="/login"
                                        className="font-semibold text-[#06359f] hover:underline"
                                    >
                                        Masuk ke portal
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-1 lg:items-start">
                            <p className="text-center text-[11px] text-slate-400 lg:text-left">
                                © {new Date().getFullYear()} IDC FTK UIN Ar-Raniry. All
                                rights reserved.
                            </p>
                            <DeveloperCredit
                                variant="light"
                                className="text-center text-[11px] leading-relaxed lg:text-left"
                            />
                        </div>
                    </div>

                    {/* Panel visual */}
                    <div className="relative hidden overflow-hidden lg:block">
                        <img
                            src="/assets/landmark-uinar-scaled.jpg"
                            alt="Kampus UIN Ar-Raniry Banda Aceh"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-br from-[#06359f]/95 via-[#06359f]/75 to-emerald-950/80" />

                        <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
                            <div className="flex justify-end">
                                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
                                    Pendaftaran PPKPM
                                </span>
                            </div>

                            <div className="max-w-lg">
                                <h2 className="text-3xl font-extrabold leading-tight text-white xl:text-4xl">
                                    Verifikasi data akademik Anda dengan aman.
                                </h2>
                                <p className="mt-4 text-sm leading-relaxed text-white/80">
                                    Pastikan NIM dan tanggal lahir sesuai data
                                    kampus sebelum melanjutkan pendaftaran PPL
                                    dan KPM.
                                </p>

                                <div className="mt-8 space-y-3">
                                    {verificationFeatures.map(
                                        ({ icon: Icon, text }) => (
                                            <div
                                                key={text}
                                                className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm"
                                            >
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                                                    <Icon className="h-4 w-4 text-white" />
                                                </span>
                                                <span className="text-sm font-medium text-white">
                                                    {text}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <p className="text-xs text-white/60">
                                Fakultas Tarbiyah dan Keguruan · UIN Ar-Raniry
                                Banda Aceh
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pop-up Peringatan Nilai Micro Teaching - di luar grid agar tampil sebagai overlay penuh */}
            {(() => {
                const isMpi = warningData?.is_mpi || false;
                const warningType = warningData?.type || (warningData === true ? 'not_found' : '');
                const userGrade = warningData?.nilai || '';
                const sksDiambil = warningData?.sks_diambil || 0;

                const courseName = isMpi 
                    ? "Micro Profesi / Program Latihan Profesi (PLP) I" 
                    : "Micro Teaching";

                let dialogTitle = `Nilai ${courseName} Belum Ada`;
                let messageTitle = `Saat ini nilai ${courseName} Anda belum tersedia.`;
                let messageContent = `Silahkan hubungi dosen/koordinator program studi Anda untuk memastikan nilai ${courseName} telah diinputkan ke sistem akademik, atau coba verifikasi kembali beberapa saat setelah nilai telah diproses.`;
                let footerMessage = `Pendaftaran tidak dapat dilanjutkan sampai nilai ${courseName} Anda tersedia di SIAKAD / SEVIMA.`;

                if (warningType === 'under_grade') {
                    dialogTitle = `Nilai ${courseName} Tidak Memenuhi Syarat`;
                    messageTitle = `Nilai ${courseName} Anda (${userGrade}) di bawah batas minimal B-.`;
                    messageContent = `Berdasarkan persyaratan pendaftaran, nilai mata kuliah ${courseName} minimal harus mendapatkan indeks nilai B-. Nilai Anda saat ini (${userGrade}) tidak diizinkan untuk mendaftar.`;
                    footerMessage = `Pendaftaran tidak dapat dilanjutkan karena nilai ${courseName} Anda tidak memenuhi syarat minimal B-.`;
                } else if (warningType === 'insufficient_sks') {
                    dialogTitle = `Jumlah SKS Belum Memenuhi Syarat`;
                    messageTitle = `Jumlah SKS yang ditempuh belum mencukupi.`;
                    messageContent = `Berdasarkan persyaratan pendaftaran, Anda wajib sudah menempuh minimal 132 SKS. Saat ini Anda baru menempuh ${sksDiambil} SKS.`;
                    footerMessage = `Pendaftaran tidak dapat dilanjutkan karena jumlah SKS Anda belum memenuhi syarat minimal 132 SKS.`;
                }

                if (showFormPertimbangan) {
                    return (
                        <Dialog
                            open={microWarningOpen}
                            onClose={() => setMicroWarningOpen(false)}
                            maxWidth="sm"
                            fullWidth
                            PaperProps={{
                                style: {
                                    borderRadius: "16px",
                                    padding: "8px",
                                },
                            }}
                        >
                            <DialogTitle
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    fontWeight: 700,
                                    fontSize: "1.15rem",
                                    color: "#1e3a8a",
                                    pb: 0,
                                }}
                            >
                                <span style={{ fontSize: "1.5rem" }}>📝</span>
                                Ajukan Pertimbangan Pendaftaran
                            </DialogTitle>

                            <DialogContent sx={{ pt: 2 }}>
                                <p style={{ margin: 0, color: "#4b5563", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "12px" }}>
                                    Masukkan alasan pertimbangan Anda agar admin dapat meninjau persyaratan pendaftaran secara manual.
                                </p>
                                <div style={{ marginTop: "16px" }} className="space-y-2">
                                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#6b7280" }}>
                                        <strong>Nama:</strong> {warningData?.nama} <br />
                                        <strong>NIM:</strong> {warningData?.nim}
                                    </p>
                                    <TextField
                                        label="Alasan Pertimbangan"
                                        multiline
                                        rows={4}
                                        fullWidth
                                        value={alasanPertimbangan}
                                        onChange={(e) => setAlasanPertimbangan(e.target.value)}
                                        placeholder="Tuliskan alasan/keterangan pertimbangan Anda (misal: SKS kurang karena konversi mata kuliah, nilai micro teaching masih proses input, dll.)"
                                        disabled={loadingPertimbangan}
                                        sx={{
                                            mt: 2,
                                            "& .MuiOutlinedInput-root.Mui-focused": {
                                                outline: "none",
                                                boxShadow: "none",
                                            },
                                        }}
                                    />
                                </div>
                            </DialogContent>

                            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                                <Button
                                    onClick={() => setShowFormPertimbangan(false)}
                                    variant="outlined"
                                    disabled={loadingPertimbangan}
                                    sx={{
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderColor: "#d1d5db",
                                        color: "#374151",
                                        "&:hover": { borderColor: "#9ca3af", backgroundColor: "#f9fafb" },
                                        px: 3,
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    onClick={handleKirimPertimbangan}
                                    variant="contained"
                                    disabled={loadingPertimbangan}
                                    sx={{
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        backgroundColor: "#3b82f6",
                                        "&:hover": { backgroundColor: "#2563eb" },
                                        boxShadow: "none",
                                        px: 3,
                                    }}
                                >
                                    {loadingPertimbangan ? <CircularProgress size={20} color="inherit" /> : "Kirim Permohonan"}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    );
                }

                return (
                    <Dialog
                        open={microWarningOpen}
                        onClose={() => setMicroWarningOpen(false)}
                        maxWidth="sm"
                        fullWidth
                        PaperProps={{
                            style: {
                                borderRadius: "16px",
                                padding: "8px",
                            },
                        }}
                    >
                        <DialogTitle
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                fontWeight: 700,
                                fontSize: "1.15rem",
                                color: "#b45309",
                                pb: 0,
                            }}
                        >
                            <span style={{ fontSize: "1.5rem" }}>⚠️</span>
                            {dialogTitle}
                        </DialogTitle>

                        <DialogContent sx={{ pt: 2 }}>
                            <div
                                style={{
                                    backgroundColor: "#fefce8",
                                    border: "1px solid #fde68a",
                                    borderRadius: "12px",
                                    padding: "16px",
                                    marginBottom: "12px",
                                }}
                            >
                                <p style={{ margin: 0, color: "#78350f", fontWeight: 600, marginBottom: "6px" }}>
                                    {messageTitle}
                                </p>
                                <p style={{ margin: 0, color: "#92400e", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "12px" }}>
                                    {messageContent}
                                </p>
                                <div style={{ borderTop: "1px dashed #fde68a", paddingTop: "8px", marginTop: "8px", fontSize: "0.9rem", color: "#78350f" }}>
                                    <strong>Status SKS Anda:</strong> {sksDiambil} SKS diambil (Syarat wajib: 132 SKS)
                                    {sksDiambil >= 132 ? (
                                        <span style={{ color: "#16a34a", marginLeft: "6px", fontWeight: "bold" }}>✓ Memenuhi Syarat</span>
                                    ) : (
                                        <span style={{ color: "#dc2626", marginLeft: "6px", fontWeight: "bold" }}>✗ Belum Memenuhi Syarat</span>
                                    )}
                                </div>
                            </div>
                            <p style={{ margin: 0, color: "#6b7280", fontSize: "0.85rem" }}>
                                {footerMessage}
                            </p>
                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontSize: "0.85rem" }}>
                                {warningData?.has_dispensasi && (
                                    <span style={{ color: "#2563eb", fontWeight: "600" }}>
                                        ℹ️ Pertimbangan Sedang Ditinjau Admin
                                    </span>
                                )}
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                                {!warningData?.has_dispensasi && (
                                    <Button
                                        onClick={() => setShowFormPertimbangan(true)}
                                        variant="contained"
                                        sx={{
                                            borderRadius: "10px",
                                            textTransform: "none",
                                            fontWeight: 600,
                                            px: 3,
                                            boxShadow: "none",
                                            backgroundColor: "#2563eb",
                                            color: "#ffffff",
                                            "&:hover": { backgroundColor: "#1d4ed8" },
                                        }}
                                    >
                                        Ajukan Pertimbangan
                                    </Button>
                                )}
                                <Button
                                    onClick={() => setMicroWarningOpen(false)}
                                    variant="outlined"
                                    sx={{
                                        borderRadius: "10px",
                                        textTransform: "none",
                                        fontWeight: 600,
                                        borderColor: "#eab308",
                                        color: "#eab308",
                                        "&:hover": { borderColor: "#ca8a04", backgroundColor: "#fefce8" },
                                        px: 4,
                                    }}
                                >
                                    Tutup
                                </Button>
                            </div>
                        </DialogActions>
                    </Dialog>
                );
            })()}
            
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity={statusType} sx={{ width: "100%" }}>
                    {statusMessage}
                </Alert>
            </Snackbar>
        </>
    );
}
