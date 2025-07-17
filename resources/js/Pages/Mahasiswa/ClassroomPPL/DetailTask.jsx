import InputError from "@/Components/InputError";
import ClassroomLayout from "@/Layouts/Mahasiswa/Classroom/ClassroomLayout";
import styled from "@emotion/styled";
import {
    Avatar,
    Button,
    IconButton,
    TextField,
    useStepContext,
} from "@mui/material";
import React from "react";
import { useState } from "react";
import { IoCloudUploadOutline } from "react-icons/io5";
import { RiAttachment2 } from "react-icons/ri";
import { LuUsers } from "react-icons/lu";
import { FiUser } from "react-icons/fi";
import { SendOutlined, SendSharp } from "@mui/icons-material";
import { ThreeDot } from "react-loading-indicators";
import { Head } from "@inertiajs/react";
import axios from "axios";
import { useEffect } from "react";
import notFound from "../../../../../public/images/nodata-found 1.png";
import { LinkIcon } from "@heroicons/react/24/outline";

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
    9;
    const [dokumen, setDokumen] = useState(null);
    const [errors, setErrors] = useState({
        dokumen: null,
        link: null,
    });

    const [loading, setLoading] = useState(false);
    const [responseError, setResponseError] = useState(null);
    const [submissionData, setSubmissionData] = useState(null);
    const [taskData, setTaskData] = useState(null);
    const [link, setLink] = useState(null);
    const [privateComment, setPrivateComment] = useState(null);
    const [publicCumment, setPublicComment] = useState(null);
    const [publiCommentData, setPublicCommentData] = useState([]);
    const [privateCommentData, setPrivateCommentData] = useState([]);

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
            if (file.size > 5000 * 1024) {
                setErrors({
                    ...errors,
                    dokumen: "Ukuran file tidak boleh melebihi 5MB",
                });

                return;
            }
            setLink(file);
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
                `${base_url}/api/classroom-ppl/task`,
                {
                    params: {
                        id_tugas: data.id_tugas,
                    },
                }
            );
            setTaskData(response.data.data);
        } catch (err) {
        } finally {
            setLoading(false);
            getTaskSubmission();
            getPrivateComment();
        }
    };

    useEffect(() => {
        getTask();
    }, []);

    const getTaskSubmission = async () => {
        setLoading(false);
        try {
     

            const response = await axios.get(
                `${base_url}/api/student/classroom-ppl/task/submission`,
                {
                    params: {
                        id_kelas: data?.id_kelas,
                        id_tugas: data?.id_tugas,
                        username_mahasiswa: auth.user?.username,
                    },
                }
            );
            setSubmissionData(response.data.data);
        } catch (err) {
            setResponseError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const submitSubmission = async () => {
        if (link) {
            setLoading(true);

            try {
                const formData = new FormData();
                formData.append("id_kelas", data?.id_kelas);
                formData.append("id_tugas", data?.id_tugas);
                formData.append("status", "diserahkan");
                formData.append("link", link);
                formData.append("username_mahasiswa", auth?.user?.username);
                const response = await axios.post(
                    `${base_url}/api/student/classroom-ppl/task/submission/create`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
                if (response.data.success === true) {
                    getTaskSubmission();
                }
            } catch (err) {
                setResponseError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        } else {
            setErrors({
                dokumen: "Dokumen wajib diupload",
                link: "Link wajib diisi",
            });
        }
    };

    const getPrivateComment = async () => {
        try {
            const response = await axios.get(
                `${base_url}/api/student/classroom-ppl/task/comment`,
                {
                    params: {
                        id_kelas: data.id_kelas,
                        id_tugas: data.id_tugas,
                        created_by: auth?.user?.username,
                    },
                }
            );
            if (response.data.success === true) {
                setPrivateCommentData(response.data.data);
            }
        } catch (err) {
            setResponseError(err.response?.data?.message);
        } finally {
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
                formData.append("message", privateComment);

                const response = await axios.post(
                    `${base_url}/api/student/classroom-ppl/task/comment`,
                    formData
                );
                console.log("response ", response);
                if (response.data.success === true) {
                    getPrivateComment();
                    setPrivateComment("");
                }
            } catch (err) {
                console.log(err);
                setResponseError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <ClassroomLayout>
            <Head title="Detail" />
            {loading && (
                <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                    <ThreeDot color="#4F61E3" size="medium" />
                </div>
            )}
            <div className="flex w-full max-w-screen-xl">
                <div className="flex w-full">
                    <div className="w-full  rounded-lg p-3 flex flex-col gap-x-8 bg-white ">
                        {responseError}
                        <div className="flex flex-row gap-x-2">
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
                            <div className="flex flex-col md:flex-row w-full  gap-3">
                                <div className="flex w-full flex-col">
                                    <h3 className="font-bold text-[#3c4043]">
                                        {taskData?.name}
                                    </h3>
                                    <div className="flex justify-between">
                                        <p className=" text-[#3c4043]">
                                            100 points
                                        </p>

                                        <p className=" text-[#3c4043]">
                                            {`Tenggat ${taskData?.tenggat}`}
                                        </p>
                                    </div>
                                    <p className="pt-3">
                                        {taskData?.deskripsi}
                                    </p>
                                    <hr className="mt-4" />

                                    <div className="flex flex-col bg-white p-3 border shadow-md rounded-lg  gap-2 mt-3">
                                        <div className="flex gap-x-2 items-center text-textblack">
                                            <FiUser className="text-xl" />
                                            Private Comments
                                        </div>
                                        <ul className="w-full h-full flex flex-col gap-2">
                                            {privateCommentData.length > 0 ? (
                                                privateCommentData.map(
                                                    (item) => (
                                                        <li
                                                            key={item.id}
                                                            className="flex flex-row text-textblack gap-2"
                                                        >
                                                            <Avatar />
                                                            <div>
                                                                {/* <h3 className="text-md">
                                                            {item.created_by !==
                                                            null
                                                                ? item.receiver !==
                                                                  null
                                                                    ? item.receiver_by_name
                                                                    : item.created_by_name
                                                                : ""}
                                                        </h3> */}
                                                                <h3 className="text-md">
                                                                    {
                                                                        item.created_by_name
                                                                    }
                                                                </h3>
                                                                <p className="text-sm text-wrap">
                                                                    {
                                                                        item.message
                                                                    }
                                                                </p>
                                                            </div>
                                                        </li>
                                                    )
                                                )
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
                                                    "& .MuiInputBase-input:focus":
                                                        {
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
                                <div className="flex w-full flex-col lg:w-150">
                                    <div className="flex p-3 flex-col gap-y-5 w-full rounded-lg border shadow-md">
                                        <ul className=" flex justify-between">
                                            <li className="text-lg">
                                                Your Work
                                            </li>
                                            <li>{submissionData?.status}</li>
                                        </ul>
                                        {submissionData?.status ===
                                            "dinilai" && (
                                            <ul className=" flex flex-col justify-between">
                                                <li>
                                                    Nilai Supervisor :{" "}
                                                    {`${submissionData?.nilai_supervisor_ppl}/100`}
                                                </li>
                                                <li>
                                                    Nilai Pamong :{" "}
                                                    {`${submissionData?.nilai_pamong}/100`}
                                                </li>
                                            </ul>
                                        )}

                                        {taskData?.tipe === "File" && (
                                            <div className="flex flex-col gap-y-2">
                                                {link && (
                                                    <a
                                                        href="#"
                                                        className="font-normal flex items-center gap-x-2 border w-full  h-10 px-3 py-1 rounded-md cursor-pointer"
                                                    >
                                                        {link.name}
                                                        <RiAttachment2 className="text-lg" />
                                                    </a>
                                                )}
                                                {submissionData?.link && (
                                                    <a
                                                        target="_blank"
                                                        href={`${base_url}/storage/${submissionData.link.replace(
                                                            /^public\//,
                                                            ""
                                                        )}`}
                                                        className="font-normal text-wrap flex items-center gap-x-2 border w-full  h-10 px-3 py-1 rounded-md cursor-pointer"
                                                    >
                                                        {submissionData?.link
                                                            .split("/")
                                                            .pop()}
                                                        <RiAttachment2 className="text-lg" />
                                                    </a>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    sx={{
                                                        textTransform:
                                                            "capitalize",
                                                        width: "100%",
                                                    }}
                                                    component="label"
                                                    startIcon={
                                                        <IoCloudUploadOutline />
                                                    }
                                                >
                                                    Upload File
                                                    <VisuallyHiddenInput
                                                        type="file"
                                                        accept="application/pdf"
                                                        onChange={(event) =>
                                                            handleDokumenChange(
                                                                event
                                                            )
                                                        }
                                                    />
                                                </Button>
                                                {errors.dokumen && (
                                                    <InputError
                                                        message={errors.dokumen}
                                                    />
                                                )}
                                            </div>
                                        )}
                                        {taskData?.tipe === "Link" && (
                                            <div className="flex flex-col gap-y-2">
                                                {submissionData?.link && (
                                                    <a
                                                        target="_blank"
                                                        href={
                                                            submissionData.link
                                                        }
                                                        className="font-normal text-wrap flex justify-between bg-primary text-white items-center gap-x-2 border w-full  h-10 px-3 py-1 rounded-md cursor-pointer"
                                                    >
                                                        Lihat
                                                        <LinkIcon className="text-sm w-5" />
                                                    </a>
                                                )}
                                                <TextField
                                                    size="small"
                                                    type="url"
                                                    label="Link Tugas"
                                                    value={link}
                                                    onChange={(e) =>
                                                        setLink(e.target.value)
                                                    }
                                                    placeholder="Paste Link"
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

                                                {errors.link && (
                                                    <InputError
                                                        message={errors.link}
                                                    />
                                                )}
                                            </div>
                                        )}

                                        <div>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    width: "100%",
                                                    textTransform: "capitalize",
                                                }}
                                                disableElevation
                                                onClick={(e) => {
                                                    submitSubmission();
                                                }}
                                                disabled={link === null}
                                            >
                                                Serahkan
                                            </Button>
                                        </div>
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
