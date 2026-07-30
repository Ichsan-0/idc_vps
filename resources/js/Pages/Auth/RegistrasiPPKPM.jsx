import {
    Alert,
    Snackbar,
    Autocomplete,
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Chip,
    Modal,
    IconButton,
    Typography,
    Card,
    CardContent,
    Grid,
    Paper,
    Divider,
    Tooltip,
    CircularProgress,
    Tabs,
    Tab,
    InputAdornment,
    OutlinedInput,
} from "@mui/material";
import PropTypes from "prop-types";
import {
    FaWhatsapp,
    FaTimes,
    FaEye,
    FaFilePdf,
    FaDownload,
    FaCheckCircle,
    FaHome,
    FaMapMarkerAlt,
} from "react-icons/fa";
import { styled, ThemeProvider, createTheme } from "@mui/material/styles";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Head, useForm, Link } from "@inertiajs/react";
import Header from "@/Components/frontpage/Header";
import InputError from "@/Components/InputError";
import { provinsi, kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import {
    CloudUploadOutlined,
    Description,
    Assignment,
    AssignmentInd,
    LocationOn,
    Home,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";
import ButtomFooter from "@/Components/frontpage/ButtomFooter";

function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3, bgcolor: "#fcfcfc" }}>{children}</Box>
            )}
        </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

