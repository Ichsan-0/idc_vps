import InputError from "@/Components/InputError";
import { Head, useForm, Link } from "@inertiajs/react";
import {
    TextField,
    Button,
    CircularProgress,
    Alert,
    Box,
    Typography,
    Paper,
} from "@mui/material";
import { LockReset, ArrowBack, EmailOutlined } from "@mui/icons-material";
import gambar from "../../../../public/assets/landmark-uinar-scaled.jpg";

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("password.email"));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 items-center w-full h-screen bg-white/90">
            <Head title="Lupa Password" />

            <div className="flex w-full justify-center items-center flex-col px-4">
                <div className="flex w-full max-w-96 mb-3 items-start justify-start">
                    <img
                        className="w-28 cursor-pointer"
                        src="https://upload.wikimedia.org/wikipedia/commons/a/af/Lambang_UIN_Ar-Raniry.png"
                        alt="Logo UIN Ar-Raniry"
                    />
                </div>

                <Paper
                    elevation={3}
                    sx={{
                        width: "100%",
                        maxWidth: 384,
                        borderRadius: 3,
                        p: 4,
                        boxShadow: "0 4px 24px rgba(0,138,1,0.08)",
                    }}
                >
                    {/* Icon & Judul */}
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1, gap: 1.5 }}>
                        <Box
                            sx={{
                                bgcolor: "#f0fdf4",
                                borderRadius: 2,
                                p: 1,
                                display: "flex",
                                alignItems: "center",
                            }}
                        >
                            <LockReset sx={{ fontSize: 32, color: "#008a01" }} />
                        </Box>
                        <Typography variant="h5" fontWeight={700}>
                            Lupa Password
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Masukkan email yang terdaftar. Kami akan mengirimkan link untuk
                        mereset password Anda.
                    </Typography>

                    {/* Status sukses dari server */}
                    {status && (
                        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                            {status}
                        </Alert>
                    )}

                    <form onSubmit={submit}>
                        <TextField
                            id="email"
                            type="email"
                            label="Alamat Email"
                            fullWidth
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            autoFocus
                            placeholder="contoh@email.com"
                            InputProps={{
                                startAdornment: (
                                    <EmailOutlined
                                        sx={{ mr: 1, color: "text.secondary", fontSize: 20 }}
                                    />
                                ),
                            }}
                            sx={{
                                mb: 1,
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                    { borderColor: "#008a01", borderWidth: "2px" },
                                "& .MuiInputBase-input:focus": {
                                    outline: "none",
                                    boxShadow: "none",
                                },
                            }}
                        />
                        <InputError message={errors.email} className="mb-3" />

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            disabled={processing}
                            sx={{
                                mt: 1,
                                py: 1.5,
                                borderRadius: 2,
                                fontWeight: "bold",
                                bgcolor: "#008a01",
                                "&:hover": { bgcolor: "#006e01" },
                                textTransform: "none",
                                fontSize: "1rem",
                            }}
                            startIcon={
                                processing ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : null
                            }
                        >
                            {processing ? "Mengirim..." : "Kirim Link Reset Password"}
                        </Button>

                        <Box sx={{ mt: 2, textAlign: "center" }}>
                            <Link
                                href={route("login")}
                                style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 4,
                                    color: "#6b7280",
                                    fontSize: "0.875rem",
                                    textDecoration: "none",
                                }}
                            >
                                <ArrowBack sx={{ fontSize: 16 }} />
                                Kembali ke halaman Login
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </div>

            <img
                src={gambar}
                className="flex hidden md:block h-full w-full object-cover"
                alt="UIN Ar-Raniry"
            />
        </div>
    );
}
