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
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [addressTab, setAddressTab] = useState(0);

    // State untuk modal preview
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [previewType, setPreviewType] = useState("");
    const [previewTitle, setPreviewTitle] = useState("");

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

    const [transkrip, setTranskrip] = useState(null);
    const [linkTranskrip] = useState(
        mahasiswa?.data_mahasiswa?.link_transkrip_nilai || null
    );

    const [suratPernyataan, setSuratPernyataan] = useState(null);
    const [linkSuratPernyataan] = useState(
        mahasiswa?.data_mahasiswa?.link_surat_pernyataan || null
    );

    const [suratKesiapan, setSuratKesiapan] = useState(null);
    const [linkSuratKesiapan] = useState(
        mahasiswa?.data_mahasiswa?.link_surat_kesiapan || null
    );

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
    });

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
        async (type) => {
            let file = null;
            let fileUrl = null;
            let title = "";

            switch (type) {
                case "transkrip":
                    file = transkrip;
                    fileUrl = linkTranskrip;
                    title = "Preview Transkrip Nilai";
                    break;
                case "surat_pernyataan":
                    file = suratPernyataan;
                    fileUrl = linkSuratPernyataan;
                    title = "Preview Surat Pernyataan KA PRODI";
                    break;
                case "surat_kesiapan":
                    file = suratKesiapan;
                    fileUrl = linkSuratKesiapan;
                    title = "Preview Surat Kesiapan Mahasiswa";
                    break;
                default:
                    return;
            }

            setLoadingPreview(true);

            if (file) {
                // Untuk file yang baru diupload
                const url = URL.createObjectURL(file);
                setPreviewFile(url);
                setPreviewType("object");
            } else if (fileUrl) {
                // Untuk file yang sudah ada di server
                // Gunakan getFullUrl untuk menggabungkan base URL dengan path file
                const fullUrl = getFullUrl(fileUrl);
                setPreviewFile(fullUrl);
                console.log("url file ", fullUrl);
                setPreviewType("url");
            } else {
                setLoadingPreview(false);
                return;
            }

            setPreviewTitle(title);
            setPreviewOpen(true);
            setLoadingPreview(false);
        },
        [
            transkrip,
            linkTranskrip,
            suratPernyataan,
            linkSuratPernyataan,
            suratKesiapan,
            linkSuratKesiapan,
            getFullUrl,
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
            setSuratPernyataan(file);
            setData("link_surat_pernyataan", file);
        },
        [setData]
    );

    const handleSuratKesiapanChange = useCallback(
        (e) => {
            const file = e.target.files[0];
            setSuratKesiapan(file);
            setData("link_surat_kesiapan", file);
        },
        [setData]
    );

    const onSubmit = useCallback(
        (e) => {
            e.preventDefault();
            post("/profil/save");
        },
        [post]
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
    }) => {
        const hasFile = file || link;
        const fullUrl = link ? getFullUrl(link) : null;

        return (
            <Card
                variant="outlined"
                sx={{
                    mb: 2,
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
                        <Box sx={{ flex: 1 }}>
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
            <Snackbar
                open={notify}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                autoHideDuration={3000}
                onClose={handleCloseNotify}
            >
                <Alert
                    onClose={handleCloseNotify}
                    severity={notifyStatus}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {flash?.message &&
                        (flash.message[notifyStatus] ||
                            flash.message.success ||
                            flash.message.error ||
                            "Terjadi kesalahan")}
                </Alert>
            </Snackbar>

            {/* Modal Preview */}
            <Modal
                open={previewOpen}
                onClose={handleClosePreview}
                aria-labelledby="preview-modal-title"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(4px)",
                }}
            >
                <Box
                    sx={{
                        position: "relative",
                        width: "95vw",
                        height: "95vh",
                        maxWidth: "1200px",
                        bgcolor: "background.paper",
                        borderRadius: 3,
                        boxShadow: 24,
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {/* Header Modal */}
                    <Box
                        sx={{
                            p: 3,
                            borderBottom: 1,
                            borderColor: "divider",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            bgcolor: "primary.main",
                            color: "white",
                        }}
                    >
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ fontWeight: 600 }}
                        >
                            {previewTitle}
                        </Typography>
                        <IconButton
                            onClick={handleClosePreview}
                            sx={{
                                color: "white",
                                "&:hover": {
                                    backgroundColor: "rgba(255,255,255,0.1)",
                                },
                            }}
                        >
                            <FaTimes />
                        </IconButton>
                    </Box>

                    {/* Content Modal */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflow: "hidden",
                            p: 0,
                            position: "relative",
                        }}
                    >
                        {loadingPreview ? (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: "100%",
                                }}
                            >
                                <CircularProgress />
                                <Typography sx={{ ml: 2 }}>
                                    Memuat preview...
                                </Typography>
                            </Box>
                        ) : previewFile ? (
                            <iframe
                                src={previewFile}
                                title={previewTitle}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    border: "none",
                                }}
                            />
                        ) : null}
                    </Box>

                    {/* Footer Modal */}
                    <Box
                        sx={{
                            p: 2,
                            borderTop: 1,
                            borderColor: "divider",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <Typography variant="body2" color="text.secondary">
                            {previewType === "object"
                                ? "File baru (belum disimpan)"
                                : "File tersimpan di server"}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={handleClosePreview}
                                startIcon={<FaTimes />}
                            >
                                Tutup
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Modal>

            <main className="flex text-gray-600 justify-center flex-col items-center w-full px-4 md:px-6 lg:px-8 z-[0] bg-gray-50 min-h-screen">
                <div className="w-full max-w-6xl py-6">
                    {/* Header Section */}
                    <Box sx={{ mb: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                borderRadius: 3,
                                background: "#ffffff",
                                border: "1px solid #e5e7eb", 
                                color: "black",
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    flexWrap: "wrap",
                                    gap: 2,
                                }}
                            >
                                <Box>
                                    <Typography
                                        variant="h4"
                                        gutterBottom
                                        sx={{ fontWeight: 700 }}
                                    >
                                        Profil Mahasiswa
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        sx={{ opacity: 0.9, maxWidth: "600px" }}
                                    >
                                        Lengkapi data profil Anda untuk
                                        keperluan administrasi. Pastikan semua
                                        informasi yang dimasukkan valid dan
                                        dokumen yang diunggah sesuai dengan
                                        ketentuan.
                                    </Typography>
                                </Box>
                                <StatusBadge
                                    status={mahasiswa?.data_mahasiswa?.status}
                                />
                            </Box>
                        </Paper>
                    </Box>

                    {/* Status Messages */}
                    {mahasiswa?.data_mahasiswa?.status === "revisi" && (
                        <Alert
                            severity="warning"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                "& .MuiAlert-icon": { fontSize: 28 },
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                            >
                                Perlu Revisi
                            </Typography>
                            <Typography variant="body2">
                                {mahasiswa?.data_mahasiswa?.keterangan ||
                                    "Silakan perbaiki data profil Anda sesuai dengan petunjuk yang diberikan."}
                            </Typography>
                        </Alert>
                    )}

                    {mahasiswa?.data_mahasiswa?.status === "rejected" && (
                        <Alert
                            severity="error"
                            sx={{
                                mb: 3,
                                borderRadius: 2,
                                "& .MuiAlert-icon": { fontSize: 28 },
                            }}
                        >
                            <Typography
                                variant="subtitle1"
                                gutterBottom
                                sx={{ fontWeight: 600 }}
                            >
                                Ditolak
                            </Typography>
                            <Typography variant="body2">
                                {mahasiswa?.data_mahasiswa?.keterangan ||
                                    "Pendaftaran Anda tidak dapat diproses lebih lanjut. Silakan hubungi administrasi untuk informasi lebih detail."}
                            </Typography>
                        </Alert>
                    )}

                    {/* Additional Sections */}
                    {link_grup &&
                        mahasiswa?.data_mahasiswa?.status === "accepted" && (
                            <Paper
                                elevation={0}
                                sx={{
                                    mt: 4,
                                    p: 4,
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: "success.light",
                                    borderLeft: "6px solid",
                                    borderLeftColor: "success.main",
                                    backgroundColor: "success.50",
                                }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: {
                                            xs: "column",
                                            md: "row",
                                        },
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 3,
                                    }}
                                >
                                    <Box sx={{ flex: 1 }}>
                                        <Typography
                                            variant="h6"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 600,
                                                color: "success.main",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                            }}
                                        >
                                            <FaWhatsapp
                                                style={{ fontSize: "1.5rem" }}
                                            />
                                            Informasi Grup WhatsApp
                                        </Typography>
                                        <Typography
                                            variant="body1"
                                            color="text.secondary"
                                        >
                                            Selamat! Pendaftaran Anda telah
                                            diterima. Bergabunglah dengan grup
                                            WhatsApp untuk mendapatkan informasi
                                            terbaru dan koordinasi lebih lanjut
                                            mengenai kegiatan yang akan diikuti.
                                        </Typography>
                                    </Box>
                                    <Button
                                        component="a"
                                        href={link_grup}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        variant="contained"
                                        startIcon={<FaWhatsapp />}
                                        sx={{
                                            bgcolor: "success.main",
                                            "&:hover": {
                                                bgcolor: "success.dark",
                                            },
                                            textTransform: "capitalize",
                                            fontWeight: 600,
                                            px: 4,
                                            py: 1.5,
                                            borderRadius: 2,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Gabung Grup
                                    </Button>
                                </Box>
                            </Paper>
                        )}

                    {/* Main Form */}
                    <form onSubmit={onSubmit} className="mt-8">
                        <Grid container spacing={3}>
                            {/* Left Column - Data Pribadi */}
                            <Grid item xs={12} md={6}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: "100%",
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: "divider",
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 600,
                                                mb: 3,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                Data Pribadi
                                            </Box>
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 2.5,
                                            }}
                                        >
                                            <TextField
                                                id="nama"
                                                value={name}
                                                label="Nama Lengkap"
                                                disabled
                                                required
                                                fullWidth
                                                variant="outlined"
                                                size="medium"
                                                sx={{
                                                    "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                    "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                }}
                                            />
                                            <TextField
                                                id="nim"
                                                value={nim}
                                                label="NIM"
                                                disabled
                                                required
                                                fullWidth
                                                variant="outlined"
                                                size="medium"
                                                sx={{
                                                    "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                    "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                }}
                                            />
                                            <TextField
                                                id="no_hp_wa"
                                                value={noHpWa}
                                                label="No. HP/WhatsApp"
                                                type="tel"
                                                required
                                                onChange={handleNoHpWa}
                                                fullWidth
                                                error={!!errors.no_hp_wa}
                                                variant="outlined"
                                                size="medium"
                                                helperText={errors.no_hp_wa}
                                                sx={{
                                                    "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                    "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                }}
                                            />
                                            <TextField
                                                id="alamat_asal"
                                                value={alamatAsal}
                                                label="Alamat Lengkap Asal (Kampung)"
                                                required
                                                onChange={
                                                    handleAlamatAsalChange
                                                }
                                                fullWidth
                                                error={!!errors.alamat_asal}
                                                variant="outlined"
                                                size="medium"
                                                multiline
                                                rows={3}
                                                helperText={errors.alamat_asal}
                                                sx={{
                                                    "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                    "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                }}
                                                placeholder="Contoh: Jl. Merdeka No. 123, RT 01/RW 02, Desa/Kelurahan"
                                            />

                                            <Divider sx={{ my: 2 }} />

                                            {/* Tabs untuk alamat asal dan sekarang */}
                                            <Paper
                                                sx={{ mb: 2, borderRadius: 2 }}
                                            >
                                                <Tabs
                                                    value={addressTab}
                                                    onChange={
                                                        handleAddressTabChange
                                                    }
                                                    variant="fullWidth"
                                                    sx={{
                                                        "& .MuiTab-root": {
                                                            textTransform:
                                                                "capitalize",
                                                            fontWeight: 600,
                                                            fontSize:
                                                                "0.875rem",
                                                        },
                                                    }}
                                                >
                                                    <Tab
                                                        icon={
                                                            <FaHome
                                                                style={{
                                                                    marginRight: 8,
                                                                }}
                                                            />
                                                        }
                                                        iconPosition="start"
                                                        label="Alamat Asal"
                                                    />
                                                    <Tab
                                                        icon={
                                                            <FaMapMarkerAlt
                                                                style={{
                                                                    marginRight: 8,
                                                                }}
                                                            />
                                                        }
                                                        iconPosition="start"
                                                        label="Alamat Sekarang"
                                                    />
                                                </Tabs>
                                            </Paper>

                                            {/* Tab Content */}
                                            <Box sx={{ mt: 2 }}>
                                                {addressTab === 0 ? (
                                                    <AddressSection
                                                        title="Detail Alamat Asal"
                                                        icon={Home}
                                                        province={provinceAsal}
                                                        regency={regencyAsal}
                                                        subDistrict={
                                                            subDistrictAsal
                                                        }
                                                        village={villageAsal}
                                                        onProvinceChange={
                                                            handleProvinceAsalChange
                                                        }
                                                        onRegencyChange={
                                                            handleRegencyAsalChange
                                                        }
                                                        onSubDistrictChange={
                                                            handleSubDistrictAsalChange
                                                        }
                                                        onVillageChange={
                                                            handleVillageAsalChange
                                                        }
                                                        listOfRegencies={
                                                            listOfRegenciesAsal
                                                        }
                                                        listOfSubdistricts={
                                                            listOfSubdistrictsAsal
                                                        }
                                                        listOfVillages={
                                                            listOfVillagesAsal
                                                        }
                                                        errors={errors}
                                                    />
                                                ) : (
                                                    <AddressSection
                                                        title="Detail Alamat Domisili Saat Kuliah"
                                                        icon={LocationOn}
                                                        province={provinceNow}
                                                        regency={regencyNow}
                                                        subDistrict={
                                                            subDistrictNow
                                                        }
                                                        village={villageNow}
                                                        onProvinceChange={
                                                            handleProvinceNowChange
                                                        }
                                                        onRegencyChange={
                                                            handleRegencyNowChange
                                                        }
                                                        onSubDistrictChange={
                                                            handleSubDistrictNowChange
                                                        }
                                                        onVillageChange={
                                                            handleVillageNowChange
                                                        }
                                                        listOfRegencies={
                                                            listOfRegenciesNow
                                                        }
                                                        listOfSubdistricts={
                                                            listOfSubdistrictsNow
                                                        }
                                                        listOfVillages={
                                                            listOfVillagesNow
                                                        }
                                                        errors={errors}
                                                        isNow={true}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Right Column - Data Akademik & Dokumen */}
                            <Grid item xs={12} md={6}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: "100%",
                                        borderRadius: 3,
                                        border: "1px solid",
                                        borderColor: "divider",
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            variant="h5"
                                            gutterBottom
                                            sx={{
                                                fontWeight: 600,
                                                mb: 3,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1,
                                                }}
                                            >
                                                Data Akademik & Dokumen
                                            </Box>
                                        </Typography>

                                        <Box
                                            sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                                gap: 2.5,
                                            }}
                                        >
                                            <Autocomplete
                                                id="prodi"
                                                value={prodi}
                                                required
                                                options={list_prodi}
                                                onChange={handleProdiChange}
                                                fullWidth
                                                getOptionLabel={(option) =>
                                                    option.name
                                                }
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Program Studi"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                            "& .MuiInputBase-input:focus":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                        }}
                                                        error={
                                                            !!errors.id_prodi
                                                        }
                                                        helperText={
                                                            errors.id_prodi
                                                        }
                                                        variant="outlined"
                                                        size="medium"
                                                    />
                                                )}
                                            />

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        id="ipk"
                                                        value={IPK}
                                                        label="IPK"
                                                        type="text"
                                                        inputMode="decimal"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                            "& .MuiInputBase-input:focus":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                        }}
                                                        required
                                                        onChange={
                                                            handleIPKChange
                                                        }
                                                        fullWidth
                                                        error={!!errors.ipk}
                                                        helperText={errors.ipk}
                                                        variant="outlined"
                                                        size="medium"
                                                    />
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl
                                                        fullWidth
                                                        error={
                                                            !!errors.nilai_micro_teaching
                                                        }
                                                    >
                                                        <InputLabel>
                                                            Nilai Micro Teaching
                                                        </InputLabel>
                                                        <Select
                                                            value={nilaiMicro}
                                                            required
                                                            label="Nilai Micro Teaching"
                                                            onChange={
                                                                handleNilaiMicroChange
                                                            }
                                                            size="medium"
                                                        >
                                                            <MenuItem
                                                                value={"A"}
                                                            >
                                                                A
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={"A-"}
                                                            >
                                                                A-
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={"B+"}
                                                            >
                                                                B+
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={"B"}
                                                            >
                                                                B
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={"B-"}
                                                            >
                                                                B-
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={"C+"}
                                                            >
                                                                C+
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={"C"}
                                                            >
                                                                C
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={"C-"}
                                                            >
                                                                C-
                                                            </MenuItem>
                                                        </Select>
                                                        {errors.nilai_micro_teaching && (
                                                            <Typography
                                                                variant="caption"
                                                                color="error"
                                                                sx={{
                                                                    mt: 0.5,
                                                                    display:
                                                                        "block",
                                                                }}
                                                            >
                                                                {
                                                                    errors.nilai_micro_teaching
                                                                }
                                                            </Typography>
                                                        )}
                                                    </FormControl>
                                                </Grid>
                                            </Grid>

                                            <Grid container spacing={2}>
                                                <Grid item xs={12} sm={6}>
                                                    <FormControl
                                                        fullWidth
                                                        error={
                                                            !!errors.cluster_kegiatan
                                                        }
                                                    >
                                                        <InputLabel>
                                                            Cluster Kegiatan
                                                        </InputLabel>
                                                        <Select
                                                            value={
                                                                clusterKegiatan
                                                            }
                                                            label="Cluster Kegiatan"
                                                            onChange={
                                                                handleClusterKegiatanChange
                                                            }
                                                            size="medium"
                                                        >
                                                            <MenuItem
                                                                value={"PPKPM"}
                                                            >
                                                                PPKPM Reguler
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={"PPL"}
                                                            >
                                                                PPL Reguler
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={"KPM"}
                                                            >
                                                                KPM Reguler
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={
                                                                    "PPKPM_Mandiri"
                                                                }
                                                            >
                                                                PPKPM Mandiri
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={
                                                                    "PPL_Mandiri"
                                                                }
                                                            >
                                                                PPL Mandiri
                                                            </MenuItem>
                                                            <MenuItem
                                                                value={
                                                                    "KPM_Mandiri"
                                                                }
                                                            >
                                                                KPM Mandiri
                                                            </MenuItem>
                                                        </Select>
                                                        {errors.cluster_kegiatan && (
                                                            <Typography
                                                                variant="caption"
                                                                color="error"
                                                                sx={{
                                                                    mt: 0.5,
                                                                    display:
                                                                        "block",
                                                                }}
                                                            >
                                                                {
                                                                    errors.cluster_kegiatan
                                                                }
                                                            </Typography>
                                                        )}
                                                    </FormControl>
                                                </Grid>
                                                <Grid item xs={12} sm={6}>
                                                    <TextField
                                                        id="semester"
                                                        value={semester}
                                                        label="Semester"
                                                        sx={{
                                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                            "& .MuiInputBase-input:focus":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                        }}
                                                        type="number"
                                                        required
                                                        onChange={
                                                            handleSemesterChange
                                                        }
                                                        fullWidth
                                                        error={
                                                            !!errors.semester
                                                        }
                                                        helperText={
                                                            errors.semester
                                                        }
                                                        variant="outlined"
                                                        size="medium"
                                                        inputProps={{
                                                            min: 1,
                                                            max: 14,
                                                        }}
                                                    />
                                                </Grid>
                                            </Grid>

                                            <FormControl
                                                fullWidth
                                                error={!!errors.jk}
                                            >
                                                <InputLabel>
                                                    Jenis Kelamin
                                                </InputLabel>
                                                <Select
                                                    value={jenisKelamin}
                                                    label="Jenis Kelamin"
                                                    onChange={
                                                        handleJenisKelaminChange
                                                    }
                                                    size="medium"
                                                >
                                                    <MenuItem value={"Pria"}>
                                                        Pria
                                                    </MenuItem>
                                                    <MenuItem value={"Wanita"}>
                                                        Wanita
                                                    </MenuItem>
                                                </Select>
                                                {errors.jk && (
                                                    <Typography
                                                        variant="caption"
                                                        color="error"
                                                        sx={{
                                                            mt: 0.5,
                                                            display: "block",
                                                        }}
                                                    >
                                                        {errors.jk}
                                                    </Typography>
                                                )}
                                            </FormControl>

                                            <Divider sx={{ my: 2 }} />

                                            {/* File Upload Sections */}
                                            <Typography
                                                variant="h6"
                                                gutterBottom
                                                sx={{
                                                    fontWeight: 600,
                                                    color: "text.primary",
                                                }}
                                            >
                                                Dokumen Pendukung
                                            </Typography>

                                            <FileUploadSection
                                                file={transkrip}
                                                link={linkTranskrip}
                                                type="transkrip"
                                                title="Transkrip Nilai"
                                                description="Unggah scan transkrip nilai terbaru dalam format PDF"
                                                icon={Description}
                                                onPreview={handleOpenPreview}
                                                onChange={handleTranskripChange}
                                                error={
                                                    errors.link_transkrip_nilai
                                                }
                                            />

                                            <FileUploadSection
                                                file={suratPernyataan}
                                                link={linkSuratPernyataan}
                                                type="surat_pernyataan"
                                                title="Surat Pernyataan KA PRODI"
                                                description="Surat pernyataan dari Kepala Program Studi"
                                                icon={Assignment}
                                                onPreview={handleOpenPreview}
                                                onChange={
                                                    handleSuratPernyataanChange
                                                }
                                                error={
                                                    errors.link_surat_pernyataan
                                                }
                                            />

                                            <FileUploadSection
                                                file={suratKesiapan}
                                                link={linkSuratKesiapan}
                                                type="surat_kesiapan"
                                                title="Surat Kesiapan Mahasiswa"
                                                description="Surat pernyataan kesiapan mengikuti kegiatan"
                                                icon={AssignmentInd}
                                                onPreview={handleOpenPreview}
                                                onChange={
                                                    handleSuratKesiapanChange
                                                }
                                                error={
                                                    errors.link_surat_kesiapan
                                                }
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Action Buttons */}
                        <Box
                            sx={{
                                mt: 4,
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: 2,
                            }}
                        >
                            <Button
                                type="submit"
                                disabled={processing}
                                variant="contained"
                                color="primary"
                                size="large"
                                sx={{
                                    textTransform: "capitalize",
                                    fontWeight: 600,
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 2,
                                    minWidth: "140px",
                                }}
                            >
                                {processing ? (
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                        }}
                                    >
                                        <CircularProgress
                                            size={20}
                                            color="inherit"
                                        />
                                        Menyimpan...
                                    </Box>
                                ) : (
                                    "Simpan Profil"
                                )}
                            </Button>
                        </Box>
                    </form>
                </div>
            </main>
            <ButtomFooter />
            <Navigation />
        </ThemeProvider>
    );
};

export default Profil;
