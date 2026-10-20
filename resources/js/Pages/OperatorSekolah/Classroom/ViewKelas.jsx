import React, { useState, useEffect } from "react";
import banner from "../../../../../public/assets/img_backtoschool.jpg";
import { Head, Link } from "@inertiajs/react";
import OperatorSekolahLayout from "@/Layouts/OperatorSekolahLayout";
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
    alpha,
} from "@mui/material";
import {
    Assignment,
    School,
    People,
    KeyboardArrowDown,
    KeyboardArrowUp,
    OpenInNew,
    Phone,
    Schedule,
    Person,
    Badge,
    AccountBalance,
} from "@mui/icons-material";

const ViewKelas = ({ base_url, data }) => {
    const [loading, setLoading] = useState(true);
    const [sekolahData, setSekolahData] = useState(null);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("mahasiswa"); // 'mahasiswa', 'tasks', 'pamong'
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(
                `${base_url}/api/operator-sekolah/classroom/${data.id_sekolah_tbl}/data`
            );
            if (res.data?.success) {
                setSekolahData(res.data.data);
            } else {
                setError(res.data?.message || "Gagal memuat data kelas sekolah.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Terjadi kesalahan saat memuat kelas.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [data.id_sekolah_tbl]);

    const sekolah = sekolahData?.sekolah;
    const mahasiswa = sekolahData?.mahasiswa || [];
    const tasks = sekolahData?.tasks || [];
    const ampraham = sekolahData?.ampraham || [];

    const kepsekList = ampraham.filter((a) =>
        (a.jabatan || "").toLowerCase().includes("kepala sekolah")
    );
    const pamongList = ampraham.filter((a) =>
        (a.jabatan || "").toLowerCase().includes("pamong")
    );

    return (
        <OperatorSekolahLayout>
            <Head title={`Monitoring PPL ${sekolah?.name || "Sekolah"} - Admin Sekolah`} />

            <div className="w-full max-w-screen-lg flex flex-col gap-y-4">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Link
                        href="/operator-sekolah/dashboard"
                        className="text-[#06359f] hover:underline flex items-center gap-1 font-semibold"
                    >
                        &larr; Portal Admin Sekolah
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800 font-semibold">{sekolah?.name || "Detail Kelas PPL"}</span>
                </div>

                {/* Main Card Container */}
                <div className="relative min-h-[380px] bg-white w-full rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col gap-y-5">
                    {loading && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm rounded-2xl">
                            <ThreeDot color="#06359f" size="medium" />
                            <span className="mt-3 text-sm font-semibold text-slate-600">
                                Memuat data kelas PPL...
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
                                <span className="bg-blue-600/90 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                    {sekolah?.gelombang?.name || "Semester Aktif"}
                                </span>
                                <span className="bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                                    Sekolah Mitra PPL
                                </span>
                            </div>
                            <h2 className="font-bold text-xl md:text-2xl lg:text-3xl text-white">
                                {sekolah?.name}
                            </h2>
                            <p className="text-sm md:text-base text-white/90 mt-0.5">
                                Supervisor: {sekolah?.nama_supervisor || "Belum Ditentukan"}
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
                                value="mahasiswa"
                                icon={<People sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label={`Mahasiswa PPL (${mahasiswa.length})`}
                            />
                            <Tab
                                value="tasks"
                                icon={<Assignment sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label={`Tugas & Laporan PPL (${tasks.length})`}
                            />
                            <Tab
                                value="pamong"
                                icon={<School sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label={`Kepsek & Pamong (${ampraham.length})`}
                            />
                        </Tabs>
                    </Box>

                    {/* TAB 1: MAHASISWA PPL & PAMONG */}
                    {activeTab === "mahasiswa" && (
                        <div className="flex flex-col gap-y-3">
                            <span className="text-xs text-slate-500 font-medium">
                                Daftar mahasiswa yang ditempatkan pada sekolah ini beserta penugasan Guru Pamong pendamping.
                            </span>

                            {mahasiswa.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {mahasiswa.map((m, idx) => (
                                        <div
                                            key={m.nim || idx}
                                            className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between gap-3 hover:border-slate-300 transition-all"
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar
                                                    sx={{
                                                        width: 44,
                                                        height: 44,
                                                        bgcolor: "#06359f",
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {m.nama_mahasiswa?.charAt(0) || "M"}
                                                </Avatar>
                                                <div className="flex-1">
                                                    <h4 className="font-bold text-slate-800 text-sm md:text-base leading-snug">
                                                        {m.nama_mahasiswa}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 mt-0.5">
                                                        NIM: <span className="font-mono font-medium">{m.nim}</span>
                                                    </p>
                                                    <p className="text-xs text-slate-600 mt-0.5">
                                                        Prodi: {m.prodi || "-"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1.5 text-xs">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-slate-500 font-medium">
                                                        Guru Pamong:
                                                    </span>
                                                    <span className="font-bold text-slate-800">
                                                        {m.nama_pamong || "Belum Ditentukan"}
                                                    </span>
                                                </div>

                                                {m.nip_pamong && (
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-slate-500 font-medium">
                                                            NIP Pamong:
                                                        </span>
                                                        <span className="font-mono text-slate-700">
                                                            {m.nip_pamong}
                                                        </span>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between pt-1">
                                                    {m.status ? (
                                                        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                                                            Status: {m.status}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-400 text-[11px]">
                                                            Status Aktif
                                                        </span>
                                                    )}

                                                    {m.no_hp && (
                                                        <a
                                                            href={`https://wa.me/${m.no_hp.replace(/^0/, "62")}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold"
                                                        >
                                                            <Phone sx={{ fontSize: 13 }} />
                                                            <span>Hubungi WA</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="font-medium text-sm">Belum ada mahasiswa yang terdaftar di sekolah ini.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: TUGAS & LAPORAN PPL (In-place Expandable) */}
                    {activeTab === "tasks" && (
                        <div className="flex flex-col gap-y-3">
                            <span className="text-xs text-slate-500 font-medium">
                                Pantau laporan dan tugas yang dikumpulkan mahasiswa PPL di sekolah ini langsung di tempat.
                            </span>

                            {tasks.length > 0 ? (
                                <div className="flex flex-col gap-y-3">
                                    {tasks.map((task) => {
                                        const isExpanded = expandedTaskId === task.id;
                                        const submissions = task.submissions || [];

                                        return (
                                            <div
                                                key={task.id}
                                                className={`border rounded-xl transition-all duration-200 overflow-hidden ${
                                                    isExpanded
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
                                                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                                isExpanded
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
                                                                <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
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
                                                                                <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
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
                                                                                    <span>Buka Laporan</span>
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
                                                                Belum ada mahasiswa di sekolah ini yang mengumpulkan laporan.
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
                                    <p className="font-medium text-sm">Belum ada tugas atau laporan PPL untuk kelas ini.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: KEPALA SEKOLAH & GURU PAMONG */}
                    {activeTab === "pamong" && (
                        <div className="flex flex-col gap-4">
                            <span className="text-xs text-slate-500 font-medium">
                                Informasi honorarium dan penugasan Kepala Sekolah serta Guru Pamong pada periode ini.
                            </span>

                            {/* Kepala Sekolah Section */}
                            <div className="flex flex-col gap-2">
                                <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                                    <Person sx={{ fontSize: 18, color: "#06359f" }} />
                                    <span>Kepala Sekolah</span>
                                </h4>

                                {kepsekList.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {kepsekList.map((kep) => (
                                            <div
                                                key={kep.id}
                                                className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-2"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-800">{kep.name}</p>
                                                        <p className="text-slate-500">NIP: {kep.nip || "-"}</p>
                                                    </div>
                                                    <Chip
                                                        label={kep.status || "Aktif"}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Bank: {kep.nama_bank || "-"}</span>
                                                    <span>Rekening: {kep.no_rekening || "-"}</span>
                                                </div>
                                                {kep.link_document && (
                                                    <a
                                                        href={`${base_url}/storage/${kep.link_document.replace('public/', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-700 font-bold hover:underline inline-flex items-center gap-1"
                                                    >
                                                        <OpenInNew sx={{ fontSize: 13 }} />
                                                        <span>Lihat Dokumen / SK</span>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                                        Data Kepala Sekolah belum terisi untuk periode ini.
                                    </div>
                                )}
                            </div>

                            {/* Guru Pamong Section */}
                            <div className="flex flex-col gap-2 pt-3 border-t border-slate-100">
                                <h4 className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                                    <School sx={{ fontSize: 18, color: "#008a01" }} />
                                    <span>Guru Pamong ({pamongList.length})</span>
                                </h4>

                                {pamongList.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {pamongList.map((pam) => (
                                            <div
                                                key={pam.id}
                                                className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col gap-2"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-800">{pam.name}</p>
                                                        <p className="text-slate-500">NIP: {pam.nip || "-"}</p>
                                                    </div>
                                                    <Chip
                                                        label={pam.status || "Aktif"}
                                                        size="small"
                                                        color="success"
                                                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                                                    />
                                                </div>
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Bank: {pam.nama_bank || "-"}</span>
                                                    <span>Rekening: {pam.no_rekening || "-"}</span>
                                                </div>
                                                {pam.username_mahasiswa && (
                                                    <p className="text-slate-700 font-medium">
                                                        Mahasiswa Bimbingan: NIM {pam.username_mahasiswa}
                                                    </p>
                                                )}
                                                {pam.link_document && (
                                                    <a
                                                        href={`${base_url}/storage/${pam.link_document.replace('public/', '')}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                                                    >
                                                        <OpenInNew sx={{ fontSize: 13 }} />
                                                        <span>Lihat Dokumen / SK</span>
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-4 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                                        Belum ada data Guru Pamong untuk periode ini.
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-2">
                                <Link
                                    href="/operator-sekolah/data/kepsek-pamong"
                                    className="px-4 py-2 bg-[#06359f] hover:bg-[#042574] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                                >
                                    <span>Kelola Data Kepsek & Pamong Selengkapnya &rarr;</span>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </OperatorSekolahLayout>
    );
};

export default ViewKelas;
