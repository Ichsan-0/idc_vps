import React, { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import { Head, router } from "@inertiajs/react";
import { 
    Alert, 
    Button, 
    Card, 
    Chip, 
    CircularProgress, 
    Dialog, 
    DialogActions, 
    DialogContent, 
    DialogTitle, 
    FormControlLabel, 
    IconButton, 
    Paper, 
    Snackbar, 
    Switch, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    TextField, 
    Typography,
    Box,
    Divider,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    InputAdornment
} from "@mui/material";
import { FaTimes, FaSearch, FaTrash, FaEye } from "react-icons/fa";
import axios from "axios";

export default function DispensasiSyarat({ dispensations, filters = {} }) {
    // Filter & Search states
    const [searchTerm, setSearchTerm] = useState(filters.search || "");
    const [filterStatus, setFilterStatus] = useState(filters.status || "all");

    // Modal states
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [selectedDispensation, setSelectedDispensation] = useState(null);

    // Reactive selection from props when list updates
    const currentSelectedDisp = useMemo(() => {
        if (!selectedDispensation) return null;
        return dispensations.find(d => d.nim === selectedDispensation.nim) || selectedDispensation;
    }, [dispensations, selectedDispensation]);

    // Search NIM states
    const [searchNim, setSearchNim] = useState("");
    const [searching, setSearching] = useState(false);
    const [searchedStudent, setSearchedStudent] = useState(null);
    const [searchError, setSearchError] = useState("");

    // Form inputs for dispensation addition
    const [skipMicro, setSkipMicro] = useState(false);
    const [skipSks, setSkipSks] = useState(false);
    const [alasan, setAlasan] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const triggerFilter = (newFilters) => {
        router.get("/admin/users/dispensasi-syarat", {
            search: newFilters.search !== undefined ? newFilters.search : searchTerm,
            status: newFilters.status !== undefined ? newFilters.status : filterStatus
        }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleStatusChange = (event) => {
        const val = event.target.value;
        setFilterStatus(val);
        triggerFilter({ status: val });
    };

    const handleSearchSubmit = () => {
        triggerFilter({ search: searchTerm });
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        triggerFilter({ search: "" });
    };

    const handleCloseAddModal = () => {
        setAddModalOpen(false);
        setSearchNim("");
        setSearchedStudent(null);
        setSearchError("");
        setSkipMicro(false);
        setSkipSks(false);
        setAlasan("");
    };

    // Toast/Snackbar notification states
    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastSeverity, setToastSeverity] = useState("success");

    const showToast = (message, severity = "success") => {
        setToastMessage(message);
        setToastSeverity(severity);
        setToastOpen(true);
    };

    // Transcript modal states
    const [transkripOpen, setTranskripOpen] = useState(false);
    const [transkripData, setTranskripData] = useState([]);
    const [loadingTranskrip, setLoadingTranskrip] = useState(false);
    const [transkripNim, setTranskripNim] = useState("");
    const [transkripStudent, setTranskripStudent] = useState(null);

    // Handler to check NIM from Sevima
    const handleCheckNim = async () => {
        if (!searchNim.trim()) {
            setSearchError("Masukkan NIM terlebih dahulu.");
            return;
        }
        setSearching(true);
        setSearchError("");
        setSearchedStudent(null);
        try {
            const response = await axios.get(`/admin/users/dispensasi-syarat/check-nim?nim=${searchNim.trim()}`);
            if (response.data.success) {
                setSearchedStudent(response.data.data);
            } else {
                setSearchError(response.data.message || "Mahasiswa tidak ditemukan.");
            }
        } catch (error) {
            console.error(error);
            setSearchError(error.response?.data?.message || "Gagal mengambil data mahasiswa dari Sevima.");
        } finally {
            setSearching(false);
        }
    };

    // Handler to save manual dispensation
    const handleSaveDispensasi = async (e) => {
        e.preventDefault();
        if (!searchedStudent) return;
        if (!alasan.trim()) {
            showToast("Alasan pertimbangan wajib diisi.", "error");
            return;
        }

        setSubmitting(true);
        try {
            router.post("/admin/users/dispensasi-syarat", {
                nim: searchedStudent.nim,
                nama: searchedStudent.nama,
                alasan: alasan,
                skip_microteaching: skipMicro,
                skip_sks: skipSks,
                sks_diambil: searchedStudent.sks_diambil,
                nilai_microteaching: searchedStudent.nilai_microteaching,
                program_studi: searchedStudent.program_studi,
            }, {
                onSuccess: () => {
                    showToast("Dispensasi syarat berhasil ditambahkan.");
                    handleCloseAddModal();
                },
                onError: (errors) => {
                    const firstError = Object.values(errors)[0] || "Gagal menyimpan data.";
                    showToast(firstError, "error");
                },
                onFinish: () => {
                    setSubmitting(false);
                }
            });
        } catch (error) {
            console.error(error);
            showToast("Terjadi kesalahan sistem.", "error");
            setSubmitting(false);
        }
    };

    const handleToggleRequirement = async (nim, type, currentValue) => {
        try {
            const response = await axios.post("/admin/users/dispensasi-syarat/toggle", {
                nim: nim,
                type: type,
                value: !currentValue
            });

            if (response.data.success) {
                showToast(response.data.message);
                if (selectedDispensation && selectedDispensation.nim === nim) {
                    setSelectedDispensation(response.data.data);
                }
                router.reload({ only: ["dispensations"] });
            } else {
                showToast(response.data.message || "Gagal mengubah syarat.", "error");
            }
        } catch (error) {
            console.error(error);
            showToast("Gagal merubah persyaratan.", "error");
        }
    };

    // Handler to delete a dispensation
    const handleDeleteDispensasi = (nim) => {
        if (confirm("Apakah Anda yakin ingin menghapus dispensasi mahasiswa ini?")) {
            router.delete(`/admin/users/dispensasi-syarat/${nim}`, {
                onSuccess: () => {
                    showToast("Dispensasi syarat berhasil dihapus.");
                },
                onError: () => {
                    showToast("Gagal menghapus dispensasi.", "error");
                }
            });
        }
    };

    // Handler to show transcript modal
    const handleViewTranscript = async (nim, nama, prodi) => {
        setTranskripNim(nim);
        setTranskripStudent({ nama, prodi });
        setLoadingTranskrip(true);
        setTranskripOpen(true);
        try {
            const response = await axios.get(`/admin/users/dispensasi-syarat/transkrip?nim=${nim}`);
            setTranskripData(response.data.data || []);
        } catch (error) {
            console.error("Error fetching transkrip:", error);
            showToast("Gagal memuat transkrip nilai.", "error");
            setTranskripOpen(false);
        } finally {
            setLoadingTranskrip(false);
        }
    };

    // Memoized calculations for transcript stats
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

    return (
        <AdminLayout title="Dispensasi Syarat Pendaftaran">
            <div className="space-y-6">
                {/* Page Header */}
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Dispensasi Syarat Pendaftaran</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Kelola pengecualian (bypass) syarat minimal 132 SKS and kelulusan Micro Teaching bagi mahasiswa.
                        </p>
                    </div>
                </div>

                {/* Full-width Table Card */}
                <Card className="rounded-2xl shadow-sm border border-gray-100 bg-white overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center flex-wrap gap-4">
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-bold text-gray-800">Daftar Mahasiswa Dispensasi</h2>
                            <Chip label={`${dispensations.length} Mahasiswa`} color="primary" size="small" variant="outlined" />
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setAddModalOpen(true)}
                            sx={{ textTransform: "none", fontWeight: "bold", borderRadius: "10px" }}
                        >
                            + Tambah Dispensasi
                        </Button>
                    </div>

                    {/* Filters Bar */}
                    <div className="px-6 py-4 bg-[#f8fafc]/50 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Status Select Option */}
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                                <InputLabel id="filter-status-label">Status</InputLabel>
                                <Select
                                    labelId="filter-status-label"
                                    id="filter-status"
                                    value={filterStatus}
                                    label="Status"
                                    onChange={handleStatusChange}
                                    sx={{ borderRadius: "10px", backgroundColor: "#ffffff" }}
                                >
                                    <MenuItem value="all">Semua Status</MenuItem>
                                    <MenuItem value="pending">Tertunda</MenuItem>
                                    <MenuItem value="approved">Disetujui</MenuItem>
                                </Select>
                            </FormControl>
                        </div>

                        {/* Search Input */}
                        <div className="flex gap-2 items-center">
                            <TextField
                                placeholder="Cari Nama / NIM..."
                                variant="outlined"
                                size="small"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <FaSearch className="text-gray-400 text-xs" />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: "10px", backgroundColor: "#ffffff" }
                                }}
                                sx={{ width: 260 }}
                            />
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleSearchSubmit}
                                sx={{ textTransform: "none", borderRadius: "10px", fontWeight: "bold", height: "40px" }}
                            >
                                Cari
                            </Button>
                            {searchTerm && (
                                <Button 
                                    variant="outlined" 
                                    color="secondary" 
                                    onClick={handleClearSearch}
                                    sx={{ textTransform: "none", borderRadius: "10px", height: "40px" }}
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>

                    <TableContainer component={Paper} elevation={0}>
                        <Table>
                            <TableHead className="bg-[#f8fafc]">
                                <TableRow>
                                    <TableCell className="font-bold text-gray-600 text-xs uppercase" align="center">No</TableCell>
                                    <TableCell className="font-bold text-gray-600 text-xs uppercase">Nama / NIM</TableCell>
                                    <TableCell className="font-bold text-gray-600 text-xs uppercase" align="center">SKS Diambil</TableCell>
                                    <TableCell className="font-bold text-gray-600 text-xs uppercase" align="center">Nilai Micro</TableCell>
                                    <TableCell className="font-bold text-gray-600 text-xs uppercase">Alasan Pertimbangan</TableCell>
                                    <TableCell className="font-bold text-gray-600 text-xs uppercase" align="center">Status</TableCell>
                                    <TableCell className="font-bold text-gray-600 text-xs uppercase" align="center">Aksi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {dispensations.length > 0 ? (
                                    dispensations.map((item, index) => (
                                        <TableRow key={item.id} className="hover:bg-[#f8fafc]/50 transition-colors">
                                            <TableCell align="center">{index + 1}</TableCell>
                                            <TableCell>
                                                <div className="font-bold text-gray-800 uppercase">{item.nama || "Mahasiswa"}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">{item.nim}</div>
                                            </TableCell>
                                            <TableCell align="center">
                                                <span className="font-semibold text-gray-700">
                                                    {item.sks_diambil !== null ? `${item.sks_diambil} SKS` : "-"}
                                                </span>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={item.nilai_microteaching || "-"}
                                                    size="small"
                                                    color={
                                                        !item.nilai_microteaching || item.nilai_microteaching === '-' || item.nilai_microteaching === ''
                                                            ? "default"
                                                            : ["A", "A-", "B+", "B", "B-"].includes(item.nilai_microteaching.toUpperCase())
                                                            ? "success"
                                                            : "error"
                                                    }
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs text-gray-600 line-clamp-2 max-w-[300px]" title={item.alasan}>
                                                    {item.alasan}
                                                </span>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip 
                                                    label={item.status === 'approved' ? 'Disetujui' : 'Tertunda'} 
                                                    color={item.status === 'approved' ? 'success' : 'warning'} 
                                                    size="small" 
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <div className="flex justify-center gap-1">
                                                    <IconButton
                                                        size="small"
                                                        color="primary"
                                                        title="Detail Dispensasi"
                                                        onClick={() => {
                                                            setSelectedDispensation(item);
                                                            setDetailModalOpen(true);
                                                        }}
                                                    >
                                                        <FaEye size={14} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        title="Hapus"
                                                        onClick={() => handleDeleteDispensasi(item.nim)}
                                                    >
                                                        <FaTrash size={14} />
                                                    </IconButton>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center" className="py-8 text-gray-400">
                                            Belum ada mahasiswa terdaftar dispensasi syarat.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Card>
            </div>

            {/* Modal Detail & Atur Dispensasi Syarat */}
            <Dialog
                open={detailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" className="font-bold text-gray-800">
                        Detail & Atur Dispensasi
                    </Typography>
                    <IconButton onClick={() => setDetailModalOpen(false)}>
                        <FaTimes />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers className="space-y-4">
                    {currentSelectedDisp && (
                        <div className="space-y-4 mt-2">
                            <div className="grid grid-cols-2 gap-4 bg-[#f8fafc] p-4 rounded-xl border border-gray-100">
                                <div className="space-y-0.5 col-span-2">
                                    <Typography variant="caption" className="text-gray-400 block">Nama Mahasiswa</Typography>
                                    <Typography variant="subtitle2" className="font-bold text-gray-800 uppercase">
                                        {currentSelectedDisp.nama}
                                    </Typography>
                                </div>
                                <div className="space-y-0.5">
                                    <Typography variant="caption" className="text-gray-400 block">NIM</Typography>
                                    <Typography variant="subtitle2" className="font-semibold text-gray-700 font-mono">
                                        {currentSelectedDisp.nim}
                                    </Typography>
                                </div>
                                <div className="space-y-0.5">
                                    <Typography variant="caption" className="text-gray-400 block">Program Studi</Typography>
                                    <Typography variant="subtitle2" className="font-semibold text-gray-700">
                                        {currentSelectedDisp.program_studi || "-"}
                                    </Typography>
                                </div>
                                <div className="space-y-0.5">
                                    <Typography variant="caption" className="text-gray-400 block">SKS Terempuh</Typography>
                                    <Typography variant="subtitle2" className="font-semibold text-gray-700">
                                        {currentSelectedDisp.sks_diambil !== null ? `${currentSelectedDisp.sks_diambil} SKS` : "-"}
                                    </Typography>
                                </div>
                                <div className="space-y-0.5">
                                    <Typography variant="caption" className="text-gray-400 block">Nilai Micro Teaching</Typography>
                                    <Typography variant="subtitle2" className="font-semibold text-gray-700">
                                        {currentSelectedDisp.nilai_microteaching || "-"}
                                    </Typography>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Typography variant="caption" className="text-gray-400 block">Alasan Pengajuan / Pertimbangan</Typography>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap">
                                    {currentSelectedDisp.alasan}
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Typography variant="caption" className="text-gray-400 block">Status Verifikasi</Typography>
                                <div>
                                    <Chip 
                                        label={currentSelectedDisp.status === 'approved' ? 'Disetujui' : 'Tertunda'} 
                                        color={currentSelectedDisp.status === 'approved' ? 'success' : 'warning'} 
                                        size="medium" 
                                    />
                                </div>
                            </div>

                            <Divider />

                            <div className="space-y-3">
                                <Typography variant="subtitle2" className="font-bold text-gray-800">Atur Pengecualian Syarat</Typography>
                                <div className="flex flex-col gap-2 p-3 bg-[#f0f9ff] rounded-xl border border-blue-100">
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={currentSelectedDisp.skip_microteaching}
                                                onChange={() => handleToggleRequirement(currentSelectedDisp.nim, "microteaching", currentSelectedDisp.skip_microteaching)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <div>
                                                <span className="font-semibold text-gray-800 text-sm block">Bypass Kelulusan Micro Teaching</span>
                                                <span className="text-xs text-gray-500 block">Mahasiswa diizinkan mendaftar tanpa lulus mata kuliah Micro Teaching</span>
                                            </div>
                                        }
                                        sx={{ alignItems: "flex-start", m: 0, gap: 1 }}
                                    />
                                    <Divider className="my-1" />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={currentSelectedDisp.skip_sks}
                                                onChange={() => handleToggleRequirement(currentSelectedDisp.nim, "sks", currentSelectedDisp.skip_sks)}
                                                color="primary"
                                            />
                                        }
                                        label={
                                            <div>
                                                <span className="font-semibold text-gray-800 text-sm block">Bypass Batas Minimal 132 SKS</span>
                                                <span className="text-xs text-gray-500 block">Mahasiswa diizinkan mendaftar meskipun belum menempuh 132 SKS</span>
                                            </div>
                                        }
                                        sx={{ alignItems: "flex-start", m: 0, gap: 1 }}
                                    />
                                </div>
                            </div>

                            <Button
                                variant="outlined"
                                color="primary"
                                fullWidth
                                onClick={() => handleViewTranscript(currentSelectedDisp.nim, currentSelectedDisp.nama, currentSelectedDisp.program_studi)}
                                className="flex items-center justify-center gap-2"
                                sx={{ textTransform: "none", py: 1, borderRadius: "10px", fontWeight: "semibold" }}
                            >
                                <FaEye /> Lihat Transkrip Nilai Lengkap
                            </Button>
                        </div>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDetailModalOpen(false)} variant="contained" color="primary" sx={{ borderRadius: "10px", textTransform: "none", px: 4 }}>
                        Tutup
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal Tambah Dispensasi Syarat */}
            <Dialog
                open={addModalOpen}
                onClose={handleCloseAddModal}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 1 }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" className="font-bold text-gray-800">
                        Cek & Tambah Dispensasi Syarat
                    </Typography>
                    <IconButton onClick={handleCloseAddModal}>
                        <FaTimes />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers className="space-y-4">
                    <div className="flex gap-2 mt-2">
                        <TextField
                            label="Masukkan NIM Mahasiswa"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={searchNim}
                            onChange={(e) => setSearchNim(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCheckNim()}
                            disabled={searching}
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCheckNim}
                            disabled={searching}
                            sx={{ minWidth: "48px", p: 1 }}
                        >
                            {searching ? <CircularProgress size={20} color="inherit" /> : <FaSearch />}
                        </Button>
                    </div>

                    {searchError && (
                        <Alert severity="error" className="py-1">
                            {searchError}
                        </Alert>
                    )}

                    {searchedStudent && (
                        <div className="mt-4 p-4 bg-[#f8fafc] rounded-xl border border-gray-100 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1 col-span-2">
                                    <Typography variant="body2" className="text-gray-400">Nama Mahasiswa</Typography>
                                    <Typography variant="subtitle2" className="font-bold text-gray-800 uppercase">
                                        {searchedStudent.nama}
                                    </Typography>
                                </div>
                                <div className="space-y-1 col-span-2">
                                    <Typography variant="body2" className="text-gray-400">NIM / Program Studi</Typography>
                                    <Typography variant="subtitle2" className="font-semibold text-gray-700">
                                        {searchedStudent.nim} - {searchedStudent.program_studi || "-"}
                                    </Typography>
                                </div>
                                <div className="space-y-1">
                                    <Typography variant="body2" className="text-gray-400">SKS Terempuh</Typography>
                                    <Typography variant="subtitle2" className="font-bold text-gray-800">
                                        {searchedStudent.sks_diambil ?? 0} SKS
                                    </Typography>
                                </div>
                                <div className="space-y-1">
                                    <Typography variant="body2" className="text-gray-400">Nilai Micro Teaching</Typography>
                                    <Typography variant="subtitle2" className="font-bold text-gray-800">
                                        {searchedStudent.nilai_microteaching ?? "-"}
                                    </Typography>
                                </div>
                            </div>

                            <Button
                                variant="outlined"
                                size="small"
                                color="primary"
                                onClick={() => handleViewTranscript(searchedStudent.nim, searchedStudent.nama, searchedStudent.program_studi)}
                                className="w-full flex items-center justify-center gap-2"
                                sx={{ textTransform: "none" }}
                            >
                                <FaEye /> Cek Transkrip Nilai
                            </Button>

                            <Divider className="my-2" />

                            <form onSubmit={handleSaveDispensasi} className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={skipMicro}
                                                onChange={(e) => setSkipMicro(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Bypass Micro Teaching"
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={skipSks}
                                                onChange={(e) => setSkipSks(e.target.checked)}
                                                color="primary"
                                            />
                                        }
                                        label="Bypass Minimal 132 SKS"
                                    />
                                </div>

                                <TextField
                                    label="Alasan Pengecualian"
                                    variant="outlined"
                                    multiline
                                    rows={3}
                                    fullWidth
                                    value={alasan}
                                    onChange={(e) => setAlasan(e.target.value)}
                                    placeholder="Tulis alasan mengapa mahasiswa diberikan dispensasi"
                                    required
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    disabled={submitting}
                                    sx={{ textTransform: "none", py: 1, borderRadius: "10px", fontWeight: "bold" }}
                                >
                                    {submitting ? "Menyimpan..." : "Aktifkan Dispensasi"}
                                </Button>
                            </form>
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddModal} variant="outlined" color="primary">
                        Batal
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Transcript Modal Viewer */}
            <Dialog
                open={transkripOpen}
                onClose={() => setTranskripOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 2 }
                }}
            >
                <DialogTitle sx={{ m: 0, p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h6" className="font-bold text-gray-800">
                        Transkrip Nilai Akademik
                    </Typography>
                    <IconButton onClick={() => setTranskripOpen(false)}>
                        <FaTimes />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {loadingTranskrip ? (
                        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}>
                            <CircularProgress color="primary" />
                            <Typography sx={{ mt: 2 }} className="text-gray-500">Memuat Data Transkrip...</Typography>
                        </Box>
                    ) : (
                        <div className="p-2 text-black bg-white" style={{ fontFamily: "serif" }}>
                            {/* Kop Surat */}
                            <div className="flex items-center justify-center border-b-4 border-double border-black pb-4 mb-4">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/a/af/Lambang_UIN_Ar-Raniry.png" className="w-16 h-16 mr-4" alt="Logo UIN" />
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
                                    <span>{transkripStudent?.prodi || "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-36 font-bold">Jenjang Pendidikan</span>
                                    <span className="mr-2">:</span>
                                    <span>Strata 1 (S1)</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold">NIM</span>
                                    <span className="mr-2">:</span>
                                    <span>{transkripNim || "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-36 font-bold">Nama</span>
                                    <span className="mr-2">:</span>
                                    <span className="uppercase">{transkripStudent?.nama || "-"}</span>
                                </div>
                                <div className="flex">
                                    <span className="w-32 font-bold">Tahun Masuk</span>
                                    <span className="mr-2">:</span>
                                    <span>{transkripNim && transkripNim.length >= 2 && !isNaN(transkripNim.substring(0, 2)) ? "20" + transkripNim.substring(0, 2) : "-"}</span>
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setTranskripOpen(false)} variant="contained" color="primary">
                        Tutup
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Notification Toast */}
            <Snackbar
                open={toastOpen}
                autoHideDuration={4000}
                onClose={() => setToastOpen(false)}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
            >
                <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} variant="filled" sx={{ width: "100%" }}>
                    {toastMessage}
                </Alert>
            </Snackbar>
        </AdminLayout>
    );
}
