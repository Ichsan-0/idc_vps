import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    ClipboardX,
    GraduationCap,
    Inbox,
    MapPin,
    RefreshCw,
    School,
    Users,
} from "lucide-react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";

const SERIES = {
    pendaftar: "#465fff",
    diterima: "#eb6834",
};

const formatNumber = (value) =>
    new Intl.NumberFormat("id-ID").format(Number(value) || 0);

const formatDate = (date = new Date()) =>
    new Intl.DateTimeFormat("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);

const formatTime = (date = new Date()) =>
    new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);

function ProdiTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="rounded-xl border border-slate-200 bg-white/95 px-3.5 py-2.5 shadow-lg shadow-slate-900/5 backdrop-blur">
            <p className="text-xs font-semibold text-slate-900">{label}</p>
            <div className="mt-2 space-y-1.5">
                {payload.map((item) => (
                    <div
                        key={item.dataKey}
                        className="flex items-center justify-between gap-6 text-xs"
                    >
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.dataKey === "pendaftar"
                                ? "Pendaftar"
                                : "Diterima"}
                        </span>
                        <span className="font-semibold tabular-nums text-slate-800">
                            {formatNumber(item.value)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="animate-pulse space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, index) => (
                    <div
                        key={index}
                        className="h-[158px] rounded-2xl border border-slate-200/80 bg-white"
                    />
                ))}
            </div>
            <div className="grid gap-5 xl:grid-cols-3">
                <div className="h-[460px] rounded-2xl border border-slate-200/80 bg-white xl:col-span-2" />
                <div className="h-[460px] rounded-2xl border border-slate-200/80 bg-white" />
            </div>
        </div>
    );
}

