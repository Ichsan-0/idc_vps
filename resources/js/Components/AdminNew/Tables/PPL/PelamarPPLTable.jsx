import Button from "@/Components/Button";
import DynamicModal from "@/Components/DynamicModal";

import LoaderOnButton from "@/Components/LoaderOnButtn";
import Search from "@/Components/Search";
import { config } from "@/config/config";
import { useConfirmationModal, useModal } from "@/Hooks/useModal";
import { PlusIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { PiSortAscending, PiSortDescending } from "react-icons/pi";
import { FaRegTrashCan } from "react-icons/fa6";
import { TfiPencil } from "react-icons/tfi";
import { RiFileExcel2Line, RiDownloadLine, RiUploadCloud2Line } from "react-icons/ri";
import DynamicModalConf from "@/Components/DynamicModalConf";
import {
    Autocomplete,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import { Link, usePage } from "@inertiajs/react";
import { useRef } from "react";
import SelectCustom from "@/Components/Select";
import EditLamaranPPL from "../../PopUps/EditLamaranPPL";
import Toaster from "@/Components/Toaster";
import InputError from "@/Components/InputError";

const PelamarPPLTable = () => {
    const [loading, setLoading] = useState(false);
    const { openModal, closeModal, isOpen } = useModal();
    const { openModal: openImportModal, closeModal: closeImportModal, isOpen: isOpenImport } = useModal();
    const { openModalConf, closeModalConf, isOpenConf } =
        useConfirmationModal();

    const [importFile, setImportFile] = useState(null);
    const [importLoading, setImportLoading] = useState(false);
    const [importLowongan, setImportLowongan] = useState(null);
    const [importError, setImportError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const modalA = useModal();

    const { props } = usePage();
    const x = props.data?.id;

    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(5);
    const [totalEntries, setTotalEntries] = useState(null);
    const [totalPages, setTotalPages] = useState(null);
    const [validationError, setValidationError] = useState({
        username_mahasiswa: null,
        keterangan: null,
        status: null,
        id_lowongan_ppl: null,
    });
    const [searchKey, setSearchKey] = useState(null);
    const [searchInput, setSearchInput] = useState(null);
    const [selectedData, setSelectedData] = useState(null);
    const [selectedPelamar, setSelectedPelamar] = useState(null);

    const [data, setData] = useState([]);
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState(null);
    const [studentName, setStudentName] = useState(null);
    const [studentNim, setStudentNim] = useState(null);
    const [selectedTempatKPM, setSelectedTempatKPM] = useState(null);
    const [tempatKPM, setTempatKPM] = useState(null || []);
    const [daftarMahasiswa, setDaftarMahasiswa] = useState([]);
    const [selectedStudnet, setSelectedStudent] = useState(null);
    const [allStudent, setAllStudent] = useState([]);
    const [studentSearchQuery, setStudentSearchQueary] = useState(null);
    const [open, setOpen] = useState(false);
    const [lowonganPPL, setLowonganPPL] = useState(null);
    const [selectedLowonganPPL, setSelectedLowonganPPL] = useState(null);
    const [responseData, setResponseData] = useState({
        severity: "",
        open: false,
        message: "",
    });

    const debounceRef = useRef(null);

    const [formData, setFormData] = useState({
        username_mahasiswa: "",
        keterangan: "",
        status: "",
        id_lowongan_ppl: "",
    });

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

    const isValid = () => {
        const errors = {
            keterangan: null,
            id_lowongan_ppl: null,
            username_mahasiswa: null,
            status: null,
        };

        if (!formData.keterangan) {
            errors.keterangan = "Keterangan wajib diisi";
        }

        if (!formData.id_lowongan_ppl) {
            errors.id_lowongan_ppl = "Lowongan PPL Wajib Diisi";
        }

        if (!formData.username_mahasiswa) {
            errors.username_mahasiswa = "Mahasiswa Wajib Diisi";
        }
        if (!formData.status) {
            errors.status = "Status Wajib Diisi";
        }

        setValidationError(errors);
        console.log("validation :", errors);

        const hasError = Object.values(errors).some((value) => value !== null);

        return !hasError;
    };

    useEffect(() => {
        const totalCount = daftarMahasiswa?.total ?? 0;
        const totalPageCount = daftarMahasiswa?.last_page ?? 0;

        setTotalEntries(totalCount);
        setTotalPages(totalPageCount);
    }, [daftarMahasiswa]);

    const handleSave = async (e) => {
        e.preventDefault();
        // console.log('is valid ', isValid);
        if (isValid()) {
            try {
                setLoading(true);
                const payload = new FormData();
                payload.append(
                    "username_mahasiswa",
                    formData.username_mahasiswa
                );
                payload.append("id_lowongan_ppl", formData.id_lowongan_ppl);
                payload.append("keterangan", formData.keterangan);
                payload.append("status", formData.status);

                const res = await axios.post(
                    `${config.base_url}/api/admin/ppl/lowongan/mahasiswa/add`,
                    payload,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );

                getMahasiswa();
                setResponseData({
                    message: res?.data?.message,
                    severity: "success",
                    open: true,
                });
            } catch (error) {
                if (error.response?.status === 422) {
                    setResponseData({
                        message:
                            error.response.data.message || "Validasi gagal",
                        severity: "error",
                        open: true,
                    });
                } else if (error.response?.status === 400) {
                    setResponseData({
                        message: error.response.data.error || "Bad Request",
                        severity: "error",
                        open: true,
                    });
                } else if (error.response?.status === 404) {
                    setResponseData({
                        message: error.response?.data?.message,
                        severity: "error",
                        open: true,
                    });
                } else {
                    setResponseData({
                        message: "Terjadi kesalahan saat menyimpan data",
                        severity: "error",
                        open: true,
                    });
                }
            } finally {
                setLoading(false);
                closeModal();
            }
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

    const deleteData = async (id) => {
        try {
            setLoading(true);
            const response = await axios.delete(
                `${config.base_url}/api/admin/ppl/lowongan/mahasiswa/delete/${id}`,
                {
                    withCredentials: true,
                    headers: {
                        Accept: "application/json",
                    },
                    params: {
                        idLamaran: selectedData,
                    },
                }
            );

            setResponseData({
                message: response?.data?.message,
                severity: "success",
                open: true,
            });
        } catch (error) {
            if (error.response?.status === 422) {
                setResponseData({
                    message: error.response.data.message || "Validasi gagal",
                    severity: "error",
                    open: true,
                });
            } else if (error.response?.status === 400) {
                setResponseData({
                    message: error.response.data.error || "Bad Request",
                    severity: "error",
                    open: true,
                });
            } else if (error.response?.status === 404) {
                setResponseData({
                    message: error.response?.data?.message,
                    severity: "error",
                    open: true,
                });
            } else {
                setResponseData({
                    message: "Terjadi kesalahan saat menghapus data",
                    severity: "error",
                    open: true,
                });
            }
        } finally {
            setSelectedData(null);
            getMahasiswa();
        }
    };

    const getMahasiswa = async () => {
        try {
            setLoading(true);

            const response = await axios.get(
                `${config.base_url}/api/admin/ppl/lowongan/mahasiswa/list`,
                {
                    params: {
                        id_sekolah: x,
                        page: currentPage,
                        perPage: entriesPerPage,
                        sortBy: sortKey,
                        sortOrder: sortDir,
                        search: searchKey,
                    },
                }
            );
            setDaftarMahasiswa(response.data.data);
        } catch (error) {
            setLoading(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudent = async () => {
        if (!studentSearchQuery) {
            setAllStudent([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(
                `${config.base_url}/api/admin/student?search=${studentSearchQuery}`
            );
            setAllStudent(response.data.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            fetchStudent();
        }, 500);
    }, [studentSearchQuery]);

    useEffect(() => {
        // if (daftarMahasiswa?.data?.length > 0) {
        getMahasiswa();
        // }
    }, [currentPage, entriesPerPage, sortKey, sortDir, searchKey]);

    useEffect(() => {
        getLowonganPPL();
        getMahasiswa();
    }, []);

    const getLowonganPPL = async () => {
        try {
            const res = await axios.get(
                `${config.base_url}/api/admin/ppl/lowongan/listsbyschool`,
                {
                    params: {
                        id_sekolah: x,
                    },
                }
            );
            setLowonganPPL(res?.data?.data || []);
        } catch (error) {
            console.log(error);
        }
    };

    const handleDownloadTemplate = () => {
        window.location.href = `${config.base_url}/admin/ppl/sekolah/detail/mahasiswa/template-import`;
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget)) return;
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            const file = files[0];
            const ext = "." + file.name.split(".").pop().toLowerCase();
            if (![".xlsx", ".xls", ".csv"].includes(ext)) {
                setImportError("Format file tidak didukung. Harap unggah file .xlsx, .xls, atau .csv.");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setImportError("Ukuran file melebihi batas maksimal (10MB).");
                return;
            }
            setImportFile(file);
            setImportError(null);
        }
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        if (!importFile) {
            setImportError("Silakan pilih file Excel terlebih dahulu.");
            return;
        }

        try {
            setImportLoading(true);
            setImportError(null);

            const payload = new FormData();
            payload.append("file", importFile);
            payload.append("id_sekolah", x);
            if (importLowongan?.id) {
                payload.append("id_lowongan_ppl", importLowongan.id);
            }

            const res = await axios.post(
                `${config.base_url}/api/admin/ppl/lowongan/mahasiswa/import`,
                payload,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Accept: "application/json",
                    },
                }
            );

            setResponseData({
                message: res.data?.message || "Data mahasiswa PPL berhasil diimpor.",
                severity: "success",
                open: true,
            });

            setImportFile(null);
            setImportLowongan(null);
            closeImportModal();
            getMahasiswa();
        } catch (err) {
            console.error("Import error:", err);
            const errorMsg =
                err.response?.data?.message ||
                err.response?.data?.error ||
                "Terjadi kesalahan saat mengimpor data.";
            setImportError(errorMsg);
            setResponseData({
                message: errorMsg,
                severity: "error",
                open: true,
            });
        } finally {
            setImportLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchInput(e.target.value);
        setTimeout(() => {
            setSearchKey(e.target.value);
        }, 2000);
    };
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
                        className={`inline-flex px-5 py-3.5 text-sm items-center justify-center gap-2 rounded-lg transition ${isCurrent
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
    const handleDeleteData = (id) => {
        closeModalConf();
        deleteData(selectedData);
    };

    const renderSkeletonRows = () => {
        const skeletonRows = Array.from(
            { length: entriesPerPage },
            (_, idx) => (
                <tr key={`skeleton-${idx}`}>
                    {Array.from({ length: 5 }).map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-3">
                            <div className="h-4 w-full bg-gray-200 animate-pulse rounded"></div>
                        </td>
                    ))}
                </tr>
            )
        );
        return skeletonRows;
    };

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white ">
            <Toaster
                openToaster={responseData.open}
                message={responseData.message}
                severity={responseData.severity}
                onClose={() =>
                    setResponseData({ ...responseData, open: false })
                }
            />
            <div className="navigation-1 flex flex-col ">
                <div className="navigation-2 p-5 flex flex-col md:flex-row gap-y-3  justify-between">
                    <div className="flex items-center gap-2 text-gray-500">
                        <span>Show</span>
                        <SelectCustom
                            showPlaceHolder={false}
                            options={["5", "10", "50", "100"].map((v) => ({
                                value: v,
                                label: v,
                            }))}
                            defaultValue={entriesPerPage}
                            onChange={handleEntriesChange}
                            className="dark:bg-dark-900"
                        />
                        <span>entries</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="w-full sm:w-52 md:w-60 min-w-[160px]">
                            <Search
                                value={searchInput}
                                onChange={(e) => handleSearchChange(e)}
                                className="w-full"
                            />
                        </div>

                        <Button
                            size="sm"
                            variant="outline"
                            onClick={openImportModal}
                            className="!border-blue-600 !text-blue-700 hover:!bg-blue-50 dark:!border-blue-500 dark:!text-blue-400 dark:hover:!bg-blue-950/20 !px-3 !py-2 text-xs md:text-sm font-medium whitespace-nowrap shadow-xs shrink-0"
                            startIcon={<RiFileExcel2Line className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        >
                            Import Peserta
                        </Button>

                        <Button
                            size="sm"
                            onClick={openModal}
                            className="!px-3 !py-2 text-xs md:text-sm font-medium whitespace-nowrap shadow-xs shrink-0"
                        >
                            Tambah
                        </Button>
                    </div>
                </div>
                <div className="w-full max-h-[500px] overflow-auto">
                    <table className="min-w-full">
                        <thead className="sticky top-0 z-10 bg-white border-b border-gray-100 dark:border-white/[0.05]">
                            <tr>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 text-xs font-medium text-gray-500"
                                >
                                    No
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-60 text-xs cursor-pointer font-medium text-gray-500"
                                    onClick={() => sortBy("name")}
                                >
                                    Nama {sortIcon("name")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                    onClick={() => sortBy("nim")}
                                >
                                    NIM {sortIcon("nim")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                    onClick={() => sortBy("prodi")}
                                >
                                    Prodi {sortIcon("prodi")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                    onClick={() => sortBy("jenisKelamin")}
                                >
                                    Jenis Kelamin {sortIcon("jenis_kelamin")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                    onClick={() => sortBy("lowongan")}
                                >
                                    Lowongan {sortIcon("lowongan")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 min-w-50 text-xs font-medium text-gray-500"
                                    onClick={() => sortBy("status")}
                                >
                                    Status {sortIcon("status")}
                                </th>
                                <th
                                    rowSpan={2}
                                    className="px-5 py-3 text-xs font-medium text-gray-500"
                                >
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading
                                ? renderSkeletonRows()
                                : daftarMahasiswa?.data?.map((row, idx) => (
                                    <tr key={row.id + "-" + idx}>
                                        <td className="px-4 py-3">
                                            {(currentPage - 1) *
                                                entriesPerPage +
                                                idx +
                                                1}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.name}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row.username_mahasiswa}
                                        </td>

                                        <td className="px-4 py-3">
                                            {row?.nama_prodi}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row?.jk}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row?.nama_lowongan}
                                        </td>
                                        <td className="px-4 py-3">
                                            {row?.status}
                                        </td>

                                        <td className="px-4 py-3">
                                            <div className="flex gap-x-2 items-center justify-center">
                                                <button
                                                    onClick={() =>
                                                        handleDelete(row.id)
                                                    }
                                                    className="text-gray-500 cursor-pointer hover:text-error-500"
                                                >
                                                    <FaRegTrashCan />
                                                </button>
                                                <button
                                                    //   href={`/admin/kpm/tempatkpm/${row.id}`}
                                                    className="text-gray-500 cursor-pointer hover:text-gray-800"
                                                    onClick={() => {
                                                        setSelectedPelamar(
                                                            row?.id
                                                        );
                                                        modalA.openModal();
                                                    }}
                                                >
                                                    <TfiPencil />
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
                        <span>{`Showing ${(currentPage - 1) * entriesPerPage + 1
                            } to ${Math.min(
                                currentPage * entriesPerPage,
                                totalEntries
                            )} of ${totalEntries} entries`}</span>
                    </div>
                    <div className="flex gap-x-4">
                        <Button
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            Previous
                        </Button>
                        <div className="w-full flex gap-x-2">
                            {renderPageButtons()}
                        </div>
                        <Button
                            variant="outline"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            </div>
            <DynamicModal
                className="max-w-[700px] m-4"
                isOpen={isOpen}
                onClose={closeModal}
            >
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Tambah Lamaran
                        </h4>
                    </div>
                    <form className="flex flex-col" onSubmit={handleSave}>
                        <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
                            <div className="mt-7">
                                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                                    Informasi Lamaran
                                </h5>

                                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                                    <div className="flex flex-col w-full">
                                        <Autocomplete
                                            open={open}
                                            onOpen={() => setOpen(true)}
                                            onClose={() => setOpen(false)}
                                            options={allStudent}
                                            getOptionLabel={(option) =>
                                                option.name || ""
                                            } // adapt for your API
                                            loading={loading}
                                            onInputChange={(event, value) =>
                                                setStudentSearchQueary(value)
                                            }
                                            onChange={(event, value) => {
                                                setFormData({
                                                    ...formData,
                                                    username_mahasiswa:
                                                        value.username,
                                                });
                                                setValidationError({
                                                    ...validationError,
                                                    username_mahasiswa: null,
                                                });
                                            }}
                                            renderOption={(props, option) => (
                                                <li
                                                    {...props}
                                                    key={option?.username}
                                                >
                                                    <div>
                                                        <p>{option?.name}</p>
                                                        <p>
                                                            NIM:{" "}
                                                            {option?.username}
                                                        </p>
                                                    </div>
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Student"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow:
                                                                "none",
                                                        },
                                                        "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow:
                                                                "none",
                                                        },
                                                    }}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {loading ? (
                                                                    <CircularProgress
                                                                        size={
                                                                            20
                                                                        }
                                                                    />
                                                                ) : null}
                                                                {
                                                                    params
                                                                        .InputProps
                                                                        .endAdornment
                                                                }
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />

                                        {validationError.username_mahasiswa && (
                                            <InputError
                                                message={
                                                    validationError.username_mahasiswa
                                                }
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <Autocomplete
                                            id="lowongan-ppl"
                                            name="lowongan-ppl"
                                            sx={{ width: "100%" }}
                                            value={selectedLowonganPPL}
                                            options={lowonganPPL}
                                            getOptionLabel={(option) =>
                                                option.name
                                            }
                                            onChange={(e, value) => {
                                                setSelectedLowonganPPL(value);
                                                setFormData({
                                                    ...formData,
                                                    id_lowongan_ppl: value.id,
                                                });
                                                setValidationError({
                                                    ...validationError,
                                                    id_lowongan_ppl: null,
                                                });
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Lowongan PPL"
                                                    sx={{
                                                        "& .MuiOutlinedInput-root.Mui-focused":
                                                        {
                                                            outline: "none",
                                                            boxShadow:
                                                                "none",
                                                        },
                                                        "& .MuiInputBase-input:focus":
                                                        {
                                                            outline: "none",
                                                            boxShadow:
                                                                "none",
                                                        },
                                                    }}
                                                />
                                            )}
                                        ></Autocomplete>
                                        {validationError.id_lowongan_ppl && (
                                            <InputError
                                                message={
                                                    validationError.id_lowongan_ppl
                                                }
                                            />
                                        )}
                                    </div>

                                    <div className="flex flex-col w-full">
                                        <TextField
                                            id="keterangan"
                                            name="keterangan"
                                            value={formData.keterangan}
                                            label="Keterangan"
                                            placeholder="Keterangan"
                                            onChange={(e) => {
                                                setFormData({
                                                    ...formData,
                                                    keterangan: e.target.value,
                                                });
                                                setValidationError({
                                                    ...validationError,
                                                    keterangan: null,
                                                });
                                            }}
                                            multiline
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
                                        ></TextField>
                                        {validationError.keterangan && (
                                            <InputError
                                                message={
                                                    validationError.keterangan
                                                }
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col w-full">
                                        <FormControl fullWidth>
                                            <InputLabel id="status">
                                                Status
                                            </InputLabel>
                                            <Select
                                                labelId="status"
                                                id="status"
                                                value={formData.status}
                                                label="Status"
                                                onChange={(e) => {
                                                    setFormData({
                                                        ...formData,
                                                        status: e.target.value,
                                                    });
                                                    setValidationError({
                                                        ...validationError,
                                                        status: null,
                                                    });
                                                }}
                                            >
                                                <MenuItem value={"submitted"}>
                                                    Direview
                                                </MenuItem>
                                                <MenuItem value={"accepted"}>
                                                    Diterima
                                                </MenuItem>
                                                <MenuItem value={"rejected"}>
                                                    Ditolak
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                        {validationError.status && (
                                            <InputError
                                                message={validationError.status}
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                startIcon={<PlusIcon />}
                                onClick={closeModal}
                            >
                                Close
                            </Button>
                            <Button
                                disabled={loading}
                                className="relative"
                                size="sm"
                                type="submit"
                            >
                                {loading ? <LoaderOnButton /> : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DynamicModal>
            <DynamicModal
                className="max-w-[700px] m-4"
                isOpen={modalA.isOpen}
                onClose={modalA.closeModal}
            >
                <EditLamaranPPL
                    closeModal={modalA.closeModal}
                    idLamaran={selectedPelamar}
                    lowonganPPL={lowonganPPL}
                    onFinish={(value) => {
                        getMahasiswa();
                        setResponseData(value);
                        console.log("success", value);
                    }}
                />
            </DynamicModal>
            {/* Modal Import Excel Mahasiswa PPL */}
            <DynamicModal
                className="max-w-[620px] m-4"
                isOpen={isOpenImport}
                onClose={() => {
                    if (!importLoading) {
                        setImportFile(null);
                        setImportError(null);
                        setIsDragging(false);
                        closeImportModal();
                    }
                }}
            >
                <div className="no-scrollbar relative w-full overflow-y-auto rounded-3xl bg-white p-5 dark:bg-gray-900 lg:p-8">
                    {/* Header Modal */}
                    <div className="flex items-start gap-3.5 pb-4 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <RiFileExcel2Line className="h-6 w-6" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white">
                                Import Mahasiswa PPL dari Excel
                            </h4>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                Tambahkan data mahasiswa pelamar/peserta PPL pada sekolah ini secara massal menggunakan file Excel (.xlsx / .xls).
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleImportSubmit} className="mt-5 space-y-4">
                        {/* Target Lowongan / Prodi Default (Opsional) */}
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Lowongan PPL Default (Opsional)
                            </label>
                            <Autocomplete
                                id="import_lowongan"
                                name="import_lowongan"
                                sx={{ width: "100%" }}
                                value={importLowongan}
                                options={lowonganPPL || []}
                                getOptionLabel={(option) => option?.name || ""}
                                onChange={(e, value) => setImportLowongan(value)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        placeholder="Pilih Lowongan Default (Opsional)"
                                    />
                                )}
                            />
                            <p className="mt-1 text-[11px] text-gray-400">
                                Jika dipilih, baris mahasiswa dengan kolom lowongan kosong di Excel akan otomatis dimasukkan ke lowongan ini.
                            </p>
                        </div>

                        {/* Template Download Card */}
                        <div className="flex items-center justify-between rounded-xl border border-dashed border-gray-200 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-gray-800/40">
                            <div className="flex items-center gap-2.5">
                                <RiFileExcel2Line className="text-xl text-emerald-600 dark:text-emerald-400" />
                                <div>
                                    <p className="text-xs font-semibold text-gray-800 dark:text-white">
                                        Format Excel Template
                                    </p>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        Unduh template standar untuk pengisian data mahasiswa
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleDownloadTemplate}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 hover:text-emerald-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                <RiDownloadLine className="text-sm" />
                                Unduh Template
                            </button>
                        </div>

                        {/* File Upload Area */}
                        <div>
                            <label className="mb-1.5 block text-xs font-semibold text-gray-700 dark:text-gray-300">
                                Pilih File Excel
                            </label>
                            <div
                                onClick={() => document.getElementById("file-import-mahasiswa-ppl")?.click()}
                                onDragOver={handleDragOver}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all duration-200 cursor-pointer ${isDragging
                                        ? "border-emerald-500 bg-emerald-100/50 scale-[1.01] shadow-lg shadow-emerald-500/10 dark:border-emerald-400 dark:bg-emerald-950/30"
                                        : importFile
                                        ? "border-emerald-500 bg-emerald-50/20 dark:border-emerald-600 dark:bg-emerald-950/10"
                                        : "border-gray-300 bg-gray-50 hover:bg-gray-100/70 hover:border-gray-400 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:bg-gray-800"
                                    }`}
                            >
                                <input
                                    id="file-import-mahasiswa-ppl"
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls,.csv"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setImportFile(e.target.files[0]);
                                            setImportError(null);
                                        }
                                    }}
                                />
                                <RiUploadCloud2Line
                                    className={`text-4xl mb-2 transition-transform duration-200 ${isDragging
                                            ? "text-emerald-600 scale-125 animate-bounce"
                                            : importFile
                                            ? "text-emerald-600"
                                            : "text-gray-400"
                                        }`}
                                />
                                {isDragging ? (
                                    <div>
                                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                            Lepaskan file Excel di sini...
                                        </p>
                                        <p className="text-xs text-emerald-500 dark:text-emerald-400 mt-0.5">
                                            File akan otomatis dipilih
                                        </p>
                                    </div>
                                ) : importFile ? (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                            {importFile.name}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {(importFile.size / 1024).toFixed(1)} KB — Klik atau seret file lain untuk mengganti
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">
                                            Klik untuk memilih file Excel atau seret dan lepas file ke sini
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                                            Format didukung: .xlsx, .xls, .csv (Maks. 10MB)
                                        </p>
                                    </div>
                                )}
                            </div>
                            {importError && (
                                <div className="mt-2">
                                    <InputError message={importError} />
                                </div>
                            )}
                        </div>

                        {/* Panduan Format Singkat */}
                        <div className="rounded-xl bg-blue-50/60 p-3 text-[11px] text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                            <span className="font-bold">Ketentuan Kolom Excel:</span>
                            <ul className="mt-1 list-disc list-inside space-y-0.5 text-blue-700 dark:text-blue-400">
                                <li><span className="font-medium">NIM:</span> Wajib (NIM / username mahasiswa).</li>
                                <li><span className="font-medium">Nama Mahasiswa:</span> Opsional (nama lengkap mahasiswa).</li>
                                <li><span className="font-medium">Lowongan / Prodi:</span> Nama lowongan atau prodi sasaran pada sekolah ini.</li>
                                <li><span className="font-medium">Status:</span> Opsional (default: <span className="font-semibold">accepted</span> / Diterima).</li>
                                <li><span className="font-medium">Keterangan:</span> Opsional (catatan penempatan).</li>
                            </ul>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                    setImportFile(null);
                                    setImportError(null);
                                    setIsDragging(false);
                                    closeImportModal();
                                }}
                            >
                                Batal
                            </Button>
                            <Button
                                disabled={importLoading || !importFile}
                                className="relative !bg-emerald-600 hover:!bg-emerald-700"
                                size="sm"
                                type="submit"
                            >
                                {importLoading ? <LoaderOnButton /> : "Import Sekarang"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DynamicModal>
            <DynamicModalConf
                className="max-w-[400px] m-4"
                showCloseButton={false}
                isOpen={isOpenConf}
                onClose={closeModalConf}
            >
                <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
                    <div className="px-2 pr-14">
                        <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
                            Confirmation
                        </h4>
                    </div>
                    <div className="flex flex-col">
                        <div className="custom-scrollbar h-[50px] overflow-y-auto px-2 pb-3">
                            Apakah anda yakin akan menghapus?
                        </div>
                        <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={closeModalConf}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={loading}
                                className="relative"
                                size="sm"
                                type="submit"
                                onClick={handleDeleteData}
                            >
                                Oke
                            </Button>
                        </div>
                    </div>
                </div>
            </DynamicModalConf>
        </div>
    );
};

export default PelamarPPLTable;
