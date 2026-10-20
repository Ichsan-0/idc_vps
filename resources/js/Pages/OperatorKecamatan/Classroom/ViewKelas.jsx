import React, { useState, useEffect } from "react";
import banner from "../../../../../public/assets/img_backtoschool.jpg";
import { Head, Link } from "@inertiajs/react";
import OperatorKecamatanLayout from "@/Layouts/OperatorKecamatanLayout";
import { ThreeDot } from "react-loading-indicators";
import axios from "axios";
import {
    Box,
    Tabs,
    Tab,
    Typography,
    Chip,
    Paper,
    Avatar,
    Button,
    Collapse,
    IconButton,
    Divider,
    alpha,
} from "@mui/material";
import {
    Assignment,
    CheckCircleOutline,
    People,
    AccountBalance,
    SupervisorAccount,
    KeyboardArrowDown,
    KeyboardArrowUp,
    OpenInNew,
    Phone,
    Schedule,
    School,
    Person,
} from "@mui/icons-material";

const ViewKelas = ({ base_url, data }) => {
    const [loading, setLoading] = useState(true);
    const [kelasData, setKelasData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("tasks"); // 'tasks', 'mahasiswa', 'keuchik'
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                `${base_url}/api/operator-kecamatan/classroom/${data.id_kelas}/data`
            );
            if (res.data?.success) {
                setKelasData(res.data.data);
            } else {
                setError(res.data?.message || "Gagal memuat data kelas.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat memuat kelas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [data.id_kelas]);

    const kelas = kelasData?.kelas;
    const mahasiswa = kelasData?.mahasiswa || [];
    const tasks = kelasData?.tasks || [];
    const keuchik = kelasData?.keuchik;
    const camat = kelasData?.camat;

    return (
        <OperatorKecamatanLayout>
            <Head title={`Monitoring Kelas ${kelas?.name || "KPM"} - Admin Kecamatan`} />

            <div className="w-full max-w-screen-lg flex flex-col gap-y-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Link
                        href="/operator-kecamatan/dashboard"
                        className="text-[#06359f] hover:underline flex items-center gap-1 font-semibold"
                    >
                        &larr; Portal Admin Kecamatan
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-semibold">{kelas?.name || "Detail Kelas KPM"}</span>
                </div>

                {/* Main Card Container */}
                <div className="relative min-h-[380px] bg-white w-full rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col gap-y-5">
                    {loading && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm rounded-2xl">
                            <ThreeDot color="#06359f" size="medium" />
                            <span className="mt-3 text-sm font-semibold text-slate-600">
                                Memuat data kelas KPM...
                            </span>
                        </div>
                    )}

                    {/* Banner Kelas */}
                    <div className="w-full relative">
                        <img
                            src={banner}
                            className="w-full relative object-cover rounded-xl max-h-48"
                            alt="Banner Kelas"
                        />
                        <div className="absolute inset-0 flex flex-col justify-end text-white bg-black/50 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {kelas?.gelombang?.name || "Semester Aktif"}
                                </span>
                                <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                    Lokasi KPM
                                </span>
                            </div>
                            <h2 className="font-bold text-xl md:text-2xl lg:text-3xl text-white">
                                {kelas?.name}
                            </h2>
                            <p className="text-sm md:text-base text-white/90 mt-0.5">
                                Supervisor: {kelas?.nama_supervisor || "Belum Ditentukan"}
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <Tabs
                            value={activeTab}
                            onChange={(e, val) => setActiveTab(val)}
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "0.92rem",
                                    minHeight: 48,
                                    px: { xs: 1.5, sm: 3 },
                                },
                            }}
                        >
                            <Tab
                                value="tasks"
                                icon={<Assignment sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label={`Tugas & Monitoring (${tasks.length})`}
                            />
                            <Tab
                                value="mahasiswa"
                                icon={<People sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label={`Mahasiswa KPM (${mahasiswa.length})`}
                            />
                            <Tab
                                value="keuchik"
                                icon={<AccountBalance sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label="Perangkat Desa & Camat"
                            />
                        </Tabs>
                    </Box>

                    {/* TAB 1: TUGAS & MONITORING (In-place Expandable) */}
                    {activeTab === "tasks" && (
                        <div className="flex flex-col gap-y-3">
                            <div className="flex items-center justify-between pb-1">
                                <span className="text-xs text-slate-500 font-medium">
                                    Klik pada tugas untuk melihat pengumpulan link & status dari mahasiswa desa ini secara langsung (tanpa reload).
                                </span>
                            </div>

                            {tasks.length > 0 ? (
                                <div className="flex flex-col gap-y-3">
                                    {tasks.map((task) => {
                                        const isExpanded = expandedTaskId === task.id;
                                        const submissions = task.submissions || [];

                                        return (
                                            <div
                                                key={task.id}
                                                className={`border rounded-xl transition-all duration-200 overflow-hidden ${isExpanded
                                                        ? "border-[#06359f] shadow-md bg-white"
                                                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                                    }`}
                                            >
                                                {/* Task Header */}
                                                <div
                                                    onClick={() =>
                                                        setExpandedTaskId(isExpanded ? null : task.id)
                                                    }
                                                    className="p-4 flex items-center justify-between cursor-pointer select-none"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${isExpanded
                                                                    ? "bg-[#06359f] text-white"
                                                                    : "bg-blue-50 text-[#06359f]"
                                                                }`}
                                                        >
                                                            <Assignment sx={{ fontSize: 22 }} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-slate-800 text-sm md:text-base">
                                                                {task.name}
                                                            </h4>
                                                            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                                                                <span className="flex items-center gap-1">
                                                                    <Schedule sx={{ fontSize: 14 }} />
                                                                    Tenggat: {task.tenggat || "Tidak Ditentukan"}
                                                                </span>
                                                                <span>&bull;</span>
                                                                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                                                    {submissions.length} Pengumpulan
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
                                                            {isExpanded ? "Tutup" : "Lihat Pengumpulan"}
                                                        </span>
                                                        <IconButton size="small">
                                                            {isExpanded ? (
                                                                <KeyboardArrowUp />
                                                            ) : (
                                                                <KeyboardArrowDown />
                                                            )}
                                                        </IconButton>
                                                    </div>
                                                </div>

                                                {/* In-Place Submissions Details */}
                                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                    <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/60">
                                                        <h5 className="font-bold text-xs uppercase text-slate-600 mb-2 tracking-wider">
                                                            Daftar Mahasiswa yang Mengumpulkan ({submissions.length} dari {mahasiswa.length})
                                                        </h5>

                                                        {submissions.length > 0 ? (
                                                            <div className="flex flex-col gap-2">
                                                                {submissions.map((sub) => (
                                                                    <div
                                                                        key={sub.id}
                                                                        className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs"
                                                                    >
                                                                        <div className="flex items-center gap-2.5">
                                                                            <Avatar
                                                                                sx={{
                                                                                    width: 32,
                                                                                    height: 32,
                                                                                    fontSize: 13,
                                                                                    bgcolor: "#06359f",
                                                                                    fontWeight: 700,
                                                                                }}
                                                                            >
                                                                                {sub.nama_mahasiswa?.charAt(0) || "M"}
                                                                            </Avatar>
                                                                            <div>
                                                                                <p className="font-bold text-sm text-slate-800 leading-tight">
                                                                                    {sub.nama_mahasiswa}
                                                                                </p>
                                                                                <p className="text-xs text-slate-500">
                                                                                    NIM: {sub.username_mahasiswa} &bull; {sub.prodi || "Mahasiswa"}
                                                                                </p>
                                                                            </div>
                                                                        </div>

                                                                        <div className="flex items-center gap-2 self-end sm:self-auto">
                                                                            {sub.score !== null && sub.score !== undefined && (
                                                                                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                                                                    Nilai: {sub.score}
                                                                                </span>
                                                                            )}

                                                                            {sub.link ? (
                                                                                <a
                                                                                    href={sub.link}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
                                                                                >
                                                                                    <span>Buka Link Tugas</span>
                                                                                    <OpenInNew sx={{ fontSize: 13 }} />
                                                                                </a>
                                                                            ) : (
                                                                                <span className="text-xs text-slate-400 italic">
                                                                                    Belum ada link
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="p-4 text-center text-xs text-slate-500 bg-white rounded-lg border border-dashed border-slate-200">
                                                                Belum ada mahasiswa di desa ini yang mengumpulkan tugas ini.
                                                            </div>
                                                        )}
                                                    </div>
                                                </Collapse>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="font-medium text-sm">Belum ada tugas untuk kelas KPM ini.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: MAHASISWA & BIMBINGAN */}
                    {activeTab === "mahasiswa" && (
                        <div className="flex flex-col gap-y-3">
                            <span className="text-xs text-slate-500 font-medium">
                                Mahasiswa aktif yang ditempatkan pada lokasi KPM ini beserta kemajuan bimbingan bersama dosen supervisor.
                            </span>

                            {mahasiswa.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {mahasiswa.map((m) => (
                                        <div
                                            key={m.nim}
                                            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        bgcolor: "#008a01",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {m.name?.charAt(0) || "M"}
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug">
                                                        {m.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        NIM: <span className="font-mono font-medium">{m.nim}</span>
                                                    </p>
                                                    <p className="text-xs text-slate-600 mt-0.5">
                                                        Prodi: {m.prodi || "-"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                                                <div className="flex items-center gap-1.5">
                                                    <CheckCircleOutline sx={{ fontSize: 16, color: "#008a01" }} />
                                                    <span className="font-semibold text-slate-700">
                                                        Bimbingan Disetujui:
                                                    </span>
                                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                                                        {m.bimbingan_count || 0} / 4 Tahap
                                                    </span>
                                                </div>

                                                {m.no_hp && (
                                                    <a
                                                        href={`https://wa.me/${m.no_hp.replace(/^0/, "62")}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
                                                    >
                                                        <Phone sx={{ fontSize: 14 }} />
                                                        <span>Hubungi WA</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="font-medium text-sm">Belum ada mahasiswa yang terdaftar di lokasi KPM ini.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: PERANGKAT DESA (KEUCHIK) & CAMAT */}
                    {activeTab === "keuchik" && (
                        <div className="flex flex-col gap-4">
                            <span className="text-xs text-slate-500 font-medium">
                                Informasi administrasi dan honorarium perangkat desa (Keuchik) serta Camat untuk lokasi ini.
                            </span>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Keuchik Card */}
                                <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#06359f] flex items-center justify-center">
                                                <Person />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">
                                                    Keuchik Gampong / Desa
                                                </h4>
                                                <p className="text-xs text-slate-500">{kelas?.name}</p>
                                            </div>
                                        </div>
                                        {keuchik?.status && (
                                            <Chip
                                                label={keuchik.status}
                                                size="small"
                                                color={keuchik.status === "diterima" ? "success" : "default"}
                                                sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                                            />
                                        )}
                                    </div>

                                    {keuchik ? (
                                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Nama Keuchik:</span>
                                                <span className="font-bold text-slate-800">{keuchik.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">NIP:</span>
                                                <span className="font-mono text-slate-700">{keuchik.nip || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Pangkat/Golongan:</span>
                                                <span className="text-slate-700">{keuchik.pangkat_dan_golongan || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Nama Bank:</span>
                                                <span className="text-slate-700">{keuchik.nama_bank || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">No. Rekening:</span>
                                                <span className="font-mono text-slate-700">{keuchik.no_rekening || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Atas Nama Rekening:</span>
                                                <span className="text-slate-700">{keuchik.nama_di_buku_rekening || "-"}</span>
                                            </div>

                                            {keuchik.link_document && (
                                                <div className="pt-2 mt-1">
                                                    <a
                                                        href={`${base_url}/storage/${keuchik.link_document.replace('public/', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs text-blue-700 font-bold hover:underline"
                                                    >
                                                        <OpenInNew sx={{ fontSize: 14 }} />
                                                        <span>Lihat Dokumen / SK Ampraham</span>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                                            Belum ada data honorarium/ampraham Keuchik untuk desa ini.
                                        </div>
                                    )}
                                </div>

                                {/* Camat Card */}
                                <div className="p-5 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200 flex flex-col gap-3 shadow-xs">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#008a01] flex items-center justify-center">
                                                <AccountBalance />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-800 text-sm">
                                                    Camat Kecamatan
                                                </h4>
                                                <p className="text-xs text-slate-500">Pimpinan Wilayah</p>
                                            </div>
                                        </div>
                                        {camat?.status && (
                                            <Chip
                                                label={camat.status}
                                                size="small"
                                                color={camat.status === "diterima" ? "success" : "default"}
                                                sx={{ fontWeight: 700, fontSize: "0.72rem" }}
                                            />
                                        )}
                                    </div>

                                    {camat ? (
                                        <div className="flex flex-col gap-2 pt-2 border-t border-slate-100 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Nama Camat:</span>
                                                <span className="font-bold text-slate-800">{camat.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">NIP:</span>
                                                <span className="font-mono text-slate-700">{camat.nip || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Pangkat/Golongan:</span>
                                                <span className="text-slate-700">{camat.pangkat_dan_golongan || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Nama Bank:</span>
                                                <span className="text-slate-700">{camat.nama_bank || "-"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">No. Rekening:</span>
                                                <span className="font-mono text-slate-700">{camat.no_rekening || "-"}</span>
                                            </div>

                                            {camat.link_document && (
                                                <div className="pt-2 mt-1">
                                                    <a
                                                        href={`${base_url}/storage/${camat.link_document.replace('public/', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-bold hover:underline"
                                                    >
                                                        <OpenInNew sx={{ fontSize: 14 }} />
                                                        <span>Lihat Dokumen / SK Camat</span>
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center bg-white rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                                            Belum ada data Camat terdaftar di tabel ampraham.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <Link
                                    href="/operator-kecamatan/data/camat-keuchik"
                                    className="px-4 py-2 bg-[#06359f] hover:bg-[#042574] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                                >
                                    <span>Kelola Data Camat & Keuchik Selengkapnya &rarr;</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </OperatorKecamatanLayout>
    );
};

export default ViewKelas;