export default function Dashboard({ auth }) {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [chartView, setChartView] = useState("chart");
    const [lastUpdated, setLastUpdated] = useState(null);

    const getData = async (isRefresh = false) => {
        try {
            setError(null);
            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            const response = await axios.get("/admin/dashboard/get-data");
            setData(response.data.data ?? {});
            setLastUpdated(new Date());
        } catch (requestError) {
            console.error(requestError);
            setError(
                "Data dashboard gagal dimuat. Silakan coba beberapa saat lagi."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const prodiData = useMemo(() => {
        const map = new Map();

        (data.recapperprodi_pendaftar ?? []).forEach((item) => {
            map.set(item.id_prodi, {
                id_prodi: item.id_prodi,
                nama_prodi: item.nama_prodi,
                pendaftar: Number(item.total) || 0,
                diterima: 0,
            });
        });

        (data.recapperprodi_lulus ?? []).forEach((item) => {
            const existing = map.get(item.id_prodi);

            if (existing) {
                existing.diterima = Number(item.total) || 0;
            } else {
                map.set(item.id_prodi, {
                    id_prodi: item.id_prodi,
                    nama_prodi: item.nama_prodi,
                    pendaftar: 0,
                    diterima: Number(item.total) || 0,
                });
            }
        });

        const sorted = Array.from(map.values()).sort(
            (first, second) => second.pendaftar - first.pendaftar
        );

        if (sorted.length <= 11) return sorted;

        const visible = sorted.slice(0, 10);
        const rest = sorted.slice(10);

        return [
            ...visible,
            {
                id_prodi: "lainnya",
                nama_prodi: "Lainnya",
                pendaftar: rest.reduce((sum, item) => sum + item.pendaftar, 0),
                diterima: rest.reduce((sum, item) => sum + item.diterima, 0),
            },
        ];
    }, [data]);

    const statusSummary = useMemo(() => {
        const items = [
            {
                key: "accepted",
                label: "Diterima",
                value: Number(data.mahasiswa_lulus_biodata) || 0,
                color: "#0ca30c",
            },
            {
                key: "submitted",
                label: "Perlu review",
                value: Number(data.mahasiswa_review) || 0,
                color: "#fab219",
            },
            {
                key: "revisi",
                label: "Revisi",
                value: Number(data.mahasiswa_revisi) || 0,
                color: "#ec835a",
            },
            {
                key: "rejected",
                label: "Ditolak",
                value: Number(data.mahasiswa_ditolak) || 0,
                color: "#d03b3b",
            },
            {
                key: "incomplete",
                label: "Belum lengkap",
                value: Number(data.mahasiswa_belum_lengkap_biodata) || 0,
                color: "#cbd5e1",
            },
        ];

        return {
            items,
            total: items.reduce((sum, item) => sum + item.value, 0),
        };
    }, [data]);

    const kegiatan = useMemo(() => {
        const ppl = Number(data.jumlah_m_ppl) || 0;
        const kpm = Number(data.jumlah_m_kpm) || 0;
        const total = ppl + kpm;

        return {
            ppl,
            kpm,
            total,
            pplPercent: total ? Math.round((ppl / total) * 100) : 0,
            kpmPercent: total ? Math.round((kpm / total) * 100) : 0,
        };
    }, [data]);

    const kpiItems = [
        {
            label: "Total pengguna",
            value: data.pengguna,
            note: `${formatNumber(data.supervisor)} supervisor KPM`,
            icon: Users,
            tone: "bg-blue-50 text-blue-600 ring-blue-100",
            noteTone: "bg-blue-50 text-blue-600",
        },
        {
            label: "Mahasiswa terdaftar",
            value: data.mahasiswappl,
            note: `${formatNumber(
                data.mahasiswa_lulus_biodata
            )} lolos biodata`,
            icon: GraduationCap,
            tone: "bg-violet-50 text-violet-600 ring-violet-100",
            noteTone: "bg-violet-50 text-violet-600",
        },
        {
            label: "Sekolah mitra",
            value: data.sekolah,
            note: `${formatNumber(data.lowongan)} lowongan PPL`,
            icon: School,
            tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
            noteTone: "bg-emerald-50 text-emerald-600",
        },
        {
            label: "Desa & gampong KPM",
            value: data.jumlah_desa,
            note: `${formatNumber(
                data.jumlah_lamaran_kpm_masuk
            )} lamaran KPM masuk`,
            icon: MapPin,
            tone: "bg-amber-50 text-amber-600 ring-amber-100",
            noteTone: "bg-amber-50 text-amber-700",
        },
    ];

    const attentionItems = [
        {
            label: "Lamaran PPL masuk",
            value: data.jumlah_lamaran_ppl_masuk,
            hint: "Menunggu verifikasi",
            icon: Inbox,
            tone: "border-amber-100 bg-amber-50/60",
            iconTone: "bg-white text-amber-600",
        },
        {
            label: "Lamaran KPM masuk",
            value: data.jumlah_lamaran_kpm_masuk,
            hint: "Menunggu verifikasi",
            icon: Inbox,
            tone: "border-amber-100 bg-amber-50/60",
            iconTone: "bg-white text-amber-600",
        },
        {
            label: "Nilai belum lengkap",
            value: data.nilaikosong,
            hint: "Mahasiswa belum dinilai lengkap",
            icon: ClipboardX,
            tone: "border-rose-100 bg-rose-50/60",
            iconTone: "bg-white text-rose-600",
        },
    ];

    const chartHeight = Math.max(320, prodiData.length * 34 + 40);

    return (
        <AdminLayout title="Dashboard">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-brand-50 px-2.5 py-1 text-[11px] font-semibold text-brand-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                        Ringkasan PPKPM
                    </span>
                    <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                        Dashboard
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Halo,{" "}
                        <span className="font-semibold text-slate-700">
                            {auth?.user?.name ?? "Admin"}
                        </span>{" "}
                        👋 · {formatDate()}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="hidden text-xs text-slate-400 sm:block">
                            Diperbarui {formatTime(lastUpdated)}
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => getData(true)}
                        disabled={loading || refreshing}
                        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-200 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                refreshing ? "animate-spin" : ""
                            }`}
                        />
                        Perbarui
                    </button>
                </div>
            </div>

            {loading ? (
                <DashboardSkeleton />
            ) : error && Object.keys(data).length === 0 ? (
                <div className="rounded-2xl border border-rose-100 bg-rose-50/60 p-6">
                    <p className="text-sm font-semibold text-rose-700">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={() => getData()}
                        className="mt-3 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-rose-700"
                    >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Coba lagi
                    </button>
                </div>
            ) : (
                <div
                    className={`space-y-5 transition-opacity ${
                        refreshing ? "pointer-events-none opacity-60" : ""
                    }`}
                >
                    {error && (
                        <div className="flex flex-col gap-2 rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-sm text-amber-700 sm:flex-row sm:items-center sm:justify-between">
                            <span>{error}</span>
                            <button
                                type="button"
                                onClick={() => getData(true)}
                                className="w-fit rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
                            >
                                Coba lagi
                            </button>
                        </div>
                    )}

                    {/* KPI */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {kpiItems.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.label}
                                    className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <span
                                            className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${item.tone}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${item.noteTone}`}
                                        >
                                            {item.note}
                                        </span>
                                    </div>
                                    <p className="mt-4 text-sm font-medium text-slate-500">
                                        {item.label}
                                    </p>
                                    <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                                        {formatNumber(item.value)}
                                    </p>
                                </div>
                            );
                        })}
                    </div>

                    {/* Charts */}
                    <div className="grid gap-5 xl:grid-cols-3">
                        <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)] sm:p-6 xl:col-span-2">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                        Rekap program studi
                                    </p>
                                    <h2 className="mt-1 text-base font-semibold text-slate-900">
                                        Pendaftar & diterima
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Jumlah mahasiswa per program studi
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                                    {[
                                        { key: "chart", label: "Grafik" },
                                        { key: "table", label: "Tabel" },
                                    ].map((view) => (
                                        <button
                                            key={view.key}
                                            type="button"
                                            onClick={() => setChartView(view.key)}
                                            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                                chartView === view.key
                                                    ? "bg-white text-slate-800 shadow-sm"
                                                    : "text-slate-500 hover:text-slate-700"
                                            }`}
                                        >
                                            {view.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-600">
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{
                                            backgroundColor: SERIES.pendaftar,
                                        }}
                                    />
                                    Pendaftar
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span
                                        className="h-2.5 w-2.5 rounded-full"
                                        style={{
                                            backgroundColor: SERIES.diterima,
                                        }}
                                    />
                                    Diterima
                                </span>
                            </div>

                            {prodiData.length === 0 ? (
                                <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 py-16 text-sm text-slate-400">
                                    Belum ada data program studi.
                                </div>
                            ) : chartView === "chart" ? (
                                <div
                                    className="mt-4 w-full flex-1"
                                    style={{ minHeight: chartHeight }}
                                >
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={prodiData}
                                            layout="vertical"
                                            margin={{
                                                top: 0,
                                                right: 20,
                                                left: 0,
                                                bottom: 4,
                                            }}
                                            barGap={2}
                                            barCategoryGap={14}
                                        >
                                            <CartesianGrid
                                                horizontal={false}
                                                stroke="#eef1f6"
                                            />
                                            <XAxis
                                                type="number"
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                                tick={{
                                                    fill: "#98a2b3",
                                                    fontSize: 11,
                                                }}
                                            />
                                            <YAxis
                                                type="category"
                                                dataKey="nama_prodi"
                                                width={72}
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{
                                                    fill: "#475467",
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                }}
                                            />
                                            <Tooltip
                                                cursor={{ fill: "#f8fafc" }}
                                                content={<ProdiTooltip />}
                                            />
                                            <Bar
                                                dataKey="pendaftar"
                                                fill={SERIES.pendaftar}
                                                radius={[0, 4, 4, 0]}
                                                maxBarSize={16}
                                            />
                                            <Bar
                                                dataKey="diterima"
                                                fill={SERIES.diterima}
                                                radius={[0, 4, 4, 0]}
                                                maxBarSize={16}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            ) : (
                                <div className="mt-4 max-h-[480px] overflow-auto rounded-xl border border-slate-100">
                                    <table className="w-full text-left text-sm">
                                        <thead className="sticky top-0 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                                            <tr>
                                                <th className="px-4 py-2.5 font-semibold">
                                                    Program studi
                                                </th>
                                                <th className="px-4 py-2.5 text-right font-semibold">
                                                    Pendaftar
                                                </th>
                                                <th className="px-4 py-2.5 text-right font-semibold">
                                                    Diterima
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {prodiData.map((item) => (
                                                <tr
                                                    key={item.id_prodi}
                                                    className="hover:bg-slate-50/70"
                                                >
                                                    <td className="px-4 py-2.5 font-medium text-slate-700">
                                                        {item.nama_prodi}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                                                        {formatNumber(
                                                            item.pendaftar
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-2.5 text-right tabular-nums text-slate-600">
                                                        {formatNumber(
                                                            item.diterima
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-5">
                            {/* Status biodata */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Verifikasi
                                </p>
                                <div className="mt-1 flex items-baseline justify-between gap-3">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Status biodata
                                    </h2>
                                    <span className="text-xs font-medium text-slate-400">
                                        {formatNumber(statusSummary.total)}{" "}
                                        mahasiswa
                                    </span>
                                </div>

                                <div
                                    className="mt-5 flex h-3 w-full gap-[2px] overflow-hidden rounded-full bg-slate-100"
                                    role="img"
                                    aria-label={`Status biodata: ${statusSummary.items
                                        .map(
                                            (item) =>
                                                `${item.label} ${item.value}`
                                        )
                                        .join(", ")}`}
                                >
                                    {statusSummary.items.map((item) =>
                                        item.value > 0 ? (
                                            <div
                                                key={item.key}
                                                className="h-full first:rounded-l-full last:rounded-r-full"
                                                style={{
                                                    flexGrow: item.value,
                                                    flexBasis: 0,
                                                    backgroundColor: item.color,
                                                }}
                                                title={`${item.label}: ${formatNumber(
                                                    item.value
                                                )}`}
                                            />
                                        ) : null
                                    )}
                                </div>

                                <ul className="mt-4 space-y-0.5">
                                    {statusSummary.items.map((item) => (
                                        <li
                                            key={item.key}
                                            className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                                        >
                                            <span className="flex items-center gap-2.5 text-sm text-slate-600">
                                                <span
                                                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            item.color,
                                                    }}
                                                />
                                                {item.label}
                                            </span>
                                            <span className="flex items-baseline gap-2">
                                                <span className="text-sm font-semibold tabular-nums text-slate-900">
                                                    {formatNumber(item.value)}
                                                </span>
                                                <span className="w-9 text-right text-[11px] font-medium tabular-nums text-slate-400">
                                                    {statusSummary.total
                                                        ? Math.round(
                                                              (item.value /
                                                                  statusSummary.total) *
                                                                  100
                                                          )
                                                        : 0}
                                                    %
                                                </span>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Komposisi kegiatan */}
                            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
                                <div className="flex items-baseline justify-between gap-3">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Komposisi kegiatan
                                    </h2>
                                    <span className="text-xs font-medium text-slate-400">
                                        {formatNumber(kegiatan.total)} mahasiswa
                                    </span>
                                </div>

                                <div className="mt-5 space-y-4">
                                    <div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 font-medium text-slate-600">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            SERIES.pendaftar,
                                                    }}
                                                />
                                                PPL
                                            </span>
                                            <span className="tabular-nums text-slate-500">
                                                <span className="font-semibold text-slate-900">
                                                    {formatNumber(kegiatan.ppl)}
                                                </span>{" "}
                                                · {kegiatan.pplPercent}%
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-blue-100">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${kegiatan.pplPercent}%`,
                                                    backgroundColor:
                                                        SERIES.pendaftar,
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="flex items-center gap-2 font-medium text-slate-600">
                                                <span
                                                    className="h-2.5 w-2.5 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            SERIES.diterima,
                                                    }}
                                                />
                                                KPM
                                            </span>
                                            <span className="tabular-nums text-slate-500">
                                                <span className="font-semibold text-slate-900">
                                                    {formatNumber(kegiatan.kpm)}
                                                </span>{" "}
                                                · {kegiatan.kpmPercent}%
                                            </span>
                                        </div>
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-orange-100">
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${kegiatan.kpmPercent}%`,
                                                    backgroundColor:
                                                        SERIES.diterima,
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Perlu perhatian */}
                    <div>
                        <h2 className="mb-3 text-sm font-semibold text-slate-700">
                            Perlu perhatian
                        </h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            {attentionItems.map((item) => {
                                const Icon = item.icon;

                                return (
                                    <div
                                        key={item.label}
                                        className={`flex items-start gap-4 rounded-2xl border p-4 ${item.tone}`}
                                    >
                                        <span
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-sm ${item.iconTone}`}
                                        >
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-slate-600">
                                                {item.label}
                                            </p>
                                            <p className="mt-0.5 text-2xl font-bold tracking-tight text-slate-900">
                                                {formatNumber(item.value)}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                {item.hint}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
