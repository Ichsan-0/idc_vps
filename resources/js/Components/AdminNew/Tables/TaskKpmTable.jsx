import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { usePage } from "@inertiajs/react";
import {
    CalendarDays,
    Eye,
    FileText,
    Link2,
    Lock,
    Plus,
    RefreshCw,
    Save,
    Search,
    Trash2,
    X,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import DynamicModal from "@/Components/DynamicModal";
import DynamicModalConf from "@/Components/DynamicModalConf";
import Toaster from "@/Components/Toaster";

dayjs.locale("id");

const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

const TipeBadge = ({ tipe }) => {
    if (!tipe) {
        return <span className="text-xs text-slate-400">-</span>;
    }

    const isLink = String(tipe).toLowerCase().startsWith("link");

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                isLink
                    ? "bg-blue-50 text-blue-700 ring-blue-200"
                    : "bg-violet-50 text-violet-700 ring-violet-200"
            }`}
        >
            {isLink ? (
                <Link2 className="h-3 w-3" />
            ) : (
                <FileText className="h-3 w-3" />
            )}
            {tipe}
        </span>
    );
};

export default function TaskKpmTable({ base_url = "", flash }) {
    const { auth } = usePage().props;
    const isSuperAdmin = !!auth?.user?.is_superadmin;

    const [data, setData] = useState({
        data: [],
        total: 0,
        from: 0,
        to: 0,
        current_page: 1,
        last_page: 1,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchKey, setSearchKey] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [modalMode, setModalMode] = useState(null);
    const [activeTask, setActiveTask] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        tenggat: null,
        tipe: "File",
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);
    const [toast, setToast] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    useEffect(() => {
        if (!flash?.message) return;

        const message =
            typeof flash.message === "string"
                ? flash.message
                : flash.message.success || flash.message.error;

        if (message) {
            setToast({
                open: true,
                message,
                severity: flash.message.success ? "success" : "error",
            });
        }
    }, [flash]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchKey(searchInput.trim());
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${base_url}/api/admin/classroom-kpm/query`,
                {
                    params: {
                        page: currentPage,
                        search_key: searchKey,
                    },
                }
            );

            setData({
                data: response.data?.data ?? [],
                total: response.data?.total ?? 0,
                from: response.data?.from ?? 0,
                to: response.data?.to ?? 0,
                current_page: response.data?.current_page ?? 1,
                last_page: response.data?.last_page ?? 1,
            });
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message || "Data tugas gagal dimuat."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, searchKey]);

    const openCreateModal = () => {
        setModalMode("create");
        setActiveTask(null);
        setFormData({ name: "", tenggat: null, tipe: "File" });
        setFormError(null);
    };

    const openEditModal = (item) => {
        setModalMode("edit");
        setActiveTask(item);
        setFormData({
            name: item.name ?? "",
            tenggat: item.tenggat ? dayjs(item.tenggat) : null,
            tipe: item.tipe || "File",
        });
        setFormError(null);
    };

    const closeFormModal = () => {
        if (formLoading) return;
        setModalMode(null);
        setActiveTask(null);
        setFormError(null);
    };

    const handleSubmitTask = async (event) => {
        event.preventDefault();

        const name = formData.name.trim();

        if (!name) {
            setFormError("Nama tugas wajib diisi.");
            return;
        }

        if (!formData.tenggat || !formData.tenggat.isValid()) {
            setFormError("Tenggat tugas wajib diisi.");
            return;
        }

        const isCreate = modalMode === "create";

        setFormLoading(true);
        setFormError(null);

        try {
            const payload = new FormData();
            payload.append("name", name);
            payload.append("tenggat", formData.tenggat.format("YYYY-MM-DD"));
            payload.append("tipe", formData.tipe);

            const url = isCreate
                ? `${base_url}/api/student/classroom/task`
                : `${base_url}/api/student/classroom/task/${activeTask.id}`;

            await axios.post(url, payload);

            setModalMode(null);
            setActiveTask(null);
            setToast({
                open: true,
                message: isCreate
                    ? "Tugas berhasil ditambahkan."
                    : "Tugas berhasil diperbarui.",
                severity: "success",
            });
            fetchData();
        } catch (err) {
            setFormError(
                err.response?.data?.message || "Gagal menyimpan tugas."
            );
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteFromModal = () => {
        const task = activeTask;
        setModalMode(null);
        setActiveTask(null);
        setDeleteTarget(task);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleteLoading(true);

        try {
            await axios.delete(
                `${base_url}/api/admin/classroom-kpm/task/${deleteTarget.id}`
            );
            setDeleteTarget(null);
            setToast({
                open: true,
                message: "Tugas berhasil dihapus.",
                severity: "success",
            });

            if (data.data.length === 1 && currentPage > 1) {
                setCurrentPage((page) => page - 1);
            } else {
                fetchData();
            }
        } catch (err) {
            setToast({
                open: true,
                message:
                    err.response?.data?.message || "Gagal menghapus tugas.",
                severity: "error",
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const pageNumbers = useMemo(() => {
        const lastPage = data.last_page || 1;
        const page = data.current_page || 1;
        const pages = [];

        if (lastPage <= 5) {
            for (let index = 1; index <= lastPage; index += 1) {
                pages.push(index);
            }
            return pages;
        }

        pages.push(1);

        if (page > 3) pages.push("ellipsis-start");

        for (
            let index = Math.max(2, page - 1);
            index <= Math.min(lastPage - 1, page + 1);
            index += 1
        ) {
            pages.push(index);
        }

        if (page < lastPage - 2) pages.push("ellipsis-end");

        pages.push(lastPage);

        return pages;
    }, [data.current_page, data.last_page]);

    const goToPage = (page) => {
        if (typeof page !== "number") return;
        if (page < 1 || page > (data.last_page || 1)) return;
        setCurrentPage(page);
    };

    const startRow = data.from || (data.current_page - 1) * 10 + 1;
    const endRow = data.to || (data.current_page - 1) * 10 + data.data.length;

    return (
        <div className="w-full">
            <Toaster
                openToaster={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={() => setToast((prev) => ({ ...prev, open: false }))}
            />

            {/* Toolbar */}
            <div className="flex flex-col gap-3 pb-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative w-full sm:max-w-sm">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                            placeholder="Cari nama tugas..."
                            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                        />
                        {searchInput && (
                            <button
                                type="button"
                                onClick={() => setSearchInput("")}
                                aria-label="Hapus pencarian"
                                className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                        {loading
                            ? "Memuat data..."
                            : `${data.total.toLocaleString()} tugas`}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={fetchData}
                        disabled={loading}
                        title="Muat ulang"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                    </button>

                    {isSuperAdmin ? (
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            <Plus className="h-4 w-4" />
                            Tambah Tugas
                        </button>
                    ) : (
                        <span
                            title="Hanya Super Admin yang dapat menambah, mengubah, atau menghapus tugas."
                            className="inline-flex h-10 items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3.5 text-xs font-semibold text-amber-700"
                        >
                            <Lock className="h-3.5 w-3.5" />
                            Hanya Super Admin
                        </span>
                    )}
                </div>
            </div>

            {error && (
                <div className="mb-4 flex flex-col gap-2 rounded-xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={fetchData}
                        className="w-fit rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
                    >
                        Coba lagi
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm text-slate-600">
                        <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="w-16 px-4 py-3.5 text-center">
                                    No
                                </th>
                                <th className="px-4 py-3.5">Nama Tugas</th>
                                <th className="px-4 py-3.5">Tenggat</th>
                                <th className="px-4 py-3.5">Tipe</th>
                                <th className="px-4 py-3.5 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(6)].map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {[...Array(5)].map((_, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                className="px-4 py-4"
                                            >
                                                <div
                                                    className={`h-3 animate-pulse rounded bg-slate-100 ${
                                                        cellIndex === 0
                                                            ? "mx-auto w-6"
                                                            : cellIndex === 4
                                                            ? "mx-auto w-16"
                                                            : "w-full"
                                                    }`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : data.data.length > 0 ? (
                                data.data.map((item, index) => (
                                    <tr
                                        key={item.id ?? index}
                                        className="transition-colors hover:bg-slate-50/70"
                                    >
                                        <td className="px-4 py-4 text-center text-xs font-semibold text-slate-400">
                                            {startRow + index}
                                        </td>

                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                                    <FileText className="h-5 w-5" />
                                                </span>
                                                <p className="font-semibold text-slate-800">
                                                    {item.name || "-"}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-4 py-4">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                                {formatDate(item.tenggat)}
                                            </span>
                                        </td>

                                        <td className="px-4 py-4">
                                            <TipeBadge tipe={item.tipe} />
                                        </td>

                                        <td className="px-4 py-4">
                                            {isSuperAdmin ? (
                                                <div className="flex items-center justify-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        title="Detail / edit tugas"
                                                        onClick={() =>
                                                            openEditModal(item)
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        title="Hapus tugas"
                                                        onClick={() =>
                                                            setDeleteTarget(item)
                                                        }
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div
                                                    title="Hanya Super Admin yang dapat mengubah atau menghapus tugas."
                                                    className="flex items-center justify-center text-slate-300"
                                                >
                                                    <Lock className="h-4 w-4" />
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <FileText className="mb-2 h-10 w-10 opacity-40" />
                                            <p className="text-sm font-semibold text-slate-600">
                                                Belum ada tugas
                                            </p>
                                            <p className="mt-0.5 text-xs">
                                                {searchKey
                                                    ? "Tidak ditemukan tugas yang cocok dengan pencarian."
                                                    : "Tambahkan tugas pertama untuk kelas KPM."}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Footer / Pagination */}
                <div className="flex flex-col gap-3 border-t border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                        Menampilkan{" "}
                        <span className="font-semibold text-slate-700">
                            {data.total > 0 ? startRow : 0}
                        </span>{" "}
                        sampai{" "}
                        <span className="font-semibold text-slate-700">
                            {endRow}
                        </span>{" "}
                        dari{" "}
                        <span className="font-semibold text-slate-700">
                            {data.total.toLocaleString()}
                        </span>{" "}
                        entri
                    </p>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                        <button
                            type="button"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage <= 1 || loading}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Sebelumnya
                        </button>

                        <div className="flex items-center gap-1">
                            {pageNumbers.map((page, index) =>
                                typeof page === "number" ? (
                                    <button
                                        key={page}
                                        type="button"
                                        onClick={() => goToPage(page)}
                                        className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                                            data.current_page === page
                                                ? "bg-brand-500 text-white shadow-sm"
                                                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        {page}
                                    </button>
                                ) : (
                                    <span
                                        key={`${page}-${index}`}
                                        className="px-1 text-xs text-slate-400"
                                    >
                                        …
                                    </span>
                                )
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={
                                currentPage >= (data.last_page || 1) || loading
                            }
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Berikutnya
                        </button>
                    </div>
                </div>
            </div>

            {/* Form modal */}
            <DynamicModal
                className="m-4 max-w-[560px]"
                isOpen={!!modalMode}
                onClose={closeFormModal}
            >
                <div className="relative w-full max-w-[560px] rounded-3xl bg-white p-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 pr-8">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <FileText className="h-5 w-5" />
                        </span>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">
                                {modalMode === "create"
                                    ? "Tambah Tugas"
                                    : "Detail Tugas"}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {modalMode === "create"
                                    ? "Buat tugas baru untuk kelas KPM."
                                    : "Perbarui informasi tugas atau hapus tugas ini."}
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmitTask}
                        className="mt-5 space-y-4"
                    >
                        <div>
                            <label
                                htmlFor="task_name"
                                className="mb-1.5 block text-sm font-medium text-slate-700"
                            >
                                Nama Tugas
                            </label>
                            <input
                                id="task_name"
                                value={formData.name}
                                onChange={(event) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: event.target.value,
                                    }))
                                }
                                placeholder="Contoh: Laporan Minggu ke 1"
                                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                            />
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="task_tenggat"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Tenggat
                                </label>
                                <LocalizationProvider
                                    dateAdapter={AdapterDayjs}
                                    adapterLocale="id"
                                >
                                    <DatePicker
                                        value={formData.tenggat}
                                        onChange={(value) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                tenggat: value,
                                            }))
                                        }
                                        format="DD/MM/YYYY"
                                        slotProps={{
                                            textField: {
                                                id: "task_tenggat",
                                                fullWidth: true,
                                                size: "small",
                                                placeholder: "dd/mm/yyyy",
                                                sx: {
                                                    "& .MuiOutlinedInput-root":
                                                        {
                                                            borderRadius:
                                                                "12px",
                                                            height: 44,
                                                            fontSize: 14,
                                                            backgroundColor:
                                                                "#fff",
                                                        },
                                                    "& .MuiOutlinedInput-notchedOutline":
                                                        {
                                                            borderColor:
                                                                "#e2e8f0",
                                                        },
                                                    "&:hover .MuiOutlinedInput-notchedOutline":
                                                        {
                                                            borderColor:
                                                                "#cbd5e1",
                                                        },
                                                    "& .Mui-focused .MuiOutlinedInput-notchedOutline":
                                                        {
                                                            borderColor:
                                                                "#465fff",
                                                        },
                                                },
                                            },
                                        }}
                                    />
                                </LocalizationProvider>
                            </div>

                            <div>
                                <label
                                    htmlFor="task_tipe"
                                    className="mb-1.5 block text-sm font-medium text-slate-700"
                                >
                                    Tipe
                                </label>
                                <select
                                    id="task_tipe"
                                    value={formData.tipe}
                                    onChange={(event) =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            tipe: event.target.value,
                                        }))
                                    }
                                    className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-700 shadow-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                                >
                                    <option value="File">File</option>
                                    <option value="Link">Link</option>
                                    <option value="Link Video">
                                        Link Video
                                    </option>
                                </select>
                            </div>
                        </div>

                        {formError && (
                            <div className="rounded-xl border border-rose-100 bg-rose-50/70 px-3.5 py-2.5 text-xs font-medium text-rose-700">
                                {formError}
                            </div>
                        )}

                        <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                {modalMode === "edit" && (
                                    <button
                                        type="button"
                                        onClick={handleDeleteFromModal}
                                        disabled={formLoading}
                                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                        Hapus Tugas
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={closeFormModal}
                                    disabled={formLoading}
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={formLoading}
                                    className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {formLoading ? (
                                        <RefreshCw className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <Save className="h-4 w-4" />
                                    )}
                                    {modalMode === "create"
                                        ? "Simpan Tugas"
                                        : "Simpan Perubahan"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </DynamicModal>

            {/* Delete confirmation */}
            <DynamicModalConf
                className="m-4 max-w-[440px]"
                showCloseButton={false}
                isOpen={!!deleteTarget}
                onClose={() => {
                    if (!deleteLoading) setDeleteTarget(null);
                }}
            >
                <div className="relative w-full max-w-[440px] rounded-3xl bg-white p-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="text-lg font-bold text-slate-800">
                                Konfirmasi Hapus
                            </h4>
                            <p className="text-xs text-slate-500">
                                Tindakan ini tidak dapat dibatalkan.
                            </p>
                        </div>
                    </div>

                    <p className="py-4 text-sm leading-relaxed text-slate-600">
                        Apakah Anda yakin ingin menghapus tugas{" "}
                        <span className="font-semibold text-slate-800">
                            {deleteTarget?.name}
                        </span>
                        ?
                    </p>

                    <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            disabled={deleteLoading}
                            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirmDelete}
                            disabled={deleteLoading}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {deleteLoading ? (
                                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                            )}
                            Ya, Hapus
                        </button>
                    </div>
                </div>
            </DynamicModalConf>
        </div>
    );
}
