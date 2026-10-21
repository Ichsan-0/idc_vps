import React, { useEffect, useMemo, useState } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    Alert,
    AlertTitle,
    Box,
    InputAdornment,
    MenuItem,
    Tab,
    Tabs,
    TextField,
} from "@mui/material";
import { CheckCircleOutline, School, Search } from "@mui/icons-material";
import { ThreeDot } from "react-loading-indicators";
import axios from "axios";
import SupervisorPPLLayout from "@/Layouts/SupervisorKPM/ClassroomPPL/SupervisorPPLLayout";
import SekolahProvider from "@/Context/SekolahContext";
import SupervisorBimbinganPanel from "@/Components/Bimbingan/SupervisorBimbinganPanel";
import StudentAssessmentInlineItem from "@/Components/SupervisorKPM/StudentAssessmentInlineItem";

const ListMahasiswa = ({ base_url, data }) => {
    const [activeTab, setActiveTab] = useState("penilaian");
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [expandedNim, setExpandedNim] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get(
                    `${base_url}/api/classroom/supervisor-ppl/mahasiswa`,
                    {
                        params: {
                            id_sekolah: data?.id_sekolah,
                        },
                    }
                );

                if (response?.data?.success) {
                    setStudents(response.data.data || []);
                } else {
                    setError(
                        response?.data?.message || "Gagal memuat data mahasiswa."
                    );
                }
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        "Gagal memuat data mahasiswa."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, [base_url, data?.id_sekolah, refreshKey]);

    const filteredStudents = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return students.filter((student) => {
            const matchesSearch =
                !keyword ||
                [
                    student.nama_mahasiswa,
                    student.nim,
                    student.nama_prodi,
                    student.nama_sekolah,
                ].some((value) =>
                    String(value || "").toLowerCase().includes(keyword)
                );

            const matchesStatus =
                statusFilter === "all" || student.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [students, search, statusFilter]);

    const toggleStudent = (nim) => {
        setExpandedNim((current) => (current === nim ? null : nim));
    };

    return (
        <SekolahProvider data={data}>
            <SupervisorPPLLayout>
                <Head title="Mahasiswa PPL" />

                <div className="px-1 py-2">
                    <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-600">
                        <Link
                            href="/supervisor/classroom/home"
                            className="flex items-center gap-1 text-[#06359f] hover:underline"
                        >
                            &larr; Portal Supervisor
                        </Link>
                        <span>/</span>
                        <span className="text-slate-800">
                            Daftar Mahasiswa PPL
                        </span>
                    </div>

                    {/* Tab Navigasi: Penilaian vs Bimbingan Mahasiswa */}
                    <Box
                        sx={{
                            borderBottom: 1,
                            borderColor: "divider",
                            mb: 3,
                            bgcolor: "white",
                            p: 1,
                            borderRadius: 3,
                        }}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={(event, value) => setActiveTab(value)}
                            textColor="primary"
                            indicatorColor="primary"
                            sx={{
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: 700,
                                    fontSize: "0.95rem",
                                    minHeight: 48,
                                    px: 3,
                                },
                            }}
                        >
                            <Tab
                                value="penilaian"
                                icon={<School sx={{ fontSize: 20 }} />}
                                iconPosition="start"
                                label={`Daftar Mahasiswa & Penilaian (${students.length})`}
                            />
                            <Tab
                                value="bimbingan"
                                icon={
                                    <CheckCircleOutline
                                        sx={{ fontSize: 20 }}
                                    />
                                }
                                iconPosition="start"
                                label="Bimbingan Mahasiswa PPL"
                            />
                        </Tabs>
                    </Box>

                    {activeTab === "bimbingan" && (
                        <SupervisorBimbinganPanel
                            tipe="ppl"
                            idKelas={data?.id_sekolah}
                            base_url={base_url}
                        />
                    )}

                    {activeTab === "penilaian" && (
                        <div className="space-y-4">
                            <Alert severity="info" sx={{ borderRadius: 2 }}>
                                <AlertTitle>Petunjuk</AlertTitle>
                                <ol className="!list-decimal space-y-1 pl-5">
                                    <li>
                                        Klik salah satu baris mahasiswa untuk membuka
                                        form penilaian langsung di bawahnya.
                                    </li>
                                    <li>
                                        Isi nilai pamong dan nilai supervisor, lalu
                                        unggah instrument penilaian (PDF, maksimal 500
                                        KB).
                                    </li>
                                    <li>
                                        Klik Simpan untuk menyimpan tanpa berpindah
                                        halaman.
                                    </li>
                                </ol>
                            </Alert>

                            {error && (
                                <Alert severity="error" sx={{ borderRadius: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                {/* Toolbar */}
                                <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                        <TextField
                                            size="small"
                                            value={search}
                                            onChange={(event) =>
                                                setSearch(event.target.value)
                                            }
                                            placeholder="Cari nama, NIM, atau prodi..."
                                            sx={{
                                                minWidth: {
                                                    xs: "100%",
                                                    sm: 280,
                                                },
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 2,
                                                    bgcolor: "white",
                                                },
                                            }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search
                                                            sx={{
                                                                color: "#94a3b8",
                                                                fontSize: 20,
                                                            }}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        <TextField
                                            select
                                            size="small"
                                            label="Status"
                                            value={statusFilter}
                                            onChange={(event) =>
                                                setStatusFilter(event.target.value)
                                            }
                                            sx={{
                                                minWidth: 175,
                                                "& .MuiOutlinedInput-root": {
                                                    borderRadius: 2,
                                                    bgcolor: "white",
                                                },
                                            }}
                                        >
                                            <MenuItem value="all">
                                                Semua Status
                                            </MenuItem>
                                            <MenuItem value="Belum Dinilai">
                                                Belum Dinilai
                                            </MenuItem>
                                            <MenuItem value="Sudah Dinilai">
                                                Sudah Dinilai
                                            </MenuItem>
                                        </TextField>
                                    </div>

                                    <div className="text-sm text-slate-500">
                                        Menampilkan{" "}
                                        <span className="font-semibold text-slate-700">
                                            {filteredStudents.length}
                                        </span>{" "}
                                        dari{" "}
                                        <span className="font-semibold text-slate-700">
                                            {students.length}
                                        </span>{" "}
                                        mahasiswa
                                    </div>
                                </div>

                                {/* Header kolom (desktop) */}
                                <div className="hidden grid-cols-12 gap-3 border-b border-slate-100 bg-slate-50/80 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 md:grid">
                                    <div className="col-span-1 text-center">
                                        No
                                    </div>
                                    <div className="col-span-3">Mahasiswa</div>
                                    <div className="col-span-2">Prodi</div>
                                    <div className="col-span-2">Tempat PPL</div>
                                    <div className="col-span-1 text-center">
                                        Nilai Pamong
                                    </div>
                                    <div className="col-span-1 text-center">
                                        Nilai Supervisor
                                    </div>
                                    <div className="col-span-1 text-center">
                                        Status
                                    </div>
                                    <div className="col-span-1 text-center">
                                        Aksi
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-100">
                                    {loading && students.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16">
                                            <ThreeDot
                                                color="#06359f"
                                                size="medium"
                                            />
                                            <span className="mt-3 text-sm font-medium text-slate-500">
                                                Memuat data mahasiswa...
                                            </span>
                                        </div>
                                    ) : filteredStudents.length > 0 ? (
                                        filteredStudents.map(
                                            (student, index) => (
                                                <StudentAssessmentInlineItem
                                                    key={student.nim}
                                                    student={student}
                                                    index={index}
                                                    idKelas={data?.id_sekolah}
                                                    baseUrl={base_url}
                                                    isExpanded={
                                                        expandedNim ===
                                                        student.nim
                                                    }
                                                    onToggle={() =>
                                                        toggleStudent(
                                                            student.nim
                                                        )
                                                    }
                                                    onSaved={() =>
                                                        setRefreshKey(
                                                            (key) => key + 1
                                                        )
                                                    }
                                                />
                                            )
                                        )
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-16 text-center">
                                            <School
                                                sx={{
                                                    fontSize: 48,
                                                    color: "#cbd5e1",
                                                }}
                                            />
                                            <p className="mt-3 text-sm font-semibold text-slate-600">
                                                Tidak ada mahasiswa
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                {search ||
                                                statusFilter !== "all"
                                                    ? "Tidak ditemukan mahasiswa yang cocok dengan pencarian/filter."
                                                    : "Belum ada mahasiswa PPL di kelas ini."}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </SupervisorPPLLayout>
        </SekolahProvider>
    );
};

export default ListMahasiswa;
