import React from "react";
import banner from "../../../../../public/assets/img_backtoschool.jpg";
import { BiTask } from "react-icons/bi";
import { Head, Link, router } from "@inertiajs/react";
import ClassroomLayout from "@/Layouts/SupervisorKPM/Classroom/ClassroomLayout";
import { useState } from "react";
import { ThreeDot } from "react-loading-indicators";
import { useEffect } from "react";
import axios from "axios";

const ViewKelas = ({ base_url, data }) => {
    const [responseError, setResponseError] = useState(null);
    const [dataKelas, setDataKelas] = useState(null);
    const [loading, setLoading] = useState(false);

    const getData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${base_url}/api/student/classroom/${data.id_kelas}/task`
            );

            if (response?.data?.success === true) {
                setDataKelas(response?.data?.data);
            }
        } catch (err) {
            setResponseError(err?.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    return (
        <ClassroomLayout>
            <Head title="Tugas kelas" />
            <div className="w-full max-w-screen-lg flex flex-col gap-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                    <Link
                        href="/supervisor/classroom/home"
                        className="text-[#06359f] hover:underline flex items-center gap-1"
                    >
                        &larr; Portal Supervisor
                    </Link>
                    <span>/</span>
                    <span className="text-slate-800">{dataKelas?.name || "Kelas"}</span>
                </div>

                <div className="relative min-h-[360px] bg-white w-full rounded-2xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col gap-y-4">
                    {loading && (
                        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white/85 backdrop-blur-sm rounded-2xl">
                            <ThreeDot color="#06359f" size="medium" />
                            <span className="mt-3 text-sm font-semibold text-slate-600">
                                Memuat tugas kelas...
                            </span>
                        </div>
                    )}
                    <div className="w-full relative">
                        <img
                            src={banner}
                            className="w-full relative object-cover rounded-xl max-h-48"
                        ></img>
                        <div className="absolute inset-0 flex flex-col justify-end text-white bg-black/40 rounded-xl p-5">
                            <h2 className="font-bold text-xl md:text-2xl lg:text-3xl text-white">
                                {dataKelas?.name}
                            </h2>
                            <p className="text-sm md:text-base text-white/90">
                                {dataKelas?.gelombang?.name || "Periode KPM"}
                            </p>
                        </div>
                    </div>

                    <ul className="flex flex-col gap-y-3">
                        {dataKelas?.tasks?.map((item) => (
                            <li
                                key={item.id}
                                className="w-full border rounded-xl p-3.5 flex gap-x-3 bg-white hover:bg-slate-50 transition-colors border-slate-200 cursor-pointer shadow-xs"
                                onClick={(e) =>
                                    router.visit(
                                        `/supervisor-kpm/classroom/${data.id_kelas}/task/${item.id}/tugas-mahasiswa`
                                    )
                                }
                            >
                                <div className="bg-[#06359f] w-fit h-fit p-3 rounded-xl text-white">
                                    <svg
                                        focusable="false"
                                        width="22"
                                        height="22"
                                        viewBox="0 0 24 24"
                                        className="fill-white"
                                    >
                                        <path d="M7 15h7v2H7zm0-4h10v2H7zm0-4h10v2H7z"></path>
                                        <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-.14 0-.27.01-.4.04a2.008 2.008 0 0 0-1.44 1.19c-.1.23-.16.49-.16.77v14c0 .27.06.54.16.78s.25.45.43.64c.27.27.62.47 1.01.55.13.02.26.03.4.03h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-.25c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zM19 19H5V5h14v14z"></path>
                                    </svg>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-slate-800 text-base">
                                        {item?.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Tenggat: {item?.tenggat || "Tidak ada tenggat"}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </ClassroomLayout>
    );
};

export default ViewKelas;
