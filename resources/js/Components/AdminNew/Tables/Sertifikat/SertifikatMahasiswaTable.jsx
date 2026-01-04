import Button from "@/Components/Button";
import DynamicModal from "@/Components/DynamicModal";
import DynamicModalConf from "@/Components/DynamicModalConf";
import LoaderOnButton from "@/Components/LoaderOnButtn";
import Search from "@/Components/Search";
import SelectCustom from "@/Components/Select";
import { useConfirmationModal, useModal } from "@/Hooks/useModal";
import {
    PlusIcon,
    TrashIcon,
    PencilIcon,
    EyeIcon,
    PrinterIcon,
} from "@heroicons/react/24/outline";
import { Link } from "@inertiajs/react";
import {
    Autocomplete,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Switch,
    Chip,
    Alert,
} from "@mui/material";
import axios from "axios";
import dayjs from "dayjs";
import React, { useEffect, useState, useRef } from "react";
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import { FaRegTrashCan } from "react-icons/fa6";
import { TfiPencil } from "react-icons/tfi";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { config } from "@/config/config";

const SertifikatMahasiswaTable = () => {
    const [loading, setLoading] = useState(false);
    const { openModal, closeModal, isOpen } = useModal();
    const { openModalConf, closeModalConf, isOpenConf } =
        useConfirmationModal();

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [validationError, setValidationError] = useState(null);
    const [searchKey, setSearchKey] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [selectedData, setSelectedData] = useState(null);

    const [gelombangData, setGelombangData] = useState([]);
    const [selectedGelombangData, setSelectedGelombangData] = useState(null);
    const [bulanTahunOptions, setBulanTahunOptions] = useState([]);

    const [data, setData] = useState([]);
    const [sortKey, setSortKey] = useState("created_at");
    const [sortDir, setSortDir] = useState("desc");
    const [selectedSertifikat, setSelectedSertifikat] = useState(null);
    const [baseNumber, setBaseNumber] = useState(null);


    const [formData, setFormData] = useState({
        kode: "B-",
        kode_universitas: "/Un.08",
        kode_idc: "/IDC",
        kode_jenis_surat: "/Kp.07.6",
        bulan_tahun: dayjs().format("MM/YYYY"),
        open_print_certificate: false,
        base_number: 0,
        tanggal_surat: dayjs().format("YYYY-MM-DD"),
        id_gelombang: "",
        template_sertifikat: "",
    });

    const [dialogMode, setDialogMode] = useState("add");
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const debounceRef = useRef(null);

    const sortIcon = (key) =>
        key === sortKey ? (
            sortDir === "asc" ? (
                <PiSortAscending className="ml-1 h-4 w-4 inline" />
            ) : (
                <PiSortDescending className="ml-1 h-4 w-4 inline" />
            )
        ) : null;

    const handleEntriesChange = (v) => {
        setEntriesPerPage(parseInt(v));
        setCurrentPage(1);
    };

    useEffect(() => {
        const totalCount = data?.total ?? 0;
        const totalPageCount = data?.last_page ?? 0;

        setTotalEntries(totalCount);
        setTotalPages(totalPageCount);
    }, [data]);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);

            const payload = { ...formData };

            let response;
            if (dialogMode === "add") {
                response = await axios.post(
                    `${config.base_url}/api/admin/student-certificate/setting`,
                    payload
                );
            } else {
                response = await axios.post(
                    `${config.base_url}/api/admin/student-certificate/setting/update/${selectedSertifikat.id}`,
                    payload
                );
            }

            if (response.data.status === "success") {
                setSnackbar({
                    open: true,
                    message:
                        dialogMode === "add"
                            ? "Sertifikat berhasil ditambahkan"
                            : "Sertifikat berhasil diperbarui",
                    severity: "success",
                });
                closeModal();
                fetchSertifikatData();
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setValidationError(error.response.data.errors);
            }
            setSnackbar({
                open: true,
                message: error.response?.data?.message || "Terjadi kesalahan",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const getGelombangData = async () => {
        try {
            const res = await axios.get(`${config.base_url}/api/gelombang`);
            setGelombangData(res.data.data || []);
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Gagal mengambil data gelombang",
                severity: "error",
            });
        }
    };


   

    const sortBy = (key) => {
        if (sortKey === key) {
            if (sortDir === "asc") {
                setSortDir("desc");
            } else if (sortDir === "desc") {
                setSortKey(null);
                setSortDir(null);
            } else {
                setSortDir("asc");
            }
        } else {
            setSortKey(key);
            setSortDir("asc");
        }

        setCurrentPage(1);
    };

    const handleDelete = (id) => {
        openModalConf();
        setSelectedData(id);
    };

    const deleteData = async () => {
        try {
            setLoading(true);
            await axios.delete(
                `${config.base_url}/api/admin/student-certificate/setting/${selectedData}`
            );

            setSnackbar({
                open: true,
                message: "Sertifikat berhasil dihapus",
                severity: "success",
            });

            closeModalConf();
            fetchSertifikatData();
        } catch (error) {
            setSnackbar({
                open: true,
                message:
                    error.response?.data?.message ||
                    "Gagal menghapus sertifikat",
                severity: "error",
            });
        } finally {
            setLoading(false);
            setSelectedData(null);
        }
    };

    const fetchSertifikatData = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: currentPage,
                per_page: entriesPerPage,
                sort_by: sortKey,
                sort_dir: sortDir,
                ...(searchKey && { search: searchKey }),
            });

            const response = await axios.get(
                `${config.base_url}/api/admin/student-certificate/setting?${params}`
            );

            if (response.data.status === "success") {
                setData(response.data);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setSnackbar({
                open: true,
                message: "Gagal mengambil data sertifikat",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await axios.post(`${config.base_url}/api/admin/student-certificate/togleactive/${id}`);
            fetchSertifikatData();
            setSnackbar({
                open: true,
                message: "Status cetak berhasil diubah",
                severity: "success",
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: "Gagal mengubah status cetak",
                severity: "error",
            });
        }
    };

    const handleAddClick = () => {
        setDialogMode("add");
        setFormData({
            kode: "B-",
            kode_universitas: "/Un.08",
            kode_idc: "/IDC",
            kode_jenis_surat: "/Kp.07.6",
            bulan_tahun: "",
            open_print_certificate: false,
            base_number: 0,
            tanggal_surat: "",
            id_gelombang: "",
            template_sertifikat: "",
        });
        openModal();
    };

    const handleEditClick = (sertifikat) => {
        setDialogMode("edit");
        setSelectedSertifikat(sertifikat);
        setFormData({
            kode: sertifikat.kode || "B-",
            kode_universitas: sertifikat.kode_universitas || "/Un.08",
            kode_idc: sertifikat.kode_idc || "/IDC",
            kode_jenis_surat: sertifikat.kode_jenis_surat || "/Kp.07.6",
            bulan_tahun: sertifikat.bulan_tahun,
            open_print_certificate: sertifikat.open_print_certificate || false,
            base_number: sertifikat.base_number || 0,
            tanggal_surat: sertifikat.tanggal_surat || dayjs().format("YYYY-MM-DD"),
            id_gelombang: sertifikat.id_gelombang || "",
            template_sertifikat: sertifikat.template_sertifikat || "",
        });
        
        if (gelombangData.length > 0 && sertifikat.id_gelombang) {
            const gelombang = gelombangData.find(item => item.id === sertifikat.id_gelombang);
            setSelectedGelombangData(gelombang || null);
        }
        
        openModal();
    };

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            setSearchKey(e.target.value);
        }, 500);
    };

    useEffect(() => {
        fetchSertifikatData();
    }, [currentPage, entriesPerPage, sortKey, sortDir, searchKey]);

    useEffect(() => {
        getGelombangData();
    }, []);

    const renderPageButtons = () => {
        const buttons = [];
        let prevEllipsis = false;
        for (let page = 1; page <= totalPages; page++) {
            const isCurrent = page === currentPage;
            const isEdge = page === 1 || page === totalPages;
            const isNear = Math.abs(page - currentPage) <= 1;
            if (isEdge || isNear) {
                prevEllipsis = false;
                buttons.push(
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`inline-flex px-5 py-3.5 text-sm items-center justify-center gap-2 rounded-lg transition ${
                            isCurrent
                                ? "bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300"
                                : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 dark:hover:bg-white/[0.03] dark:hover:text-gray-300"
                        }`}
                    >
                        {page}
                    </button>
                );
            } else {
                if (!prevEllipsis) {
                    buttons.push(
                        <span
                            key={`ellipsis-${page}`}
                            className="inline-flex px-5 py-3.5 text-sm items-center justify-center gap-2 text-gray-500"
                        >
                            ...
                        </span>
                    );
                    prevEllipsis = true;
                }
            }
        }
        return buttons;
    };

    const renderSkeletonRows = () => {
        const skeletonRows = Array.from(
            { length: entriesPerPage },
            (_, idx) => (
                <tr key={`skeleton-${idx}`}>
                    {Array.from({ length: 7 }).map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-3">
                            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                        </td>
                    ))}
                </tr>
            )
        );
        return skeletonRows;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";
        return dayjs(dateString).format("DD/MM/YYYY");
    };

    const getStatusChip = (status) => {
        return status ? (
            <Chip
                label="Aktif"
                color="success"
                size="small"
                className="!text-xs"
            />
        ) : (
            <Chip
                label="Nonaktif"
                color="default"
                size="small"
                variant="outlined"
                className="!text-xs"
            />
        );
    };

    const generatePreviewNumber = () => {
        const formattedBaseNumber = String(formData.base_number).padStart(3, '0');
        return `${formData.kode}${formData.base_number}${formData.kode_universitas}${formData.kode_idc}${formData.kode_jenis_surat}/${formData.bulan_tahun}/${formattedBaseNumber}`;
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                {snackbar.open && (
                    <Alert
                        severity={snackbar.severity}
                        onClose={() =>
                            setSnackbar({ ...snackbar, open: false })
                        }
                        className="m-4"
                    >
                        {snackbar.message}
                    </Alert>
                )}

                <div className="navigation-1 flex flex-col">
                    <div className="navigation-2 p-5 flex flex-col md:flex-row gap-y-3 justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>Show</span>
                            <SelectCustom
                                showPlaceHolder={false}
                                options={["5", "10", "25", "50"].map((v) => ({
                                    value: v,
                                    label: v,
                                }))}
                                defaultValue={entriesPerPage.toString()}
                                onChange={handleEntriesChange}
                                className="dark:bg-dark-900"
                            />
                            <span>entries</span>
                        </div>
                        <div className="flex justify-end gap-x-2">
                            <div>
                                <Search
                                    value={searchInput}
                                    onChange={handleSearchChange}
                                    placeholder="Cari kode, bulan tahun, atau gelombang..."
                                />
                            </div>
                            <Button onClick={handleAddClick}>Tambah</Button>
                        </div>
                    </div>

                    <div className="w-full max-h-[500px] overflow-auto">
                        <table className="min-w-full">
                            <thead className="sticky top-0 z-10 bg-white border-b border-gray-100 dark:border-white/[0.05]">
                                <tr>
                                    <th className="px-5 py-3 text-xs font-medium text-gray-500">
                                        No
                                    </th>
                                    <th
                                        className="px-5 py-3 min-w-60 text-xs cursor-pointer font-medium text-gray-500"
                                        onClick={() => sortBy("kode")}
                                    >
                                        Kode {sortIcon("kode")}
                                    </th>
                                    <th
                                        className="px-5 py-3 min-w-60 text-xs font-medium text-gray-500"
                                        onClick={() => sortBy("bulan_tahun")}
                                    >
                                        Bulan/Tahun {sortIcon("bulan_tahun")}
                                    </th>
                                    <th className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500">
                                        Nomor Sertifikat
                                    </th>
                                    <th
                                        className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                        onClick={() => sortBy("tanggal_surat")}
                                    >
                                        Tanggal Surat {sortIcon("tanggal_surat")}
                                    </th>
                                    <th className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500">
                                        Status Cetak
                                    </th>
                                    <th
                                        className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                        onClick={() => sortBy("nama_gelombang")}
                                    >
                                        Gelombang {sortIcon("nama_gelombang")}
                                    </th>
                                    <th className="px-5 py-3 text-xs font-medium text-gray-500">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                                {loading
                                    ? renderSkeletonRows()
                                    : data?.data?.map((row, idx) => (
                                          <tr key={row.id}>
                                              <td className="px-4 py-3">
                                                  {(currentPage - 1) *
                                                      entriesPerPage +
                                                      idx +
                                                      1}
                                              </td>
                                              <td className="px-4 py-3 font-medium">
                                                  {row.kode}
                                              </td>
                                              <td className="px-4 py-3">
                                                  {row.bulan_tahun}
                                              </td>
                                              <td className="px-4 py-3 font-mono text-sm">
                                                  {row.nomor_surat || "-"}
                                              </td>
                                              <td className="px-4 py-3">
                                                  {row.tanggal_surat}
                                              </td>
                                              <td className="px-4 py-3">
                                                  {getStatusChip(
                                                      row.open_print_certificate
                                                  )}
                                              </td>
                                              <td className="px-4 py-3">
                                                  {row.nama_gelombang || "-"}
                                              </td>
                                              <td className="px-4 py-3">
                                                  <div className="flex gap-x-2 items-center justify-center">
                                                      <button
                                                          onClick={() =>
                                                              handleToggleStatus(
                                                                  row.id
                                                              )
                                                          }
                                                          className={`p-1.5 rounded-md ${
                                                              row.open_print_certificate
                                                                  ? "text-amber-500 hover:bg-amber-50"
                                                                  : "text-green-500 hover:bg-green-50"
                                                          }`}
                                                          title={
                                                              row.open_print_certificate
                                                                  ? "Nonaktifkan Cetak"
                                                                  : "Aktifkan Cetak"
                                                          }
                                                      >
                                                          {row.open_print_certificate ? (
                                                              <PrinterIcon className="h-4 w-4" />
                                                          ) : (
                                                              <EyeIcon className="h-4 w-4" />
                                                          )}
                                                      </button>
                                                      <button
                                                          onClick={() =>
                                                              handleEditClick(
                                                                  row
                                                              )
                                                          }
                                                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md"
                                                          title="Edit"
                                                      >
                                                          <TfiPencil className="h-4 w-4" />
                                                      </button>
                                                      <button
                                                          onClick={() =>
                                                              handleDelete(
                                                                  row.id
                                                              )
                                                          }
                                                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-md"
                                                          title="Hapus"
                                                      >
                                                          <FaRegTrashCan className="h-4 w-4" />
                                                      </button>
                                                  </div>
                                              </td>
                                          </tr>
                                      ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="navigation-3 p-5 flex flex-col md:flex-row gap-y-3 justify-between">
                        <div className="flex items-center gap-2 text-gray-500">
                            <span>{`Showing ${
                                (currentPage - 1) * entriesPerPage + 1
                            } to ${Math.min(
                                currentPage * entriesPerPage,
                                totalEntries
                            )} of ${totalEntries} entries`}</span>
                        </div>
                        <div className="flex gap-x-4">
                            <Button
                                variant="outline"
                                disabled={currentPage === 1}
                                onClick={() =>
                                    setCurrentPage((prev) => prev - 1)
                                }
                            >
                                Previous
                            </Button>
                            <div className="w-full flex gap-x-2">
                                {renderPageButtons()}
                            </div>
                            <Button
                                variant="outline"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((prev) => prev + 1)
                                }
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Add/Edit Modal */}
                <DynamicModal
                    className="max-w-[700px] m-4"
                    isOpen={isOpen}
                    onClose={closeModal}
                >
                    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                        <div className="px-2 pr-14">
                            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                                {dialogMode === "add"
                                    ? "Tambah Template Sertifikat"
                                    : "Edit Template Sertifikat"}
                            </h4>
                        </div>
                        <form className="flex flex-col" onSubmit={handleSave}>
                            <div className="custom-scrollbar h-[550px] overflow-y-auto px-2 pb-3">
                                <div className="mt-7">
                                    <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                        Informasi Template
                                    </h5>

                                    {validationError && (
                                        <Alert
                                            severity="error"
                                            className="mb-4"
                                        >
                                            {Object.values(validationError)
                                                .flat()
                                                .join(", ")}
                                        </Alert>
                                    )}

                                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-800 font-medium">
                                            Preview Nomor Sertifikat:
                                        </p>
                                        <p className="text-lg font-mono font-bold text-blue-900 mt-1">
                                            {generatePreviewNumber()}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                        <div className="flex flex-col w-full">
                                            <TextField
                                                label="Kode Awal"
                                                value={formData.kode}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        kode: e.target.value,
                                                    })
                                                }
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
                                                required
                                                fullWidth
                                                helperText="Contoh: B-"
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col w-full">
                                            <TextField
                                                label="Kode Universitas"
                                                value={formData.kode_universitas}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        kode_universitas: e.target.value,
                                                    })
                                                }
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
                                                fullWidth
                                                helperText="Contoh: /Un.08"
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col w-full">
                                            <TextField
                                                label="Kode IDC"
                                                value={formData.kode_idc}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        kode_idc: e.target.value,
                                                    })
                                                }
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
                                                fullWidth
                                                helperText="Contoh: /IDC"
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col w-full">
                                            <TextField
                                                label="Kode Jenis Surat"
                                                value={formData.kode_jenis_surat}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        kode_jenis_surat: e.target.value,
                                                    })
                                                }
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
                                                fullWidth
                                                helperText="Contoh: /Kp.07.6"
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col w-full">
                                            <TextField
                                                label="Bulan/Tahun"
                                                value={formData.bulan_tahun}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        bulan_tahun: e.target.value,
                                                    })
                                                }
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
                                                required
                                                fullWidth
                                                helperText="Format: MM/YYYY (contoh: 01/2024)"
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col w-full">
                                            <TextField
                                                label="Base Number"
                                                type="number"
                                                value={formData.base_number}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        base_number: parseInt(e.target.value) || 0,
                                                    })
                                                }
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
                                                fullWidth
                                                helperText="Angka dasar untuk penomoran"
                                            />
                                        </div>
                                        
                                        
                                        <div className="flex flex-col w-full">
                                            <TextField
                                                label="Tanggal Surat"
                                                value={formData.tanggal_surat}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        tanggal_surat: e.target.value,
                                                    })
                                                }
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
                                                fullWidth
                                                helperText="Tanggal surat"
                                            />
                                        </div>
                                        
                                        <div className="flex flex-col w-full">
                                            <Autocomplete
                                                id="gelombang"
                                                name="gelombang"
                                                sx={{ width: "100%" }}
                                                value={selectedGelombangData}
                                                options={gelombangData}
                                                getOptionLabel={(option) =>
                                                    option.name || ""
                                                }
                                                onChange={(e, value) => {
                                                    setSelectedGelombangData(value);
                                                    setFormData({
                                                        ...formData,
                                                        id_gelombang: value ? value.id : "",
                                                    });
                                                }}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Gelombang"
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
                                                    />
                                                )}
                                            />
                                        </div>
                                        
                                        
                                        
                                        <div className="flex flex-col w-full">
                                            <FormControl fullWidth>
                                                <InputLabel id="status-cetak">
                                                    Status Cetak
                                                </InputLabel>
                                                <Select
                                                    labelId="status-cetak"
                                                    value={
                                                        formData.open_print_certificate
                                                            ? "active"
                                                            : "inactive"
                                                    }
                                                    label="Status Cetak"
                                                    onChange={(e) =>
                                                        setFormData({
                                                            ...formData,
                                                            open_print_certificate:
                                                                e.target
                                                                    .value ===
                                                                "active",
                                                        })
                                                    }
                                                >
                                                    <MenuItem value="active">
                                                        Aktif
                                                    </MenuItem>
                                                    <MenuItem value="inactive">
                                                        Nonaktif
                                                    </MenuItem>
                                                </Select>
                                            </FormControl>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={closeModal}
                                >
                                    Batal
                                </Button>
                                <Button
                                    disabled={loading}
                                    className="relative"
                                    size="sm"
                                    type="submit"
                                >
                                    {loading ? <LoaderOnButton /> : "Simpan"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </DynamicModal>

                {/* Delete Confirmation Modal */}
                <DynamicModalConf
                    className="max-w-[400px] m-4"
                    showCloseButton={false}
                    isOpen={isOpenConf}
                    onClose={closeModalConf}
                >
                    <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                        <div className="px-2 pr-14">
                            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                                Konfirmasi Hapus
                            </h4>
                        </div>
                        <div className="flex flex-col">
                            <div className="custom-scrollbar h-[50px] overflow-y-auto px-2 pb-3">
                                Apakah Anda yakin ingin menghapus template sertifikat ini? 
                                Tindakan ini tidak dapat dibatalkan.
                            </div>
                            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={closeModalConf}
                                >
                                    Batal
                                </Button>
                                <Button
                                    disabled={loading}
                                    className="relative bg-red-500 hover:bg-red-600"
                                    size="sm"
                                    onClick={deleteData}
                                >
                                    {loading ? <LoaderOnButton /> : "Hapus"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DynamicModalConf>
            </div>
        </LocalizationProvider>
    );
};

export default SertifikatMahasiswaTable;