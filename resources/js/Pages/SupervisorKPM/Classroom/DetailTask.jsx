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
import { IoCloudUploadOutline } from "react-icons/io5";
import { RiAttachment2 } from "react-icons/ri";
import { LuUsers } from "react-icons/lu";
import { FiUser } from "react-icons/fi";
import { SendOutlined, SendSharp } from "@mui/icons-material";
import { ThreeDot } from "react-loading-indicators";
import { Head, Link, usePage } from "@inertiajs/react";
import ClassroomLayout from "@/Layouts/SupervisorKPM/Classroom/ClassroomLayout";
import NavLink from "@/Components/SupervisorKPM/Classroom/Header/NavLink";
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

const DetailTask = ({ base_url, data, auth }) => {
    const [dokumen, setDokumen] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tipeTugas, setTipeTugas] = useState("file");
    const { url, component } = usePage();
    const { pathname, search } = new URL(url, window.location.origin);
    const [responseError, setResponseError] = useState(null);
    const [dataTask, setDataTask] = useState(null);
    const [publiCommentData, setPublicCommentData] = useState([]);
    const [publicCumment, setPublicComment] = useState(null);

    const handleDokumenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                setErrors({
                    ...errors,
                    dokumen: "Only PDF Files are allowed",
                });

                return;
            }
            if (file.size > 500 * 1024) {
                setErrors({
                    ...errors,
                    dokumen: "Ukuran file tidak boleh melibihi 200kb",
                });

                return;
            }
            setDokumen(file);
            // setPayload({ ...payload, dokumen: file });
            setErrors({
                ...errors,
                dokumen: null,
            });
        }
    };

    const getTask = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${base_url}/api/admin/classroom-kpm/task/${data?.id_tugas}`
            );

            if (response?.data?.success === true) {
                setDataTask(response?.data?.data);
            }
        } catch (err) {
        } finally {
            setLoading(false);
            getPublicComment();
        }
    };

    const getPublicComment = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${base_url}/api/student/classroom/publiccomment`,
                {
                    params: {
                        id_kelas: data.id_kelas,
                        id_tugas: data.id_tugas,
                    },
                }
            );
            setPublicCommentData(response.data.data);
        } catch (err) {
            setResponseError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const makePublicComment = async () => {
        if (publicCumment !== null) {
            try {
                setLoading(true);

                const formData = new FormData();
                formData.append("tipe", "public");
                formData.append("id_tugas", data?.id_tugas);
                formData.append("id_kelas", data?.id_kelas);
                formData.append("created_by", auth?.user?.username);
                formData.append("message", publicCumment);

                const response = await axios.post(
                    `${base_url}/api/student/classroom/publiccomment`,
                    formData
                );
                console.log("response ", response);
                if (response.data.success === true) {
                    getPublicComment();
                    setPublicComment("");
                }
            } catch (err) {
                console.log(err);
                setResponseError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        getTask();
    }, []);
    return (
        <ClassroomLayout>
            <Head title="Detail" />
            {loading && (
                <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                    <ThreeDot color="#4F61E3" size="medium" />
                </div>
            )}
            <div className="flex w-full max-w-screen-lg flex-col gap-3">
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
                                pathname.includes("task") && "!border-primary"
                            }`}
                        >
                            <NavLink
                                href={`/supervisor-kpm/classroom/${data?.id_kelas}/task/${data?.id_tugas}/detail`}
                                className={`group relative flex h-10 items-center gap-2.5 text-[#3c4043] px-4 font-medium duration-100 ease-in-out hover:bg-black/5 border-primary ${
                                    (pathname === "/mahasiswa/classroom" ||
                                        pathname.includes("task")) &&
                                    " !text-primary"
                                }`}
                            >
                                Petunjuk
                            </NavLink>
                        </div>
                        <div className="w-fit h-fit border-primary/0 border-b-2 hover:border-primary">
                            <NavLink
                                href={`/supervisor-kpm/classroom/${data?.id_kelas}/task/${data?.id_tugas}/tugas-mahasiswa`}
                                className={`group relative flex h-10 items-center gap-2.5 text-[#3c4043] px-4 font-medium duration-100 ease-in-out hover:bg-primary/10 border-primary ${
                                    (pathname ===
                                        "/operator-kecamatan/data/camat-keuchik" ||
                                        pathname.includes("camat-keuchik")) &&
                                    "!text-white"
                                }`}
                            >
                                Tugas Mahasiswa
                            </NavLink>
                        </div>
                    </div>
                </div>

                <div className="flex w-full">
                    <div className="w-full  rounded-lg p-3 flex gap-x-8 bg-white ">
                        <div className="bg-[#129eaf] w-fit h-fit p-3 rounded-full">
                            <svg
                                focusable="false"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                className="fill-white"
                            >
                                <path d="M7 15h7v2H7zm0-4h10v2H7zm0-4h10v2H7z"></path>
                                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-.14 0-.27.01-.4.04a2.008 2.008 0 0 0-1.44 1.19c-.1.23-.16.49-.16.77v14c0 .27.06.54.16.78s.25.45.43.64c.27.27.62.47 1.01.55.13.02.26.03.4.03h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7-.25c.41 0 .75.34.75.75s-.34.75-.75.75-.75-.34-.75-.75.34-.75.75-.75zM19 19H5V5h14v14z"></path>
                            </svg>
                        </div>
                        <div className="flex flex-col lg:flex-row w-full lg:cols gap-3">
                            <div className="flex w-full flex-col">
                                <h3 className="font-bold text-[#3c4043]">
                                    {dataTask?.name}
                                </h3>
                                <div className="flex justify-between">
                                    <p className=" text-[#3c4043]">
                                        100 points
                                    </p>

                                    <p className=" text-[#3c4043]">
                                        Tenggat {dataTask?.tenggat}
                                    </p>
                                </div>
                                <hr className="mt-4" />
                                <div className="flex flex-col gap-2 mt-3">
                                    <div className="flex gap-x-2 items-center text-textblack">
                                        <LuUsers className="text-xl" />
                                        Class Comments
                                    </div>
                                    <ul className="w-full h-full flex flex-col gap-2 py-2">
                                        {publiCommentData.length > 0 ? (
                                            publiCommentData.map((item) => (
                                                <li className="flex flex-row text-textblack gap-2">
                                                    <Avatar />
                                                    <div>
                                                        <h3 className="text-md ">
                                                            {
                                                                item.created_by_name
                                                            }
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
                                            value={publicCumment}
                                            onChange={(e) =>
                                                setPublicComment(e.target.value)
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
                                            onClick={() => makePublicComment()}
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

export default DetailTask;
