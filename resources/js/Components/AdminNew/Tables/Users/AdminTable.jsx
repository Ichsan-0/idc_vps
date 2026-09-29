import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
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
import { PlusIcon } from "@heroicons/react/24/outline";
import {
    RiEyeLine,
    RiEyeOffLine,
    RiUserAddLine,
    RiLockPasswordLine,
    RiShieldUserLine,
} from "react-icons/ri";
import { TfiPencil } from "react-icons/tfi";
import { FaRegTrashCan } from "react-icons/fa6";
import { PiSortAscending, PiSortDescending } from "react-icons/pi";

const AdminTable = ({ base_url }) => {
    const apiBase = base_url || config.base_url || window.location.origin;
    const { auth } = usePage().props;
    const currentUserId = auth?.user?.id;

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

    // Add Form state
    const [addFormData, setAddFormData] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    });
    const [addValidationError, setAddValidationError] = useState({});
    const [addLoading, setAddLoading] = useState(false);
    const [showAddPassword, setShowAddPassword] = useState(false);

    // Edit Form state
    const [editFormData, setEditFormData] = useState({
        id: "",
        name: "",
        username: "",
        email: "",
        password: "",
    });
    const [editValidationError, setEditValidationError] = useState({});
    const [editLoading, setEditLoading] = useState(false);
    const [showEditPassword, setShowEditPassword] = useState(false);

    // Delete state
    const [selectedToDelete, setSelectedToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Toast state
    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    const showToast = (message, severity = "success") => {
        setToast({
            open: true,
            message,
            severity,
        });
    };

    // Debounce timer ref for search
    const searchDebounceRef = useRef(null);

    // Fetch Admin list
    const fetchData = useCallback(
        async (
            page = currentPage,
            entries = entriesPerPage,
            search = searchKey,
            sort = sortKey,
            dir = sortDir
        ) => {
            setLoading(true);
            try {
                const response = await axios.get(
                    `${apiBase}/api/admin/users/admin`,
                    {
                        params: {
                            page,
                            entries_per_page: entries,
                            search_key: search,
                            sort_key: sort,
                            sort_dir: dir,
                        },
                    }
                );

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
                console.error("Gagal memuat data admin:", err);
                showToast(
                    err.response?.data?.message || "Gagal memuat data admin.",
                    "error"
                );
            } finally {
                setLoading(false);
            }
        },
        [apiBase, currentPage, entriesPerPage, searchKey, sortKey, sortDir]
    );

    // Initial load and dependency triggers
    useEffect(() => {
        fetchData(currentPage, entriesPerPage, searchKey, sortKey, sortDir);
    }, [currentPage, entriesPerPage, searchKey, sortKey, sortDir]);

    // Live search input with debounce
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

    // Sort toggle
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

    // Entries per page change
    const handleEntriesChange = (e) => {
        setEntriesPerPage(parseInt(e.target.value, 10));
        setCurrentPage(1);
    };

    // Open Add Modal
    const handleOpenAdd = () => {
        setAddFormData({
            name: "",
            username: "",
            email: "",
            password: "",
        });
        setAddValidationError({});
        setShowAddPassword(false);
        openAddModal();
    };

    // Submit Add Admin
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setAddLoading(true);
        setAddValidationError({});

        try {
            const payload = {
                name: addFormData.name,
                username: addFormData.username,
                email: addFormData.email,
                password: addFormData.password,
            };

            const res = await axios.post(
                `${apiBase}/api/admin/users/admin`,
                payload
            );

            if (res.data?.success || res.status === 200 || res.status === 201) {
                showToast(
                    res.data?.message || "Admin baru berhasil ditambahkan.",
                    "success"
                );
                closeAddModal();
                fetchData(1, entriesPerPage, searchKey, sortKey, sortDir);
            }
        } catch (err) {
            console.error("Error adding admin:", err);
            if (err.response?.status === 422) {
                setAddValidationError(err.response?.data?.errors || {});
                showToast(
                    err.response?.data?.message ||
                        "Periksa kembali data yang dimasukkan.",
                    "error"
                );
            } else {
                showToast(
                    err.response?.data?.message || "Gagal menambahkan admin.",
                    "error"
                );
            }
        } finally {
            setAddLoading(false);
        }
    };

    // Open Edit Modal
    const handleOpenEdit = (admin) => {
        setEditFormData({
            id: admin.id,
            name: admin.name || "",
            username: admin.username || "",
            email: admin.email || "",
            password: "", // Always start empty for optional reset
        });
        setEditValidationError({});
        setShowEditPassword(false);
        openEditModal();
    };

    // Submit Edit Admin
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        setEditValidationError({});

        try {
            const payload = {
                name: editFormData.name,
                username: editFormData.username,
                email: editFormData.email,
            };

            // Only append password if filled
            if (editFormData.password && editFormData.password.trim() !== "") {
                payload.password = editFormData.password;
            }

            const res = await axios.post(
                `${apiBase}/api/admin/users/admin/update/${editFormData.id}`,
                payload
            );

            if (res.data?.success || res.status === 200) {
                showToast(
                    res.data?.message || "Data Admin berhasil diperbarui.",
                    "success"
                );
                closeEditModal();
                fetchData(
                    currentPage,
                    entriesPerPage,
                    searchKey,
                    sortKey,
                    sortDir
                );
            }
        } catch (err) {
            console.error("Error updating admin:", err);
            if (err.response?.status === 422) {
                setEditValidationError(err.response?.data?.errors || {});
                showToast(
                    err.response?.data?.message ||
                        "Periksa kembali data yang dimasukkan.",
                    "error"
                );
            } else {
                showToast(
                    err.response?.data?.message || "Gagal memperbarui admin.",
                    "error"
                );
            }
        } finally {
            setEditLoading(false);
        }
    };

    // Open Delete Confirmation
    const handleOpenDelete = (admin) => {
        if (currentUserId && admin.id === currentUserId) {
            showToast(
                "Anda tidak dapat menghapus akun admin yang sedang login.",
                "error"
            );
            return;
        }
        setSelectedToDelete(admin);
        openModalConf();
    };

    // Confirm Delete Admin
    const handleDeleteConfirm = async () => {
        if (!selectedToDelete) return;
        setDeleteLoading(true);

        try {
            const res = await axios.delete(
                `${apiBase}/api/admin/users/admin/${selectedToDelete.id}`
            );

            if (res.data?.success || res.status === 200) {
                showToast(
                    res.data?.message || "Admin berhasil dihapus.",
                    "success"
                );
                closeModalConf();
                setSelectedToDelete(null);
                fetchData(
                    currentPage,
                    entriesPerPage,
                    searchKey,
                    sortKey,
                    sortDir
                );
            }
        } catch (err) {
            console.error("Error deleting admin:", err);
            showToast(
                err.response?.data?.message || "Gagal menghapus admin.",
                "error"
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    // Render skeleton rows while loading
    const renderSkeletonRows = () => {
        return Array.from({ length: 5 }).map((_, i) => (
            <tr
                key={`skeleton-${i}`}
                className="animate-pulse border-b border-gray-100 dark:border-gray-800"
            >
                <td className="px-4 py-4">
                    <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
                <td className="px-4 py-4">
                    <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
                <td className="px-4 py-4">
                    <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
                <td className="px-4 py-4">
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                </td>
                <td className="px-4 py-4">
                    <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </td>
                <td className="px-4 py-4 text-center">
                    <div className="h-8 w-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </td>
            </tr>
        ));
    };

    // Render pagination buttons
    const renderPaginationButtons = () => {
        const pages = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);
            if (currentPage > 3) {
                pages.push("...");
            }
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                if (!pages.includes(i)) pages.push(i);
            }
            if (currentPage < totalPages - 2) {
                pages.push("...");
            }
            if (!pages.includes(totalPages)) pages.push(totalPages);
        }

        return pages.map((page, idx) => {
            if (page === "...") {
                return (
                    <span
                        key={`ellipsis-${idx}`}
                        className="px-2 py-1 text-xs text-gray-400 select-none"
                    >
                        ...
                    </span>
                );
            }
            const isActive = page === currentPage;
            return (
                <button
                    key={`page-${page}`}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold transition ${
                        isActive
                            ? "bg-brand-500 text-white shadow-xs"
                            : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                >
                    {page}
                </button>
            );
        });
    };

    return (
        <div className="space-y-4">
            {/* Toast Alert */}
            <Toaster
                openToaster={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={() => setToast({ ...toast, open: false })}
            />

            {/* Toolbar: Entries, Search, Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    {/* Entries selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            Tampilkan:
                        </span>
                        <select
                            value={entriesPerPage}
                            onChange={handleEntriesChange}
                            className="rounded-xl border border-gray-200 bg-white py-1.5 px-3 text-xs font-medium text-gray-700 shadow-theme-xs transition focus:border-brand-500 focus:outline-hidden dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            data
                        </span>
                    </div>

                    {/* Search Field */}
                    <div className="w-full sm:w-64">
                        <Search
                            value={searchInput}
                            onChange={handleSearchChange}
                            placeholder="Cari admin (nama, username, email)..."
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Actions: Tambah Admin */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Button
                        size="sm"
                        variant="primary"
                        onClick={handleOpenAdd}
                        startIcon={<PlusIcon className="h-4 w-4" />}
                        className="!bg-emerald-600 hover:!bg-emerald-700 shadow-xs !py-2 !px-3.5 text-xs sm:text-sm whitespace-nowrap shrink-0"
                    >
                        Tambah Admin
                    </Button>
                </div>
            </div>

            {/* Main Table */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 shadow-theme-xs">
                <div className="w-full overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                        <thead className="border-b border-gray-100 bg-gray-50/80 text-xs font-semibold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-800/60 dark:text-gray-400">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-4 py-3.5 w-16 text-center"
                                >
                                    No
                                </th>
                                <th
                                    scope="col"
                                    onClick={() => handleSort("name")}
                                    className="px-4 py-3.5 cursor-pointer select-none transition hover:text-gray-900 dark:hover:text-white"
                                >
                                    Nama Admin {renderSortIcon("name")}
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
                                    className="px-4 py-3.5 text-center"
                                >
                                    Role
                                </th>
                                <th
                                    scope="col"
                                    className="px-4 py-3.5 text-center w-28"
                                >
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading ? (
                                renderSkeletonRows()
                            ) : data && data.length > 0 ? (
                                data.map((item, idx) => {
                                    const rowNumber =
                                        (currentPage - 1) * entriesPerPage +
                                        idx +
                                        1;
                                    const isCurrentLoggedIn =
                                        currentUserId &&
                                        item.id === currentUserId;

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
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400 font-bold text-xs">
                                                        {item.name
                                                            ? item.name
                                                                  .charAt(0)
                                                                  .toUpperCase()
                                                            : "A"}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-800 dark:text-white/90">
                                                            {item.name}
                                                        </p>
                                                        {isCurrentLoggedIn && (
                                                            <span className="text-[10px] text-brand-600 dark:text-brand-400 font-medium">
                                                                (Akun Anda saat
                                                                ini)
                                                            </span>
                                                        )}
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
                                            <td className="px-4 py-3.5 text-center">
                                                <Badge
                                                    variant="light"
                                                    color="primary"
                                                    size="sm"
                                                >
                                                    Admin
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3.5 text-center">
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        title="Edit Data / Reset Password"
                                                        onClick={() =>
                                                            handleOpenEdit(item)
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-blue-400"
                                                    >
                                                        <TfiPencil className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title={
                                                            isCurrentLoggedIn
                                                                ? "Akun Anda saat ini (tidak dapat dihapus)"
                                                                : "Hapus Admin"
                                                        }
                                                        disabled={
                                                            isCurrentLoggedIn
                                                        }
                                                        onClick={() =>
                                                            handleOpenDelete(
                                                                item
                                                            )
                                                        }
                                                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                                                            isCurrentLoggedIn
                                                                ? "cursor-not-allowed opacity-40 border-gray-200 text-gray-400"
                                                                : "border-gray-200 text-gray-600 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400"
                                                        }`}
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
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                                            <RiShieldUserLine className="text-5xl mb-2 opacity-50" />
                                            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                                                Tidak ada data Admin
                                            </p>
                                            <p className="text-xs mt-0.5">
                                                {searchKey
                                                    ? "Tidak ditemukan admin yang cocok dengan kata kunci pencarian."
                                                    : "Belum ada akun admin terdaftar. Silakan tambahkan admin baru."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Footer / Pagination */}
                <div className="flex flex-col gap-3 border-t border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Menampilkan{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {totalEntries > 0
                                ? (currentPage - 1) * entriesPerPage + 1
                                : 0}
                        </span>{" "}
                        sampai{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {Math.min(
                                currentPage * entriesPerPage,
                                totalEntries
                            )}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold text-gray-700 dark:text-gray-200">
                            {totalEntries}
                        </span>{" "}
                        entri
                    </p>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <Button
                            size="sm"
                            variant="outline"
                            disabled={currentPage === 1}
                            onClick={() =>
                                setCurrentPage((prev) => Math.max(1, prev - 1))
                            }
                            className="!px-3 !py-1.5 !text-xs"
                        >
                            Sebelumnya
                        </Button>

                        <div className="flex items-center gap-1">
                            {renderPaginationButtons()}
                        </div>

                        <Button
                            size="sm"
                            variant="outline"
                            disabled={
                                currentPage === totalPages || totalPages === 0
                            }
                            onClick={() =>
                                setCurrentPage((prev) =>
                                    Math.min(totalPages, prev + 1)
                                )
                            }
                            className="!px-3 !py-1.5 !text-xs"
                        >
                            Berikutnya
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal Tambah Admin */}
            <DynamicModal
                className="max-w-[540px] m-4"
                isOpen={isOpenAdd}
                onClose={() => {
                    if (!addLoading) closeAddModal();
                }}
            >
                <div className="relative w-full max-w-[540px] overflow-hidden rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                    {/* Header */}
                    <div className="flex items-start gap-3.5 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                            <RiUserAddLine className="text-2xl" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                                Tambah Admin Baru
                            </h4>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Masukkan data identitas dan kredensial untuk akun
                                admin baru.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleAddSubmit} className="mt-5 space-y-4">
                        {/* Nama */}
                        <div>
                            <Label htmlFor="add_name">
                                Nama Lengkap{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="add_name"
                                name="name"
                                placeholder="Contoh: Muhammad Ichsan, S.Kom"
                                value={addFormData.name}
                                onChange={(e) =>
                                    setAddFormData({
                                        ...addFormData,
                                        name: e.target.value,
                                    })
                                }
                                error={!!addValidationError.name}
                            />
                            {addValidationError.name && (
                                <InputError
                                    message={
                                        addValidationError.name[0] ||
                                        addValidationError.name
                                    }
                                />
                            )}
                        </div>

                        {/* Username */}
                        <div>
                            <Label htmlFor="add_username">
                                Username <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="add_username"
                                name="username"
                                placeholder="Contoh: ichsan_admin"
                                value={addFormData.username}
                                onChange={(e) =>
                                    setAddFormData({
                                        ...addFormData,
                                        username: e.target.value,
                                    })
                                }
                                error={!!addValidationError.username}
                            />
                            {addValidationError.username && (
                                <InputError
                                    message={
                                        addValidationError.username[0] ||
                                        addValidationError.username
                                    }
                                />
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <Label htmlFor="add_email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="add_email"
                                name="email"
                                type="email"
                                placeholder="Contoh: admin@uin-ar-raniry.ac.id"
                                value={addFormData.email}
                                onChange={(e) =>
                                    setAddFormData({
                                        ...addFormData,
                                        email: e.target.value,
                                    })
                                }
                                error={!!addValidationError.email}
                            />
                            {addValidationError.email && (
                                <InputError
                                    message={
                                        addValidationError.email[0] ||
                                        addValidationError.email
                                    }
                                />
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <Label htmlFor="add_password">
                                Password <span className="text-red-500">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    id="add_password"
                                    name="password"
                                    type={showAddPassword ? "text" : "password"}
                                    placeholder="Minimal 6 karakter"
                                    value={addFormData.password}
                                    onChange={(e) =>
                                        setAddFormData({
                                            ...addFormData,
                                            password: e.target.value,
                                        })
                                    }
                                    error={!!addValidationError.password}
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowAddPassword((prev) => !prev)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    {showAddPassword ? (
                                        <RiEyeOffLine className="text-lg" />
                                    ) : (
                                        <RiEyeLine className="text-lg" />
                                    )}
                                </button>
                            </div>
                            {addValidationError.password && (
                                <InputError
                                    message={
                                        addValidationError.password[0] ||
                                        addValidationError.password
                                    }
                                />
                            )}
                        </div>

                        {/* Modal Actions */}
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
                                {addLoading ? (
                                    <LoaderOnButton />
                                ) : (
                                    "Simpan Admin"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DynamicModal>

            {/* Modal Edit Admin & Reset Password */}
            <DynamicModal
                className="max-w-[540px] m-4"
                isOpen={isOpenEdit}
                onClose={() => {
                    if (!editLoading) closeEditModal();
                }}
            >
                <div className="relative w-full max-w-[540px] overflow-hidden rounded-3xl bg-white p-6 dark:bg-gray-900 lg:p-8">
                    {/* Header */}
                    <div className="flex items-start gap-3.5 border-b border-gray-100 pb-4 dark:border-gray-800">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                            <TfiPencil className="text-xl" />
                        </div>
                        <div>
                            <h4 className="text-xl font-bold text-gray-800 dark:text-white/90">
                                Edit Data Admin
                            </h4>
                            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                                Perbarui informasi akun admin atau atur ulang
                                password jika diperlukan.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleEditSubmit}
                        className="mt-5 space-y-4"
                    >
                        {/* Nama */}
                        <div>
                            <Label htmlFor="edit_name">
                                Nama Lengkap{" "}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit_name"
                                name="name"
                                placeholder="Nama Lengkap Admin"
                                value={editFormData.name}
                                onChange={(e) =>
                                    setEditFormData({
                                        ...editFormData,
                                        name: e.target.value,
                                    })
                                }
                                error={!!editValidationError.name}
                            />
                            {editValidationError.name && (
                                <InputError
                                    message={
                                        editValidationError.name[0] ||
                                        editValidationError.name
                                    }
                                />
                            )}
                        </div>

                        {/* Username */}
                        <div>
                            <Label htmlFor="edit_username">
                                Username <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit_username"
                                name="username"
                                placeholder="Username Admin"
                                value={editFormData.username}
                                onChange={(e) =>
                                    setEditFormData({
                                        ...editFormData,
                                        username: e.target.value,
                                    })
                                }
                                error={!!editValidationError.username}
                            />
                            {editValidationError.username && (
                                <InputError
                                    message={
                                        editValidationError.username[0] ||
                                        editValidationError.username
                                    }
                                />
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <Label htmlFor="edit_email">
                                Email <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="edit_email"
                                name="email"
                                type="email"
                                placeholder="Email Admin"
                                value={editFormData.email}
                                onChange={(e) =>
                                    setEditFormData({
                                        ...editFormData,
                                        email: e.target.value,
                                    })
                                }
                                error={!!editValidationError.email}
                            />
                            {editValidationError.email && (
                                <InputError
                                    message={
                                        editValidationError.email[0] ||
                                        editValidationError.email
                                    }
                                />
                            )}
                        </div>

                        {/* Reset Password Form (Optional) */}
                        <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                            <div className="flex items-center gap-2 mb-2 text-amber-800 dark:text-amber-300">
                                <RiLockPasswordLine className="text-lg" />
                                <Label
                                    htmlFor="edit_password"
                                    className="!mb-0 font-bold text-amber-900 dark:text-amber-200"
                                >
                                    Reset Password (Opsional)
                                </Label>
                            </div>
                            <p className="text-[11px] text-amber-700 dark:text-amber-400 mb-2 leading-relaxed">
                                Form ini sengaja dikosongkan. Isi password baru
                                (min. 6 karakter) hanya jika Anda ingin mereset
                                password admin ini. Biarkan kosong jika tidak
                                ingin mengubah password.
                            </p>
                            <div className="relative">
                                <Input
                                    id="edit_password"
                                    name="password"
                                    type={
                                        showEditPassword ? "text" : "password"
                                    }
                                    placeholder="Kosongkan jika tidak ingin mereset password"
                                    value={editFormData.password}
                                    onChange={(e) =>
                                        setEditFormData({
                                            ...editFormData,
                                            password: e.target.value,
                                        })
                                    }
                                    error={!!editValidationError.password}
                                    className="pr-10 !bg-white dark:!bg-gray-900"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowEditPassword((prev) => !prev)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                >
                                    {showEditPassword ? (
                                        <RiEyeOffLine className="text-lg" />
                                    ) : (
                                        <RiEyeLine className="text-lg" />
                                    )}
                                </button>
                            </div>
                            {editValidationError.password && (
                                <div className="mt-1">
                                    <InputError
                                        message={
                                            editValidationError.password[0] ||
                                            editValidationError.password
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        {/* Modal Actions */}
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
                                {editLoading ? (
                                    <LoaderOnButton />
                                ) : (
                                    "Simpan Perubahan"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </DynamicModal>

            {/* Modal Konfirmasi Hapus Admin (Alert) */}
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
                                Konfirmasi Hapus Admin
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                    </div>

                    <div className="py-4 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                        Apakah Anda yakin ingin menghapus akun admin{" "}
                        <span className="font-bold text-gray-800 dark:text-white">
                            {selectedToDelete?.name}
                        </span>{" "}
                        (Username: {selectedToDelete?.username})?
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <Button
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

export default AdminTable;
