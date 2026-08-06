import DynamicModal from "@/Components/DynamicModal";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import { useModal } from "@/Hooks/useModal";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import { Autocomplete, MenuItem, Select, TextField, Modal, Box, CircularProgress, IconButton, Typography, Divider } from "@mui/material";
import { useState } from "react";
import Button from "@/Components/Button";
import MasterSekolahViewSkeleton from "@/Components/AdminNew/MasterSekolahViewSkeleton";
import axios from "axios";
import { config } from "@/config/config";
import { useEffect, useMemo } from "react";
import { provinsi, desa, kabupaten, kecamatan } from "daftar-wilayah-indonesia";
import { FaTimes, FaEye } from "react-icons/fa";
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
    
    // Transkrip states & logic
    const [transkripOpen, setTranskripOpen] = useState(false);
    const [transkripData, setTranskripData] = useState([]);
    const [loadingTranskrip, setLoadingTranskrip] = useState(false);

    const handleFetchTranskrip = async () => {
        if (!formData?.nim) return;
        setLoadingTranskrip(true);
        setTranskripOpen(true);
        try {
            const response = await axios.get(
                `${config.base_url}/api/admin/users/student/transkrip?nim=${formData.nim}`
            );
            setTranskripData(response.data.data || []);
        } catch (error) {
            console.error("Error fetching transkrip:", error);
            alert(error.response?.data?.error || "Gagal memuat transkrip nilai.");
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
    
    const [dataKabupatenAsal, setDataKabupatenAsal] = useState([]);
    const [dataKecamatanAsal, setDataKecamatanAsal] = useState([]);
    const [dataDesaAsal, setDataDesaAsal] = useState([]);
    
    const [dataKabupatenSekarang, setDataKabupatenSekarang] = useState([]);
    const [dataKecamatanSekarang, setDataKecamatanSekarang] = useState([]);
    const [dataDesaSekarang, setDataDesaSekarang] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [resetLoading, setResetLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [validationError, setValidationError] = useState({});
    const { openModal, closeModal, isOpen } = useModal();

    const handleResetPassword = async () => {
        const confirmReset = window.confirm("yakin mereset password");
        if (!confirmReset) return;

        try {
            setResetLoading(true);
            await axios.post(
                `${config.base_url}/api/admin/users/student/reset-password/${id}`
            );
            alert("Password berhasil di-reset menjadi 12345678");
        } catch (error) {
            console.error("Failed to reset password:", error);
            alert("Gagal mereset password");
        } finally {
            setResetLoading(false);
        }
    };

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
                                                     {getNamaWilayah(formData?.provinsi_asal, provinsi())}
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
                                                    {getNamaWilayah(formData?.provinsi_sekarang, provinsi())}
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

                            <div className="flex flex-col gap-3 w-full sm:flex-row lg:w-auto">
                                <button
                                    onClick={handleFetchTranskrip}
                                    className="flex w-full items-center justify-center gap-2 rounded-full border border-blue-300 bg-white px-4 py-3 text-sm font-medium text-blue-600 shadow-theme-xs hover:bg-blue-50 hover:text-blue-700 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-blue-950/20 lg:inline-flex lg:w-auto"
                                    disabled={loadingTranskrip}
                                >
                                    <svg
                                        className="fill-none stroke-current"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                        <path
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    {loadingTranskrip ? "Memuat..." : "Lihat Transkrip Nilai"}
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    className="flex w-full items-center justify-center gap-2 rounded-full border border-red-300 bg-white px-4 py-3 text-sm font-medium text-red-600 shadow-theme-xs hover:bg-red-50 hover:text-red-700 dark:border-red-700 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-950/20 lg:inline-flex lg:w-auto"
                                    disabled={resetLoading}
                                >
                                    {resetLoading ? (
                                        <LoaderOnButton />
                                    ) : (
                                        <>
                                            <svg
                                                className="fill-current"
                                                width="18"
                                                height="18"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                                <path
                                                    d="M19.4 15A1.65 1.65 0 0 0 22 16.4V17.6A1.65 1.65 0 0 0 19.4 19H17A1.65 1.65 0 0 0 14.4 20.4L13.8 21.6A1.65 1.65 0 0 0 10.6 21.6L10 20.4A1.65 1.65 0 0 0 7.4 19H5A1.65 1.65 0 0 0 2.4 17.6V16.4A1.65 1.65 0 0 0 5 15C5.7 15 6.4 14.5 6.6 13.8L7.2 12.6C7.5 11.9 7.5 11.1 7.2 10.4L6.6 9.2A1.65 1.65 0 0 0 5 8V6.8A1.65 1.65 0 0 0 2.4 5.4H4.8A1.65 1.65 0 0 0 7.4 4H9.8A1.65 1.65 0 0 0 12.4 2.6L13 1.4A1.65 1.65 0 0 0 16.2 1.4L16.8 2.6A1.65 1.65 0 0 0 19.4 4H21.8A1.65 1.65 0 0 0 24.4 5.4V6.8A1.65 1.65 0 0 0 21.8 8.2L21.2 9.4C20.9 10.1 20.9 10.9 21.2 11.6L21.8 12.8A1.65 1.65 0 0 0 24.4 14.2V15"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            Reset Password
                                        </>
                                    )}
                                </button>
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
                                        <span>{formData?.nama_prodi || "-"}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-36 font-bold">Jenjang Pendidikan</span>
                                        <span className="mr-2">:</span>
                                        <span>Strata 1 (S1)</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 font-bold">NIM</span>
                                        <span className="mr-2">:</span>
                                        <span>{formData?.nim || "-"}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-36 font-bold">Nama</span>
                                        <span className="mr-2">:</span>
                                        <span className="uppercase">{formData?.name || "-"}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 font-bold">Tempat Lahir</span>
                                        <span className="mr-2">:</span>
                                        <span className="uppercase">{formData?.tempat_lahir || "-"}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-36 font-bold">Tahun Masuk</span>
                                        <span className="mr-2">:</span>
                                        <span>{formData?.nim && formData?.nim.length >= 2 && !isNaN(formData?.nim.substring(0, 2)) ? "20" + formData?.nim.substring(0, 2) : "-"}</span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 font-bold">Tanggal Lahir</span>
                                        <span className="mr-2">:</span>
                                        <span>
                                            {formData?.tanggal_lahir
                                                ? new Date(formData?.tanggal_lahir).toLocaleDateString("id-ID", {
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
            </div>
        </AdminLayout>
    );
}