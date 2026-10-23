import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    ChevronDown,
    Clock,
    Download,
    MessageSquare,
    RefreshCw,
    Search,
    X,
} from "lucide-react";
import Toaster from "@/Components/Toaster";
import { downloadExcel } from "@/Utils/downloadExcel";

const STATUS_META = {
    approved: {
        label: "Disetujui",
        className: "bg-emerald-50 text-emerald-700 ring-emerald-200",
        icon: CheckCircle2,
    },
    pending: {
        label: "Menunggu validasi",
        className: "bg-amber-50 text-amber-700 ring-amber-200",
        icon: Clock,
    },
    rejected: {
        label: "Perlu revisi",
        className: "bg-rose-50 text-rose-700 ring-rose-200",
        icon: AlertTriangle,
    },
};

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

const formatDateTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const StatusBadge = ({ status }) => {
    const meta = STATUS_META[status] ?? {
        label: status || "-",
        className: "bg-slate-100 text-slate-600 ring-slate-200",
        icon: Clock,
    };
    const Icon = meta.icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${meta.className}`}
        >
            <Icon className="h-3 w-3" />
            {meta.label}
        </span>
    );
};

const FilterSelect = ({ value, onChange, children, label, className = "" }) => (
    <div className={`relative ${className}`}>
        <select
            value={value}
            onChange={onChange}
            aria-label={label}
            className="h-10 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3.5 pr-9 text-sm font-medium text-slate-700 shadow-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
        >
            {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
);

export default function BimbinganRekapTable({
    base_url = "",
    flash,
    gelombangList = [],
}) {
    const [data, setData] = useState({
        data: [],
        total: 0,
        from: 0,
        to: 0,
        current_page: 1,
        last_page: 1,
    });
    const [stats, setStats] = useState({
        total: 0,
        approved: 0,
        pending: 0,
        rejected: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchInput, setSearchInput] = useState("");
    const [searchKey, setSearchKey] = useState("");
    const [tipe, setTipe] = useState("all");
    const [status, setStatus] = useState("all");
    const [selectedGelombang, setSelectedGelombang] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedId, setExpandedId] = useState(null);
    const [exportLoading, setExportLoading] = useState(false);
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
                `${base_url}/api/admin/bimbingan/query`,
                {
                    params: {
                        page: currentPage,
                        search_key: searchKey,
                        tipe: tipe === "all" ? undefined : tipe,
                        status: status === "all" ? undefined : status,
                        id_gelombang:
                            selectedGelombang === "all"
                                ? undefined
                                : selectedGelombang,
                    },
                }
            );

            const paginator = response.data?.data ?? {};

            setData({
                data: paginator.data ?? [],
                total: paginator.total ?? 0,
                from: paginator.from ?? 0,
                to: paginator.to ?? 0,
                current_page: paginator.current_page ?? 1,
                last_page: paginator.last_page ?? 1,
            });
            setStats(
                response.data?.stats ?? {
                    total: 0,
                    approved: 0,
                    pending: 0,
                    rejected: 0,
                }
            );
            setExpandedId(null);
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                    "Data rekap bimbingan gagal dimuat."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [currentPage, searchKey, tipe, status, selectedGelombang]);

    const exportExcel = async () => {
        setExportLoading(true);

        try {
            await downloadExcel({
                url: `${base_url}/api/admin/bimbingan/export`,
                data: {
                    search_key: searchKey,
                    tipe: tipe === "all" ? null : tipe,
                    status: status === "all" ? null : status,
                    id_gelombang:
                        selectedGelombang === "all"
                            ? null
                            : selectedGelombang,
                },
                filename: "rekap_bimbingan.xlsx",
            });
            setToast({
                open: true,
                message: "Data rekap bimbingan berhasil diekspor.",
                severity: "success",
            });
        } catch (err) {
            setToast({
                open: true,
                message: err.message || "Gagal mengekspor data.",
                severity: "error",
            });
        } finally {
            setExportLoading(false);
        }
    };

    const statCards = useMemo(
        () => [
            {
                label: "Total bimbingan",
                value: stats.total,
                icon: BookOpen,
                iconTone: "bg-blue-50 text-blue-600",
            },
            {
                label: "Disetujui",
                value: stats.approved,
                icon: CheckCircle2,
                iconTone: "bg-emerald-50 text-emerald-600",
            },
            {
                label: "Menunggu validasi",
                value: stats.pending,
                icon: Clock,
                iconTone: "bg-amber-50 text-amber-600",
            },
            {
                label: "Perlu revisi",
                value: stats.rejected,
                icon: AlertTriangle,
                iconTone: "bg-rose-50 text-rose-600",
            },
        ],
        [stats]
    );

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

            {/* Statistik */}
            <div className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
                {statCards.map((card) => {
                    const Icon = card.icon;

                    return (
                        <div
                            key={card.label}
                            className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                        >
                            <div className="flex items-center gap-3">
                                <span
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.iconTone}`}
                                >
                                    <Icon className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-xs font-medium text-slate-500">
                                        {card.label}
                                    </p>
                                    <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
                                        {Number(
                                            card.value || 0
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Toolbar */}
            <div className="flex flex-col gap-3 pb-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
                <div className="flex flex-1 flex-col gap-3 xl:flex-row xl:items-center">
                    <div className="relative w-full shrink-0 xl:w-[300px]">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            value={searchInput}
                            onChange={(event) =>
                                setSearchInput(event.target.value)
                            }
                            placeholder="Cari mahasiswa, NIM, judul, atau supervisor..."
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

                    <div className="flex flex-wrap items-center gap-2 xl:flex-nowrap">
                        <FilterSelect
                            className="w-full shrink-0 sm:w-[200px]"
                            label="Filter tahun ajaran"
                            value={selectedGelombang}
                            onChange={(event) => {
                                setSelectedGelombang(event.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="all">Semua tahun ajaran</option>
                            {gelombangList.map((gelombang) => (
                                <option key={gelombang.id} value={gelombang.id}>
                                    {gelombang.name}
                                </option>
                            ))}
                        </FilterSelect>

                        <FilterSelect
                            className="w-full shrink-0 sm:w-[150px]"
                            label="Filter kegiatan"
                            value={tipe}
                            onChange={(event) => {
                                setTipe(event.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="all">Semua kegiatan</option>
                            <option value="kpm">KPM</option>
                            <option value="ppl">PPL</option>
                        </FilterSelect>

                        <FilterSelect
                            className="w-full shrink-0 sm:w-[170px]"
                            label="Filter status"
                            value={status}
                            onChange={(event) => {
                                setStatus(event.target.value);
                                setCurrentPage(1);
                            }}
                        >
                            <option value="all">Semua status</option>
                            <option value="approved">Disetujui</option>
                            <option value="pending">Menunggu validasi</option>
                            <option value="rejected">Perlu revisi</option>
                        </FilterSelect>
                    </div>

                    <span className="shrink-0 whitespace-nowrap text-xs font-medium text-slate-500">
                        {loading
                            ? "Memuat data..."
                            : `${data.total.toLocaleString()} bimbingan`}
                    </span>
                </div>

                <div className="flex items-center gap-2 self-end 2xl:self-auto">
                    <button
                        type="button"
                        onClick={fetchData}
                        disabled={loading}
                        title="Muat ulang"
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />
                    </button>

                    <button
                        type="button"
                        onClick={exportExcel}
                        disabled={exportLoading}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {exportLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Export Excel
                    </button>
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
                    <table className="w-full min-w-[1180px] text-left text-sm text-slate-600">
                        <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="w-16 px-4 py-3.5 text-center">
                                    No
                                </th>
                                <th className="min-w-[190px] px-4 py-3.5">
                                    Mahasiswa
                                </th>
                                <th className="px-4 py-3.5">Kegiatan</th>
                                <th className="min-w-[150px] px-4 py-3.5">
                                    Tahun Ajaran
                                </th>
                                <th className="min-w-[160px] px-4 py-3.5">
                                    Kelas / Tempat
                                </th>
                                <th className="px-4 py-3.5 text-center">
                                    Ke-
                                </th>
                                <th className="px-4 py-3.5">Tanggal</th>
                                <th className="min-w-[200px] px-4 py-3.5">
                                    Judul Bimbingan
                                </th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="w-16 px-4 py-3.5 text-center">
                                    Detail
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(6)].map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {[...Array(10)].map((_, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                className="px-4 py-4"
                                            >
                                                <div
                                                    className={`h-3 animate-pulse rounded bg-slate-100 ${
                                                        cellIndex === 0
                                                            ? "mx-auto w-6"
                                                            : "w-full"
                                                    }`}
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : data.data.length > 0 ? (
                                data.data.map((item, index) => {
                                    const isExpanded =
                                        expandedId === item.id;

                                    return (
                                        <React.Fragment key={item.id}>
                                            <tr
                                                className={`transition-colors hover:bg-slate-50/70 ${
                                                    isExpanded
                                                        ? "bg-slate-50/70"
                                                        : ""
                                                }`}
                                            >
                                                <td className="px-4 py-4 text-center text-xs font-semibold text-slate-400">
                                                    {startRow + index}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                                                            {item.nama_mahasiswa
                                                                ? item.nama_mahasiswa
                                                                      .charAt(0)
                                                                      .toUpperCase()
                                                                : "?"}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-slate-800">
                                                                {item.nama_mahasiswa ||
                                                                    item.username_mahasiswa ||
                                                                    "-"}
                                                            </p>
                                                            <p className="font-mono text-[11px] text-slate-400">
                                                                {
                                                                    item.username_mahasiswa
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ring-1 ring-inset ${
                                                            item.tipe === "kpm"
                                                                ? "bg-blue-50 text-blue-700 ring-blue-200"
                                                                : "bg-violet-50 text-violet-700 ring-violet-200"
                                                        }`}
                                                    >
                                                        {item.tipe}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                        {item.nama_gelombang ||
                                                            "-"}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-slate-600">
                                                    {item.nama_kelas || "-"}
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-semibold text-slate-600">
                                                        {item.bimbingan_ke}
                                                    </span>
                                                </td>

                                                <td className="px-4 py-4 text-xs text-slate-500">
                                                    {formatDate(item.tanggal)}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <p className="font-semibold text-slate-800">
                                                        {item.judul || "-"}
                                                    </p>
                                                    <p className="mt-0.5 line-clamp-1 max-w-[260px] text-[11px] text-slate-400">
                                                        {item.deskripsi || ""}
                                                    </p>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <StatusBadge
                                                        status={item.status}
                                                    />
                                                </td>

                                                <td className="px-4 py-4 text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExpandedId(
                                                                isExpanded
                                                                    ? null
                                                                    : item.id
                                                            )
                                                        }
                                                        aria-expanded={
                                                            isExpanded
                                                        }
                                                        title="Lihat isi bimbingan"
                                                        className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
                                                            isExpanded
                                                                ? "border-brand-300 bg-brand-50 text-brand-600"
                                                                : "border-slate-200 text-slate-500 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600"
                                                        }`}
                                                    >
                                                        <ChevronDown
                                                            className={`h-4 w-4 transition-transform ${
                                                                isExpanded
                                                                    ? "rotate-180"
                                                                    : ""
                                                            }`}
                                                        />
                                                    </button>
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr>
                                                    <td
                                                        colSpan={10}
                                                        className="bg-slate-50/60 px-4 pb-5 pt-1"
                                                    >
                                                        <div className="ml-16 grid gap-4 rounded-xl border border-slate-200 bg-white p-4 lg:grid-cols-2">
                                                            <div>
                                                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                                                    Isi Bimbingan
                                                                </p>
                                                                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                                                                    {item.deskripsi ||
                                                                        "-"}
                                                                </p>
                                                            </div>

                                                            <div className="space-y-3 rounded-xl bg-slate-50 p-3.5">
                                                                <div className="flex items-start gap-2.5">
                                                                    <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                                                    <div>
                                                                        <p className="text-[11px] font-semibold text-slate-500">
                                                                            Supervisor
                                                                        </p>
                                                                        <p className="text-sm font-medium text-slate-700">
                                                                            {item.nama_supervisor ||
                                                                                item.username_supervisor ||
                                                                                "Belum ditentukan"}
                                                                        </p>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <p className="text-[11px] font-semibold text-slate-500">
                                                                        Catatan Supervisor
                                                                    </p>
                                                                    <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                                                                        {item.catatan_supervisor ||
                                                                            "Belum ada catatan."}
                                                                    </p>
                                                                </div>

                                                                <div>
                                                                    <p className="text-[11px] font-semibold text-slate-500">
                                                                        Divalidasi pada
                                                                    </p>
                                                                    <p className="mt-0.5 text-sm text-slate-600">
                                                                        {item.validated_at
                                                                            ? formatDateTime(
                                                                                  item.validated_at
                                                                              )
                                                                            : "Belum divalidasi"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={10}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <BookOpen className="mb-2 h-10 w-10 opacity-40" />
                                            <p className="text-sm font-semibold text-slate-600">
                                                Belum ada data bimbingan
                                            </p>
                                            <p className="mt-0.5 text-xs">
                                                {searchKey ||
                                                tipe !== "all" ||
                                                status !== "all"
                                                    ? "Tidak ditemukan bimbingan yang cocok dengan filter."
                                                    : "Belum ada bimbingan yang diinput oleh mahasiswa."}
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
        </div>
    );
}
