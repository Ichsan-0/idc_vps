import InputError from "@/Components/InputError";
import OperatorSekolahLayout from "@/Layouts/OperatorSekolahLayout";
import { Head, router } from "@inertiajs/react";
import {
    Alert,
    AlertTitle,
    Autocomplete,
    Box,
    Button,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    styled,
    TextField,
    Typography,
    Paper,
    Grid,
    Breadcrumbs,
    Divider,
} from "@mui/material";
import { NavigateNext, InfoOutlined } from "@mui/icons-material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { RiAttachment2 } from "react-icons/ri";
import { ThreeDot } from "react-loading-indicators";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const AddKepsekPamong = ({ base_url, data_opt, idGelombang, nama_gelombang }) => {
    // State untuk form data
    const [formData, setFormData] = useState({
        name: "",
        nama_di_buku_rekening: "",
        nip: "",
        pangkat_golongan: "",
        jabatan: "",
        nama_bank: "",
        no_rekening: "",
        no_npwp: "",
        dokumen: null,
        mahasiswa: null,
    });

    // State untuk error
    const [errors, setErrors] = useState({});
    const [apiError, setApiError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // State untuk data mahasiswa
    const [dataMahasiswa, setDataMahasiswa] = useState([]);
    const [filterInfo, setFilterInfo] = useState(null);

    // Handler untuk perubahan form
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear error untuk field yang diubah
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    // Validasi NIP
    const validateNIP = (value) => {
        if (!value) return "NIP wajib diisi";
        const regex = /^\d{16,}$|^[-]+$/;
        if (!value.match(regex)) {
            return "Angka numerik dengan panjang minimal 16 digit atau -";
        }
        return null;
    };

    // Validasi No Rekening
    const validateNoRekening = (value) => {
        if (!value) return "No rekening wajib diisi";
        const regex = /^\d{10,14}$/;
        if (!value.match(regex)) {
            return "Berupa angka 14 digit BAS atau 10 digit BSI";
        }
        return null;
    };

    // Validasi No NPWP
    const validateNoNPWP = (value) => {
        if (!value) return "No NPWP wajib diisi";
        const regex = /^\d{15,16}$/;
        if (!value.match(regex)) {
            return "Berupa angka 15 atau 16 digit";
        }
        return null;
    };

    // Validasi dokumen
    const validateDokumen = (file) => {
        if (!file) return "Dokumen wajib diupload";
        if (file.type !== "application/pdf") {
            return "Hanya file PDF yang diperbolehkan";
        }
        if (file.size > 500 * 1024) {
            return "Ukuran file tidak boleh melebihi 500kb";
        }
        return null;
    };

    // Validasi form secara keseluruhan
    const validateForm = () => {
        const newErrors = {};
        
        // Validasi required fields
        if (!formData.name) newErrors.name = "Nama wajib diisi";
        if (!formData.nama_di_buku_rekening) newErrors.nama_di_buku_rekening = "Nama di buku rekening wajib diisi";
        
        // Validasi NIP
        const nipError = validateNIP(formData.nip);
        if (nipError) newErrors.nip = nipError;
        
        if (!formData.pangkat_golongan) newErrors.pangkat_golongan = "Pangkat & golongan wajib diisi";
        if (!formData.jabatan) newErrors.jabatan = "Jabatan wajib dipilih";
        if (!formData.nama_bank) newErrors.nama_bank = "Nama bank wajib diisi";
        
        // Validasi No Rekening
        const rekeningError = validateNoRekening(formData.no_rekening);
        if (rekeningError) newErrors.no_rekening = rekeningError;
        
        // Validasi No NPWP
        const npwpError = validateNoNPWP(formData.no_npwp);
        if (npwpError) newErrors.no_npwp = npwpError;
        
        // Validasi dokumen
        const dokumenError = validateDokumen(formData.dokumen);
        if (dokumenError) newErrors.dokumen = dokumenError;
        
        // Validasi khusus untuk Guru Pamong
        if (formData.jabatan === "Guru Pamong" && !formData.mahasiswa) {
            newErrors.mahasiswa = "Mahasiswa Bimbingan wajib dipilih";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Ambil data mahasiswa dengan filter
    const fetchMahasiswa = async () => {
        setLoading(true);
        try {
            let url = `${base_url}/api/operator-sekolah/data/mahasiswa?id_sekolah=${data_opt.id_sekolah}`;
            
            // Tambahkan filter idGelombang jika ada
            if (idGelombang) {
                url += `&idGelombang=${idGelombang}`;
            }
            
            const response = await axios.get(url);
            
            if (response.data.status === 'success') {
                setDataMahasiswa(response.data.data || []);
                setFilterInfo(response.data.filter_info);
            } else {
                setApiError(response.data.message || 'Gagal mengambil data mahasiswa');
            }
        } catch (error) {
            console.error('Error fetching mahasiswa:', error);
            setApiError(error.response?.data?.message || 'Terjadi kesalahan saat mengambil data');
        } finally {
            setLoading(false);
        }
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }
        
        setLoading(true);
        setApiError(null);
        
        try {
            const formDataToSend = new FormData();
            
            // Tambahkan semua field ke FormData
            Object.keys(formData).forEach(key => {
                if (key === 'mahasiswa' && formData[key]) {
                    // Untuk mahasiswa, kirim username
                    formDataToSend.append('username_mahasiswa', formData[key].username);
                } else if (key === 'dokumen' && formData[key]) {
                    // Untuk dokumen, kirim file
                    formDataToSend.append(key, formData[key]);
                } else if (formData[key] !== null && formData[key] !== undefined) {
                    formDataToSend.append(key, formData[key]);
                }
            });
            
            // Tambahkan data tambahan
            formDataToSend.append('id_sekolah', data_opt.id_sekolah);
            if (idGelombang) {
                formDataToSend.append('id_gelombang', idGelombang);
            }
            
            const response = await axios.post(
                `${base_url}/api/operator-sekolah/data/kepsek_pamong/save`,
                formDataToSend,
                {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        'Accept': 'application/json'
                    },
                }
            );
            
            if (response.data.status === "ok" || response.data.success) {
                // Redirect setelah sukses
                router.visit("/operator-sekolah/data/kepsek-pamong", {
                    onSuccess: () => {
                        // Optional: Tampilkan notifikasi sukses
                    }
                });
            } else {
                setApiError(response.data.message || 'Terjadi kesalahan saat menyimpan data');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            
            if (error.response?.data?.errors) {
                // Jika ada error validasi dari server
                const serverErrors = error.response.data.errors;
                const formattedErrors = {};
                
                Object.keys(serverErrors).forEach(key => {
                    formattedErrors[key] = serverErrors[key][0];
                });
                
                setErrors(formattedErrors);
            } else {
                setApiError(
                    error.response?.data?.message || 
                    error.message || 
                    'Terjadi kesalahan saat menyimpan data'
                );
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle file upload
    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const error = validateDokumen(file);
            if (error) {
                setErrors(prev => ({ ...prev, dokumen: error }));
            } else {
                handleChange('dokumen', file);
            }
        }
    };

    // Effect untuk fetch data mahasiswa
    useEffect(() => {
        fetchMahasiswa();
    }, [idGelombang]);

    // Render loading overlay
    const renderLoadingOverlay = () => (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                zIndex: 9999,
            }}
        >
            <ThreeDot color="#4F61E3" size="medium" />
        </Box>
    );

    return (
        <OperatorSekolahLayout>
            <Head title="Tambah Kepsek / Pamong" />
            
            {loading && renderLoadingOverlay()}
            
            <Box sx={{ p: 3 }}>
                {/* Breadcrumb */}
                <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
                    <Typography 
                        onClick={() => router.visit("/operator-sekolah/data/kepsek-pamong")}
                        sx={{ 
                            cursor: 'pointer', 
                            color: 'text.secondary',
                            '&:hover': { 
                                color: 'primary.main',
                                textDecoration: 'underline' 
                            } 
                        }}
                    >
                        Kepsek & Pamong
                    </Typography>
                    <Typography color="text.primary" fontWeight="medium">
                        Tambah Baru
                    </Typography>
                </Breadcrumbs>

                {/* Header dengan filter info */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Tambah Data Kepsek / Pamong
                    </Typography>
                    
                    {nama_gelombang && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                            <Chip 
                                label={`Gelombang: ${nama_gelombang}`}
                                color="primary"
                                variant="outlined"
                                size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                                {dataMahasiswa.length} mahasiswa tersedia untuk dibimbing
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Error Alert */}
                {apiError && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        <AlertTitle>Error</AlertTitle>
                        {apiError}
                    </Alert>
                )}

                {/* Info Alert */}
                <Alert 
                    severity="info" 
                    icon={<InfoOutlined />}
                    sx={{ mb: 3 }}
                >
                    <AlertTitle>Petunjuk Pengisian</AlertTitle>
                    <Box component="ol" sx={{ pl: 2, m: 0 }}>
                        <li>Setelah memasukkan nama, pilih jabatan yang sesuai</li>
                        <li>Jika tidak ada NIP atau pangkat & golongan, isi dengan tanda (-)</li>
                        <li>No rekening: 14 digit (BAS) atau 10 digit (BSI)</li>
                        <li>Dokumen: Scan buku rekening dan NPWP dalam format PDF (maks. 500kb)</li>
                        {idGelombang && (
                            <li>
                                <strong>Data mahasiswa telah difilter berdasarkan gelombang {idGelombang}</strong>
                            </li>
                        )}
                    </Box>
                </Alert>

                {/* Form */}
                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Grid container spacing={3}>
                        {/* Nama */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nama"
                                value={formData.name}
                                onChange={(e) => handleChange('name', e.target.value)}
                                error={!!errors.name}
                                helperText={errors.name}
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
                            />
                        </Grid>

                        {/* Nama di Buku Rekening */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Nama di Buku Rekening"
                                value={formData.nama_di_buku_rekening}
                                onChange={(e) => handleChange('nama_di_buku_rekening', e.target.value)}
                                error={!!errors.nama_di_buku_rekening}
                                helperText={errors.nama_di_buku_rekening}
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
                            />
                        </Grid>

                        {/* NIP */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="NIP"
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
                                value={formData.nip}
                                onChange={(e) => handleChange('nip', e.target.value)}
                                error={!!errors.nip}
                                helperText={errors.nip || "Minimal 16 digit atau '-' jika tidak ada"}
                            />
                        </Grid>

                        {/* Pangkat dan Golongan */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.pangkat_golongan}>
                                <InputLabel>Pangkat dan Golongan</InputLabel>
                                <Select
                                    value={formData.pangkat_golongan}
                                    label="Pangkat dan Golongan"
                                    onChange={(e) => handleChange('pangkat_golongan', e.target.value)}
                                >
                                    <MenuItem value="Pembina/(IVA)">Pembina/(IVA)</MenuItem>
                                    <MenuItem value="Pembina Tingkat 1/(IVB)">Pembina Tingkat 1/(IVB)</MenuItem>
                                    <MenuItem value="Pembina Utama Muda/(IVC)">Pembina Utama Muda/(IVC)</MenuItem>
                                    <MenuItem value="Pembina Utama Madya/(IVD)">Pembina Utama Madya/(IVD)</MenuItem>
                                    <MenuItem value="Pembina Utama/(IVE)">Pembina Utama/(IVE)</MenuItem>
                                    <MenuItem value="Penata Muda/(IIIA)">Penata Muda/(IIIA)</MenuItem>
                                    <MenuItem value="Penata Muda Tingkat 1/(IIIB)">Penata Muda Tingkat 1/(IIIB)</MenuItem>
                                    <MenuItem value="Penata/(IIIC)">Penata/(IIIC)</MenuItem>
                                    <MenuItem value="Penata Tingkat 1/(IIID)">Penata Tingkat 1/(IIID)</MenuItem>
                                    <MenuItem value="-">Lainnya</MenuItem>
                                </Select>
                                {errors.pangkat_golongan && (
                                    <InputError message={errors.pangkat_golongan} />
                                )}
                            </FormControl>
                        </Grid>

                        {/* Jabatan */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.jabatan}>
                                <InputLabel>Jabatan</InputLabel>
                                <Select
                                    value={formData.jabatan}
                                    label="Jabatan"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleChange('jabatan', value);
                                        // Reset mahasiswa jika bukan Guru Pamong
                                        if (value !== "Guru Pamong") {
                                            handleChange('mahasiswa', null);
                                        }
                                    }}
                                >
                                    <MenuItem value="Kepala Sekolah">Kepala Sekolah</MenuItem>
                                    <MenuItem value="Guru Pamong">Guru Pamong</MenuItem>
                                </Select>
                                {errors.jabatan && (
                                    <InputError message={errors.jabatan} />
                                )}
                            </FormControl>
                        </Grid>

                        {/* Nama Bank */}
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth error={!!errors.nama_bank}>
                                <InputLabel>Nama Bank</InputLabel>
                                <Select
                                    value={formData.nama_bank}
                                    label="Nama Bank"
                                    onChange={(e) => handleChange('nama_bank', e.target.value)}
                                >
                                    <MenuItem value="Bank Aceh Syari'ah">Bank Aceh Syari'ah</MenuItem>
                                    <MenuItem value="Bank Syari'ah Indonesia">Bank Syari'ah Indonesia</MenuItem>
                                </Select>
                                {errors.nama_bank && (
                                    <InputError message={errors.nama_bank} />
                                )}
                            </FormControl>
                        </Grid>

                        {/* No Rekening */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="No Rekening"
                                value={formData.no_rekening}
                                onChange={(e) => handleChange('no_rekening', e.target.value)}
                                error={!!errors.no_rekening}
                                helperText={errors.no_rekening || "14 digit (BAS) atau 10 digit (BSI)"}
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
                            />
                        </Grid>

                        {/* No NPWP */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="No NPWP"
                                value={formData.no_npwp}
                                onChange={(e) => handleChange('no_npwp', e.target.value)}
                                error={!!errors.no_npwp}
                                helperText={errors.no_npwp || "15 atau 16 digit"}
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
                            />
                        </Grid>

                        {/* Mahasiswa Bimbingan (hanya untuk Guru Pamong) */}
                        {formData.jabatan === "Guru Pamong" && (
                            <Grid item xs={12}>
                                <Autocomplete
                                    value={formData.mahasiswa}
                                    onChange={(_, value) => handleChange('mahasiswa', value)}
                                    options={dataMahasiswa}
                                    getOptionLabel={(option) => option.name || ''}
                                    isOptionEqualToValue={(option, value) => 
                                        option.username === value?.username
                                    }
                                    loading={loading}
                                    loadingText="Memuat data mahasiswa..."
                                    noOptionsText={
                                        idGelombang 
                                            ? `Tidak ada mahasiswa pada gelombang ${idGelombang}`
                                            : "Tidak ada data mahasiswa"
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Mahasiswa Bimbingan"
                                            error={!!errors.mahasiswa}
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
                                            helperText={errors.mahasiswa || "Pilih mahasiswa yang akan dibimbing"}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <Box component="li" {...props}>
                                            <Box>
                                                <Typography variant="body1">
                                                    {option.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    NIM: {option.username}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    )}
                                />
                            </Grid>
                        )}

                        {/* Dokumen Upload */}
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {formData.dokumen && (
                                    <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 1,
                                        p: 1.5,
                                        bgcolor: 'action.hover',
                                        borderRadius: 1
                                    }}>
                                        <RiAttachment2 />
                                        <Typography variant="body2">
                                            {formData.dokumen.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                                            {(formData.dokumen.size / 1024).toFixed(2)} KB
                                        </Typography>
                                    </Box>
                                )}
                                
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={<IoCloudUploadOutline />}
                                    sx={{ width: 'fit-content' }}
                                >
                                    Upload Dokumen
                                    <VisuallyHiddenInput
                                        type="file"
                                        accept="application/pdf"
                                        onChange={handleFileUpload}
                                    />
                                </Button>
                                
                                {errors.dokumen && (
                                    <InputError message={errors.dokumen} />
                                )}
                                
                                <Typography variant="caption" color="text.secondary">
                                    * Format PDF, maksimal 500KB
                                </Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={() => router.visit("/operator-sekolah/data/kepsek-pamong")}
                            disabled={loading}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={loading}
                            sx={{ minWidth: 120 }}
                        >
                            {loading ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </Box>
                </Paper>
            </Box>
        </OperatorSekolahLayout>
    );
};

export default AddKepsekPamong;