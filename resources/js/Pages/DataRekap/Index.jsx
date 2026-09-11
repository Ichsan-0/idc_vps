import React, { useState, useEffect, useMemo } from "react";
import { Head } from "@inertiajs/react";
import axios from "axios";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const COLORS = [
    "#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
    "#14b8a6", "#d97706", "#dc2626", "#7c3aed", "#db2777",
];

export default function Index({ auth }) {
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [years, setYears] = useState([]);
    const [prodiList, setProdiList] = useState([]);
    const [totalPerYear, setTotalPerYear] = useState({});
    const [selectedProdi, setSelectedProdi] = useState([]);
    const [chartType, setChartType] = useState("bar");
    const [searchProdi, setSearchProdi] = useState("");

    useEffect(() => {
        fetchData();
        checkSyncStatus();
    }, []);

    // Polling status background sync setiap 4 detik
    useEffect(() => {
        let interval = null;
        if (isRefreshing) {
            interval = setInterval(async () => {
                try {
                    const statusRes = await axios.get("/api/data-rekap/status");
                    if (statusRes.data.status) {
                        if (!statusRes.data.running) {
                            setIsRefreshing(false);
                            fetchData(); // Reload data terbaru yang sudah selesai tergenerate
                        }
                    }
                } catch (e) {
                    console.error("Status check error", e);
                }
            }, 4000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [isRefreshing]);

    const checkSyncStatus = async () => {
        try {
            const res = await axios.get("/api/data-rekap/status");
            if (res.data.status && res.data.running) {
                setIsRefreshing(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleSyncSevima = async () => {
        const confirmed = window.confirm(
            "Proses pembaruan data Sevima API akan berjalan di background server VPS (estimasi 1 - 2 menit). Anda tidak perlu menunggu di halaman ini dan tidak akan ada timeout. Lanjutkan?"
        );
        if (!confirmed) return;

        try {
            setIsRefreshing(true);
            const res = await axios.post("/api/data-rekap/refresh");
            if (res.data.status) {
                console.log(res.data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(`/api/data-rekap`, { timeout: 30000 });
            if (res.data.status) {
                if (res.data.data) {
                    setData(res.data.data);
                    setYears(res.data.years);
                    setProdiList(res.data.prodi_list);
                    setTotalPerYear(res.data.total_per_year);
                    setSelectedProdi((prev) =>
                        prev.length ? prev : res.data.prodi_list.slice(0, 10)
                    );
                }
                if (res.data.syncing) {
                    setIsRefreshing(true);
                }
            } else {
                setError(res.data.message || "Gagal memuat data.");
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Gagal menghubungi server. Coba lagi beberapa saat lagi."
            );
        } finally {
            setLoading(false);
        }
    };

    const toggleProdi = (prodiName) => {
        if (selectedProdi.includes(prodiName)) {
            setSelectedProdi(selectedProdi.filter((p) => p !== prodiName));
        } else {
            setSelectedProdi([...selectedProdi, prodiName]);
        }
    };

    const selectAll = () => setSelectedProdi([...prodiList]);
    const clearAll = () => setSelectedProdi([]);

    const filteredData = useMemo(() => {
        if (!searchProdi) return data;
        return data.filter((item) =>
            item.prodi.toLowerCase().includes(searchProdi.toLowerCase())
        );
    }, [data, searchProdi]);

    const grandTotalPerYear = useMemo(() => {
        const result = {};
        years.forEach((y) => {
            result[y] = filteredData.reduce((acc, row) => acc + (row[y] || 0), 0);
        });
        return result;
    }, [filteredData, years]);

    const grandTotal = useMemo(() => {
        return Object.values(grandTotalPerYear).reduce((a, b) => a + b, 0);
    }, [grandTotalPerYear]);

    const chartData = useMemo(() => {
        const activeProdis = data.filter((d) => selectedProdi.includes(d.prodi));

        return {
            labels: years.map((y) => `Angkatan ${y}`),
            datasets: activeProdis.map((item, idx) => {
                const color = COLORS[idx % COLORS.length];
                return {
                    label: item.prodi,
                    data: years.map((y) => item[y] || 0),
                    backgroundColor: color + "B3",
                    borderColor: color,
                    borderWidth: 2,
                    borderRadius: 6,
                    tension: 0.3,
                };
            }),
        };
    }, [data, selectedProdi, years]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    boxWidth: 12,
                    font: { size: 11, weight: "600" },
                    padding: 16,
                },
            },
            tooltip: {
                backgroundColor: "rgba(17, 24, 39, 0.9)",
                padding: 12,
                cornerRadius: 8,
                titleFont: { size: 13, weight: "bold" },
                bodyFont: { size: 12 },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { font: { size: 12, weight: "600" } },
            },
            y: {
                beginAtZero: true,
                grid: { color: "rgba(156, 163, 175, 0.15)" },
                ticks: { font: { size: 11 } },
            },
        },
    };

    const content = (
        <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-800 dark:text-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Guest Navigation Bar */}
                {!auth?.user && (
                    <header className="flex items-center justify-between bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center gap-3">
                            <img
                                src="/assets/images/Lambang_UIN_Ar-Raniry.png"
                                alt="UIN Ar-Raniry Logo"
                                className="w-10 h-10 object-contain"
                                onError={(e) => { e.target.style.display = "none"; }}
                            />
                            <div>
                                <h2 className="font-extrabold text-base text-gray-900 dark:text-white leading-tight">
                                    FTK UIN Ar-Raniry Banda Aceh
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Sistem Informasi Rekapitulasi Data Mahasiswa
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <a
                                href="/"
                                className="text-xs font-semibold text-gray-600 hover:text-indigo-600 dark:text-gray-300 dark:hover:text-white transition-colors"
                            >
                                Beranda
                            </a>
                        </div>
                    </header>
                )}

                <Head title="Rekapitulasi Mahasiswa Aktif" />

                {/* Page Title Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold mb-2">
                            <span>⚡ Server Cache (Diperbarui per 6 Bulan)</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            Rekapitulasi Jumlah Mahasiswa Aktif
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Jumlah mahasiswa aktif per Program Studi berdasarkan tahun angkatan{" "}
                            <span className="font-semibold text-gray-700 dark:text-gray-300">
                                {years[0] ?? 2020} – {years[years.length - 1] ?? 2026}
                            </span>
                        </p>
                    </div>

                    <button
                        onClick={handleSyncSevima}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-60 shadow-sm"
                        title="Sinkronkan ulang data langsung dari Sevima API"
                    >
                        {loading && isRefreshing ? (
                            <>
                                <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                                </svg>
                                <span>Menyinkronkan API...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Reload Data Sevima</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Progress Banner during Sevima Reload */}
                {isRefreshing && (
                    <div className="bg-amber-50 dark:bg-amber-950/60 border-l-4 border-amber-500 p-4 rounded-2xl shadow-sm flex items-center gap-3 text-amber-800 dark:text-amber-200">
                        <svg className="animate-spin w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                        </svg>
                        <div>
                            <p className="font-bold text-sm">Sedang melakukan sinkronisasi data dari Sevima API...</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                Proses ini membutuhkan waktu beberapa menit untuk melakukan scanning 82+ halaman Sevima API. Mohon jangan menutup halaman ini.
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 text-sm dark:bg-red-950/30 dark:border-red-800 dark:text-red-300">
                        ⚠️ <strong>Perhatian:</strong> {error}
                    </div>
                )}

                {/* Loading State */}
                {loading && (
                    <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300 rounded-2xl p-6 text-sm flex flex-col items-center justify-center gap-3 py-12 shadow-sm">
                        <svg className="animate-spin w-8 h-8 text-indigo-600 dark:text-indigo-400" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                            <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                        </svg>
                        <p className="font-semibold text-base text-center">
                            Memproses data dari Sevima API Platform...
                        </p>
                        <p className="text-xs text-indigo-600 dark:text-indigo-400 text-center max-w-md">
                            Mengambil dan mengelompokkan ribuan data mahasiswa aktif secara otomatis. Harap tunggu sebentar.
                        </p>
                    </div>
                )}

                {!loading && !error && data.length > 0 && (
                    <>
                        {/* Summary Metric Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Mahasiswa Aktif
                                </p>
                                <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
                                    {grandTotal.toLocaleString("id-ID")}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Total Program Studi
                                </p>
                                <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
                                    {prodiList.length}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Angkatan Terbaru ({years[years.length - 1]})
                                </p>
                                <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
                                    {(totalPerYear[years[years.length - 1]] ?? 0).toLocaleString("id-ID")}
                                </p>
                            </div>
                            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Rentang Angkatan
                                </p>
                                <p className="text-3xl font-extrabold text-sky-600 dark:text-sky-400 mt-2">
                                    {years[0]}–{years[years.length - 1]}
                                </p>
                            </div>
                        </div>

                        {/* Data Table (DILETAKKAN DI ATAS GRAFIK) */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                        📋 Tabel Rekapitulasi per Program Studi
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Data jumlah mahasiswa aktif berdasarkan angkatan {years[0]} s.d. {years[years.length - 1]}
                                    </p>
                                </div>
                                <input
                                    type="text"
                                    value={searchProdi}
                                    onChange={(e) => setSearchProdi(e.target.value)}
                                    placeholder="Cari Program Studi..."
                                    className="border border-gray-300 dark:border-gray-700 rounded-xl px-3.5 py-2 text-sm w-full sm:w-64 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800/80 text-left border-b border-gray-200 dark:border-gray-700">
                                            <th className="px-4 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider sticky left-0 bg-gray-50 dark:bg-gray-800 min-w-[220px]">
                                                Program Studi
                                            </th>
                                            {years.map((y) => (
                                                <th
                                                    key={y}
                                                    className="px-3 py-3.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center whitespace-nowrap"
                                                >
                                                    {y}
                                                </th>
                                            ))}
                                            <th className="px-4 py-3.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-center bg-indigo-50/50 dark:bg-indigo-950/30">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {filteredData.map((row, idx) => (
                                            <tr
                                                key={row.prodi}
                                                className="hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-semibold text-gray-800 dark:text-gray-200 sticky left-0 bg-white dark:bg-gray-900">
                                                    <span
                                                        className="inline-block w-2.5 h-2.5 rounded-full mr-2.5"
                                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                    />
                                                    {row.prodi}
                                                </td>
                                                {years.map((y) => (
                                                    <td
                                                        key={y}
                                                        className="px-3 py-3 text-center text-gray-700 dark:text-gray-300 font-medium"
                                                    >
                                                        {row[y] > 0 ? (
                                                            <span>{row[y]}</span>
                                                        ) : (
                                                            <span className="text-gray-300 dark:text-gray-700">—</span>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="px-4 py-3 text-center font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20">
                                                    {row.total}
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Grand Total Footer */}
                                        <tr className="bg-indigo-50/70 dark:bg-indigo-950/40 font-bold border-t-2 border-indigo-200 dark:border-indigo-800">
                                            <td className="px-4 py-3.5 text-indigo-900 dark:text-indigo-200 sticky left-0 bg-indigo-50/90 dark:bg-indigo-950/60 uppercase">
                                                Total Mahasiswa Aktif
                                            </td>
                                            {years.map((y) => (
                                                <td
                                                    key={y}
                                                    className="px-3 py-3.5 text-center text-indigo-900 dark:text-indigo-200"
                                                >
                                                    {grandTotalPerYear[y] || 0}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3.5 text-center text-indigo-900 dark:text-indigo-200 text-base font-extrabold">
                                                {grandTotal}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {filteredData.length === 0 && (
                                    <div className="py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                                        Tidak ada Program Studi yang cocok dengan &quot;{searchProdi}&quot;
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Chart Component (DILETAKKAN DI BAWAH TABEL) */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 dark:text-white">
                                        📈 Grafik Distribusi Mahasiswa
                                    </h2>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Klik nama prodi di bawah untuk memfilter grafik
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                                    <button
                                        onClick={() => setChartType("bar")}
                                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                            chartType === "bar"
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                        }`}
                                    >
                                        Bar Chart
                                    </button>
                                    <button
                                        onClick={() => setChartType("line")}
                                        className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all ${
                                            chartType === "line"
                                                ? "bg-indigo-600 text-white shadow-sm"
                                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                        }`}
                                    >
                                        Line Chart
                                    </button>
                                </div>
                            </div>

                            {/* Filter Chips */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <button
                                    onClick={selectAll}
                                    className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 px-2.5 py-1 rounded-lg font-medium transition-colors"
                                >
                                    Pilih Semua
                                </button>
                                <button
                                    onClick={clearAll}
                                    className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2.5 py-1 rounded-lg font-medium transition-colors"
                                >
                                    Hapus Semua
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-1.5 mb-6 max-h-36 overflow-y-auto pr-1">
                                {prodiList.map((prodi, i) => {
                                    const isSelected = selectedProdi.includes(prodi);
                                    return (
                                        <button
                                            key={prodi}
                                            onClick={() => toggleProdi(prodi)}
                                            className="text-xs px-2.5 py-1 rounded-full border transition-all"
                                            style={{
                                                backgroundColor: isSelected
                                                    ? COLORS[i % COLORS.length] + "20"
                                                    : "transparent",
                                                borderColor: COLORS[i % COLORS.length],
                                                color: isSelected
                                                    ? COLORS[i % COLORS.length]
                                                    : "#9ca3af",
                                                fontWeight: isSelected ? "600" : "400",
                                            }}
                                        >
                                            {prodi}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="h-80 sm:h-96">
                                {chartType === "bar" ? (
                                    <Bar data={chartData} options={chartOptions} />
                                ) : (
                                    <Line data={chartData} options={chartOptions} />
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    if (auth?.user) {
        return <AdminLayout>{content}</AdminLayout>;
    }

    return content;
}
