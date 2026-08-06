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
import { Head, useForm } from "@inertiajs/react";
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
    ContentCopy,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";
import Navigation from "@/Components/Mahasiswa/Navigation";
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

const Profil = ({
    lowongan_ppl,
    flash,
    mahasiswa,
    list_prodi,
    link_grup,
    base_url,
}) => {
    const [notify, setNotify] = useState(false);
    const [notifyStatus, setNotifyStatus] = useState("info");
    const [customMessage, setCustomMessage] = useState("");
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [addressTab, setAddressTab] = useState(0);

    // State untuk modal preview
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewType, setPreviewType] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");

    // Transkrip states & logic
    const [transkripOpen, setTranskripOpen] = useState(false);
    const [transkripData, setTranskripData] = useState([]);
    const [loadingTranskrip, setLoadingTranskrip] = useState(false);

    const handleFetchTranskrip = async () => {
        setLoadingTranskrip(true);
        setTranskripOpen(true);
        try {
            const response = await fetch('/profil/transkrip');
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

    useEffect(() => {
        if (flash?.message) {
            setNotify(true);
            if (flash.message.success) {
                setNotifyStatus("success");
            } else if (flash.message.error) {
                setNotifyStatus("error");
            } else {
                setNotifyStatus("info");
            }
        }
    }, [flash]);

    const handleCloseNotify = useCallback((event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    }, []);

    const handleAddressTabChange = (event, newValue) => {
        setAddressTab(newValue);
    };

    // Fungsi untuk membuat URL lengkap dengan base URL
    const getFullUrl = useCallback(
        (relativePath) => {
            if (!relativePath) return null;

            // Jika path sudah merupakan URL lengkap, kembalikan langsung
            if (
                relativePath.startsWith("http://") ||
                relativePath.startsWith("https://") ||
                relativePath.startsWith("blob:")
            ) {
                return relativePath;
            }

            // Jika path dimulai dengan slash, pastikan tidak double slash
            if (relativePath.startsWith("/")) {
                // Hapus slash di akhir base_url jika ada, dan tambahkan path
                const cleanBaseUrl = base_url?.endsWith("/")
                    ? base_url.slice(0, -1)
                    : base_url || "";
                return `${cleanBaseUrl}${relativePath}`;
            }

            // Jika path relatif tanpa slash di awal
            const cleanBaseUrl =
                base_url && !base_url.endsWith("/")
                    ? `${base_url}/storage/`
                    : base_url || "/";
            return `${cleanBaseUrl}${relativePath}`;
        },
        [base_url]
    );

    const [name] = useState(mahasiswa?.name || "");
    const [nim] = useState(mahasiswa?.username || "");
    const [IPK, setIPK] = useState(mahasiswa?.data_mahasiswa?.ipk || "");
    const [nilaiMicro, setNilaiMicro] = useState(
        mahasiswa?.data_mahasiswa?.nilai_micro_teaching || ""
    );
    const [prodi, setProdi] = useState(
        list_prodi.find(
            (itm) => itm.id === mahasiswa?.data_mahasiswa?.id_prodi
        ) || null
    );

    const listOfProvincies = useMemo(() => provinsi(), []);

    // State untuk alamat asal
    const [listOfRegenciesAsal, setListOfRegenciesAsal] = useState([]);
    const [listOfSubdistrictsAsal, setListOfSubdistrictsAsal] = useState([]);
    const [listOfVillagesAsal, setListOfVillagesAsal] = useState([]);

    const [provinceAsal, setProvinceAsal] = useState(() => {
        if (mahasiswa?.data_mahasiswa?.province_code) {
            return (
                listOfProvincies.find(
                    (itm) => itm.kode === mahasiswa.data_mahasiswa.province_code
                ) || null
            );
        }
        return null;
    });

    const [regencyAsal, setRegencyAsal] = useState(() => {
        if (
            mahasiswa?.data_mahasiswa?.regency_code &&
            mahasiswa.data_mahasiswa.province_code
        ) {
            const regencies = kabupaten(mahasiswa.data_mahasiswa.province_code);
            return (
                regencies.find(
                    (itm) => itm.kode === mahasiswa.data_mahasiswa.regency_code
                ) || null
            );
        }
        return null;
    });

    const [subDistrictAsal, setSubDistrictAsal] = useState(() => {
        if (
            mahasiswa?.data_mahasiswa?.subdistrict_code &&
            mahasiswa.data_mahasiswa.regency_code
        ) {
            const subDistricts = kecamatan(
                mahasiswa.data_mahasiswa.regency_code
            );
            return (
                subDistricts.find(
                    (itm) =>
                        itm.kode === mahasiswa.data_mahasiswa.subdistrict_code
                ) || null
            );
        }
        return null;
    });

    const [villageAsal, setVillageAsal] = useState(() => {
        if (
            mahasiswa?.data_mahasiswa?.village_code &&
            mahasiswa.data_mahasiswa.subdistrict_code
        ) {
            const villages = desa(mahasiswa.data_mahasiswa.subdistrict_code);
            return (
                villages.find(
                    (itm) => itm.kode === mahasiswa.data_mahasiswa.village_code
                ) || null
            );
        }
        return null;
    });

    // State untuk alamat sekarang
    const [listOfRegenciesNow, setListOfRegenciesNow] = useState([]);
    const [listOfSubdistrictsNow, setListOfSubdistrictsNow] = useState([]);
    const [listOfVillagesNow, setListOfVillagesNow] = useState([]);

    const [provinceNow, setProvinceNow] = useState(() => {
        if (mahasiswa?.data_mahasiswa?.province_code_now) {
            return (
                listOfProvincies.find(
                    (itm) =>
                        itm.kode === mahasiswa.data_mahasiswa.province_code_now
                ) || null
            );
        }
        return null;
    });

    const [regencyNow, setRegencyNow] = useState(() => {
        if (
            mahasiswa?.data_mahasiswa?.regency_code_now &&
            mahasiswa.data_mahasiswa.province_code_now
        ) {
            const regencies = kabupaten(
                mahasiswa.data_mahasiswa.province_code_now
            );
            return (
                regencies.find(
                    (itm) =>
                        itm.kode === mahasiswa.data_mahasiswa.regency_code_now
                ) || null
            );
        }
        return null;
    });

    const [subDistrictNow, setSubDistrictNow] = useState(() => {
        if (
            mahasiswa?.data_mahasiswa?.subdistrict_code_now &&
            mahasiswa.data_mahasiswa.regency_code_now
        ) {
            const subDistricts = kecamatan(
                mahasiswa.data_mahasiswa.regency_code_now
            );
            return (
                subDistricts.find(
                    (itm) =>
                        itm.kode ===
                        mahasiswa.data_mahasiswa.subdistrict_code_now
                ) || null
            );
        }
        return null;
    });

    const [villageNow, setVillageNow] = useState(() => {
        if (
            mahasiswa?.data_mahasiswa?.village_code_now &&
            mahasiswa.data_mahasiswa.subdistrict_code_now
        ) {
            const villages = desa(
                mahasiswa.data_mahasiswa.subdistrict_code_now
            );
            return (
                villages.find(
                    (itm) =>
                        itm.kode === mahasiswa.data_mahasiswa.village_code_now
                ) || null
            );
        }
        return null;
    });

    const [noHpWa, setNoHpWa] = useState(
        mahasiswa?.data_mahasiswa?.no_hp_wa || ""
    );
    const [alamatAsal, setAlamatAsal] = useState(
        mahasiswa?.data_mahasiswa?.alamat_asal || ""
    );
    const [clusterKegiatan, setClusterKegiatan] = useState(
        mahasiswa?.data_mahasiswa?.cluster_kegiatan || ""
    );
    const [semester, setSemester] = useState(
        mahasiswa?.data_mahasiswa?.semester || ""
    );
    const [jenisKelamin, setJenisKelamin] = useState(
        mahasiswa?.data_mahasiswa?.jk || ""
    );
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [transkrip, setTranskrip] = useState(null);
    const [linkTranskrip] = useState(
        mahasiswa?.data_mahasiswa?.link_transkrip_nilai || null
    );

    const [suratPernyataan, setSuratPernyataan] = useState(null);
    const [linkSuratPernyataan, setLinkSuratPernyataan] = useState(
        mahasiswa?.data_mahasiswa?.link_surat_pernyataan || null
    );

    const [suratKesiapan, setSuratKesiapan] = useState(null);
    const [linkSuratKesiapan, setLinkSuratKesiapan] = useState(
        mahasiswa?.data_mahasiswa?.link_surat_kesiapan || null
    );

    useEffect(() => {
        setLinkSuratPernyataan(mahasiswa?.data_mahasiswa?.link_surat_pernyataan || null);
        setLinkSuratKesiapan(mahasiswa?.data_mahasiswa?.link_surat_kesiapan || null);
    }, [mahasiswa]);

    const { setData, post, errors, processing } = useForm({
        province_code: provinceAsal?.kode || "",
        regency_code: regencyAsal?.kode || "",
        subdistrict_code: subDistrictAsal?.kode || "",
        village_code: villageAsal?.kode || "",
        province_code_now: provinceNow?.kode || "",
        regency_code_now: regencyNow?.kode || "",
        subdistrict_code_now: subDistrictNow?.kode || "",
        village_code_now: villageNow?.kode || "",
        ipk: IPK,
        id_prodi: prodi?.id || "",
        nilai_micro_teaching: nilaiMicro,
        no_hp_wa: noHpWa,
        cluster_kegiatan: clusterKegiatan,
        semester: semester,
        link_transkrip_nilai: transkrip,
        link_surat_pernyataan: suratPernyataan,
        link_surat_kesiapan: suratKesiapan,
        jk: jenisKelamin,
        alamat_asal: alamatAsal,
        password: "",
    });

    useEffect(() => {
        if (errors && Object.keys(errors).length > 0) {
            setNotifyStatus("error");
            setNotify(true);
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    }, [errors]);

    // Initialize regency list based on province for alamat asal
    useEffect(() => {
        if (provinceAsal?.kode) {
            setListOfRegenciesAsal(kabupaten(provinceAsal.kode));
        } else {
            setListOfRegenciesAsal([]);
        }
    }, [provinceAsal]);

    // Initialize subdistrict list based on regency for alamat asal
    useEffect(() => {
        if (regencyAsal?.kode) {
            setListOfSubdistrictsAsal(kecamatan(regencyAsal.kode));
        } else {
            setListOfSubdistrictsAsal([]);
        }
    }, [regencyAsal]);

    // Initialize village list based on subdistrict for alamat asal
    useEffect(() => {
        if (subDistrictAsal?.kode) {
            setListOfVillagesAsal(desa(subDistrictAsal.kode));
        } else {
            setListOfVillagesAsal([]);
        }
    }, [subDistrictAsal]);

    // Initialize regency list based on province for alamat sekarang
    useEffect(() => {
        if (provinceNow?.kode) {
            setListOfRegenciesNow(kabupaten(provinceNow.kode));
        } else {
            setListOfRegenciesNow([]);
        }
    }, [provinceNow]);

    // Initialize subdistrict list based on regency for alamat sekarang
    useEffect(() => {
        if (regencyNow?.kode) {
            setListOfSubdistrictsNow(kecamatan(regencyNow.kode));
        } else {
            setListOfSubdistrictsNow([]);
        }
    }, [regencyNow]);

    // Initialize village list based on subdistrict for alamat sekarang
    useEffect(() => {
        if (subDistrictNow?.kode) {
            setListOfVillagesNow(desa(subDistrictNow.kode));
        } else {
            setListOfVillagesNow([]);
        }
    }, [subDistrictNow]);

    // Fungsi untuk membuka preview file
    const handleOpenPreview = useCallback(
        (type) => {
            let file = null;
            let fileUrl = null;

            switch (type) {
                case "surat_pernyataan":
                    file = suratPernyataan;
                    fileUrl = linkSuratPernyataan;
                    break;
                case "surat_kesiapan":
                    file = suratKesiapan;
                    fileUrl = linkSuratKesiapan;
                    break;
                default:
                    return;
            }

            if (file) {
                // Untuk file yang baru diupload
                const url = URL.createObjectURL(file);
                window.open(url, '_blank');
            } else if (fileUrl) {
                // Panggil secure controller route
                window.open(`/profil/document/${type}`, '_blank');
            }
        },
        [
            suratPernyataan,
            linkSuratPernyataan,
            suratKesiapan,
            linkSuratKesiapan,
        ]
    );

    // Fungsi untuk menutup preview
    const handleClosePreview = useCallback(() => {
        setPreviewOpen(false);
        // Cleanup object URL jika ada
        if (previewFile && previewType === "object") {
            URL.revokeObjectURL(previewFile);
        }
        setPreviewFile(null);
        setPreviewType("");
        setPreviewTitle("");
    }, [previewFile, previewType]);

    // Cleanup object URL saat component unmount
    useEffect(() => {
        return () => {
            if (previewFile && previewType === "object") {
                URL.revokeObjectURL(previewFile);
            }
        };
    }, [previewFile, previewType]);

    const handleJenisKelaminChange = useCallback(
        (e) => {
            const value = e.target.value;
            setJenisKelamin(value);
            setData("jk", value);
        },
        [setData]
    );

    // Handler untuk alamat asal
    const handleProvinceAsalChange = useCallback(
        (e, value) => {
            setProvinceAsal(value);
            setData("province_code", value?.kode || "");
            setRegencyAsal(null);
            setSubDistrictAsal(null);
            setVillageAsal(null);
            setListOfRegenciesAsal(value ? kabupaten(value.kode) : []);
            setListOfSubdistrictsAsal([]);
            setListOfVillagesAsal([]);
            setData("regency_code", "");
            setData("subdistrict_code", "");
            setData("village_code", "");
        },
        [setData]
    );

    const handleRegencyAsalChange = useCallback(
        (e, value) => {
            setRegencyAsal(value);
            setData("regency_code", value?.kode || "");
            setSubDistrictAsal(null);
            setVillageAsal(null);
            setListOfSubdistrictsAsal(value ? kecamatan(value.kode) : []);
            setListOfVillagesAsal([]);
            setData("subdistrict_code", "");
            setData("village_code", "");
        },
        [setData]
    );

    const handleSubDistrictAsalChange = useCallback(
        (e, value) => {
            setSubDistrictAsal(value);
            setData("subdistrict_code", value?.kode || "");
            setVillageAsal(null);
            setListOfVillagesAsal(value ? desa(value.kode) : []);
            setData("village_code", "");
        },
        [setData]
    );

    const handleVillageAsalChange = useCallback(
        (e, value) => {
            setVillageAsal(value);
            setData("village_code", value?.kode || "");
        },
        [setData]
    );

    // Handler untuk alamat sekarang
    const handleProvinceNowChange = useCallback(
        (e, value) => {
            setProvinceNow(value);
            setData("province_code_now", value?.kode || "");
            setRegencyNow(null);
            setSubDistrictNow(null);
            setVillageNow(null);
            setListOfRegenciesNow(value ? kabupaten(value.kode) : []);
            setListOfSubdistrictsNow([]);
            setListOfVillagesNow([]);
            setData("regency_code_now", "");
            setData("subdistrict_code_now", "");
            setData("village_code_now", "");
        },
        [setData]
    );

    const handleRegencyNowChange = useCallback(
        (e, value) => {
            setRegencyNow(value);
            setData("regency_code_now", value?.kode || "");
            setSubDistrictNow(null);
            console.log("regency now", value);
            setVillageNow(null);
            setListOfSubdistrictsNow(value ? kecamatan(value.kode) : []);
            setListOfVillagesNow([]);
            setData("subdistrict_code_now", "");
            setData("village_code_now", "");
        },
        [setData]
    );

    const handleSubDistrictNowChange = useCallback(
        (e, value) => {
            setSubDistrictNow(value);
            setData("subdistrict_code_now", value?.kode || "");
            setVillageNow(null);
            setListOfVillagesNow(value ? desa(value.kode) : []);
            setData("village_code_now", "");
        },
        [setData]
    );

    const handleVillageNowChange = useCallback(
        (e, value) => {
            setVillageNow(value);
            setData("village_code_now", value?.kode || "");
        },
        [setData]
    );

    const handleIPKChange = useCallback(
        (e) => {
            const value = e.target.value;
            setIPK(value);
            setData("ipk", value);
        },
        [setData]
    );

    const handleNilaiMicroChange = useCallback(
        (e) => {
            const value = e.target.value;
            setNilaiMicro(value);
            setData("nilai_micro_teaching", value);
        },
        [setData]
    );

    const handleProdiChange = useCallback(
        (e, value) => {
            setProdi(value);
            setData("id_prodi", value?.id || "");
        },
        [setData]
    );

    const handleNoHpWa = useCallback(
        (e) => {
            const value = e.target.value;
            setNoHpWa(value);
            setData("no_hp_wa", value);
        },
        [setData]
    );

    const handleAlamatAsalChange = useCallback(
        (e) => {
            const value = e.target.value;
            setAlamatAsal(value);
            setData("alamat_asal", value);
        },
        [setData]
    );

    const handleCopyAlamatAsal = useCallback(() => {
        setProvinceNow(provinceAsal);
        setRegencyNow(regencyAsal);
        setSubDistrictNow(subDistrictAsal);
        setVillageNow(villageAsal);

        setData((prev) => ({
            ...prev,
            province_code_now: provinceAsal?.kode || "",
            regency_code_now: regencyAsal?.kode || "",
            subdistrict_code_now: subDistrictAsal?.kode || "",
            village_code_now: villageAsal?.kode || "",
        }));
    }, [provinceAsal, regencyAsal, subDistrictAsal, villageAsal, setData]);

    const handleClusterKegiatanChange = useCallback(
        (e) => {
            const value = e.target.value;
            setClusterKegiatan(value);
            setData("cluster_kegiatan", value);
        },
        [setData]
    );

    const handleSemesterChange = useCallback(
        (e) => {
            const value = e.target.value;
            setSemester(value);
            setData("semester", value);
        },
        [setData]
    );

    const handleTranskripChange = useCallback(
        (e) => {
            const file = e.target.files[0];
            setTranskrip(file);
            setData("link_transkrip_nilai", file);
        },
        [setData]
    );

    const handleSuratPernyataanChange = useCallback(
        (e) => {
            const file = e.target.files[0];
            if (file) {
                const maxSize = 500 * 1024; // 500 KB
                if (file.size > maxSize) {
                    setCustomMessage(`File "${file.name}" terlalu besar! Ukuran file maksimal adalah 500 KB.`);
                    setNotifyStatus("error");
                    setNotify(true);
                    e.target.value = ""; // Reset the input file selection
                    return;
                }
            }
            setSuratPernyataan(file);
            setData("link_surat_pernyataan", file);
            setCustomMessage(""); // Clear custom warning
        },
        [setData]
    );

    const handleSuratKesiapanChange = useCallback(
        (e) => {
            const file = e.target.files[0];
            if (file) {
                const maxSize = 500 * 1024; // 500 KB
                if (file.size > maxSize) {
                    setCustomMessage(`File "${file.name}" terlalu besar! Ukuran file maksimal adalah 500 KB.`);
                    setNotifyStatus("error");
                    setNotify(true);
                    e.target.value = ""; // Reset the input file selection
                    return;
                }
            }
            setSuratKesiapan(file);
            setData("link_surat_kesiapan", file);
            setCustomMessage(""); // Clear custom warning
        },
        [setData]
    );

    const handlePasswordChange = useCallback(
        (e) => {
            const value = e.target.value;
            setPassword(value);
            setData("password", value);
        },
        [setData]
    );

    const onSubmit = useCallback(
        (e) => {
            e.preventDefault();
            post("/profil/save", {
                onSuccess: () => {
                    setSuratPernyataan(null);
                    setSuratKesiapan(null);
                    setPassword("");
                    setData("password", "");
                }
            });
        },
        [post, setSuratPernyataan, setSuratKesiapan, setData]
    );

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            province_code_now: provinceNow?.kode || "",
        }));
    }, [provinceNow]);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            regency_code_now: regencyNow?.kode || "",
        }));
    }, [regencyNow]);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            subdistrict_code_now: subDistrictNow?.kode || "",
        }));
    }, [subDistrictNow]);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            village_code_now: villageNow?.kode || "",
        }));
    }, [villageNow]);

    // Sync form data untuk alamat asal (untuk memastikan)
    useEffect(() => {
        setData((prev) => ({
            ...prev,
            province_code: provinceAsal?.kode || "",
        }));
    }, [provinceAsal]);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            regency_code: regencyAsal?.kode || "",
        }));
    }, [regencyAsal]);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            subdistrict_code: subDistrictAsal?.kode || "",
        }));
    }, [subDistrictAsal]);

    useEffect(() => {
        setData((prev) => ({
            ...prev,
            village_code: villageAsal?.kode || "",
        }));
    }, [villageAsal]);

    // Komponen untuk tampilan file dengan preview button yang lebih profesional
    const FileUploadSection = ({
        file,
        link,
        type,
        title,
        description,
        icon: Icon,
        onPreview,
        onChange,
        error,
        accept = "application/pdf",
        templateUrl,
    }) => {
        const hasFile = file || link;
        const fullUrl = link ? getFullUrl(link) : null;

        return (
            <Card
                variant="outlined"
                sx={{
                    mb: 2,
                    position: "relative",
                    borderColor: error ? "error.main" : "divider",
                    backgroundColor: hasFile
                        ? "success.50"
                        : "background.paper",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        boxShadow: 1,
                        borderColor: "primary.light",
                    },
                }}
            >
                <CardContent>
                    {templateUrl && (
                        <Button
                            component="a"
                            href={templateUrl}
                            download
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<FaDownload style={{ fontSize: "10px" }} />}
                            sx={{
                                position: "absolute",
                                top: 12,
                                right: 12,
                                textTransform: "capitalize",
                                borderRadius: 1.5,
                                fontSize: "0.65rem",
                                py: 0.25,
                                px: 1,
                                zIndex: 1,
                                minWidth: "auto",
                                backgroundColor: "background.paper",
                                "&:hover": {
                                    backgroundColor: "primary.main",
                                    color: "white",
                                }
                            }}
                        >
                            Template
                        </Button>
                    )}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            mb: 2,
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: hasFile
                                    ? "success.main"
                                    : "action.selected",
                                borderRadius: 2,
                                p: 1.5,
                                mr: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Icon
                                sx={{
                                    fontSize: 28,
                                    color: hasFile
                                        ? "success.contrastText"
                                        : "action.active",
                                }}
                            />
                        </Box>
                        <Box sx={{ flex: 1, pr: templateUrl ? 11 : 0 }}>
                            <Typography variant="h6" gutterBottom>
                                {title}
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                gutterBottom
                            >
                                {description}
                            </Typography>

                            {/* File Status */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    mt: 1,
                                    p: 1.5,
                                    bgcolor: "grey.50",
                                    borderRadius: 1,
                                }}
                            >
                                {hasFile ? (
                                    <>
                                        <FaFilePdf
                                            style={{
                                                color: "#f44336",
                                                marginRight: 8,
                                            }}
                                        />
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" noWrap>
                                                {file
                                                    ? file.name
                                                    : link.split("/").pop()}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {file
                                                    ? `Ukuran: ${(
                                                        file.size / 1024
                                                    ).toFixed(2)} KB`
                                                    : "File tersimpan di server"}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                            <Tooltip title="Preview File">
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        onPreview(type)
                                                    }
                                                    sx={{
                                                        color: "primary.main",
                                                        "&:hover": {
                                                            backgroundColor:
                                                                "primary.main",
                                                            color: "white",
                                                        },
                                                    }}
                                                >
                                                    <FaEye />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </>
                                ) : (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontStyle: "italic" }}
                                    >
                                        Belum ada file yang diunggah
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                    </Box>

                    <Button
                        component="label"
                        variant={hasFile ? "outlined" : "contained"}
                        startIcon={<CloudUploadOutlined />}
                        fullWidth
                        sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                        }}
                    >
                        {hasFile ? "Ganti File" : "Unggah File"}
                        <VisuallyHiddenInput
                            type="file"
                            accept={accept}
                            onChange={onChange}
                        />
                    </Button>

                    {error && (
                        <Typography
                            variant="caption"
                            color="error"
                            sx={{ mt: 1, display: "block" }}
                        >
                            {error}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        );
    };

    // Komponen untuk status profil
    const StatusBadge = ({ status }) => {
        const statusConfig = {
            null: { label: "Lengkapi Profilmu", color: "error", icon: null },
            submitted: {
                label: "Sedang Direview",
                color: "warning",
                icon: null,
            },
            rejected: { label: "Ditolak", color: "error", icon: null },
            accepted: {
                label: "Diterima",
                color: "success",
                icon: <FaCheckCircle style={{ marginRight: 4 }} />,
            },
            revisi: { label: "Perlu Revisi", color: "warning", icon: null },
        };

        const config = statusConfig[status] || {
            label: "Status Tidak Dikenali",
            color: "default",
        };

        return (
            <Chip
                variant="filled"
                label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        {config.icon}
                        {config.label}
                    </Box>
                }
                color={config.color}
                sx={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    height: 32,
                    "& .MuiChip-label": {
                        px: 2,
                    },
                }}
            />
        );
    };

    // Komponen untuk alamat section
    const AddressSection = ({
        title,
        icon: Icon,
        province,
        regency,
        subDistrict,
        village,
        onProvinceChange,
        onRegencyChange,
        onSubDistrictChange,
        onVillageChange,
        listOfRegencies,
        listOfSubdistricts,
        listOfVillages,
        errors,
        isNow = false,
    }) => {
        const prefix = isNow ? "_now" : "";

        return (
            <Box>
                <Typography
                    variant="h6"
                    gutterBottom
                    sx={{
                        fontWeight: 600,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mb: 3,
                    }}
                >
                    <Icon />
                    {title}
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Autocomplete
                            id={`province${prefix}`}
                            value={province}
                            required
                            getOptionLabel={(option) => option.nama}
                            options={listOfProvincies}
                            onChange={onProvinceChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    sx={{
                                        "& .MuiOutlinedInput-root.Mui-focused":
                                        {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                    label="Provinsi"
                                    error={!!errors[`province_code${prefix}`]}
                                    helperText={
                                        errors[`province_code${prefix}`]
                                    }
                                    variant="outlined"
                                    size="medium"
                                />
                            )}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Autocomplete
                            id={`regency${prefix}`}
                            value={regency}
                            required
                            getOptionLabel={(option) => option.nama}
                            options={listOfRegencies}
                            onChange={onRegencyChange}
                            disabled={!province}
                            renderInput={(params) => (
                                <TextField
                                    sx={{
                                        "& .MuiOutlinedInput-root.Mui-focused":
                                        {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                    {...params}
                                    label="Kabupaten/Kota"
                                    error={!!errors[`regency_code${prefix}`]}
                                    helperText={errors[`regency_code${prefix}`]}
                                    variant="outlined"
                                    size="medium"
                                />
                            )}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Autocomplete
                            id={`subdistrict${prefix}`}
                            value={subDistrict}
                            required
                            getOptionLabel={(option) => option.nama}
                            options={listOfSubdistricts}
                            onChange={onSubDistrictChange}
                            disabled={!regency}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    sx={{
                                        "& .MuiOutlinedInput-root.Mui-focused":
                                        {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                    label="Kecamatan"
                                    error={
                                        !!errors[`subdistrict_code${prefix}`]
                                    }
                                    helperText={
                                        errors[`subdistrict_code${prefix}`]
                                    }
                                    variant="outlined"
                                    size="medium"
                                />
                            )}
                            fullWidth
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Autocomplete
                            id={`village${prefix}`}
                            value={village}
                            required
                            getOptionLabel={(option) => option.nama}
                            options={listOfVillages}
                            onChange={onVillageChange}
                            disabled={!subDistrict}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    sx={{
                                        "& .MuiOutlinedInput-root.Mui-focused":
                                        {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                        "& .MuiInputBase-input:focus": {
                                            outline: "none",
                                            boxShadow: "none",
                                        },
                                    }}
                                    label="Desa/Kelurahan"
                                    error={!!errors[`village_code${prefix}`]}
                                    helperText={errors[`village_code${prefix}`]}
                                    variant="outlined"
                                    size="medium"
                                />
                            )}
                            fullWidth
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    };

    return (
        <ThemeProvider theme={theme}>
            <Head title="Profil Mahasiswa" />
            <Header />

            {/* Snackbar Notifikasi */}
            <Snackbar
                open={notify}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                autoHideDuration={4000}
                onClose={handleCloseNotify}
            >
                <Alert onClose={handleCloseNotify} severity={notifyStatus} variant="filled" sx={{ width: "100%" }}>
                    {customMessage ? (
                        customMessage
                    ) : flash?.message ? (
                        flash.message[notifyStatus] || flash.message.success || flash.message.error || "Terjadi kesalahan"
                    ) : Object.keys(errors).length > 0 ? (
                        "Terdapat kesalahan pada form. Periksa kembali seluruh input yang wajib diisi."
                    ) : (
                        "Terjadi kesalahan"
                    )}
                </Alert>
            </Snackbar>

            {/* Modal Preview Dokumen */}
            <Modal
                open={previewOpen}
                onClose={handleClosePreview}
                sx={{ display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}
            >
                <Box sx={{ position: "relative", width: "95vw", height: "95vh", maxWidth: "1200px", bgcolor: "background.paper", borderRadius: 3, boxShadow: 24, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <Box sx={{ p: 3, borderBottom: 1, borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between", bgcolor: "primary.main", color: "white" }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>{previewTitle}</Typography>
                        <IconButton onClick={handleClosePreview} sx={{ color: "white", "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}>
                            <FaTimes />
                        </IconButton>
                    </Box>
                    <Box sx={{ flexGrow: 1, overflow: "hidden", position: "relative" }}>
                        {loadingPreview ? (
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                                <CircularProgress />
                                <Typography sx={{ ml: 2 }}>Memuat preview...</Typography>
                            </Box>
                        ) : previewFile ? (
                            <iframe src={previewFile} title={previewTitle} style={{ width: "100%", height: "100%", border: "none" }} />
                        ) : null}
                    </Box>
                    <Box sx={{ p: 2, borderTop: 1, borderColor: "divider", display: "flex", justifyContent: "flex-end" }}>
                        <Button variant="outlined" onClick={handleClosePreview} startIcon={<FaTimes />}>Tutup</Button>
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
                                    <span>{prodi?.name || "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-36 font-bold">Jenjang Pendidikan</span>
                                    <span className="mr-2">:</span>
                                    <span>Strata 1 (S1)</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold">NIM</span>
                                    <span className="mr-2">:</span>
                                    <span>{nim || "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-36 font-bold">Nama</span>
                                    <span className="mr-2">:</span>
                                    <span className="uppercase">{name || "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold">Tempat Lahir</span>
                                    <span className="mr-2">:</span>
                                    <span className="uppercase">-</span>
                                </div>
                                <div className="flex">
                                    <span className="w-36 font-bold">Tahun Masuk</span>
                                    <span className="mr-2">:</span>
                                    <span>{nim && nim.length >= 2 && !isNaN(nim.substring(0, 2)) ? "20" + nim.substring(0, 2) : "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold">Tanggal Lahir</span>
                                    <span className="mr-2">:</span>
                                    <span>-</span>
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

            <main className="flex text-gray-600 justify-center flex-col items-center w-full px-4 md:px-6 lg:px-8 bg-gray-50 min-h-screen pt-20 pb-10">
                <div className="w-full max-w-6xl">

                    {/* Header */}
                    {/* Link Grup WA */}
                    {link_grup && (
                        <Paper elevation={0} sx={{ mb: 3, p: 3, borderRadius: 3, border: "1px solid", borderColor: "success.light", borderLeft: "6px solid", borderLeftColor: "success.main", backgroundColor: "#f0fdf4" }}>
                            <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                                <Box>
                                    <Typography variant="h6" sx={{ fontWeight: 600, color: "success.main", display: "flex", alignItems: "center", gap: 1 }}>
                                        <FaWhatsapp style={{ fontSize: "1.4rem" }} /> Grup WhatsApp
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Silakan bergabung ke grup WhatsApp untuk koordinasi dan informasi lebih lanjut.
                                    </Typography>
                                </Box>
                                <Button component="a" href={link_grup} target="_blank" rel="noopener noreferrer" variant="contained"
                                    startIcon={<FaWhatsapp />}
                                    sx={{ bgcolor: "success.main", "&:hover": { bgcolor: "success.dark" }, fontWeight: 600, px: 3, py: 1.5, borderRadius: 2, whiteSpace: "nowrap" }}>
                                    Gabung Grup
                                </Button>
                            </Box>
                        </Paper>
                    )}
                    <Box sx={{ mb: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 3, background: "#ffffff", border: "1px solid #e5e7eb" }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                                <Box>
                                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>Profil Mahasiswa</Typography>
                                    <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: "600px" }}>
                                        Lengkapi dan perbarui data profil Anda. Data yang bersumber dari SIAKAD bersifat <strong>read-only</strong> dan hanya dapat diubah melalui sistem akademik.
                                    </Typography>
                                </Box>
                                {/* Status Badge */}
                                {(() => {
                                    const statusConfig = {
                                        submitted: { label: "Sedang Direview", color: "#ed6c02" },
                                        rejected: { label: "Ditolak", color: "#d32f2f" },
                                        accepted: { label: "Diterima ✓", color: "#2e7d32" },
                                        revisi: { label: "Perlu Revisi", color: "#ed6c02" },
                                    };
                                    const cfg = statusConfig[mahasiswa?.data_mahasiswa?.status];
                                    return cfg ? (
                                        <Chip
                                            label={cfg.label}
                                            sx={{ fontWeight: 700, fontSize: "0.875rem", height: 36, px: 1, bgcolor: cfg.color, color: "#fff" }}
                                        />
                                    ) : (
                                        <Chip label="Lengkapi Profil" sx={{ fontWeight: 700, fontSize: "0.875rem", height: 36, px: 1, bgcolor: "#d32f2f", color: "#fff" }} />
                                    );
                                })()}
                            </Box>
                        </Paper>
                    </Box>

                    {/* Alert Revisi / Ditolak */}
                    {mahasiswa?.data_mahasiswa?.status === "revisi" && (
                        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Perlu Revisi</Typography>
                            <Typography variant="body2">{mahasiswa?.data_mahasiswa?.keterangan || "Silakan perbaiki data profil Anda sesuai petunjuk."}</Typography>
                        </Alert>
                    )}
                    {mahasiswa?.data_mahasiswa?.status === "rejected" && (
                        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Ditolak</Typography>
                            <Typography variant="body2">{mahasiswa?.data_mahasiswa?.keterangan || "Pendaftaran tidak dapat diproses. Hubungi administrasi."}</Typography>
                        </Alert>
                    )}



                    {/* Main Form */}
                    <form onSubmit={onSubmit}>
                        <Grid container spacing={3}>

                            {/* ===== KOLOM KIRI: Data Pribadi + Alamat ===== */}
                            <Grid item xs={12} md={7}>

                                {/* Card: Data Akun */}
                                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", mb: 3 }}>
                                    <CardContent className="space-y-6">
                                        <Typography variant="h6" sx={{ borderBottom: "2px solid #008a01", pb: 1, width: "fit-content" }}>
                                            Data Akun
                                        </Typography>

                                        <Grid container spacing={2}>
                                            {/* Username (NIM) — readonly */}
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Username"
                                                    fullWidth
                                                    disabled
                                                    value={nim}
                                                    variant="outlined"
                                                    helperText="Username login (Sesuai NIM)"
                                                />
                                            </Grid>

                                            {/* Password Baru — editable */}
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    label="Password Baru"
                                                    type={showPassword ? "text" : "password"}
                                                    fullWidth
                                                    value={password}
                                                    onChange={handlePasswordChange}
                                                    error={!!errors.password}
                                                    helperText={errors.password || "Kosongkan jika tidak ingin mengubah password"}
                                                    variant="outlined"
                                                    InputProps={{
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    onClick={() => setShowPassword(!showPassword)}
                                                                    edge="end"
                                                                >
                                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                {/* Card: Data Pribadi & Akademik */}
                                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", mb: 3 }}>
                                    <CardContent className="space-y-6">
                                        <Typography variant="h6" sx={{ borderBottom: "2px solid #008a01", pb: 1, width: "fit-content" }}>
                                            Data Pribadi &amp; Akademik
                                        </Typography>

                                        <Grid container spacing={2}>
                                            {/* Nama — readonly dari SIAKAD */}
                                            <Grid item xs={12} md={6}>
                                                <TextField label="Nama Lengkap" fullWidth disabled value={name} variant="outlined"
                                                    helperText="Data dari SIAKAD" />
                                            </Grid>

                                            {/* NIM — readonly */}
                                            <Grid item xs={12} md={6}>
                                                <TextField label="NIM" fullWidth disabled value={nim} variant="outlined"
                                                    helperText="Data dari SIAKAD" />
                                            </Grid>

                                            {/* Jenis Kelamin — editable */}
                                            <Grid item xs={12} md={6}>
                                                <FormControl fullWidth error={!!errors.jk}>
                                                    <InputLabel>Jenis Kelamin</InputLabel>
                                                    <Select value={jenisKelamin} label="Jenis Kelamin" onChange={handleJenisKelaminChange}>
                                                        <MenuItem value="Pria">Pria</MenuItem>
                                                        <MenuItem value="Wanita">Wanita</MenuItem>
                                                    </Select>
                                                    {errors.jk && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>{errors.jk}</Typography>}
                                                </FormControl>
                                            </Grid>

                                            {/* No. HP/WA — editable */}
                                            <Grid item xs={12} md={6}>
                                                <TextField label="Nomor WhatsApp" fullWidth value={noHpWa} onChange={handleNoHpWa}
                                                    error={!!errors.no_hp_wa} helperText={errors.no_hp_wa} placeholder="08xxxxxxxxxx" />
                                                <Typography variant="caption" sx={{ mt: 0.5, display: "block", color: "primary.main", fontStyle: "italic" }}>
                                                    * Ganti dengan nomor WhatsApp yang aktif
                                                </Typography>
                                            </Grid>

                                            {/* Program Studi — readonly dari SIAKAD */}
                                            <Grid item xs={12}>
                                                <TextField label="Program Studi" fullWidth disabled value={prodi?.name || ""} variant="outlined"
                                                    helperText="Data dari SIAKAD" />
                                                {errors.id_prodi && <Typography variant="caption" color="error">{errors.id_prodi}</Typography>}
                                            </Grid>

                                            {/* Semester — readonly */}
                                            <Grid item xs={12} md={4}>
                                                <TextField label="Semester" type="number" fullWidth disabled value={semester} variant="outlined"
                                                    helperText="Data dari SIAKAD" />
                                            </Grid>

                                            {/* IPK — readonly */}
                                            <Grid item xs={12} md={4}>
                                                <TextField label="IPK Terakhir" type="number" fullWidth disabled value={IPK} variant="outlined"
                                                    helperText="Data dari SIAKAD" />
                                            </Grid>

                                            {/* Nilai Micro Teaching — readonly */}
                                            <Grid item xs={12} md={4}>
                                                <TextField label="Nilai Micro Teaching" fullWidth disabled
                                                    value={nilaiMicro || "Belum ada"} variant="outlined"
                                                    helperText="Data dari SIAKAD" />
                                            </Grid>

                                            {/* Cluster Kegiatan — editable */}
                                            <Grid item xs={12}>
                                                <FormControl fullWidth error={!!errors.cluster_kegiatan}>
                                                    <InputLabel>Cluster Kegiatan</InputLabel>
                                                    <Select value={clusterKegiatan} label="Cluster Kegiatan" onChange={handleClusterKegiatanChange}>
                                                        <MenuItem value="PPKPM">PPKPM (PPL + KPM)</MenuItem>
                                                        <MenuItem value="PPL">PPL</MenuItem>
                                                        <MenuItem value="KPM">KPM</MenuItem>
                                                        <MenuItem value="PPKPM_Mandiri">PPKPM Mandiri</MenuItem>
                                                        <MenuItem value="PPL_Mandiri">PPL Mandiri</MenuItem>
                                                        <MenuItem value="KPM_Mandiri">KPM Mandiri</MenuItem>
                                                    </Select>
                                                    {errors.cluster_kegiatan && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: "block" }}>{errors.cluster_kegiatan}</Typography>}
                                                </FormControl>
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>

                                {/* Card: Informasi Alamat */}
                                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ borderBottom: "2px solid #008a01", pb: 1, width: "fit-content", mb: 2 }}>
                                            Informasi Alamat
                                        </Typography>

                                        {/* Alamat Lengkap */}
                                        <Box sx={{ mb: 2 }}>
                                            <TextField
                                                label="Alamat Lengkap (Jalan/Desa)"
                                                fullWidth multiline rows={2}
                                                value={alamatAsal}
                                                onChange={handleAlamatAsalChange}
                                                error={!!errors.alamat_asal}
                                                helperText={errors.alamat_asal}
                                                placeholder="Contoh: Jl. Merdeka No. 123, Desa..."
                                            />
                                        </Box>

                                        {/* Tabs Alamat */}
                                        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                                            <Tabs value={addressTab} onChange={handleAddressTabChange}>
                                                <Tab icon={<Home sx={{ fontSize: 20 }} />} iconPosition="start" label="Alamat Asal" />
                                                <Tab icon={<LocationOn sx={{ fontSize: 20 }} />} iconPosition="start" label="Alamat Sekarang" />
                                            </Tabs>
                                        </Box>

                                        {/* Tab: Alamat Asal */}
                                        <CustomTabPanel value={addressTab} index={0}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={listOfProvincies}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={provinceAsal}
                                                        onChange={handleProvinceAsalChange}
                                                        renderInput={(p) => <TextField {...p} label="Provinsi" error={!!errors.province_code} helperText={errors.province_code} />}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={listOfRegenciesAsal}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={regencyAsal}
                                                        onChange={handleRegencyAsalChange}
                                                        disabled={!provinceAsal}
                                                        renderInput={(p) => <TextField {...p} label="Kabupaten/Kota" error={!!errors.regency_code} helperText={errors.regency_code} />}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={listOfSubdistrictsAsal}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={subDistrictAsal}
                                                        onChange={handleSubDistrictAsalChange}
                                                        disabled={!regencyAsal}
                                                        renderInput={(p) => <TextField {...p} label="Kecamatan" error={!!errors.subdistrict_code} helperText={errors.subdistrict_code} />}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={listOfVillagesAsal}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={villageAsal}
                                                        onChange={handleVillageAsalChange}
                                                        disabled={!subDistrictAsal}
                                                        renderInput={(p) => <TextField {...p} label="Desa/Kelurahan" error={!!errors.village_code} helperText={errors.village_code} />}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CustomTabPanel>

                                        {/* Tab: Alamat Sekarang */}
                                        <CustomTabPanel value={addressTab} index={1}>
                                            <Box sx={{ mb: 2, display: "flex", justifyContent: "flex-end" }}>
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    onClick={handleCopyAlamatAsal}
                                                    startIcon={<ContentCopy />}
                                                    sx={{ textTransform: "none", borderRadius: 1.5 }}
                                                >
                                                    Salin dari Alamat Asal
                                                </Button>
                                            </Box>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={listOfProvincies}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={provinceNow}
                                                        onChange={handleProvinceNowChange}
                                                        renderInput={(p) => <TextField {...p} label="Provinsi" error={!!errors.province_code_now} helperText={errors.province_code_now} />}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={listOfRegenciesNow}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={regencyNow}
                                                        onChange={handleRegencyNowChange}
                                                        disabled={!provinceNow}
                                                        renderInput={(p) => <TextField {...p} label="Kabupaten/Kota" error={!!errors.regency_code_now} helperText={errors.regency_code_now} />}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={listOfSubdistrictsNow}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={subDistrictNow}
                                                        onChange={handleSubDistrictNowChange}
                                                        disabled={!regencyNow}
                                                        renderInput={(p) => <TextField {...p} label="Kecamatan" error={!!errors.subdistrict_code_now} helperText={errors.subdistrict_code_now} />}
                                                    />
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Autocomplete
                                                        options={listOfVillagesNow}
                                                        getOptionLabel={(opt) => opt.nama}
                                                        value={villageNow}
                                                        onChange={handleVillageNowChange}
                                                        disabled={!subDistrictNow}
                                                        renderInput={(p) => <TextField {...p} label="Desa/Kelurahan" error={!!errors.village_code_now} helperText={errors.village_code_now} />}
                                                    />
                                                </Grid>
                                            </Grid>
                                        </CustomTabPanel>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* ===== KOLOM KANAN: Dokumen ===== */}
                            <Grid item xs={12} md={5}>

                                {/* Info Akademik Summary — readonly card */}
                                <Card elevation={0} sx={{ borderRadius: 3, border: "1px solid #e5e7eb", mb: 3, bgcolor: "#f8fffe" }}>
                                    <CardContent>
                                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "primary.main" }}>
                                            📋 Ringkasan Akademik
                                        </Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                                            {[
                                                {
                                                    label: "Status Pendaftaran", value: mahasiswa?.data_mahasiswa?.status === "submitted" ? "Sedang Direview"
                                                        : mahasiswa?.data_mahasiswa?.status === "accepted" ? "✓ Diterima"
                                                            : mahasiswa?.data_mahasiswa?.status === "rejected" ? "✗ Ditolak"
                                                                : mahasiswa?.data_mahasiswa?.status === "revisi" ? "⚠ Perlu Revisi"
                                                                    : "Belum Lengkap"
                                                },
                                                { label: "Gelombang", value: mahasiswa?.data_mahasiswa?.gelombang?.name || "-" },
                                                { label: "Cluster", value: clusterKegiatan || "-" },
                                            ].map((item) => (
                                                <Box key={item.label} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5, borderBottom: "1px solid #e5e7eb" }}>
                                                    <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{item.value}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </CardContent>
                                </Card>

                                {/* Dokumen Pendukung */}
                                <Typography variant="h6" className="mb-3 px-1">Dokumen Pendukung</Typography>

                                {/* Transkrip Nilai */}
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

                                {/* Surat Pernyataan */}
                                <FileUploadSection
                                    file={suratPernyataan}
                                    link={linkSuratPernyataan}
                                    type="surat_pernyataan"
                                    title="Surat Pernyataan"
                                    description="Surat Pernyataan Ka Prodi (PDF, Max 500KB)"
                                    icon={Assignment}
                                    onPreview={handleOpenPreview}
                                    onChange={handleSuratPernyataanChange}
                                    error={errors.link_surat_pernyataan}
                                    templateUrl="/assets/Form%20Surat%20Pernyataan%20Kaprodi%20untuk%20PPKPM%20.docx"
                                />

                                {/* Surat Kesiapan */}
                                <FileUploadSection
                                    file={suratKesiapan}
                                    link={linkSuratKesiapan}
                                    type="surat_kesiapan"
                                    title="Surat Kesiapan"
                                    description="Surat Kesiapan Mahasiswa (PDF, Max 500KB)"
                                    icon={AssignmentInd}
                                    onPreview={handleOpenPreview}
                                    onChange={handleSuratKesiapanChange}
                                    error={errors.link_surat_kesiapan}
                                    templateUrl="/assets/SURAT%20PERNYATAAN%20%26%20PERJANJIAN%20MAHASISWA%20PPKPM%20.docx"
                                />

                                {/* Tombol Simpan */}
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    disabled={processing}
                                    sx={{ mt: 2, py: 2, borderRadius: 3, fontWeight: "bold" }}
                                >
                                    {processing ? (
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <CircularProgress size={20} color="inherit" />
                                            Menyimpan...
                                        </Box>
                                    ) : "Simpan Profil"}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </div>
            </main>

            <ButtomFooter />
            <Navigation />
        </ThemeProvider>
    );
};

export default Profil;
