import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { router } from "@inertiajs/react";
import { Autocomplete, TextField } from "@mui/material";
import {
    CalendarDays,
    Download,
    Eye,
    RefreshCw,
    Search,
    Trash2,
    UserRound,
    X,
} from "lucide-react";
import DynamicModalConf from "@/Components/DynamicModalConf";
import Toaster from "@/Components/Toaster";
import { config } from "@/config/config";
import { downloadExcel } from "@/Utils/downloadExcel";

const STATUS_STYLES = {
    diterima: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    ditolak: "bg-rose-50 text-rose-700 ring-rose-200",
    "di-review": "bg-amber-50 text-amber-700 ring-amber-200",
    default: "bg-slate-100 text-slate-600 ring-slate-200",
};

const STATUS_LABELS = {
    diterima: "Diterima",
    ditolak: "Ditolak",
    "di-review": "Di-review",
};

const StatusBadge = ({ status }) => {
    const key = STATUS_STYLES[status] ? status : "default";

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${STATUS_STYLES[key]}`}
        >
            <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
            {STATUS_LABELS[status] || status || "Belum diverifikasi"}
        </span>
    );
};

const getInitials = (name) => {
    if (!name) return "?";
    return name.trim().charAt(0).toUpperCase();
};

export default function PamongKepsekTable({ base_url = "", flash }) {
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
    const [gelombangList, setGelombangList] = useState([]);
    const [selectedGelombang, setSelectedGelombang] = useState(null);
    const [loadingGelombang, setLoadingGelombang] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
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
            const nextSearch = searchInput.trim();
            setSearchKey(nextSearch);
            setCurrentPage(1);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchInput]);

    useEffect(() => {
        const fetchGelombang = async () => {
            setLoadingGelombang(true);

            try {
                const response = await axios.get(
                    `${config.base_url}/api/gelombang`
                );
                const list = response.data?.data ?? [];
                setGelombangList(list);

                if (list.length > 0) {
                    const sorted = [...list].sort((first, second) => {
                        if (first.created_at && second.created_at) {
                            return (
                                new Date(second.created_at) -
                                new Date(first.created_at)
                            );
                        }
                        return second.id - first.id;
                    });

                    setSelectedGelombang(sorted[0]);
                }
            } catch (err) {
                console.error(err);
                setToast({
                    open: true,
                    message: "Gagal memuat data gelombang.",
                    severity: "error",
                });
            } finally {
                setLoadingGelombang(false);
            }
        };

        fetchGelombang();
    }, []);

    const fetchData = async () => {
        if (!selectedGelombang) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                `${base_url}/api/admin/data/kepsek-pamong/query`,
                {
                    params: {
                        page: currentPage,
                        search_key: searchKey,
                        id_gelombang: selectedGelombang.id,
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
                err.response?.data?.message ||
                    "Data pamong & kepala sekolah gagal dimuat."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedGelombang) {
            setData({
                data: [],
                total: 0,
                from: 0,
                to: 0,
                current_page: 1,
                last_page: 1,
            });
            setLoading(false);
            return;
        }

        fetchData();
    }, [currentPage, searchKey, selectedGelombang]);

    const exportExcel = async () => {
        setExportLoading(true);

        try {
            const gelombangName = selectedGelombang?.name
                ? selectedGelombang.name.replace(/\s+/g, "_")
                : "";
            const filename = gelombangName
                ? `pamong_kepsek_${gelombangName}.xlsx`
                : "pamong_kepsek.xlsx";

            await downloadExcel({
                url: `${base_url}/api/admin/data/kepsek-pamong/export`,
                data: {
                    id_gelombang: selectedGelombang?.id ?? null,
                    search_key: searchKey,
                },
                filename,
            });

            setToast({
                open: true,
                message: "Data berhasil diekspor.",
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

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;

        setDeleteLoading(true);

        try {
            await axios.post(
                `${base_url}/api/admin/data/kepsek-pamong/delete/${deleteTarget.id}`
            );
            setDeleteTarget(null);
            setToast({
                open: true,
                message: "Data pamong & kepala sekolah berhasil dihapus.",
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
                    err.response?.data?.message || "Gagal menghapus data.",
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
                            placeholder="Cari nama, NIM, atau sekolah..."
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

                    <Autocomplete
                        size="small"
                        loading={loadingGelombang}
                        options={gelombangList}
                        value={selectedGelombang}
                        onChange={(event, value) => {
                            setSelectedGelombang(value);
                            setCurrentPage(1);
                        }}
                        getOptionLabel={(option) =>
                            option.name || "Pilih Gelombang"
                        }
                        isOptionEqualToValue={(option, value) =>
                            option.id === value.id
                        }
                        sx={{
                            width: { xs: "100%", sm: 250 },
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                minHeight: 40,
                                backgroundColor: "#fff",
                                fontSize: 13,
                            },
                            "& .MuiInputLabel-root": {
                                fontSize: 13,
                            },
                        }}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                <div>
                                    <p className="text-sm font-medium text-slate-700">
                                        {option.name}
                                    </p>
                                    {option.description && (
                                        <p className="text-[11px] text-slate-400">
                                            {option.description}
                                        </p>
                                    )}
                                </div>
                            </li>
                        )}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Gelombang"
                                size="small"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <>
                                            <CalendarDays className="mr-1.5 h-4 w-4 text-slate-400" />
                                            {params.InputProps.startAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />

                    <span className="text-xs font-medium text-slate-500">
                        {loading
                            ? "Memuat data..."
                            : `${data.total.toLocaleString()} data ditemukan`}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={fetchData}
                        disabled={loading || !selectedGelombang}
                        title="Muat ulang"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                    <table className="w-full min-w-[1150px] text-left text-sm text-slate-600">
                        <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="w-16 px-4 py-3.5 text-center">
                                    No
                                </th>
                                <th className="px-4 py-3.5">Mahasiswa</th>
                                <th className="px-4 py-3.5">
                                    Pamong / Kepala Sekolah
                                </th>
                                <th className="px-4 py-3.5">Jabatan</th>
                                <th className="px-4 py-3.5">Sekolah</th>
                                <th className="px-4 py-3.5">Rekening</th>
                                <th className="px-4 py-3.5">Status</th>
                                <th className="px-4 py-3.5">Gelombang</th>
                                <th className="px-4 py-3.5 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(6)].map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {[...Array(9)].map((_, cellIndex) => (
                                            <td
                                                key={cellIndex}
                                                className="px-4 py-3.5"
                                            >
                                                <div
                                                    className={`h-3 animate-pulse rounded bg-slate-100 ${
                                                        cellIndex === 0
                                                            ? "mx-auto w-6"
                                                            : cellIndex === 8
                                                            ? "mx-auto w-14"
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
                                        <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-400">
                                            {startRow + index}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                                                    {getInitials(
                                                        item.nama_mahasiswa
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {item.nama_mahasiswa ||
                                                            "-"}
                                                    </p>
                                                    <p className="font-mono text-[11px] text-slate-400">
                                                        {item.nim || "-"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-xs font-bold text-violet-600">
                                                    {getInitials(item.name)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-800">
                                                        {item.name || "-"}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400">
                                                        {item.nip &&
                                                        item.nip !== "null"
                                                            ? item.nip
                                                            : "NIP -"}
                                                        {item.pangkat_dan_golongan &&
                                                        item.pangkat_dan_golongan !==
                                                            "null"
                                                            ? ` · ${item.pangkat_dan_golongan}`
                                                            : ""}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${
                                                    item.jabatan === "kepsek"
                                                        ? "bg-blue-50 text-blue-700 ring-blue-200"
                                                        : "bg-violet-50 text-violet-700 ring-violet-200"
                                                }`}
                                            >
                                                {item.jabatan === "kepsek"
                                                    ? "Kepala Sekolah"
                                                    : item.jabatan
                                                    ? "Pamong"
                                                    : "-"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5 text-slate-600">
                                            {item.nama_sekolah || "-"}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <p className="text-xs font-medium text-slate-700">
                                                {item.nama_bank || "-"}
                                            </p>
                                            <p className="font-mono text-[11px] text-slate-500">
                                                {item.no_rekening || "-"}
                                            </p>
                                            <p className="text-[11px] text-slate-400">
                                                a.n.{" "}
                                                {item.nama_di_buku_rekening ||
                                                    "-"}
                                            </p>
                                            {item.no_npwp &&
                                                item.no_npwp !== "null" && (
                                                    <p className="text-[11px] text-slate-400">
                                                        NPWP {item.no_npwp}
                                                    </p>
                                                )}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <StatusBadge
                                                status={item.status}
                                            />
                                            {item.keterangan && (
                                                <p
                                                    className="mt-1 max-w-[150px] truncate text-[11px] text-slate-400"
                                                    title={item.keterangan}
                                                >
                                                    {item.keterangan}
                                                </p>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
                                                <CalendarDays className="h-3 w-3" />
                                                {item.nama_gelombang || "-"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    type="button"
                                                    title="Lihat detail"
                                                    onClick={() =>
                                                        router.get(
                                                            `/admin/data/kepsek-pamong/detail/${item.id}`
                                                        )
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    title="Hapus data"
                                                    onClick={() =>
                                                        setDeleteTarget(item)
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={9}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <UserRound className="mb-2 h-10 w-10 opacity-40" />
                                            <p className="text-sm font-semibold text-slate-600">
                                                Tidak ada data pamong & kepala
                                                sekolah
                                            </p>
                                            <p className="mt-0.5 text-xs">
                                                {searchKey
                                                    ? "Tidak ditemukan data yang cocok dengan kata kunci pencarian."
                                                    : "Belum ada data pada gelombang yang dipilih."}
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
                        Apakah Anda yakin ingin menghapus data{" "}
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
