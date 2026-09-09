import AdminLayout from "@/Layouts/Admin/AdminLayout";
import { Head } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { config } from "@/config/config";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const COLORS = [
    "#6366f1","#f59e0b","#10b981","#ef4444","#3b82f6",
    "#8b5cf6","#ec4899","#14b8a6","#f97316","#84cc16",
    "#06b6d4","#a855f7","#e11d48","#0ea5e9","#22d3ee",
    "#d946ef","#fb923c","#4ade80","#facc15","#60a5fa",
];

export default function DataRekap() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState([]);
    const [years, setYears] = useState([]);
    const [prodiList, setProdiList] = useState([]);
    const [totalPerYear, setTotalPerYear] = useState({});
    const [chartType, setChartType] = useState("bar"); // 'bar' | 'line'
    const [searchProdi, setSearchProdi] = useState("");
    const [selectedProdi, setSelectedProdi] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await axios.get(
                `${config.base_url}/api/admin/data-rekap`
            );
            if (res.data.status) {
                setData(res.data.data);
                setYears(res.data.years);
                setProdiList(res.data.prodi_list);
                setTotalPerYear(res.data.total_per_year);
                setSelectedProdi(res.data.prodi_list.slice(0, 10)); // default tampilkan 10 pertama
            } else {
                setError(res.data.message || "Gagal memuat data.");
            }
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                    "Gagal menghubungi server. Pastikan koneksi internet aktif."
            );
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter((row) =>
        row.prodi.toLowerCase().includes(searchProdi.toLowerCase())
    );

    const chartData = {
        labels: years.map(String),
        datasets: selectedProdi.map((prodi, i) => {
            const row = data.find((r) => r.prodi === prodi);
            return {
                label: prodi,
                data: years.map((y) => row?.[y] ?? 0),
                backgroundColor: COLORS[i % COLORS.length] + "cc",
                borderColor: COLORS[i % COLORS.length],
                borderWidth: 2,
                tension: 0.4,
                fill: false,
            };
        }),
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: { boxWidth: 12, padding: 10, font: { size: 11 } },
            },
            title: {
                display: true,
                text: "Jumlah Mahasiswa Aktif per Prodi per Angkatan",
                font: { size: 15, weight: "bold" },
            },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} mahasiswa`,
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { stepSize: 5 },
                title: { display: true, text: "Jumlah Mahasiswa" },
            },
            x: {
                title: { display: true, text: "Tahun Angkatan" },
            },
        },
    };

    const toggleProdi = (prodi) => {
        setSelectedProdi((prev) =>
            prev.includes(prodi) ? prev.filter((p) => p !== prodi) : [...prev, prodi]
        );
    };

    const selectAll = () => setSelectedProdi([...prodiList]);
    const clearAll = () => setSelectedProdi([]);

    // Grand total per row (tahun) untuk tabel
    const grandTotalPerYear = {};
    years.forEach((y) => {
        grandTotalPerYear[y] = data.reduce((sum, row) => sum + (row[y] ?? 0), 0);
    });
    const grandTotal = data.reduce((sum, row) => sum + (row.total ?? 0), 0);

    return (
        <AdminLayout>
            <Head title="Rekap Mahasiswa Aktif" />
            <div className="flex flex-col gap-5 p-4">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            📊 Rekap Mahasiswa Aktif per Prodi
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Data berdasarkan tahun angkatan{" "}
                            {years[0]}–{years[years.length - 1]} dari Sevima API
                        </p>
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                                </svg>
                                Memuat...
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh Data
                            </>
                        )}
                    </button>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm dark:bg-red-900/20 dark:border-red-700 dark:text-red-400">
                        ⚠️ {error}
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading && (
                    <div className="animate-pulse space-y-4">
                        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                        <div className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    </div>
                )}

                {!loading && !error && data.length > 0 && (
                    <>
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4">
                                <p className="text-xs font-medium text-indigo-500 dark:text-indigo-400 uppercase tracking-wide">Total Mahasiswa</p>
                                <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300 mt-1">{grandTotal.toLocaleString()}</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700 rounded-xl p-4">
                                <p className="text-xs font-medium text-emerald-500 dark:text-emerald-400 uppercase tracking-wide">Jumlah Prodi</p>
                                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">{prodiList.length}</p>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
                                <p className="text-xs font-medium text-amber-500 dark:text-amber-400 uppercase tracking-wide">Tahun Terbaru ({years[years.length - 1]})</p>
                                <p className="text-3xl font-bold text-amber-700 dark:text-amber-300 mt-1">
                                    {(totalPerYear[years[years.length - 1]] ?? 0).toLocaleString()}
                                </p>
                            </div>
                            <div className="bg-sky-50 dark:bg-sky-900/30 border border-sky-200 dark:border-sky-700 rounded-xl p-4">
                                <p className="text-xs font-medium text-sky-500 dark:text-sky-400 uppercase tracking-wide">Rentang Tahun</p>
                                <p className="text-3xl font-bold text-sky-700 dark:text-sky-300 mt-1">{years[0]}–{years[years.length - 1]}</p>
                            </div>
                        </div>

                        {/* Chart Section */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 shadow-sm">
                            {/* Prodi selector untuk chart */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Filter Prodi Chart:</span>
                                <button onClick={selectAll} className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-1 rounded-md transition-colors">Pilih Semua</button>
                                <button onClick={clearAll} className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 px-2 py-1 rounded-md transition-colors">Hapus Semua</button>
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Jenis:</span>
                                    <button
                                        onClick={() => setChartType("bar")}
                                        className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${chartType === "bar" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                    >
                                        Bar
                                    </button>
                                    <button
                                        onClick={() => setChartType("line")}
                                        className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${chartType === "line" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                                    >
                                        Line
                                    </button>
                                </div>
                            </div>

                            {/* Prodi chips */}
                            <div className="flex flex-wrap gap-2 mb-5 max-h-32 overflow-y-auto">
                                {prodiList.map((prodi, i) => (
                                    <button
                                        key={prodi}
                                        onClick={() => toggleProdi(prodi)}
                                        className="text-xs px-2 py-1 rounded-full border transition-all"
                                        style={{
                                            backgroundColor: selectedProdi.includes(prodi) ? COLORS[i % COLORS.length] + "22" : "transparent",
                                            borderColor: COLORS[i % COLORS.length],
                                            color: selectedProdi.includes(prodi) ? COLORS[i % COLORS.length] : "#9ca3af",
                                            fontWeight: selectedProdi.includes(prodi) ? "600" : "400",
                                        }}
                                    >
                                        {prodi}
                                    </button>
                                ))}
                            </div>

                            {/* Chart */}
                            <div className="h-80">
                                {chartType === "bar" ? (
                                    <Bar data={chartData} options={chartOptions} />
                                ) : (
                                    <Line data={chartData} options={chartOptions} />
                                )}
                            </div>
                        </div>

                        {/* Table Section */}
                        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm overflow-hidden">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                                <h2 className="text-base font-semibold text-gray-700 dark:text-gray-200">
                                    Tabel Rekap Per Prodi
                                </h2>
                                <input
                                    type="text"
                                    value={searchProdi}
                                    onChange={(e) => setSearchProdi(e.target.value)}
                                    placeholder="Cari Program Studi..."
                                    className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm w-full md:w-64 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide sticky left-0 bg-gray-50 dark:bg-gray-800 min-w-[200px]">
                                                Program Studi
                                            </th>
                                            {years.map((y) => (
                                                <th key={y} className="px-3 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide text-center whitespace-nowrap">
                                                    {y}
                                                </th>
                                            ))}
                                            <th className="px-3 py-3 text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide text-center">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                        {filteredData.map((row, idx) => (
                                            <tr
                                                key={row.prodi}
                                                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                            >
                                                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 sticky left-0 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                                    <span
                                                        className="inline-block w-2 h-2 rounded-full mr-2"
                                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                    />
                                                    {row.prodi}
                                                </td>
                                                {years.map((y) => (
                                                    <td key={y} className="px-3 py-3 text-center text-gray-700 dark:text-gray-300">
                                                        {row[y] > 0 ? (
                                                            <span className="font-semibold">{row[y]}</span>
                                                        ) : (
                                                            <span className="text-gray-300 dark:text-gray-600">—</span>
                                                        )}
                                                    </td>
                                                ))}
                                                <td className="px-3 py-3 text-center font-bold text-indigo-600 dark:text-indigo-400">
                                                    {row.total}
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Grand Total Row */}
                                        <tr className="bg-indigo-50 dark:bg-indigo-900/20 font-bold">
                                            <td className="px-4 py-3 text-indigo-700 dark:text-indigo-300 sticky left-0 bg-indigo-50 dark:bg-indigo-900/20">
                                                TOTAL
                                            </td>
                                            {years.map((y) => (
                                                <td key={y} className="px-3 py-3 text-center text-indigo-700 dark:text-indigo-300">
                                                    {grandTotalPerYear[y] || 0}
                                                </td>
                                            ))}
                                            <td className="px-3 py-3 text-center text-indigo-700 dark:text-indigo-300">
                                                {grandTotal}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>

                                {filteredData.length === 0 && (
                                    <div className="py-12 text-center text-gray-400 dark:text-gray-600 text-sm">
                                        Tidak ada data yang sesuai dengan pencarian.
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {!loading && !error && data.length === 0 && (
                    <div className="text-center py-20 text-gray-400 dark:text-gray-500">
                        <svg className="w-16 h-16 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p>Tidak ada data mahasiswa aktif yang ditemukan.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
