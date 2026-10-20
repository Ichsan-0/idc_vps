import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Autocomplete, TextField } from "@mui/material";
import { config } from "@/config/config";
import Button from "@/Components/Button";
import Badge from "@/Components/Badge";
import Input from "@/Components/InputField";
import Label from "@/Components/Label";
import InputError from "@/Components/InputError";
import LoaderOnButton from "@/Components/LoaderOnButtn";
import Search from "@/Components/Search";
import Toaster from "@/Components/Toaster";
import DynamicModal from "@/Components/DynamicModal";
import DynamicModalConf from "@/Components/DynamicModalConf";
import { useConfirmationModal, useModal } from "@/Hooks/useModal";
import { downloadExcel } from "@/Utils/downloadExcel";
import { PlusIcon } from "@heroicons/react/24/outline";
import {
    RiDownloadLine,
    RiEyeLine,
    RiEyeOffLine,
    RiRefreshLine,
    RiUserAddLine,
    RiShieldUserLine,
} from "react-icons/ri";
import { TfiPencil } from "react-icons/tfi";
import { FaRegTrashCan } from "react-icons/fa6";
import { PiSortAscending, PiSortDescending } from "react-icons/pi";

const OperatorAccountTable = ({ base_url, type = "sekolah", options = [] }) => {
    const apiBase = base_url || config.base_url || window.location.origin;
    const isSekolah = type === "sekolah";

    const entityLabel = isSekolah ? "Admin Sekolah" : "Admin Kecamatan";
    const targetLabel = isSekolah ? "Sekolah" : "Kecamatan";
    const targetKey = isSekolah ? "id_sekolah" : "id_kecamatan";
    const targetNameKey = isSekolah ? "nama_sekolah" : "nama_kecamatan";
    const targetSortKey = isSekolah ? "nama_sekolah" : "kecamatan";

    const endpoints = {
        list: isSekolah
            ? "/api/admin/admin-sekolah/query"
            : "/api/admin/data/admin-kecamatan/query",
        create: isSekolah
            ? "/api/admin/admin-sekolah"
            : "/api/admin/admin-kecamatan",
        update: (id) =>
            isSekolah
                ? `/api/admin/admin-sekolah/update/${id}`
                : `/api/admin/admin-kecamatan/update/${id}`,
        destroy: (id) =>
            isSekolah
                ? `/api/admin/admin-sekolah/${id}`
                : `/api/admin/admin-kecamatan/${id}`,
        export: isSekolah
            ? "/api/admin/oprator-sekolah/export"
            : "/api/admin/oprator-kecamatan/export",
        generate: isSekolah
            ? "/api/admin/admin-sekolah/generate"
            : "/api/admin/admin-kecamatan/generate",
    };

    const normalizedOptions = (options || [])
        .map((option) => ({
            value: String(option.value ?? option.id ?? ""),
            label: option.label ?? option.name ?? "",
        }))
        .filter((option) => option.value !== "");

    // Table data states
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [totalEntries, setTotalEntries] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchKey, setSearchKey] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [sortKey, setSortKey] = useState("id");
    const [sortDir, setSortDir] = useState("desc");

    // Modal hooks
    const {
        isOpen: isOpenAdd,
        openModal: openAddModal,
        closeModal: closeAddModal,
    } = useModal();
    const {
        isOpen: isOpenEdit,
        openModal: openEditModal,
        closeModal: closeEditModal,
    } = useModal();
    const {
        isOpenConf,
        openModalConf,
        closeModalConf,
    } = useConfirmationModal();

    // Add form state
    const [addFormData, setAddFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
        targetValue: "",
    });
    const [addValidationError, setAddValidationError] = useState({});
    const [addLoading, setAddLoading] = useState(false);
    const [showAddPassword, setShowAddPassword] = useState(false);

    // Edit form state
    const [editFormData, setEditFormData] = useState({
        id: "",
        name: "",
        username: "",
        email: "",
        password: "",
        targetValue: "",
    });
    const [editValidationError, setEditValidationError] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    // Delete state
    const [selectedToDelete, setSelectedToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Export / generate states
    const [exportLoading, setExportLoading] = useState(false);
    const [generateLoading, setGenerateLoading] = useState(false);

    // Toast state
    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showToast = (message, severity = "success") => {
        setToast({ open: true, message, severity });
    };

    const searchDebounceRef = useRef(null);

    // Fetch list
    const fetchData = useCallback(
        async (page = currentPage, entries = entriesPerPage, search = searchKey, sort = sortKey, dir = sortDir) => {
            setLoading(true);
            try {
                const response = await axios.get(`${apiBase}${endpoints.list}`, {
                    params: {
                        page,
                        entries_per_page: entries,
                        search_key: search,
                        sort_key: sort,
                        sort_dir: dir,
                    },
                });

                const resData = response.data?.data;
                if (resData) {
                    setData(resData.data || []);
                    setTotalEntries(resData.total || 0);
                    setTotalPages(resData.last_page || 1);
                    setCurrentPage(resData.current_page || 1);
                } else {
                    setData([]);
                }
            } catch (err) {
                console.error(`Gagal memuat data ${entityLabel}:`, err);
                showToast(
                    err.response?.data?.message || `Gagal memuat data ${entityLabel}.`,
                    "error"
                );
            } finally {
                setLoading(false);
            }
        },
        [apiBase, endpoints.list, currentPage, entriesPerPage, searchKey, sortKey, sortDir, entityLabel]
    );

    useEffect(() => {
        fetchData(currentPage, entriesPerPage, searchKey, sortKey, sortDir);
    }, [currentPage, entriesPerPage, searchKey, sortKey, sortDir]);

    // Search debounce
    const handleSearchChange = (e) => {
        const val = e.target.value;
        setSearchInput(val);

        if (searchDebounceRef.current) {
            clearTimeout(searchDebounceRef.current);
        }

        searchDebounceRef.current = setTimeout(() => {
            setSearchKey(val);
            setCurrentPage(1);
        }, 400);
    };

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortKey(key);
            setSortDir("asc");
        }
        setCurrentPage(1);
    };

    const renderSortIcon = (key) => {
        if (sortKey !== key) return null;
        return sortDir === "asc" ? (
            <PiSortAscending className="inline ml-1 text-sm text-brand-500" />
        ) : (
            <PiSortDescending className="inline ml-1 text-sm text-brand-500" />
        );
    };

    const handleEntriesChange = (e) => {
        setEntriesPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1);
    };

    const handleOpenAdd = () => {
        setAddFormData({
            name: "",
            username: "",
            email: "",
            password: "",
            targetValue: "",
        });
        setAddValidationError({});
        setShowAddPassword(false);
        openAddModal();
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setAddValidationError({});

        if (!addFormData.targetValue) {
            setAddValidationError({ [targetKey]: [`${targetLabel} wajib dipilih.`] });
            return;
        }

        setAddLoading(true);

        try {
            const payload = {
                name: addFormData.name,
                username: addFormData.username,
                email: addFormData.email,
                password: addFormData.password,
                [targetKey]: addFormData.targetValue,
            };

            const res = await axios.post(`${apiBase}${endpoints.create}`, payload);

            if (res.data?.success || res.status === 200 || res.status === 201) {
                showToast(res.data?.message || `${entityLabel} berhasil ditambahkan.`, "success");
                closeAddModal();
                fetchData(1, entriesPerPage, searchKey, sortKey, sortDir);
            }
        } catch (err) {
            console.error(`Error adding ${entityLabel}:`, err);
            if (err.response?.status === 422) {
                setAddValidationError(err.response?.data?.errors || {});
                showToast(
                    err.response?.data?.message || "Periksa kembali data yang dimasukkan.",
                    "error"
                );
            } else {
                showToast(err.response?.data?.message || `Gagal menambahkan ${entityLabel}.`, "error");
            }
        } finally {
            setAddLoading(false);
        }
    };

    const handleOpenEdit = (item) => {
        setEditFormData({
            id: item.id,
            name: item.name || "",
            username: item.username || "",
            email: item.email || "",
            password: "",
            targetValue: String(item[targetKey] ?? ""),
        });
        setEditValidationError({});
        setShowEditPassword(false);
        openEditModal();
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditValidationError({});

        if (!editFormData.targetValue) {
            setEditValidationError({ [targetKey]: [`${targetLabel} wajib dipilih.`] });
            return;
        }

        setEditLoading(true);

        try {
            const payload = {
                name: editFormData.name,
                username: editFormData.username,
                email: editFormData.email,
                [targetKey]: editFormData.targetValue,
            };

            if (editFormData.password && editFormData.password.trim() !== "") {
                payload.password = editFormData.password;
            }

            const res = await axios.post(
                `${apiBase}${endpoints.update(editFormData.id)}`,
                payload
            );

            if (res.data?.success || res.status === 200) {
                showToast(res.data?.message || `${entityLabel} berhasil diperbarui.`, "success");
                closeEditModal();
                fetchData(currentPage, entriesPerPage, searchKey, sortKey, sortDir);
            }
        } catch (err) {
            console.error(`Error updating ${entityLabel}:`, err);
            if (err.response?.status === 422) {
                setEditValidationError(err.response?.data?.errors || {});
                showToast(
                    err.response?.data?.message || "Periksa kembali data yang dimasukkan.",
                    "error"
                );
            } else {
                showToast(err.response?.data?.message || `Gagal memperbarui ${entityLabel}.`, "error");
            }
        } finally {
            setEditLoading(false);
        }
    };

    const handleOpenDelete = (item) => {
        setSelectedToDelete(item);
        openModalConf();
    };

    const handleDeleteConfirm = async () => {
        if (!selectedToDelete) return;
        setDeleteLoading(true);

        try {
            const res = await axios.delete(
                `${apiBase}${endpoints.destroy(selectedToDelete.id)}`
            );

            if (res.data?.success || res.status === 200) {
                showToast(res.data?.message || `${entityLabel} berhasil dihapus.`, "success");
                closeModalConf();
                setSelectedToDelete(null);
                fetchData(currentPage, entriesPerPage, searchKey, sortKey, sortDir);
            }
        } catch (err) {
            console.error(`Error deleting ${entityLabel}:`, err);
            showToast(err.response?.data?.message || `Gagal menghapus ${entityLabel}.`, "error");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleExport = async () => {
        setExportLoading(true);
        try {
            await downloadExcel({
                url: `${apiBase}${endpoints.export}`,
                filename: `Kredentials_${entityLabel.replace(/\s+/g, "_")}.xlsx`,
            });
            showToast(`Berhasil mengunduh data ${entityLabel}.`, "success");
        } catch (err) {
            console.error("Export error:", err);
            showToast(`Gagal mengekspor data ${entityLabel}.`, "error");
        } finally {
            setExportLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (generateLoading) return;

        const confirmed = window.confirm(
            `Generate akun ${entityLabel} untuk semua ${targetLabel.toLowerCase()} yang belum memiliki akun? Proses ini dapat memakan waktu.`
        );
        if (!confirmed) return;

        setGenerateLoading(true);
        try {
            const payload = isSekolah
                ? {}
                : {
                    data_desa: normalizedOptions.map((option) => ({
                        kode: option.value,
                        nama: option.label,
                    })),
                };

            const res = await axios.post(`${apiBase}${endpoints.generate}`, payload);
            const result = res.data || {};
            let message = result.message || `Generate akun ${entityLabel} selesai.`;

            if (typeof result.created !== "undefined") {
                message += ` (${result.created} dibuat, ${result.skipped ?? 0} dilewati)`;
            }

            showToast(message, "success");
            fetchData(1, entriesPerPage, searchKey, sortKey, sortDir);
        } catch (err) {
            console.error("Generate error:", err);
            showToast(err.response?.data?.message || `Gagal generate akun ${entityLabel}.`, "error");
        } finally {
            setGenerateLoading(false);
        }
    };

    const renderSkeletonRows = () => {
        return Array.from({ length: 5 }).map((_, i) => (
            <tr key={`skeleton-${i}`} className="animate-pulse border-b border-gray-100 dark:border-gray-800">
                <td className="px-4 py-4"><div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                <td className="px-4 py-4"><div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                <td className="px-4 py-4"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                <td className="px-4 py-4"><div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                <td className="px-4 py-4"><div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" /></td>
                <td className="px-4 py-4"><div className="h-5 w-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full" /></td>
                <td className="px-4 py-4 text-center"><div className="h-8 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg" /></td>
            </tr>
        ));
    };

    const renderPaginationButtons = () => {
        const buttons = [];
        const maxVisible = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage + 1 < maxVisible) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            buttons.push(
                <button
                    key="page-1"
                    onClick={() => setCurrentPage(1)}
                    className="h-9 w-9 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                    1
                </button>
            );
            if (startPage > 2) {
                buttons.push(
                    <span key="dots-start" className="px-1 text-gray-400">
                        ...
                    </span>
                );
            }
        }

        for (let p = startPage; p <= endPage; p++) {
            const isActive = p === currentPage;
            buttons.push(
                <button
                    key={`page-${p}`}
                    onClick={() => setCurrentPage(p)}
                    className={`h-9 w-9 rounded-lg text-xs font-semibold transition ${isActive
                        ? "bg-brand-500 text-white shadow-sm"
                        : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                >
                    {p}
                </button>
            );
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                buttons.push(
                    <span key="dots-end" className="px-1 text-gray-400">
                        ...
                    </span>
                );
            }
            buttons.push(
                <button
                    key={`page-${totalPages}`}
                    onClick={() => setCurrentPage(totalPages)}
                    className="h-9 w-9 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                    {totalPages}
                </button>
            );
        }

        return buttons;
    };

    const renderTargetOptions = () => {
        const list = [...normalizedOptions];

        // Pastikan nilai yang sedang diedit tetap muncul walau tidak ada di daftar opsi.
        const currentValue = editFormData.targetValue
            ? String(editFormData.targetValue)
            : "";
        if (currentValue && !list.some((option) => option.value === currentValue)) {
            const currentItem = data.find(
                (item) => String(item[targetKey]) === currentValue
            );
            list.push({
                value: currentValue,
                label: currentItem?.[targetNameKey] || currentValue,
            });
        }

        return list;
    };

    const addTargetOptions = normalizedOptions;
    const selectedAddTarget =
        addTargetOptions.find((option) => option.value === addFormData.targetValue) || null;

    const editTargetOptions = renderTargetOptions();
    const selectedEditTarget =
        editTargetOptions.find((option) => option.value === editFormData.targetValue) || null;

    return (
        <div className="w-full">
            <Toaster
                openToaster={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={() => setToast((prev) => ({ ...prev, open: false }))}
            />

            {/* Toolbar */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 pb-4">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 shrink-0">
                        <span>Tampilkan</span>
                        <select
                            value={entriesPerPage}
                            onChange={handleEntriesChange}
                            className="h-10 w-20 cursor-pointer rounded-xl border border-gray-200 bg-white pl-4 pr-8 py-2 text-sm font-semibold text-gray-700 shadow-sm focus:border-brand-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                        <span>data</span>
                    </div>

                    <div className="w-full sm:w-52 md:w-60 lg:w-64 min-w-[160px]">
                        <Search
                            value={searchInput}
                            onChange={handleSearchChange}
                            placeholder={`Cari nama, username, email, atau ${targetLabel.toLowerCase()}...`}
                            className="w-full"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                        type="button"
                        size="sm"
                        variant="primary"
                        onClick={handleOpenAdd}
                        startIcon={<PlusIcon className="h-4 w-4" />}
                        className="!bg-emerald-600 hover:!bg-emerald-700 shadow-xs !py-2 !px-3.5 text-xs sm:text-sm whitespace-nowrap shrink-0"
                    >
                        Tambah {entityLabel}
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleGenerate}
                        disabled={generateLoading}
                        startIcon={<RiRefreshLine className="text-base text-amber-600 dark:text-amber-400" />}
                        className="hover:!border-amber-500 hover:!text-amber-600 !py-2 !px-3.5 text-xs sm:text-sm whitespace-nowrap shadow-xs shrink-0"
                    >
                        {generateLoading ? <LoaderOnButton /> : "Generate"}
                    </Button>

                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleExport}
                        disabled={exportLoading}
                        startIcon={<RiDownloadLine className="text-base text-gray-600 dark:text-gray-400" />}
                        className="!py-2 !px-3.5 text-xs sm:text-sm whitespace-nowrap shadow-xs shrink-0"
                    >
                        {exportLoading ? <LoaderOnButton /> : "Export Data"}
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-theme-xs">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-4 py-3.5 w-16 text-center">
                                    No
                                </th>
                                <th
                                    scope="col"
                                    onClick={() => handleSort("name")}
                                    className="px-4 py-3.5 cursor-pointer select-none transition hover:text-gray-900 dark:hover:text-white"
                                >
                                    Nama {renderSortIcon("name")}
                                </th>
                                <th
                                    scope="col"
                                    onClick={() => handleSort("username")}
                                    className="px-4 py-3.5 cursor-pointer select-none transition hover:text-gray-900 dark:hover:text-white"
                                >
                                    Username {renderSortIcon("username")}
                                </th>
                                <th
                                    scope="col"
                                    onClick={() => handleSort("email")}
                                    className="px-4 py-3.5 cursor-pointer select-none transition hover:text-gray-900 dark:hover:text-white"
                                >
                                    Email {renderSortIcon("email")}
                                </th>
                                <th
                                    scope="col"
                                    onClick={() => handleSort(targetSortKey)}
                                    className="px-4 py-3.5 cursor-pointer select-none transition hover:text-gray-900 dark:hover:text-white"
                                >
                                    {targetLabel} {renderSortIcon(targetSortKey)}
                                </th>
                                <th scope="col" className="px-4 py-3.5 text-center">
                                    Role
                                </th>
                                <th scope="col" className="px-4 py-3.5 text-center w-28">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                renderSkeletonRows()
                            ) : data && data.length > 0 ? (
                                data.map((item, idx) => {
                                    const rowNumber = (currentPage - 1) * entriesPerPage + idx + 1;
                                    const targetName =
                                        item[targetNameKey] ||
                                        normalizedOptions.find(
                                            (option) => option.value === String(item[targetKey])
                                        )?.label ||
                                        item[targetKey] ||
                                        "-";

                                    return (
                                        <tr
                                            key={item.id || idx}
                                            className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                                        >
                                            <td className="px-4 py-3.5 text-center text-xs font-medium text-gray-500">
                                                {rowNumber}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 font-bold text-xs">
                                                        {item.name ? item.name.charAt(0).toUpperCase() : "A"}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-white/90">
                                                            {item.name}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 font-mono text-xs text-gray-700 dark:text-gray-300">
                                                <span className="rounded-md bg-gray-100 px-2 py-0.5 dark:bg-gray-800">
                                                    {item.username}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 text-xs">
                                                {item.email || "-"}
                                            </td>
                                            <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 text-xs">
                                                {targetName}
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <Badge variant="light" color={isSekolah ? "info" : "warning"} size="sm">
                                                    {entityLabel}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        title={`Edit ${entityLabel}`}
                                                        onClick={() => handleOpenEdit(item)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                                                    >
                                                        <TfiPencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title={`Hapus ${entityLabel}`}
                                                        onClick={() => handleOpenDelete(item)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400"
                                                    >
                                                        <FaRegTrashCan className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                            <RiShieldUserLine className="text-5xl mb-2 opacity-50" />
                                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                Tidak ada data {entityLabel}
                                            </p>
                                            <p className="text-xs mt-0.5">
                                                {searchKey
                                                    ? "Tidak ditemukan data yang cocok dengan kata kunci pencarian."
                                                    : `Belum ada akun ${entityLabel.toLowerCase()} terdaftar. Silakan tambahkan baru atau generate.`}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="flex flex-col gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Menampilkan{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {totalEntries > 0 ? (currentPage - 1) * entriesPerPage + 1 : 0}
                        </span>{" "}
                        sampai{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {Math.min(currentPage * entriesPerPage, totalEntries)}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {totalEntries}
                        </span>{" "}
                        entri
                    </p>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                            className="!px-3 !py-1.5 !text-xs"
                        >
                            Sebelumnya
                        </Button>

                        <div className="flex items-center gap-1">{renderPaginationButtons()}</div>

                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={currentPage === totalPages || totalPages === 0}
                            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                            className="!px-3 !py-1.5 !text-xs"
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal Tambah */}
            <DynamicModal
                className="max-w-[580px] m-4"
                isOpen={isOpenAdd}
                onClose={() => {
                    if (!addLoading) closeAddModal();
                }}
            >
                <div className="relative w-full max-w-[580px] overflow-hidden rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                    <div className="flex items-start gap-3.5 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <RiUserAddLine className="text-2xl" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                                Tambah {entityLabel}
                            </h4>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Masukkan identitas akun {entityLabel.toLowerCase()} baru untuk mengakses sistem.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
                        <div>
                            <Label htmlFor="add_name">Nama Lengkap <span className="text-red-500">*</span></Label>
                            <Input
                                id="add_name"
                                name="name"
                                placeholder={`Contoh: Operator ${targetLabel}`}
                                value={addFormData.name}
                                onChange={(e) =>
                                    setAddFormData({ ...addFormData, name: e.target.value })
                                }
                                error={!!addValidationError.name}
                            />
                            {addValidationError.name && (
                                <InputError message={addValidationError.name[0] || addValidationError.name} />
                            )}
                        </div>

                        <div>
                            <Label htmlFor="add_username">Username <span className="text-red-500">*</span></Label>
                            <Input
                                id="add_username"
                                name="username"
                                placeholder="Contoh: operatorsekolah"
                                value={addFormData.username}
                                onChange={(e) =>
                                    setAddFormData({ ...addFormData, username: e.target.value })
                                }
                                error={!!addValidationError.username}
                            />
                            {addValidationError.username && (
                                <InputError message={addValidationError.username[0] || addValidationError.username} />
                            )}
                        </div>

                        <div>
                            <Label htmlFor="add_email">Email <span className="text-red-500">*</span></Label>
                            <Input
                                id="add_email"
                                name="email"
                                type="email"
                                placeholder="Contoh: operator@example.com"
                                value={addFormData.email}
                                onChange={(e) =>
                                    setAddFormData({ ...addFormData, email: e.target.value })
                                }
                                error={!!addValidationError.email}
                            />
                            {addValidationError.email && (
                                <InputError message={addValidationError.email[0] || addValidationError.email} />
                            )}
                        </div>

                        <div>
                            <Label htmlFor="add_password">Password Awal <span className="text-red-500">*</span></Label>
                            <div className="relative">
                                <Input
                                    id="add_password"
                                    name="password"
                                    type={showAddPassword ? "text" : "password"}
                                    placeholder="Minimal 6 karakter"
                                    value={addFormData.password}
                                    onChange={(e) =>
                                        setAddFormData({ ...addFormData, password: e.target.value })
                                    }
                                    error={!!addValidationError.password}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowAddPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    {showAddPassword ? <RiEyeOffLine className="text-lg" /> : <RiEyeLine className="text-lg" />}
                                </button>
                            </div>
                            {addValidationError.password && (
                                <InputError message={addValidationError.password[0] || addValidationError.password} />
                            )}
                        </div>

                        <div>
                            <Autocomplete
                                id="add_target"
                                options={addTargetOptions}
                                value={selectedAddTarget}
                                onChange={(event, newValue) =>
                                    setAddFormData({
                                        ...addFormData,
                                        targetValue: newValue ? newValue.value : "",
                                    })
                                }
                                getOptionLabel={(option) => option.label || ""}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                noOptionsText={`${targetLabel} tidak ditemukan`}
                                autoHighlight
                                openOnFocus
                                sx={{ width: "100%" }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={`${targetLabel} *`}
                                        placeholder={`Cari ${targetLabel.toLowerCase()}...`}
                                        error={!!addValidationError[targetKey]}
                                        size="small"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "8px",
                                                minHeight: "44px",
                                            },
                                            "& .MuiInputBase-input": { fontSize: "0.875rem" },
                                            "& .MuiInputLabel-root": { fontSize: "0.875rem" },
                                        }}
                                    />
                                )}
                            />
                            {addValidationError[targetKey] && (
                                <InputError message={addValidationError[targetKey][0] || addValidationError[targetKey]} />
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={closeAddModal}
                            >
                                Batal
                            </Button>
                            <Button
                                disabled={addLoading}
                                className="relative !bg-emerald-600 hover:!bg-emerald-700"
                                size="sm"
                                type="submit"
                            >
                                {addLoading ? <LoaderOnButton /> : `Simpan ${entityLabel}`}
                            </Button>
                        </div>
                    </form>
                </div>
            </DynamicModal>

            {/* Modal Edit */}
            <DynamicModal
                className="max-w-[580px] m-4"
                isOpen={isOpenEdit}
                onClose={() => {
                    if (!editLoading) closeEditModal();
                }}
            >
                <div className="relative w-full max-w-[580px] overflow-hidden rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                    <div className="flex items-start gap-3.5 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                            <TfiPencil className="text-xl" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                                Edit {entityLabel}
                            </h4>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Perbarui data akun atau reset password jika diperlukan.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
                        <div>
                            <Label htmlFor="edit_name">Nama Lengkap <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit_name"
                                name="name"
                                placeholder="Nama Lengkap"
                                value={editFormData.name}
                                onChange={(e) =>
                                    setEditFormData({ ...editFormData, name: e.target.value })
                                }
                                error={!!editValidationError.name}
                            />
                            {editValidationError.name && (
                                <InputError message={editValidationError.name[0] || editValidationError.name} />
                            )}
                        </div>

                        <div>
                            <Label htmlFor="edit_username">Username <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit_username"
                                name="username"
                                placeholder="Username"
                                value={editFormData.username}
                                onChange={(e) =>
                                    setEditFormData({ ...editFormData, username: e.target.value })
                                }
                                error={!!editValidationError.username}
                            />
                            {editValidationError.username && (
                                <InputError message={editValidationError.username[0] || editValidationError.username} />
                            )}
                        </div>

                        <div>
                            <Label htmlFor="edit_email">Email <span className="text-red-500">*</span></Label>
                            <Input
                                id="edit_email"
                                name="email"
                                type="email"
                                placeholder="Email"
                                value={editFormData.email}
                                onChange={(e) =>
                                    setEditFormData({ ...editFormData, email: e.target.value })
                                }
                                error={!!editValidationError.email}
                            />
                            {editValidationError.email && (
                                <InputError message={editValidationError.email[0] || editValidationError.email} />
                            )}
                        </div>

                        <div>
                            <Autocomplete
                                id="edit_target"
                                options={editTargetOptions}
                                value={selectedEditTarget}
                                onChange={(event, newValue) =>
                                    setEditFormData({
                                        ...editFormData,
                                        targetValue: newValue ? newValue.value : "",
                                    })
                                }
                                getOptionLabel={(option) => option.label || ""}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                                noOptionsText={`${targetLabel} tidak ditemukan`}
                                autoHighlight
                                openOnFocus
                                sx={{ width: "100%" }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label={`${targetLabel} *`}
                                        placeholder={`Cari ${targetLabel.toLowerCase()}...`}
                                        error={!!editValidationError[targetKey]}
                                        size="small"
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "8px",
                                                minHeight: "44px",
                                            },
                                            "& .MuiInputBase-input": { fontSize: "0.875rem" },
                                            "& .MuiInputLabel-root": { fontSize: "0.875rem" },
                                        }}
                                    />
                                )}
                            />
                            {editValidationError[targetKey] && (
                                <InputError message={editValidationError[targetKey][0] || editValidationError[targetKey]} />
                            )}
                        </div>

                        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                            <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-300">
                                <RiEyeLine className="text-lg" />
                                <Label htmlFor="edit_password" className="!mb-0 font-bold text-amber-900 dark:text-amber-200">
                                    Reset Password (Opsional)
                                </Label>
                            </div>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-2 leading-relaxed">
                                Isi password baru (min. 6 karakter) hanya jika ingin mereset password akun. Biarkan kosong jika tidak ingin mengubah password.
                            </p>
                            <div className="relative">
                                <Input
                                    id="edit_password"
                                    name="password"
                                    type={showEditPassword ? "text" : "password"}
                                    placeholder="Kosongkan jika tidak ingin mereset password"
                                    value={editFormData.password}
                                    onChange={(e) =>
                                        setEditFormData({ ...editFormData, password: e.target.value })
                                    }
                                    error={!!editValidationError.password}
                                    className="pr-10 !bg-white dark:!bg-gray-900"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowEditPassword((prev) => !prev)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    {showEditPassword ? <RiEyeOffLine className="text-lg" /> : <RiEyeLine className="text-lg" />}
                                </button>
                            </div>
                            {editValidationError.password && (
                                <div className="mt-1">
                                    <InputError message={editValidationError.password[0] || editValidationError.password} />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                            <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={closeEditModal}
                            >
                                Batal
                            </Button>
                            <Button
                                disabled={editLoading}
                                className="relative !bg-blue-600 hover:!bg-blue-700"
                                size="sm"
                                type="submit"
                            >
                                {editLoading ? <LoaderOnButton /> : "Simpan Perubahan"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DynamicModal>

            {/* Modal Konfirmasi Hapus */}
            <DynamicModalConf
                className="max-w-[440px] m-4"
                showCloseButton={false}
                isOpen={isOpenConf}
                onClose={() => {
                    if (!deleteLoading) closeModalConf();
                }}
            >
                <div className="relative w-full max-w-[440px] rounded-3xl bg-white p-6 dark:bg-gray-900">
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-3 dark:border-gray-800">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                            <FaRegTrashCan className="text-lg" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-gray-800 dark:text-white/90">
                                Konfirmasi Hapus
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                    </div>

                    <div className="py-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        Apakah Anda yakin ingin menghapus akun {entityLabel.toLowerCase()}{" "}
                        <span className="font-bold text-gray-800 dark:text-white">
                            {selectedToDelete?.name}
                        </span>{" "}
                        (Username: {selectedToDelete?.username})?
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={closeModalConf}
                            disabled={deleteLoading}
                        >
                            Batal
                        </Button>
                        <Button
                            size="sm"
                            type="button"
                            disabled={deleteLoading}
                            onClick={handleDeleteConfirm}
                            className="!bg-red-600 hover:!bg-red-700 text-white"
                        >
                            {deleteLoading ? <LoaderOnButton /> : "Ya, Hapus"}
                        </Button>
                    </div>
                </div>
            </DynamicModalConf>
        </div>
    );
};

export default OperatorAccountTable;
