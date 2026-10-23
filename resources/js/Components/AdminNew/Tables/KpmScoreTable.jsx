import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Autocomplete, TextField } from "@mui/material";
import {
    CalendarDays,
    Download,
    RefreshCw,
    Search,
    UsersRound,
    X,
} from "lucide-react";
import Toaster from "@/Components/Toaster";
import { config } from "@/config/config";
import { downloadExcel } from "@/Utils/downloadExcel";

const ScoreBadge = ({ score }) => {
    const value = Number(score) || 0;

    if (!value) {
        return <span className="text-slate-300">–</span>;
    }

    const styles =
        value >= 80
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
            : value >= 60
            ? "bg-blue-50 text-blue-700 ring-blue-200"
            : "bg-amber-50 text-amber-700 ring-amber-200";

    return (
        <span
            className={`inline-flex min-w-9 items-center justify-center rounded-lg px-2 py-1 text-xs font-semibold tabular-nums ring-1 ring-inset ${styles}`}
        >
            {value}
        </span>
    );
};

export default function KpmScoreTable({ base_url = "", flash }) {
    const [data, setData] = useState({
        data: [],
        headers: [],
        total: 0,
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
                `${base_url}/api/admin/classroom-kpm/nilai/query`,
                {
                    params: {
                        page: currentPage,
                        search: searchKey,
                        gelombang: selectedGelombang.id,
                    },
                }
            );

            setData({
                data: response.data?.data ?? [],
                headers: response.data?.headers ?? [],
                total: response.data?.total ?? 0,
                to: response.data?.to ?? 0,
                current_page: response.data?.current_page ?? 1,
                last_page: response.data?.last_page ?? 1,
            });
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message || "Data nilai KPM gagal dimuat."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedGelombang) {
            setData({
                data: [],
                headers: [],
                total: 0,
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
        if (!selectedGelombang) return;

        setExportLoading(true);

        try {
            await downloadExcel({
                url: `${base_url}/api/admin/classroom-kpm/nilai/export`,
                data: { gelombang: selectedGelombang.id },
                filename: "nilai_kpm.xlsx",
            });
            setToast({
                open: true,
                message: "Data nilai KPM berhasil diekspor.",
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

    const getRowSummary = (item) => {
        const tasks = item.tasks ?? [];
        const scored = tasks.filter((task) => Number(task.score) > 0);
        const totalScore = scored.reduce(
            (sum, task) => sum + Number(task.score),
            0
        );

        return {
            scored: scored.length,
            total: data.headers.length || tasks.length,
            average: scored.length
                ? Math.round(totalScore / scored.length)
                : null,
        };
    };

    const startRow =
        data.total > 0 ? (data.current_page - 1) * 10 + 1 : 0;
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
                            placeholder="Cari nama, NIM, atau tempat KPM..."
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
                            width: { xs: "100%", sm: 240 },
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                minHeight: 40,
                                backgroundColor: "#fff",
                                fontSize: 13,
                            },
                            "& .MuiInputLabel-root": { fontSize: 13 },
                        }}
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
                            : `${data.total.toLocaleString()} mahasiswa`}
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
                        disabled={exportLoading || !selectedGelombang}
                        className="inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {exportLoading ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Export Nilai
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
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                            <tr>
                                <th className="w-16 px-4 py-3.5 text-center">
                                    No
                                </th>
                                <th className="min-w-[200px] px-4 py-3.5">
                                    Mahasiswa
                                </th>
                                <th className="min-w-[150px] px-4 py-3.5">
                                    Tempat KPM
                                </th>
                                <th className="min-w-[160px] px-4 py-3.5">
                                    Supervisor
                                </th>

                                {data.headers.map((header) => (
                                    <th
                                        key={header.id_tugas}
                                        title={header.nama_tugas}
                                        className="w-[170px] min-w-[150px] px-4 py-3.5 align-bottom leading-snug"
                                    >
                                        <span className="line-clamp-2">
                                            {header.nama_tugas}
                                        </span>
                                    </th>
                                ))}

                                <th className="min-w-[120px] px-4 py-3.5 text-center">
                                    Rata-rata
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                [...Array(6)].map((_, rowIndex) => (
                                    <tr key={rowIndex}>
                                        {[
                                            0,
                                            1,
                                            2,
                                            3,
                                            ...data.headers.map(
                                                (header) => header.id_tugas
                                            ),
                                            "average",
                                        ].map((key, cellIndex) => (
                                            <td
                                                key={`${key}-${cellIndex}`}
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
                                    const summary = getRowSummary(item);

                                    return (
                                        <tr
                                            key={
                                                item.username_mahasiswa ?? index
                                            }
                                            className="transition-colors hover:bg-slate-50/70"
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

                                            <td className="px-4 py-4 text-slate-600">
                                                {item.nama_tempat_kpm || "-"}
                                            </td>

                                            <td className="px-4 py-4 text-slate-600">
                                                {item.nama_supervisor || "-"}
                                            </td>

                                            {data.headers.map((header) => {
                                                const task = item.tasks?.find(
                                                    (task) =>
                                                        String(
                                                            task.id_tugas
                                                        ) ===
                                                        String(header.id_tugas)
                                                );

                                                return (
                                                    <td
                                                        key={header.id_tugas}
                                                        className="px-4 py-4 text-center"
                                                    >
                                                        <ScoreBadge
                                                            score={
                                                                task?.score
                                                            }
                                                        />
                                                    </td>
                                                );
                                            })}

                                            <td className="px-4 py-4">
                                                <div className="flex flex-col items-center gap-1">
                                                    {summary.average !==
                                                    null ? (
                                                        <ScoreBadge
                                                            score={
                                                                summary.average
                                                            }
                                                        />
                                                    ) : (
                                                        <span className="text-xs text-slate-400">
                                                            -
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-400">
                                                        {summary.scored}/
                                                        {summary.total} dinilai
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5 + data.headers.length}
                                        className="px-4 py-14 text-center"
                                    >
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <UsersRound className="mb-2 h-10 w-10 opacity-40" />
                                            <p className="text-sm font-semibold text-slate-600">
                                                Tidak ada data nilai KPM
                                            </p>
                                            <p className="mt-0.5 text-xs">
                                                {searchKey
                                                    ? "Tidak ditemukan mahasiswa yang cocok dengan pencarian."
                                                    : "Belum ada mahasiswa pada gelombang yang dipilih."}
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
                            {startRow}
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
