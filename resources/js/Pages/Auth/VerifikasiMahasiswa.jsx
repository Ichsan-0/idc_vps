import { useEffect, useState } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import { Alert, CircularProgress, Snackbar, TextField } from "@mui/material";
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

    useEffect(() => {
        if (errors.nim || errors.tanggal_lahir) {
            setNotif(false);
        }
    }, [errors]);

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
        </ThemeProvider>
    );
}
