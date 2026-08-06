import { useEffect, useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Alert, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, TextField } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import gambar from "../../../../public/assets/landmark-uinar-scaled.jpg";
import InputError from "@/Components/InputError";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import dayjs from "dayjs";

const theme = createTheme({
    palette: {
        primary: {
            main: "#eab308",
        },
    },
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#eab308",
                        borderWidth: "2px",
                    },
                    "&.Mui-disabled": {
                        backgroundColor: "#f5f5f5",
                    },
                },
                input: {
                    "&.Mui-disabled": {
                        color: "#000000",
                        WebkitTextFillColor: "#000000",
                        fontWeight: "300",
                    },
                    "&:focus": {
                        outline: "none",
                        boxShadow: "none",
                    },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    "& .MuiOutlinedInput-root.Mui-focused": {
                        outline: "none",
                        boxShadow: "none",
                    },
                    "& .MuiInputBase-input:focus": {
                        outline: "none",
                        boxShadow: "none",
                    },
                },
            },
        },
    },
});

export default function VerifikasiMahasiswa() {
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        nim: "",
        tanggal_lahir: "",
    });

    const [notif, setNotif] = useState(false);
    const [dateValue, setDateValue] = useState(data.tanggal_lahir ? dayjs(data.tanggal_lahir) : null);
    const [microWarningOpen, setMicroWarningOpen] = useState(false);
    const [warningData, setWarningData] = useState(null);

    useEffect(() => {
        if (errors.nim || errors.tanggal_lahir) {
            setNotif(false);
        }
    }, [errors]);

    // Buka popup saat flash micro_warning diterima dari redirect
    useEffect(() => {
        if (flash?.micro_warning) {
            setWarningData(flash.micro_warning);
            setMicroWarningOpen(true);
        }
    }, [flash?.micro_warning]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("verifikasi.mahasiswa.check"), { preserveScroll: true });
    };

    return (
        <ThemeProvider theme={theme}>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center w-full min-h-screen bg-white">
                <Head title="Verifikasi Mahasiswa" />

                {/* Panel Kiri : Form */}
                <div className="flex w-full min-h-screen justify-center items-start md:items-center flex-col bg-white px-6 py-10">
                    <div className="flex w-full max-w-[500px] mb-5 items-start">
                        <img
                            className="w-20"
                            src="https://upload.wikimedia.org/wikipedia/commons/a/af/Lambang_UIN_Ar-Raniry.png"
                            alt="Logo UIN Ar-Raniry"
                        />
                    </div>

                    {/* Card Form */}
                    <div className="w-full max-w-[500px] bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
                        <h1 className="text-2xl font-bold mb-1 text-gray-800">
                            Verifikasi Mahasiswa
                        </h1>
                        <p className="text-sm text-gray-400 mb-7">
                            Masukkan NIM dan tanggal lahir untuk memverifikasi data Anda sebelum melakukan pendaftaran.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* NIM */}
                            <div>
                                <TextField
                                    id="nim"
                                    label="NIM"
                                    type="text"
                                    fullWidth
                                    value={data.nim}
                                    onChange={(e) => setData("nim", e.target.value)}
                                    placeholder="Contoh: 210101234"
                                    disabled={processing}
                                />
                                <InputError message={errors.nim} className="mt-1" />
                            </div>

                            {/* Tanggal Lahir */}
                            <div>
                                <LocalizationProvider dateAdapter={AdapterDayjs}>
                                    <DesktopDatePicker
                                        label="Tanggal Lahir"
                                        format="DD/MM/YYYY"
                                        value={dateValue}
                                        onChange={(newValue) => {
                                            setDateValue(newValue);
                                            if (newValue && newValue.isValid()) {
                                                setData("tanggal_lahir", newValue.format("YYYY-MM-DD"));
                                            } else {
                                                setData("tanggal_lahir", "");
                                            }
                                        }}
                                        slotProps={{
                                            textField: {
                                                fullWidth: true,
                                                id: "tanggal_lahir",
                                                disabled: processing,
                                                error: !!errors.tanggal_lahir,
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                                <InputError message={errors.tanggal_lahir} className="mt-1" />
                            </div>

                            {/* Tombol */}
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-xl transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {processing ? (
                                    <>
                                        <CircularProgress size={18} sx={{ color: "white" }} />
                                        <span>Memeriksa...</span>
                                    </>
                                ) : "Verifikasi"}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Panel Kanan : Gambar */}
                <img
                    src={gambar}
                    className="hidden md:block h-full w-full object-cover fixed right-0 top-0 bottom-0"
                    style={{ width: "50%", height: "100vh" }}
                    alt="UIN Ar-Raniry"
                />
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

                        <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: "center" }}>
                            <Button
                                onClick={() => setMicroWarningOpen(false)}
                                variant="contained"
                                sx={{
                                    borderRadius: "10px",
                                    textTransform: "none",
                                    fontWeight: 600,
                                    backgroundColor: "#eab308",
                                    "&:hover": { backgroundColor: "#ca8a04" },
                                    boxShadow: "none",
                                    px: 4,
                                }}
                            >
                                Tutup
                            </Button>
                        </DialogActions>
                    </Dialog>
                );
            })()}
        </ThemeProvider>
    );
}
