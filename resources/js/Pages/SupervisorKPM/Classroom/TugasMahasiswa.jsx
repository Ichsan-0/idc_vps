import InputError from "@/Components/InputError";
import styled from "@emotion/styled";
import {
    Avatar,
    Breadcrumbs,
    Button,
    IconButton,
    TextField,
    Typography,
} from "@mui/material";
import React from "react";
import { useState } from "react";
import { LuUser, LuUsers } from "react-icons/lu";
import { SendOutlined, SendSharp } from "@mui/icons-material";
import { ThreeDot } from "react-loading-indicators";
import { Head, Link, usePage } from "@inertiajs/react";
import ClassroomLayout from "@/Layouts/SupervisorKPM/Classroom/ClassroomLayout";
import NavLink from "@/Components/SupervisorKPM/Classroom/Header/NavLink";
import { ProgressBar, Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import axios from "axios";
import { useEffect } from "react";
import notFound from "../../../../../public/images/nodata-found 1.png";

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
                // setCurrentMahasiswa(response?.data?.data[0]);
            }
        } catch (err) {
            setResponseError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const makePrivateCommenct = async () => {
        if (privateComment !== null) {
            try {
                console.log("test");

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
                formData.append("message", privateComment);

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

    return (
        <ClassroomLayout>
            <Head title="Detail" />
            {loading && (
                <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                    <ThreeDot color="#4F61E3" size="medium" />
                </div>
            )}
            <div className="flex w-full flex-col gap-3">
                <div className="w-full ">
                    <div className="py-4">
                        <Breadcrumbs>
                            <Link
                                className="text-primary"
                                href={`/supervisor-kpm/classroom/${data?.id_kelas}/task`}
                            >
                                Tugas
                            </Link>
                            <Typography>Detail</Typography>
                        </Breadcrumbs>
                    </div>
                    <div className="bg-white flex justify-start ">
                        <div
                            className={`w-fit h-fit border-primary/0 border-b-2 hover:border-primary ${
                                pathname.includes("petunjuk") &&
                                "!border-primary"
                            }`}
                        >
                            <NavLink
                                href={`/supervisor-kpm/classroom/${data?.id_kelas}/task/${data?.id_tugas}/detail`}
                                className={`group relative flex h-10 items-center gap-2.5 text-[#3c4043] px-4 font-medium duration-100 ease-in-out hover:bg-black/5 border-primary ${
                                    (pathname === "/mahasiswa/classroom" ||
                                        pathname.includes("petunjuk")) &&
                                    " !text-primary"
                                }`}
                            >
                                Petunjuk
                            </NavLink>
                        </div>
                        <div
                            className={`w-fit h-fit border-primary/0 border-b-2 hover:border-primary ${
                                pathname.includes("tugas-mahasiswa") &&
                                "!border-primary"
                            }`}
                        >
                            <NavLink
                                href={`/supervisor-kpm/classroom/${data?.id_kelas}/task/${data?.id_tugas}/tugas-mahasiswa`}
                                className={`group relative flex h-10 items-center gap-2.5 text-[#3c4043] px-4 font-medium duration-100 ease-in-out hover:bg-primary/10 border-primary ${
                                    (pathname ===
                                        "/supervisor-kpm/classroom/{id_kelas}/task/{id_tugas}/tugas-mahasiswa" ||
                                        pathname.includes("tugas-mahasiswa")) &&
                                    "!text-primary"
                                }`}
                            >
                                Tugas Mahasiswa
                            </NavLink>
                        </div>
                    </div>
                </div>

                <div className="flex w-full">
                    <div className="flex w-full flex-[0.5]">
                        <ul className="flex flex-col w-full h-[80vh] min-w-70 p-2 overflow-y-auto gap-y-3">
                            {studentSubmissionData.length > 0 ? (
                                studentSubmissionData.map((item, index) => (
                                    <li
                                        key={item.username_mahasiswa}
                                        onClick={() => {
                                            setCurrentMahasiswa(
                                                studentSubmissionData[index]
                                            );
                                        }}
                                        className={`flex flex-row w-full cursor-pointer hover:shadow-lg hover:border-primary gap-x-2 border p-3 rounded-md ${
                                            currentMahasiswa?.username_mahasiswa ===
                                            item.username_mahasiswa
                                                ? "border-primary shadow-lg"
                                                : ""
                                        }`}
                                    >
                                        <div className="flex w-full flex-row justify-between">
                                            <div className="flex w-full flex-row gap-x-2">
                                                <Avatar></Avatar>
                                                <div>
                                                    <p className="text-textblack">
                                                        {item?.mahasiswa?.name}
                                                    </p>
                                                    <p className="text-textblack text-sm">
                                                        {
                                                            item.username_mahasiswa
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <p>
                                                {item?.status === "dinilai"
                                                    ? item.score + "/100"
                                                    : 100}
                                            </p>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <></>
                            )}
                        </ul>
                    </div>

                    <div className="flex w-full">
                        {currentMahasiswa !== null ? (
                            currentMahasiswa?.status === "diserahkan" ||
                            currentMahasiswa?.status === "dinilai" ? (
                                currentMahasiswa?.tugas?.tipe === "File" ? (
                                    <div className="flex w-full overflow-y-auto h-screen p-9">
                                        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
                                            <Viewer
                                                plugins={[
                                                    defaultLayoutPluginInstance,
                                                ]}
                                                fileUrl={`${base_url}/storage/${currentMahasiswa.link.replace(
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
                                ) : (
                                    <div className="flex flex-col gap-y-3 p-5 w-full">
                                        <p className="text-center">
                                            Klik tombol dibawah ini untuk
                                            melihat video dari mahasiswa
                                        </p>
                                        <a
                                            href={currentMahasiswa.link}
                                            target="_blank"
                                            className="text-center bg-primary hover:bg-primary/55 rounded-md text-white py-2"
                                            fullWidth
                                        >
                                            Tonton Video
                                        </a>
                                    </div>
                                )
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
                    <div className="w-full flex-[1] min-w-65 rounded-lg p-5 flex gap-x-8 bg-white ">
                        <div className="flex flex-col  lg:flex-row w-full lg:cols gap-3">
                            <div className="flex w-full flex-col">
                                <div className="flex w-full flex-col gap-y-5">
                                    <div className="flex w-full justify-between">
                                        <div>
                                            <h3 className="font-bold text-[#3c4043]">
                                                {
                                                    currentMahasiswa?.mahasiswa
                                                        ?.name
                                                }
                                            </h3>
                                            <h3 className="text-[#3c4043]">
                                                {
                                                    currentMahasiswa?.username_mahasiswa
                                                }
                                            </h3>
                                        </div>

                                        <p className=" text-[#3c4043] ">
                                            <p>
                                                {currentMahasiswa?.status ===
                                                "dinilai"
                                                    ? currentMahasiswa?.score +
                                                      "/100"
                                                    : 100}
                                            </p>
                                        </p>
                                    </div>
                                    <div>{currentMahasiswa?.status}</div>

                                    {currentMahasiswa?.status !==
                                        "ditugaskan" && (
                                        <>
                                            <div className="flex flex-col gap-y-2">
                                                <TextField
                                                    size="small"
                                                    label="Nilai"
                                                    value={nilai}
                                                    onChange={(e) =>
                                                        setNilai(e.target.value)
                                                    }
                                                    sx={{
                                                        "& .MuiOutlinedInput-root.Mui-focused":
                                                            {
                                                                outline: "none",
                                                                boxShadow:
                                                                    "none",
                                                            },
                                                        "& .MuiInputBase-input:focus":
                                                            {
                                                                outline: "none",
                                                                boxShadow:
                                                                    "none",
                                                            },
                                                    }}
                                                />
                                            </div>
                                            <div>
                                                <Button
                                                    variant="contained"
                                                    disabled={nilai === null}
                                                    sx={{
                                                        width: "100%",
                                                        textTransform:
                                                            "capitalize",
                                                    }}
                                                    disableElevation
                                                    onClick={(e) =>
                                                        updateNilai(e)
                                                    }
                                                >
                                                    Simpan Nilai
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                                <hr className="mt-4" />
                                <div className="flex flex-col gap-2 mt-3">
                                    <div className="flex gap-x-2 items-center text-textblack">
                                        <LuUser className="text-xl" />
                                        Private Comments
                                    </div>
                                    <ul className="w-full h-full flex flex-col gap-2">
                                        {privateCommentData.length > 0 ? (
                                            privateCommentData.map((item) => (
                                                <li
                                                    key={item.id}
                                                    className="flex flex-row text-textblack gap-2"
                                                >
                                                    <Avatar />
                                                    <div>
                                                        <h3 className="text-md">
                                                            {item.sender_name}
                                                        </h3>
                                                        <p className="text-sm text-wrap">
                                                            {item.message}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <div className="flex w-full h-full justify-center">
                                                <img
                                                    src={notFound}
                                                    className="h-40"
                                                ></img>
                                            </div>
                                        )}
                                    </ul>
                                    <div className="flex gap-x-1">
                                        <TextField
                                            size="small"
                                            label="Add Comment"
                                            value={privateComment}
                                            onChange={(e) =>
                                                setPrivateComment(
                                                    e.target.value
                                                )
                                            }
                                            sx={{
                                                width: "100%",
                                                "& .MuiOutlinedInput-root.Mui-focused":
                                                    {
                                                        outline: "none",
                                                        boxShadow: "none",
                                                    },
                                                "& .MuiInputBase-input:focus": {
                                                    outline: "none",
                                                    boxShadow: "none",
                                                },
                                            }}
                                        ></TextField>
                                        <IconButton
                                            disabled={loading}
                                            onClick={(e) =>
                                                makePrivateCommenct()
                                            }
                                        >
                                            <SendSharp />
                                        </IconButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ClassroomLayout>
    );
};

export default TugasMahasiswa;
