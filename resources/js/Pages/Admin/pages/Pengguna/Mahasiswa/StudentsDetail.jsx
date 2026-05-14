import DynamicModal from "@/Components/DynamicModal";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import { useModal } from "@/Hooks/useModal";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import { Autocomplete, MenuItem, Select, TextField } from "@mui/material";
import { useState } from "react";
import Button from "@/Components/Button";
import MasterSekolahViewSkeleton from "@/Components/AdminNew/MasterSekolahViewSkeleton";
import axios from "axios";
import { config } from "@/config/config";
import { useEffect } from "react";
import { desa, kabupaten, kecamatan } from "daftar-wilayah-indonesia";
import LoaderOnButton from "@/Components/LoaderOnButtn";
import { getMappingStatus } from "@/Utils/utils";

export default function DetailStudent({ id, base_url }) {
    const [formData, setFormData] = useState({
        name: "",
        nim: "",
        email: "",
        nama_prodi: "",
        gender: "",
        cluster_kegiatan: "",
        nilai_micro_teaching: "",
        nama_gelombang: "",
        status: "",
        no_hp_wa: "",
        provinsi_asal: "",
        kabupaten_asal: "",
        kecamatan_asal: "",
        desa_asal: "",
        provinsi_sekarang: "",
        kabupaten_sekarang: "",
        kecamatan_sekarang: "",
        desa_sekarang: "",
        ipk: 0,
        link_transkrip_nilai: "",
        link_surat_pernyataan: "",
        link_surat_kesiapan: "",
        semester: "",
        keterangan: ""
    });
    
    const [originalFormData, setOriginalFormData] = useState({});
    const [statusOptions] = useState([
        { value: "submitted", label: "Pending" },
        { value: "accepted", label: "Diterima" },
        { value: "rejected", label: "Ditolak" },
        { value: "revisi", label: "Revisi" }
    ]);
    
    const [dataKabupatenAsal, setDataKabupatenAsal] = useState([]);
    const [dataKecamatanAsal, setDataKecamatanAsal] = useState([]);
    const [dataDesaAsal, setDataDesaAsal] = useState([]);
    
    const [dataKabupatenSekarang, setDataKabupatenSekarang] = useState([]);
    const [dataKecamatanSekarang, setDataKecamatanSekarang] = useState([]);
    const [dataDesaSekarang, setDataDesaSekarang] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [validationError, setValidationError] = useState({});
    const { openModal, closeModal, isOpen } = useModal();

    const getData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.base_url}/api/admin/users/student/detail?x=${id}`
            );

            const data = response.data.data;
            setFormData(data);
            setOriginalFormData(data);
            
            // Load wilayah data
            await loadWilayahData(data);
            
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadWilayahData = async (data) => {
        // Load data wilayah asal
        if (data.provinsi_asal) {
            const kabAsal = kabupaten(data.provinsi_asal);
            setDataKabupatenAsal(kabAsal);
            
            if (data.kabupaten_asal) {
                const kecAsal = kecamatan(data.kabupaten_asal);
                setDataKecamatanAsal(kecAsal);
                
                if (data.kecamatan_asal) {
                    const desaAsal = desa(data.kecamatan_asal);
                    setDataDesaAsal(desaAsal);
                }
            }
        }
        
        // Load data wilayah sekarang
        if (data.provinsi_sekarang) {
            const kabSekarang = kabupaten(data.provinsi_sekarang);
            setDataKabupatenSekarang(kabSekarang);
            
            if (data.kabupaten_sekarang) {
                const kecSekarang = kecamatan(data.kabupaten_sekarang);
                setDataKecamatanSekarang(kecSekarang);
                
                if (data.kecamatan_sekarang) {
                    const desaSekarang = desa(data.kecamatan_sekarang);
                    setDataDesaSekarang(desaSekarang);
                }
            }
        }
    };

    const getNamaWilayah = (kode, dataWilayah) => {
        const wilayah = dataWilayah?.find(item => item.kode === kode);
        return wilayah?.nama || "-";
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                status: formData.status,
                keterangan: formData.keterangan
            };

            await axios.post(
                `${config.base_url}/api/admin/users/student/status/${id}`,
                payload,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            getData();
            closeModal();
            setIsEditing(false);
            setValidationError({});
        } catch (error) {
            if (error.response?.status === 422) {
                setValidationError(error.response.data.errors);
            }
            console.error("Failed to save:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData(originalFormData);
        setIsEditing(false);
        setValidationError({});
    };

    const handleEditClick = () => {
        setIsEditing(true);
        openModal();
    };

    useEffect(() => {
        getData();
    }, [id]);

    return (
        <AdminLayout>
            <div className="flex flex-col gap-3">
                <PageBreadcrumb
                    home={"/admin/users/student"}
                    pageTitle="Detail Mahasiswa"
                />
                <div className="p-5 border border-gray-200 bg-white rounded-2xl dark:border-gray-800 lg:p-6">
                    {loading ? (
                        <MasterSekolahViewSkeleton />
                    ) : (
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-6">
                                    Informasi Mahasiswa
                                </h4>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
                                    {/* Data Pribadi */}
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Nama Lengkap
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.name || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            NIM
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.nim || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Email
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.email || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Program Studi
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.nama_prodi || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Jenis Kelamin
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.gender === "Wanita" ? "Perempuan" : 
                                             formData?.gender === "Pria" ? "Laki-laki" : 
                                             formData?.gender || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Nomor HP/WA
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.no_hp_wa || "-"}
                                        </p>
                                    </div>

                                    {/* Data Akademik */}
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            IPK
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.ipk ? formData.ipk.toFixed(2) : "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Semester
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.semester || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Nilai Micro Teaching
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.nilai_micro_teaching || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Cluster Kegiatan
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.cluster_kegiatan || "-"}
                                        </p>
                                    </div>

                                    {/* Data KPM */}
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Gelombang
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.nama_gelombang || "-"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Status
                                        </p>
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            formData?.status === "accepted" ? "bg-green-100 text-green-800" :
                                            formData?.status === "rejected" ? "bg-red-100 text-red-800" :
                                            formData?.status === "revisi" ? "bg-yellow-100 text-yellow-800" :
                                            "bg-blue-100 text-blue-800"
                                        }`}>
                                            
                                             {getMappingStatus(formData?.status)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                                            Keterangan
                                        </p>
                                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                            {formData?.keterangan || "-"}
                                        </p>
                                    </div>

                                    {/* Alamat Asal */}
                                    <div className="lg:col-span-2">
                                        <h5 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Alamat Asal
                                        </h5>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Provinsi
                                                </p>
                                                <p className="text-sm text-gray-800 dark:text-white/90">
                                                    {getNamaWilayah(formData?.provinsi_asal, kabupaten("11"))}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Kabupaten/Kota
                                                </p>
                                                <p className="text-sm text-gray-800 dark:text-white/90">
                                                    {getNamaWilayah(formData?.kabupaten_asal, dataKabupatenAsal)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Kecamatan
                                                </p>
                                                <p className="text-sm text-gray-800 dark:text-white/90">
                                                    {getNamaWilayah(formData?.kecamatan_asal, dataKecamatanAsal)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Desa/Kelurahan
                                                </p>
                                                <p className="text-sm text-gray-800 dark:text-white/90">
                                                    {getNamaWilayah(formData?.desa_asal, dataDesaAsal)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Alamat Sekarang */}
                                    <div className="lg:col-span-2">
                                        <h5 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Alamat Sekarang
                                        </h5>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Provinsi
                                                </p>
                                                <p className="text-sm text-gray-800 dark:text-white/90">
                                                    {getNamaWilayah(formData?.provinsi_sekarang, kabupaten("11"))}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Kabupaten/Kota
                                                </p>
                                                <p className="text-sm text-gray-800 dark:text-white/90">
                                                    {getNamaWilayah(formData?.kabupaten_sekarang, dataKabupatenSekarang)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Kecamatan
                                                </p>
                                                <p className="text-sm text-gray-800 dark:text-white/90">
                                                    {getNamaWilayah(formData?.kecamatan_sekarang, dataKecamatanSekarang)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Desa/Kelurahan
                                                </p>
                                                <p className="text-sm text-gray-800 dark:text-white/90">
                                                    {getNamaWilayah(formData?.desa_sekarang, dataDesaSekarang)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Links */}
                                    <div className="lg:col-span-2">
                                        <h5 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            Dokumen Pendukung
                                        </h5>
                                        <div className="space-y-2">
                                            {formData?.link_transkrip_nilai && (
                                                <div>
                                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Transkrip Nilai
                                                    </p>
                                                    <a 
                                                        href={base_url + '/storage/' + formData.link_transkrip_nilai} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                    >
                                                        Lihat Transkrip
                                                    </a>
                                                </div>
                                            )}
                                            {formData?.link_surat_pernyataan && (
                                                <div>
                                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Surat Pernyataan
                                                    </p>
                                                    <a 
                                                        href={base_url + '/storage/' + formData.link_surat_pernyataan} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                    >
                                                        Lihat Surat Pernyataan
                                                    </a>
                                                </div>
                                            )}
                                            {formData?.link_surat_kesiapan && (
                                                <div>
                                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Surat Kesiapan
                                                    </p>
                                                    <a 
                                                        href={base_url + '/storage/' +  formData.link_surat_kesiapan} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                                                    >
                                                        Lihat Surat Kesiapan
                                                    </a>
                                                </div>
                                            )}
                                            {!formData?.link_transkrip_nilai && 
                                             !formData?.link_surat_pernyataan && 
                                             !formData?.link_surat_kesiapan && (
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Tidak ada dokumen yang diunggah
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleEditClick}
                                className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
                            >
                                <svg
                                    className="fill-current"
                                    width="18"
                                    height="18"
                                    viewBox="0 0 18 18"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                                        fill=""
                                    />
                                </svg>
                                Edit Status
                            </button>
                        </div>
                    )}
                </div>
                <DynamicModal
                    className="max-w-[700px] m-4"
                    isOpen={isOpen}
                    onClose={() => {
                        handleCancel();
                        closeModal();
                    }}
                >
                    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                        <div className="px-2 pr-14">
                            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                                Edit Status Mahasiswa
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Edit status dan keterangan untuk mahasiswa
                            </p>
                        </div>
                        <form className="flex flex-col" onSubmit={handleSave}>
                            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                                <div className="mt-7">
                                    <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                        Informasi Status
                                    </h5>

                                    <div className="grid grid-cols-1 gap-x-6 gap-y-5">
                                        {/* Informasi Mahasiswa (readonly) */}
                                        <div className="p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                                            <h6 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                                Data Mahasiswa
                                            </h6>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Nama
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                        {formData?.name}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                        NIM
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                        {formData?.nim}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Program Studi
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                        {formData?.nama_prodi}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                                                        Gelombang
                                                    </p>
                                                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                                                        {formData?.nama_gelombang}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Edit Status */}
                                        <div className="space-y-5">
                                            <div className="flex flex-col w-full">
                                                <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Status KPM
                                                </label>
                                                <Select
                                                    value={formData.status || ""}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        status: e.target.value
                                                    })}
                                                    displayEmpty
                                                    sx={{
                                                        width: "100%",
                                                        "& .MuiOutlinedInput-root.Mui-focused": {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                    }}
                                                >
                                                    <MenuItem value="" disabled>
                                                        Pilih Status
                                                    </MenuItem>
                                                    {statusOptions.map((option) => (
                                                        <MenuItem key={option.value} value={option.value}>
                                                            {option.label}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                                {validationError.status && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {validationError.status[0]}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex flex-col w-full">
                                                <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                    Keterangan
                                                </label>
                                                <TextField
                                                    id="keterangan"
                                                    name="keterangan"
                                                    value={formData.keterangan || ""}
                                                    label="Keterangan"
                                                    placeholder="Masukkan keterangan status mahasiswa"
                                                    onChange={(e) => {
                                                        setFormData({
                                                            ...formData,
                                                            keterangan: e.target.value
                                                        });
                                                    }}
                                                    multiline
                                                    rows={4}
                                                    sx={{
                                                        "& .MuiOutlinedInput-root.Mui-focused": {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                        "& .MuiInputBase-input:focus": {
                                                            outline: "none",
                                                            boxShadow: "none",
                                                        },
                                                    }}
                                                />
                                                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                    Berikan keterangan atau alasan perubahan status
                                                </p>
                                                {validationError.keterangan && (
                                                    <p className="mt-1 text-sm text-red-600">
                                                        {validationError.keterangan[0]}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        handleCancel();
                                        closeModal();
                                    }}
                                >
                                    Batal
                                </Button>
                                <Button
                                    disabled={loading}
                                    className="relative"
                                    size="sm"
                                    type="submit"
                                >
                                    {loading ? (
                                        <LoaderOnButton />
                                    ) : (
                                        "Simpan Perubahan"
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DynamicModal>
            </div>
        </AdminLayout>
    );
}