const theme = createTheme({
    palette: {
        primary: {
            main: "#008a01",
            light: "#66b967",
            dark: "#006e01",
            contrastText: "#fff",
        },
        secondary: {
            main: "#1976d2",
            light: "#42a5f5",
            dark: "#1565c0",
        },
        success: {
            main: "#2e7d32",
            light: "#4caf50",
        },
        warning: {
            main: "#ed6c02",
            light: "#ff9800",
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 700,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#008a01",
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

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0,0,0,0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

export default function RegistrasiPPKPM({ verifiedData, list_prodi, base_url }) {
    const [notify, setNotify] = useState(false);
    const [notifyStatus, setNotifyStatus] = useState("info");
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [addressTab, setAddressTab] = useState(0);

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewType, setPreviewType] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [termsOpen, setTermsOpen] = useState(false);
    const [frontendErrors, setFrontendErrors] = useState({});

    // Transkrip states & logic
    const [transkripOpen, setTranskripOpen] = useState(false);
    const [transkripData, setTranskripData] = useState([]);
    const [loadingTranskrip, setLoadingTranskrip] = useState(false);

    const handleFetchTranskrip = async () => {
        setLoadingTranskrip(true);
        setTranskripOpen(true);
        try {
            const response = await fetch('/registrasi-ppkpm/transkrip');
            const result = await response.json();
            if (response.ok) {
                setTranskripData(result.data || []);
            } else {
                alert(result.error || 'Gagal memuat transkrip nilai.');
                setTranskripOpen(false);
            }
        } catch (error) {
            console.error('Error fetching transkrip:', error);
            alert('Terjadi kesalahan jaringan.');
            setTranskripOpen(false);
        } finally {
            setLoadingTranskrip(false);
        }
    };

    const transkripStats = useMemo(() => {
        let sksDiambil = 0;
        let sksLulus = 0;
        let totalMutu = 0;

        transkripData.forEach((item) => {
            const attrs = item.attributes || {};
            const sks = parseFloat(attrs.sks_mata_kuliah || attrs.sks || 0);
            const bobot = parseFloat(attrs.bobot_mata_kuliah || attrs.bobot || 0);
            const lulus = attrs.is_lulus === "1" || attrs.is_lulus === true;

            sksDiambil += sks;
            if (lulus) {
                sksLulus += sks;
            }
            totalMutu += bobot;
        });

        const calculatedIpk = sksDiambil > 0 ? (totalMutu / sksDiambil).toFixed(2) : "0.00";

        return {
            sksDiambil,
            sksLulus,
            totalMutu: totalMutu.toFixed(2),
            ipk: calculatedIpk,
        };
    }, [transkripData]);

    const handleAddressTabChange = (event, newValue) => {
        setAddressTab(newValue);
    };

    const listOfProvincies = useMemo(() => provinsi(), []);

    // Form data initialization
    const { data, setData, post, reset, processing, errors } = useForm({
        name: verifiedData.nama || "",
        nim: verifiedData.nim || "",
        email: verifiedData.email || "",
        hp: verifiedData.hp || "",
        program_studi: verifiedData.program_studi || "",
        jk: (verifiedData.jenis_kelamin === "L" || verifiedData.jenis_kelamin === "Laki-laki" || verifiedData.jenis_kelamin === "Pria") ? "Pria" : ((verifiedData.jenis_kelamin === "P" || verifiedData.jenis_kelamin === "Perempuan" || verifiedData.jenis_kelamin === "Wanita") ? "Wanita" : ""),
        semester: verifiedData.semester || "",
        ipk: verifiedData.ipk || "",
        nilai_micro_teaching: verifiedData.nilai_micro_teaching || "",
        cluster_kegiatan: "",
        id_prodi: (() => {
            const prodiFromSevima = (verifiedData.program_studi || "").trim().toLowerCase();
            const match = list_prodi.find(p => p.name.trim().toLowerCase() === prodiFromSevima);
            return match?.id || "";
        })(),
        alamat_asal: verifiedData.alamat || "",
        alamat_sekarang: "",
        // Regions Asal
        province_code: "",
        regency_code: "",
        subdistrict_code: "",
        village_code: "",

        // Regions Sekarang
        province_code_now: "",
        regency_code_now: "",
        subdistrict_code_now: "",
        village_code_now: "",

        // Account
        password: "",
        password_confirmation: "",

        // Files
        link_transkrip_nilai: null,
        link_surat_pernyataan: null,
        link_surat_kesiapan: null,
    });

    const [provinceAsal, setProvinceAsal] = useState(null);
    const [regencyAsal, setRegencyAsal] = useState(null);
    const [subDistrictAsal, setSubDistrictAsal] = useState(null);
    const [villageAsal, setVillageAsal] = useState(null);

    const [provinceNow, setProvinceNow] = useState(null);
    const [regencyNow, setRegencyNow] = useState(null);
    const [subDistrictNow, setSubDistrictNow] = useState(null);
    const [villageNow, setVillageNow] = useState(null);

    // Regions logic for Asal
    useEffect(() => {
        setData("province_code", provinceAsal?.kode || "");
        setRegencyAsal(null);
    }, [provinceAsal]);

    useEffect(() => {
        setData("regency_code", regencyAsal?.kode || "");
        setSubDistrictAsal(null);
    }, [regencyAsal]);

    useEffect(() => {
        setData("subdistrict_code", subDistrictAsal?.kode || "");
        setVillageAsal(null);
    }, [subDistrictAsal]);

    useEffect(() => {
        setData("village_code", villageAsal?.kode || "");
    }, [villageAsal]);

    // Regions logic for Sekarang
    useEffect(() => {
        setData("province_code_now", provinceNow?.kode || "");
        setRegencyNow(null);
    }, [provinceNow]);

    useEffect(() => {
        setData("regency_code_now", regencyNow?.kode || "");
        setSubDistrictNow(null);
    }, [regencyNow]);

    useEffect(() => {
        setData("subdistrict_code_now", subDistrictNow?.kode || "");
        setVillageNow(null);
    }, [subDistrictNow]);

    useEffect(() => {
        setData("village_code_now", villageNow?.kode || "");
    }, [villageNow]);

    const validateForm = () => {
        const errs = {};
        if (!data.jk) errs.jk = 'Jenis kelamin wajib dipilih.';
        if (!data.hp) errs.hp = 'Nomor WhatsApp wajib diisi.';
        if (!data.cluster_kegiatan) errs.cluster_kegiatan = 'Cluster kegiatan wajib dipilih.';
        if (!data.alamat_asal) errs.alamat_asal = 'Alamat asal wajib diisi.';
        if (!data.province_code) errs.province_code = 'Provinsi asal wajib dipilih.';
        if (!data.regency_code) errs.regency_code = 'Kabupaten asal wajib dipilih.';
        if (!data.subdistrict_code) errs.subdistrict_code = 'Kecamatan asal wajib dipilih.';
        if (!data.village_code) errs.village_code = 'Desa asal wajib dipilih.';
        if (!data.alamat_sekarang) errs.alamat_sekarang = 'Alamat sekarang wajib diisi.';
        if (!data.province_code_now) errs.province_code_now = 'Provinsi sekarang wajib dipilih.';
        if (!data.regency_code_now) errs.regency_code_now = 'Kabupaten sekarang wajib dipilih.';
        if (!data.subdistrict_code_now) errs.subdistrict_code_now = 'Kecamatan sekarang wajib dipilih.';
        if (!data.village_code_now) errs.village_code_now = 'Desa sekarang wajib dipilih.';
        if (!data.email) errs.email = 'Email wajib diisi.';
        if (!data.password) errs.password = 'Password wajib diisi.';
        if (!data.password_confirmation) errs.password_confirmation = 'Konfirmasi password wajib diisi.';
        if (data.password && data.password_confirmation && data.password !== data.password_confirmation)
            errs.password_confirmation = 'Konfirmasi password tidak cocok.';
        if (!data.link_surat_pernyataan) errs.link_surat_pernyataan = 'Surat Pernyataan Ka Prodi wajib diunggah.';
        if (!data.link_surat_kesiapan) errs.link_surat_kesiapan = 'Surat Kesiapan Mahasiswa wajib diunggah.';
        return errs;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errs = validateForm();
        if (Object.keys(errs).length > 0) {
            setFrontendErrors(errs);
            setNotifyStatus('error');
            setNotify(true);
            // Auto-switch ke tab alamat sekarang jika error ada di sana
            const hasAsalError = errs.alamat_asal || errs.province_code || errs.regency_code || errs.subdistrict_code || errs.village_code;
            const hasSekarangError = errs.alamat_sekarang || errs.province_code_now || errs.regency_code_now || errs.subdistrict_code_now || errs.village_code_now;
            if (hasSekarangError && !hasAsalError) setAddressTab(1);
            else if (hasAsalError) setAddressTab(0);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        setFrontendErrors({});
        post(route("registrasi.ppkpm.store"));
    };

    // Tampilkan notif jika ada error validasi dari server
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            setFrontendErrors({});
            setNotifyStatus("error");
            setNotify(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [errors]);

    const FileUploadSection = ({ file, type, title, description, icon: Icon, error }) => {
        return (
            <Card variant="outlined" sx={{ mb: 2, borderColor: error ? "error.main" : "divider" }}>
                <CardContent>
                    <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                        <Box sx={{ bgcolor: file ? "success.main" : "action.selected", borderRadius: 2, p: 1.5, mr: 2 }}>
                            <Icon sx={{ fontSize: 28, color: file ? "white" : "action.active" }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="h6">{title}</Typography>
                            <Typography variant="body2" color="text.secondary">{description}</Typography>
                        </Box>
                    </Box>
                    <Button
                        component="label"
                        variant={file ? "outlined" : "contained"}
                        startIcon={<CloudUploadOutlined />}
                        fullWidth
                    >
                        {file ? "Ganti File" : "Unggah File (PDF)"}
                        <VisuallyHiddenInput type="file" accept="application/pdf" onChange={(e) => setData(type, e.target.files[0])} />
                    </Button>
                    {file && <Typography variant="caption" sx={{ mt: 1, display: "block" }}>Selected: {file.name}</Typography>}
                    {error && <Typography variant="caption" color="error" sx={{ mt: 1, display: "block" }}>{error}</Typography>}
                </CardContent>
            </Card>
        );
    };

    // Gabungkan error frontend dan server
    const allErrors = { ...frontendErrors, ...errors };

    return (
        <ThemeProvider theme={theme}>
            <Head title="Registrasi PPKPM" />
            <Header />

            <main className="flex text-gray-600 justify-center flex-col items-center w-full px-4 md:px-6 lg:px-8 bg-gray-50 min-h-screen pt-20 pb-10">
                <div className="w-full max-w-6xl">
                    <Box sx={{ mb: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, background: "#ffffff", border: "1px solid #e5e7eb" }}>
                            <Typography variant="h4" gutterBottom>Registrasi Mahasiswa PPKPM</Typography>
                            <Typography variant="body1">
                                Selamat data telah terverifikasi! Silakan lengkapi data profil dan akun Anda untuk menyelesaikan pendaftaran PPKPM.{" "}
                                <span
                                    onClick={() => setTermsOpen(true)}
                                    style={{ color: "#008a01", cursor: "pointer", fontWeight: "bold", textDecoration: "underline" }}
                                >
                                    Baca Ketentuan
                                </span>
                            </Typography>
                        </Paper>
                    </Box>

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Kiri : Data Pribadi & Akademik */}
                            <Grid item xs={12} md={7}>
                                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", mb: 3 }}>
                                    <CardContent className="space-y-6">
                                        <Typography variant="h6" sx={{ borderBottom: "2px solid #008a01", pb: 1, width: "fit-content" }}>
                                            Data Pribadi & Akademik
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} md={6}>
                                                <TextField label="Nama Lengkap" fullWidth disabled value={data.name} variant="outlined" />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField label="NIM" fullWidth disabled value={data.nim} variant="outlined" />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Jenis Kelamin</InputLabel>
                                                    <Select value={data.jk} label="Jenis Kelamin" onChange={(e) => setData("jk", e.target.value)}>
                                                        <MenuItem value="Pria">Pria</MenuItem>
                                                        <MenuItem value="Wanita">Wanita</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <InputError message={allErrors.jk} />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField label="Nomor WhatsApp" fullWidth value={data.hp} onChange={(e) => setData("hp", e.target.value)} placeholder="08xxxxxxxxxx" />
                                                <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "primary.main", fontStyle: "italic" }}>
                                                    * Ganti dengan nomor WhatsApp yang aktif
                                                </Typography>
                                                <InputError message={allErrors.hp} />
                                            </Grid>

                                            <Grid item xs={12} md={12}>
                                                <TextField label="Program Studi" fullWidth disabled value={data.program_studi} variant="outlined" />
                                                <InputError message={allErrors.id_prodi} />
                                            </Grid>

                                            <Grid item xs={12} md={4}>
                                                <TextField label="Semester" type="number" fullWidth disabled value={data.semester} onChange={(e) => setData("semester", e.target.value)} />
                                                <InputError message={allErrors.semester} />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField label="IPK Terakhir" type="number" step="0.01" fullWidth disabled value={data.ipk} onChange={(e) => setData("ipk", e.target.value)} />
                                                <InputError message={allErrors.ipk} />
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <TextField label="Nilai Micro Teaching" fullWidth disabled value={data.nilai_micro_teaching || "Belum ada"} variant="outlined" />
                                                <InputError message={allErrors.nilai_micro_teaching} />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Cluster Kegiatan</InputLabel>
                                                    <Select value={data.cluster_kegiatan} label="Cluster Kegiatan" onChange={(e) => setData("cluster_kegiatan", e.target.value)}>
                                                        <MenuItem value="PPKPM">PPKPM (PPL + KPM)</MenuItem>
                                                        <MenuItem value="PPL">PPL</MenuItem>
                                                        <MenuItem value="KPM">KPM</MenuItem>
                                                    </Select>
                                                </FormControl>
                                                <InputError message={allErrors.cluster_kegiatan} />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ borderBottom: "2px solid #008a01", pb: 1, width: "fit-content", mb: 2 }}>
                                            Informasi Alamat
                                        </Typography>

                                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                                            <Tabs value={addressTab} onChange={handleAddressTabChange}>
                                                <Tab icon={<Home sx={{ fontSize: 20 }} />} iconPosition="start" label="Alamat Asal" />
                                                <Tab icon={<LocationOn sx={{ fontSize: 20 }} />} iconPosition="start" label="Alamat Sekarang" />
                                            </Tabs>
                                        </Box>

                                        <CustomTabPanel value={addressTab} index={0}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField label="Alamat Lengkap (Jalan/Desa)" fullWidth multiline rows={2} value={data.alamat_asal} onChange={(e) => setData("alamat_asal", e.target.value)} />
                                                    <InputError message={allErrors.alamat_asal} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={listOfProvincies}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={provinceAsal}
                                                        onChange={(e, v) => setProvinceAsal(v)}
                                                        renderInput={(p) => <TextField {...p} label="Provinsi" />}
                                                    />
                                                    <InputError message={allErrors.province_code} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={provinceAsal ? kabupaten(provinceAsal.kode) : []}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={regencyAsal}
                                                        onChange={(e, v) => setRegencyAsal(v)}
                                                        disabled={!provinceAsal}
                                                        renderInput={(p) => <TextField {...p} label="Kabupaten" />}
                                                    />
                                                    <InputError message={allErrors.regency_code} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={regencyAsal ? kecamatan(regencyAsal.kode) : []}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={subDistrictAsal}
                                                        onChange={(e, v) => setSubDistrictAsal(v)}
                                                        disabled={!regencyAsal}
                                                        renderInput={(p) => <TextField {...p} label="Kecamatan" />}
                                                    />
                                                    <InputError message={allErrors.subdistrict_code} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={subDistrictAsal ? desa(subDistrictAsal.kode) : []}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={villageAsal}
                                                        onChange={(e, v) => setVillageAsal(v)}
                                                        disabled={!subDistrictAsal}
                                                        renderInput={(p) => <TextField {...p} label="Desa" />}
                                                    />
                                                    <InputError message={allErrors.village_code} />
                                                </Grid>
                                            </Grid>
                                        </CustomTabPanel>

                                        <CustomTabPanel value={addressTab} index={1}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12}>
                                                    <TextField label="Alamat Lengkap Sekarang (Jalan/Desa)" fullWidth multiline rows={2} value={data.alamat_sekarang} onChange={(e) => setData("alamat_sekarang", e.target.value)} />
                                                    <InputError message={allErrors.alamat_sekarang} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={listOfProvincies}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={provinceNow}
                                                        onChange={(e, v) => setProvinceNow(v)}
                                                        renderInput={(p) => <TextField {...p} label="Provinsi" />}
                                                    />
                                                    <InputError message={allErrors.province_code_now} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={provinceNow ? kabupaten(provinceNow.kode) : []}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={regencyNow}
                                                        onChange={(e, v) => setRegencyNow(v)}
                                                        disabled={!provinceNow}
                                                        renderInput={(p) => <TextField {...p} label="Kabupaten" />}
                                                    />
                                                    <InputError message={allErrors.regency_code_now} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={regencyNow ? kecamatan(regencyNow.kode) : []}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={subDistrictNow}
                                                        onChange={(e, v) => setSubDistrictNow(v)}
                                                        disabled={!regencyNow}
                                                        renderInput={(p) => <TextField {...p} label="Kecamatan" />}
                                                    />
                                                    <InputError message={allErrors.subdistrict_code_now} />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={subDistrictNow ? desa(subDistrictNow.kode) : []}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={villageNow}
                                                        onChange={(e, v) => setVillageNow(v)}
                                                        disabled={!subDistrictNow}
                                                        renderInput={(p) => <TextField {...p} label="Desa" />}
                                                    />
                                                    <InputError message={allErrors.village_code_now} />
                                                </Grid>
                                            </Grid>
                                        </CustomTabPanel>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Kanan : Akun & Berkas */}
                            <Grid item xs={12} md={5}>
                                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", mb: 3, bgcolor: "primary.50" }}>
                                    <CardContent className="space-y-4">
                                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>Data Akun</Typography>
                                        <TextField label="Email Kampus" fullWidth value={data.email} onChange={(e) => setData("email", e.target.value)} />
                                        <InputError message={allErrors.email} />

                                        <FormControl variant="outlined" fullWidth>
                                            <InputLabel>Password</InputLabel>
                                            <OutlinedInput
                                                type={showPassword ? "text" : "password"}
                                                value={data.password}
                                                onChange={(e) => setData("password", e.target.value)}
                                                endAdornment={
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                }
                                                label="Password"
                                            />
                                            <InputError message={allErrors.password} />
                                        </FormControl>

                                        <FormControl variant="outlined" fullWidth>
                                            <InputLabel>Konfirmasi Password</InputLabel>
                                            <OutlinedInput
                                                type={showPassword ? "text" : "password"}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData("password_confirmation", e.target.value)}
                                                label="Konfirmasi Password"
                                            />
                                            <InputError message={allErrors.password_confirmation} />
                                        </FormControl>
                                    </CardContent>
                                </Card>

                                <Typography variant="h6" className="mb-3 px-2">Unggah Berkas</Typography>

                                <Card variant="outlined" sx={{ mb: 2, borderColor: "divider" }}>
                                    <CardContent>
                                        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
                                            <Box sx={{ bgcolor: "primary.main", borderRadius: 2, p: 1.5, mr: 2 }}>
                                                <Description sx={{ fontSize: 28, color: "white" }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6">Transkrip Nilai</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Lihat transkrip nilai sementara Anda langsung dari sistem akademik
                                                </Typography>
                                            </Box>
                                        </Box>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            startIcon={<FaEye />}
                                            fullWidth
                                            onClick={handleFetchTranskrip}
                                        >
                                            Lihat Transkrip Nilai
                                        </Button>
                                    </CardContent>
                                </Card>

                                <FileUploadSection
                                    type="link_surat_pernyataan"
                                    file={data.link_surat_pernyataan}
                                    title="Surat Pernyataan"
                                    description="Surat Pernyataan Ka Prodi (PDF, Max 500KB)"
                                    icon={Assignment}
                                    error={allErrors.link_surat_pernyataan}
                                />

                                <FileUploadSection
                                    type="link_surat_kesiapan"
                                    file={data.link_surat_kesiapan}
                                    title="Surat Kesiapan"
                                    description="Surat Kesiapan Mahasiswa (PDF, Max 500KB)"
                                    icon={AssignmentInd}
                                    error={allErrors.link_surat_kesiapan}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={processing}
                                    sx={{ mt: 2, py: 2, borderRadius: 3, fontWeight: "bold" }}
                                >
                                    {processing ? "Memproses..." : "Selesaikan Pendaftaran"}
                                </Button>

                            </Grid>
                        </Grid>
                    </form>
                </div>
            </main>

            <Modal
                open={termsOpen}
                onClose={() => setTermsOpen(false)}
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
            >
                <Box sx={{ width: "95%", maxWidth: 600, bgcolor: "background.paper", borderRadius: 3, boxShadow: 24, p: 4, position: "relative" }}>
                    <IconButton
                        onClick={() => setTermsOpen(false)}
                        sx={{ position: "absolute", right: 16, top: 16, color: "text.secondary" }}
                    >
                        <FaTimes />
                    </IconButton>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: "700", color: "primary.main", mb: 3 }}>
                        Informasi dan Ketentuan Pelaksanaan PPKPM
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="body1" paragraph>
                            Mahasiswa yang diperkenankan mengikuti PPKPM harus memenuhi ketentuan sebagai berikut:
                        </Typography>
                        <ul className="list-decimal list-inside space-y-2 mt-2">
                            <li><Typography component="span" variant="body1">Berstatus sebagai mahasiswa aktif.</Typography></li>
                            <li><Typography component="span" variant="body1">Telah lulus Mata Kuliah Microteaching dengan nilai minimal C.</Typography></li>
                            <li><Typography component="span" variant="body1">Apabila terdapat kesalahan data (misalnya alamat asal dan data pribadi lainnya), agar segera melakukan perbaikan melalui halaman profil pada akun SEVIMA masing-masing.</Typography></li>
                        </ul>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mb: 4 }}>
                        Seluruh data yang digunakan dalam proses ini merupakan hasil sinkronisasi dari sistem SEVIMA.
                    </Typography>
                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="contained" onClick={() => setTermsOpen(false)} sx={{ px: 4, borderRadius: 2 }}>
                            Mengerti
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Modal Transkrip Sementara */}
            <Modal
                open={transkripOpen}
                onClose={() => setTranskripOpen(false)}
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)",
                }}
            >
                <Box
                    sx={{
                        width: "90%",
                        maxWidth: 900,
                        maxHeight: "90vh",
                        bgcolor: "background.paper",
                        borderRadius: 3,
                        boxShadow: 24,
                        p: 4,
                        position: "relative",
                        overflowY: "auto",
                    }}
                >
                    <IconButton
                        onClick={() => setTranskripOpen(false)}
                        sx={{ position: "absolute", right: 16, top: 16, color: "text.secondary" }}
                    >
                        <FaTimes />
                    </IconButton>

                    {loadingTranskrip ? (
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}>
                            <CircularProgress color="primary" />
                            <Typography sx={{ mt: 2 }}>Memuat Data Transkrip...</Typography>
                        </Box>
                    ) : (
                        <div className="p-2 text-black bg-white" style={{ fontFamily: "serif" }}>
                            {/* Kop Surat */}
                            <div className="flex items-center justify-center border-b-4 border-double border-black pb-4 mb-4">
                                <img src="/Lambang_UIN_Ar-Raniry.png" className="w-16 h-16 mr-4" alt="Logo UIN" />
                                <div className="text-center text-black">
                                    <h1 className="text-xl font-bold tracking-wide uppercase">UIN Ar-Raniry Banda Aceh</h1>
                                    <p className="text-xs">Jalan Lingkar Kampus UIN Ar-Raniry, Kota Pelajar Mahasiswa, Darussalam, Banda Aceh</p>
                                    <p className="text-xs">Website: http://ar-raniry.ac.id / e-Mail: uin@ar-raniry.ac.id / Telepon: 0651-7552921</p>
                                </div>
                            </div>

                            {/* Judul Dokumen */}
                            <div className="text-center mb-6">
                                <h2 className="text-lg font-bold uppercase tracking-widest border-b border-black pb-1 inline-block text-black">
                                    TRANSKRIP SEMENTARA
                                </h2>
                            </div>

                            {/* Data Mahasiswa */}
                            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm mb-6 text-black">
                                <div className="flex">
                                    <span className="w-32 font-bold">Program Studi</span>
                                    <span className="mr-2">:</span>
                                    <span>{verifiedData.program_studi || "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-36 font-bold">Jenjang Pendidikan</span>
                                    <span className="mr-2">:</span>
                                    <span>Strata 1 (S1)</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold">NIM</span>
                                    <span className="mr-2">:</span>
                                    <span>{verifiedData.nim || "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-36 font-bold">Nama</span>
                                    <span className="mr-2">:</span>
                                    <span className="uppercase">{verifiedData.nama || "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold">Tempat Lahir</span>
                                    <span className="mr-2">:</span>
                                    <span className="uppercase">{verifiedData.tempat_lahir || "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-36 font-bold">Tahun Masuk</span>
                                    <span className="mr-2">:</span>
                                    <span>{verifiedData.nim && verifiedData.nim.length >= 2 && !isNaN(verifiedData.nim.substring(0, 2)) ? "20" + verifiedData.nim.substring(0, 2) : "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold">Tanggal Lahir</span>
                                    <span className="mr-2">:</span>
                                    <span>
                                        {verifiedData.tanggal_lahir
                                            ? new Date(verifiedData.tanggal_lahir).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })
                                            : "-"}
                                    </span>
                                </div>
                            </div>

                            {/* Tabel Transkrip */}
                            <table className="w-full border-collapse border border-black text-xs mb-6 text-black">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border border-black px-2 py-1 text-center w-8">NO</th>
                                        <th className="border border-black px-2 py-1 text-center w-24">KODE</th>
                                        <th className="border border-black px-2 py-1 text-left">MATA KULIAH</th>
                                        <th className="border border-black px-2 py-1 text-center w-16">NILAI</th>
                                        <th className="border border-black px-2 py-1 text-center w-16">A.M</th>
                                        <th className="border border-black px-2 py-1 text-center w-12">SKS</th>
                                        <th className="border border-black px-2 py-1 text-center w-16">BOBOT</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transkripData.length > 0 ? (
                                        transkripData.map((item, index) => {
                                            const attrs = item.attributes || {};
                                            return (
                                                <tr key={item.id || index} className="hover:bg-gray-50">
                                                    <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                                    <td className="border border-black px-2 py-1 text-center font-mono">{attrs.kode_mata_kuliah || "-"}</td>
                                                    <td className="border border-black px-2 py-1">{attrs.nama_mata_kuliah || "-"}</td>
                                                    <td className="border border-black px-2 py-1 text-center">{attrs.nilai_huruf || "-"}</td>
                                                    <td className="border border-black px-2 py-1 text-center">
                                                        {parseFloat(attrs.nilai_angka || 0).toFixed(2)}
                                                    </td>
                                                    <td className="border border-black px-2 py-1 text-center">{attrs.sks_mata_kuliah || 0}</td>
                                                    <td className="border border-black px-2 py-1 text-center">
                                                        {parseFloat(attrs.bobot_mata_kuliah || 0).toFixed(2)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="border border-black px-2 py-8 text-center text-gray-500">
                                                Tidak ada data transkrip nilai.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            {/* Keterangan & Summary */}
                            <div className="grid grid-cols-2 text-xs border-t border-black pt-4 text-black">
                                <div>
                                    <p className="font-bold mb-1">KETERANGAN</p>
                                    <div className="grid grid-cols-[40px_10px_1fr] gap-y-0.5">
                                        <span>SKS</span>
                                        <span>:</span>
                                        <span>Satuan Kredit Semester</span>

                                        <span>HM</span>
                                        <span>:</span>
                                        <span>Huruf Mutu</span>

                                        <span>AM</span>
                                        <span>:</span>
                                        <span>Angka Mutu</span>

                                        <span>M</span>
                                        <span>:</span>
                                        <span>Mutu</span>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <div className="grid grid-cols-[200px_10px_50px] gap-y-1">
                                        <span>Jumlah SKS Yang Diambil</span>
                                        <span>:</span>
                                        <span className="text-right font-bold">{transkripStats.sksDiambil}</span>

                                        <span>Jumlah SKS Yang Lulus</span>
                                        <span>:</span>
                                        <span className="text-right font-bold">{transkripStats.sksLulus}</span>

                                        <span>Jumlah Mutu</span>
                                        <span>:</span>
                                        <span className="text-right font-bold">{transkripStats.totalMutu}</span>

                                        <span>Index Prestasi Kumulatif (IPK)</span>
                                        <span>:</span>
                                        <span className="text-right font-bold">{transkripStats.ipk}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Box>
            </Modal>

            <ButtomFooter />

            {/* Snackbar global error validasi */}
            <Snackbar
                open={notify && notifyStatus === "error"}
                autoHideDuration={6000}
                onClose={() => setNotify(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={() => setNotify(false)}
                    severity="error"
                    variant="filled"
                    sx={{ width: "100%", borderRadius: 2 }}
                >
                    <strong>Terdapat kesalahan pada form.</strong> Mohon periksa kembali form yang wajib diisi.
                    {allErrors.id_prodi && (
                        <div style={{ fontSize: "0.85rem", marginTop: 4 }}>
                            ⚠ Program Studi: {errors.id_prodi}
                        </div>
                    )}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    );
}
