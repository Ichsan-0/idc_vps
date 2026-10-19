import ClassroomLayout from "@/Layouts/Mahasiswa/Classroom/ClassroomLayout";
import React, { useState } from "react";
import banner from "../../../../../public/assets/img_backtoschool.jpg";
import { Head, usePage } from "@inertiajs/react";
import { ThreeDot } from "react-loading-indicators";
import { Box, Tabs, Tab } from "@mui/material";
import { Assignment, CheckCircleOutline } from "@mui/icons-material";
import MahasiswaBimbinganView from "@/Components/Bimbingan/MahasiswaBimbinganView";
import TaskInlineItem from "@/Components/Classroom/TaskInlineItem";

const Home = ({ base_url, data }) => {
    const { auth } = usePage().props;
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("tasks"); // 'tasks' or 'bimbingan'
    const [expandedTaskId, setExpandedTaskId] = useState(null);

    return (
        <ClassroomLayout>
            <Head title={`Kelas PPL ${data?.data_kelas?.nama_tempat || ""} - IDC`} />
            <div className="relative min-h-[360px] bg-white w-full rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col gap-y-5">
                {loading && (
                    <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm rounded-2xl">
                        <ThreeDot color="#06359f" size="medium" />
                        <span className="mt-3 text-sm font-semibold text-slate-600">
                            Memuat tugas kelas...
                        </span>
                    </div>
                )}

                {/* Banner Sekolah PPL */}
                <div className="w-full relative">
                    <img
                        src={banner}
                        className="w-full relative object-cover rounded-xl max-h-48"
                        alt="Banner Sekolah PPL"
                    />
                    <div className="absolute inset-0 flex flex-col justify-end text-white bg-black/40 rounded-xl p-5">
                        <h2 className="font-bold text-xl md:text-2xl lg:text-3xl text-white">
                            {data?.data_kelas?.nama_tempat || "Sekolah Mitra PPL"}
                        </h2>
                        <p className="text-sm md:text-base text-white/90">
                            Praktik Pengalaman Lapangan (PPL)
                        </p>
                    </div>
                </div>

                {/* Tab Navigasi: Tugas PPL vs Bimbingan Supervisor */}
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
                                fontSize: "0.95rem",
                                minHeight: 48,
                                px: 3,
                            },
                        }}
                    >
                        <Tab
                            value="tasks"
                            icon={<Assignment sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label={`Tugas Kelas (${data?.tasks?.length || 0})`}
                        />
                        <Tab
                            value="bimbingan"
                            icon={<CheckCircleOutline sx={{ fontSize: 20 }} />}
                            iconPosition="start"
                            label="Bimbingan Dosen Supervisor"
                        />
                    </Tabs>
                </Box>

                {/* TAB CONTENT 1: Tugas Kelas (In-place Expandable & Tempel Link) */}
                {activeTab === "tasks" && (
                    <div className="flex flex-col gap-y-3">
                        {data?.tasks && data.tasks.length > 0 ? (
                            <ul className="flex flex-col gap-y-3">
                                {data.tasks.map((item) => (
                                    <TaskInlineItem
                                        key={item.id}
                                        task={item}
                                        idKelas={data?.data_kelas?.id}
                                        tipe="ppl"
                                        baseUrl={base_url}
                                        usernameMahasiswa={auth?.user?.username}
                                        isExpanded={expandedTaskId === item.id}
                                        onToggle={() =>
                                            setExpandedTaskId(
                                                expandedTaskId === item.id ? null : item.id
                                            )
                                        }
                                    />
                                ))}
                            </ul>
                        ) : (
                            <div className="p-8 text-center text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <p className="font-medium">Belum ada tugas untuk kelas PPL ini.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB CONTENT 2: Bimbingan Supervisor */}
                {activeTab === "bimbingan" && (
                    <MahasiswaBimbinganView
                        tipe="ppl"
                        idKelas={data?.data_kelas?.id}
                        base_url={base_url}
                    />
                )}
            </div>
        </ClassroomLayout>
    );
};

export default Home;
