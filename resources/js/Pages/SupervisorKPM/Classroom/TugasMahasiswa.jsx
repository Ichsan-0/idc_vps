import styled from "@emotion/styled";

import React from "react";
import { useState } from "react";
import { Link, usePage } from "@inertiajs/react";
import ClassroomLayout from "@/Layouts/SupervisorKPM/Classroom/ClassroomLayout";
import { ProgressBar, Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import axios from "axios";
import { useEffect } from "react";
import notFound from "../../../../../public/images/nodata-found 1.png";
import {
    Home,
    User,
    Settings,
    Search,
    Heart,
    MessageCircle,
    ChevronRight,
} from "lucide-react";
import StudentSidebar from "@/Components/SupervisorKPM/Classroom/Sidebar/StudentSidebar";
import RightSidebar from "@/Components/SupervisorKPM/Classroom/Sidebar/RightSidebar";
import YouTubeEmbed from "@/Components/YouTubeEmbed";
import Button from "@/Components/Button";



const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const TugasMahasiswa = ({ base_url, data, auth }) => {
    const [activeNav, setActiveNav] = useState("home");

    const defaultLayoutPluginInstance = defaultLayoutPlugin();
    const [dokumen, setDokumen] = useState(null);
    const [errors, setErrors] = useState({
        dukumen: null,
        link: null,
    });
    const [loading, setLoading] = useState(false);
    const [tipeTugas, setTipeTugas] = useState("file");
    const { url, component } = usePage();
    const { pathname, search } = new URL(url, window.location.origin);
    const [responseError, setResponseError] = useState(null);
    const [studentSubmissionData, setStudentSubmissionData] = useState([]);
    const [currentMahasiswa, setCurrentMahasiswa] = useState(null);
    const [privateComment, setPrivateComment] = useState(null);
    const [privateCommentData, setPrivateCommentData] = useState([]);
    const [nilai, setNilai] = useState(null);

    const getStudentSubmission = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${base_url}/api/supervisor-kpm/classroom/${data?.id_kelas}/${data?.id_tugas}/tugas-mahasiswa`
            );
            if (response?.data?.success === true) {
                setStudentSubmissionData(response?.data?.data);
            }
        } catch (err) {
            setResponseError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const makePrivateCommenct = async (e,comment) => {
        console.log('test : ', comment);
        if (comment !== null) {
            try {

                setLoading(true);

                const formData = new FormData();
                formData.append("tipe", "private");
                formData.append("id_tugas", data?.id_tugas);
                formData.append("id_kelas", data?.id_kelas);
                formData.append("created_by", auth?.user?.username);
                formData.append(
                    "receiver",
                    currentMahasiswa?.username_mahasiswa
                );
                formData.append("message", comment);

                const response = await axios.post(
                    `${base_url}/api/student/classroom/privatecomment`,
                    formData
                );

                console.log("response ", response);
                if (response.data.success === true) {
                    setPrivateComment("");
                    getPrivateComment();
                }
            } catch (err) {
                console.log(err);
                setResponseError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const getPrivateComment = async () => {
        try {
            const response = await axios.get(
                `${base_url}/api/supervisor-kpm/classroom/private-comment`,
                {
                    params: {
                        id_kelas: data?.id_kelas,
                        id_tugas: data?.id_tugas,
                        username_mahasiswa:
                            currentMahasiswa?.username_mahasiswa,
                    },
                }
            );

            if (response.data.success === true) {
                setPrivateCommentData(response.data.data);
            }
        } catch (err) {
            setResponseError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const updateNilai = async (e) => {
        if (nilai !== null || nilai !== "") {
            try {
                setLoading(true);
                const formData = new FormData();
                formData.append("id_kelas", data?.id_kelas);
                formData.append("id_tugas", data?.id_tugas);
                formData.append("status", "dinilai");
                formData.append(
                    "username_mahasiswa",
                    currentMahasiswa?.username_mahasiswa
                );
                formData.append("score", nilai);

                const response = await axios.post(
                    `${base_url}/api/supervisor-kpm/classroom/tugas-mahasiswa/nilai/update`,
                    formData
                );
                if (response.data?.success === true) {
                    setNilai("");
                    getStudentSubmission();
                }
            } catch (err) {
                setResponseError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        getStudentSubmission();
    }, []);
    useEffect(() => {
        getPrivateComment();
    }, [currentMahasiswa]);

    const renderMainContent = () => {privateCommentData
        return (
            <div className="flex flex-col gap-y-3 w-full top-24 sticky overflow-y-auto h-[calc(100vh-6rem)]">
                <div className="flex bg-[#f7f5f3] flex-row items-center gap-x-2 font-normal ml-14 p-4 border rounded-2xl">
                    <Link
                        href={`/supervisor-kpm/classroom/${data?.id_kelas}/task`}
                        className="text-gray-400"
                    >
                        Tugas
                    </Link>
                    <ChevronRight className="text-gray-400" size={18} />
                    <p className="text-gray-600">Detail Tugas</p>
                </div>
                {currentMahasiswa !== null ? (
                    currentMahasiswa?.status === "diserahkan" ||
                    currentMahasiswa?.status === "dinilai" ? (
                        ((currentMahasiswa?.link && (currentMahasiswa.link.startsWith("http://") || currentMahasiswa.link.startsWith("https://") || currentMahasiswa?.tugas?.tipe === "Link" || currentMahasiswa?.tugas?.tipe === "Link Video")) ? (
                            <div className="flex flex-col mt-9 gap-3 w-full ml-16 mr-7">
                                <p className="text-gray-600 font-normal">
                                    Tautan tugas yang dikumpulkan mahasiswa:
                                </p>
                                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-blue-700 break-all max-w-xl select-all">
                                    {currentMahasiswa?.link}
                                </div>
                                <Button
                                    variant="contained"
                                    onClick={() =>
                                        window.open(currentMahasiswa?.link, "_blank")
                                    }
                                    sx={{
                                        width: "fit-content",
                                        textTransform: "none",
                                        fontWeight: 700,
                                        bgcolor: "#06359f",
                                        "&:hover": { bgcolor: "#042574" },
                                        borderRadius: 2,
                                    }}
                                >
                                    Buka Link Tugas Mahasiswa
                                </Button>
                            </div>
                        ) : (
                            <div className="flex w-full overflow-y-auto pl-14 pr-7">
                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                                    <Viewer
                                        plugins={[defaultLayoutPluginInstance]}
                                        fileUrl={`${base_url}/storage/${(currentMahasiswa.link || "").replace(
                                            /^public\//,
                                            ""
                                        )}`}
                                        renderLoader={(percentages) => (
                                            <div
                                                style={{
                                                    width: "240px",
                                                }}
                                            >
                                                <ProgressBar
                                                    progress={Math.round(
                                                        percentages
                                                    )}
                                                />
                                            </div>
                                        )}
                                    ></Viewer>
                                </Worker>
                            </div>
                        ))
                    ) : (
                        <div className="flex w-full flex-col items-center">
                            <img
                                src={notFound}
                                className="w-80 h-80 bg-cover"
                            ></img>
                            <p className="font-bold">
                                Mahasiwa ini belum mengumpulkan tugas
                            </p>
                        </div>
                    )
                ) : (
                    <div className="flex w-full flex-col items-center">
                        <img
                            src={notFound}
                            className="w-80 h-80 bg-cover"
                        ></img>
                        <p className="font-bold">
                            Silakan pilih salah satu mahasiswa
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <ClassroomLayout title={"Detail Tugas"} disableScroll={false}>
            <div className="flex w-full flex-row h-screen">
                {/* Left Sidebar */}
                <aside className="w-64  border-r h-full flex-shrink-0">
                    <StudentSidebar
                        data={data}
                        students={studentSubmissionData}
                        selectedStudent={currentMahasiswa}
                        onStudentSelect={(student) =>{
                            setCurrentMahasiswa(student)
                            
                        }
                        }
                    />
                </aside>

                {/* Main Content */}
                <main className="flex w-full  p-6">{renderMainContent()}</main>

                {/* Right Sidebar */}
                <aside className="w-80 border-l h-full flex-shrink-0">
                    <RightSidebar
                        privateCommentData={privateCommentData}
                        selectedStudent={currentMahasiswa}
                        data={data}
                        activeNav={activeNav}
                        onNavChange={setActiveNav}
                        getStudentSubmission={getStudentSubmission}
                        onPostComment={(e, comment)=>makePrivateCommenct(e, comment)}
                    />
                </aside>
            </div>
        </ClassroomLayout>
    );
};

export default TugasMahasiswa;
