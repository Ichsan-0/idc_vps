import React from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    Alert,
    AlertTitle,
    Avatar,
    Breadcrumbs,
    Button,
    Chip,
    IconButton,
    TextField,
} from "@mui/material";

import { useState } from "react";
import { useEffect } from "react";
import { ThreeDot } from "react-loading-indicators";
import { useRef } from "react";
import axios from "axios";
import SupervisorPPLLayout from "@/Layouts/SupervisorKPM/ClassroomPPL/SupervisorPPLLayout";
import { createContext } from "react";
import SekolahProvider from "@/Context/SekolahContext";
import { MdOpenInNew } from "react-icons/md";
import { GrAttachment } from "react-icons/gr";
import InputError from "@/Components/InputError";
import { CloudUploadOutlined, SendSharp } from "@mui/icons-material";
import styled from "@emotion/styled";
import notFound from "../../../../../public/images/nodata-found 1.png";
import { LuUser } from "react-icons/lu";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0,0,0,0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
});

const ListMahasiswa = ({ base_url, auth, data }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const [fieldErrors, setFieldErrors] = useState({
        nilai_pamong: null,
        nilai_supervisor: null,
        link_instrument: null,
    });
    const [instrument, setInstrument] = useState(null);
    const [nilaiPamong, setNilaiPamong] = useState(
        data?.data_mahasiswa?.nilai_pamong
    );
    const [nilaiSupervisor, setNilaiSupervisor] = useState(
        data?.data_mahasiswa?.nilai_supervisor_ppl
    );
    const [linkInstrument, setLinkInstrument] = useState(
        data?.data_mahasiswa?.link_instrument_penilaian
    );
    const [linkLaporan, setLinkLaporan] = useState(
        data?.data_mahasiswa?.link_laporan
    );
    const [privateComment, setPrivateComment] = useState(null);
    const [privateCommentData, setPrivateCommentData] = useState([]);
    const [submissionData, setSubmissionData] = useState(null);

    const handleInstrumentChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type !== "application/pdf") {
                setFieldErrors({
                    ...fieldErrors,
                    link_instrument: "Only Pdf Files ara allowed",
                });
                return;
            }
            if (file.size > 500 * 1024) {
                setFieldErrors({
                    ...fieldErrors,
                    link_instrument: "Ukuran file tidak boleh melebihi 500 kb",
                });
                return;
            }
            setInstrument(e.target.files[0]);
            setFieldErrors({
                ...fieldErrors,
                link_instrument: null,
            });
        }
    };

    const handleNilaiPamongChange = (e) => {
        setNilaiPamong(e.target.value);
        const regex = /^\d+(\.\d+)?$/;
        if (!e.target.value.match(regex)) {
            setFieldErrors({
                ...fieldErrors,
                nilai_pamong:
                    "Hanya dapat diisi dengan angka,  e.g. 90.5, 80.08 ",
            });

            return;
        } else {
            setFieldErrors({
                ...fieldErrors,
                nilai_pamong: null,
            });
        }
    };
    const handleNilaiSupervisorChange = (e) => {
        setNilaiSupervisor(e.target.value);
        const regex = /^\d+(\.\d+)?$/;
        if (!e.target.value.match(regex)) {
            setFieldErrors({
                ...fieldErrors,
                nilai_supervisor:
                    "Hanya dapat diisi dengan angka, e.g. 90.5, 80.08 ",
            });

            return;
        } else {
            setFieldErrors({
                ...fieldErrors,
                nilai_supervisor: null,
            });
        }
    };

    const validate = () => {
        const newErrors = { ...fieldErrors };

        if (instrument === null) {
            newErrors.link_instrument = "Instrument Penilaian Wajib diupload";
        }
        if (nilaiPamong === null) {
            newErrors.nilai_pamong = "Nilai pamong wajib diisi";
        }
        if (nilaiSupervisor === null) {
            newErrors.nilai_supervisor = "Nilai supervisor wajib diisi";
        }

        setFieldErrors(newErrors);
        return Object.values(newErrors).every((value) => value === null);
    };

    const handleOpenLaporanPPL = (link) => {
        window.open(
            link,
            "_blank",
            `width=${screen.width * 0.8}, height=${
                screen.height * 0.6
            }, left=100, top=100`
        );
    };

    const getTaskSubmission = async () => {
        setLoading(false);
        try {
            const response = await axios.get(
                `${base_url}/api/student/classroom-ppl/task/submission`,
                {
                    params: {
                        id_kelas: data?.id_sekolah,
                        id_tugas: 1,
                        username_mahasiswa: data?.data_mahasiswa?.nim,
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

    const makePrivateCommenct = async () => {
        if (privateComment !== null) {
            try {
                console.log("test");

                setLoading(true);

                const formData = new FormData();
                formData.append("tipe", "private");
                formData.append("id_tugas", 1);
                formData.append("id_kelas", data?.id_sekolah);
                formData.append("created_by", auth?.user?.username);
                formData.append("receiver", data?.data_mahasiswa?.nim);
                formData.append("message", privateComment);

                const response = await axios.post(
                    `${base_url}/api/supervisor-ppl/classroom/private-comment/add`,
                    formData
                );

                console.log("response ", response);
                if (response.data.success === true) {
                    setPrivateComment("");
                    getPrivateComment();
                }
            } catch (err) {
                console.log(err);
                setError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        }
    };
    const getPrivateComment = async () => {
        console.log("test");
        try {
            setLoading(true);
            const response = await axios.get(
                `${base_url}/api/supervisor-ppl/classroom/private-comment`,
                {
                    params: {
                        id_kelas: data?.id_kelas,
                        id_tugas: data?.id_tugas,
                        created_by: data?.data_mahasiswa?.nim,
                    },
                }
            );

            if (response.data.success === true) {
                setPrivateCommentData(response.data.data);
            }
        } catch (err) {
            console.log(err);
            setError(err.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };

    const updateNilai = async () => {
        if (validate()) {
            setLoading(true);
            try {
                const formData = new FormData();
                formData.append("nilai_pamong", nilaiPamong);
                formData.append("nilai_supervisor_ppl", nilaiSupervisor);
                formData.append("instrument", instrument);
                formData.append("id_kelas", data?.id_sekolah);
                formData.append("id_tugas", 1);
                formData.append(
                    "username_mahasiswa",
                    data?.data_mahasiswa?.nim
                );
                const response = await axios.post(
                    `${base_url}/api/supervisor-ppl/classroom/mahasiswa/update/${data?.data_mahasiswa?.nim}`,
                    formData,
                    {
                        headers: { "Content-Type": "multipart/form-data" },
                    }
                );
                if (response?.data?.success === true) {
                    router.visit(
                        `/supervisor-ppl/classroom/${data?.id_sekolah}`
                    );
                }
            } catch (err) {
                setError(err.response?.data?.message);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleOpenInstrumentClick = (link) => {
        if (link) {
            window.open(
                link,
                "_blank",
                `width=${screen.width * 0.8}, height=${
                    screen.height * 0.6
                }, left=100, top=100`
            );
        }
    };
    useEffect(() => {
        getPrivateComment();
        getTaskSubmission();
    }, []);

    return (
        <SekolahProvider data={data}>
            <SupervisorPPLLayout>
                <Head title={data?.data_mahasiswa?.nama_mahasiswa} />
                <div className="px-3">
                    <div className="flex w-full justify-start gap-x-2 py-2"></div>

                    <p>{error}</p>
                    <Breadcrumbs className="">
                        <Link
                            href={`/supervisor-ppl/classroom/${data?.id_sekolah}`}
                        >
                            List Mahasiswa
                        </Link>
                        <Link className="text-blue-500">Detail</Link>
                    </Breadcrumbs>
                    <div className="h-5"></div>
                    <div className="bg-white dark:bg-gray-800 gap-y-2 flex flex-col p-3 relative shadow-md sm:rounded-lg overflow-hidden">
                        <Alert severity="info">
                            <AlertTitle>Petunjuk</AlertTitle>
                            <ol class="!list-decimal pl-5 space-y-2">
                                <li>Mohon diisi nilai pamong dan supervisor</li>
                                <li>
                                    Siapkan berkas scan instrument penilaian
                                    dari mahasiswa dengan nama{" "}
                                    <span className="font-semibold">
                                        {data?.data_mahasiswa?.nama_mahasiswa}
                                    </span>
                                    {", "}
                                    dalam bentuk pdf, dengan ukuran maksimal
                                    500kb
                                </li>
                                <li>
                                    Jika semua data sudah diisi silakan klik
                                    simpan
                                </li>
                            </ol>
                        </Alert>
                        {submissionData?.status === "ditugaskan" && (
                            <Alert severity="warning">
                                <AlertTitle>Peringatan</AlertTitle>
                                <p>
                                    Mahasisawa dengan nama{" "}
                                    <span className="font-bold">
                                        {data?.data_mahasiswa?.nama_mahasiswa}
                                    </span>{" "}
                                    Belum mengupload laporan PPL
                                </p>
                            </Alert>
                        )}

                        <div className="relative overflow-x-auto min-h-50 py-3">
                            {loading && (
                                <div className="absolute z-10 w-full h-full flex items-center justify-center bg-white/70">
                                    <ThreeDot color="#4F61E3" size="medium" />
                                </div>
                            )}
                            <div className="grid grid-cols-1 justify-items-start md:grid-cols-2 w-full align-top">
                                <table className="w-full h-fit">
                                    <tbody>
                                        <tr>
                                            <td className="text-end">
                                                Nama Mahasiswa
                                            </td>
                                            <td className="pl-3 justify-start">
                                                {
                                                    data?.data_mahasiswa
                                                        ?.nama_mahasiswa
                                                }
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-end">NIM</td>
                                            <td className="pl-3 justify-start">
                                                {data?.data_mahasiswa?.nim}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-end">Prodi</td>
                                            <td className="pl-3 justify-start">
                                                {
                                                    data?.data_mahasiswa
                                                        ?.nama_prodi
                                                }
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <table className="w-full">
                                    <tbody className="">
                                        <tr>
                                            <td className="text-end">
                                                Nilai Supervisor
                                            </td>
                                            <td className="pl-3 py-2 justify-start">
                                                <div className="flex flex-col">
                                                    <TextField
                                                        id="nilaiSupervisor"
                                                        value={nilaiSupervisor}
                                                        type="text"
                                                        size="small"
                                                        inputMode="decimal"
                                                        onChange={(e) =>
                                                            handleNilaiSupervisorChange(
                                                                e
                                                            )
                                                        }
                                                        fullWidth
                                                        sx={{
                                                            width: "100%",
                                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                            "& .MuiInputBase-input:focus":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                        }}
                                                    />
                                                    {fieldErrors.nilai_supervisor && (
                                                        <InputError
                                                            message={
                                                                fieldErrors.nilai_supervisor
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-end">
                                                Nilai Pamong
                                            </td>
                                            <td className="pl-3  py-2 justify-start">
                                                <div className="flex flex-col">
                                                    <TextField
                                                        id="nilaiPamong"
                                                        size="small"
                                                        value={nilaiPamong}
                                                        type="text"
                                                        inputMode="decimal"
                                                        onChange={(e) =>
                                                            handleNilaiPamongChange(
                                                                e
                                                            )
                                                        }
                                                        fullWidth
                                                        sx={{
                                                            width: "100%",
                                                            "& .MuiOutlinedInput-root.Mui-focused":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                            "& .MuiInputBase-input:focus":
                                                                {
                                                                    outline:
                                                                        "none",
                                                                    boxShadow:
                                                                        "none",
                                                                },
                                                        }}
                                                    />
                                                    {fieldErrors.nilai_pamong && (
                                                        <InputError
                                                            message={
                                                                fieldErrors.nilai_pamong
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-end">
                                                Laporan PPL
                                            </td>
                                            <td className="pl-3  py-2 justify-start">
                                                {linkLaporan ? (
                                                    <button
                                                        className="flex py-2 gap-x-3 items-center rounded-sm px-4 text-white hover:bg-blue-600 bg-blue-500"
                                                        onClick={() =>
                                                            handleOpenLaporanPPL(
                                                                linkLaporan
                                                            )
                                                        }
                                                    >
                                                        Lihat <GrAttachment />
                                                    </button>
                                                ) : (
                                                    <>
                                                        Belum mengupload laporan
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-end">
                                                Instrument Penilaian
                                            </td>
                                            <td className="pl-3  py-2 justify-start">
                                                <div className="flex flex-col justify-center">
                                                    <div className="flex flex-row justify-center gap-x-2 ">
                                                        <Button
                                                            component="label"
                                                            variant="outlined"
                                                            disableElevation
                                                            tabIndex={-1}
                                                            sx={{
                                                                display: "flex",
                                                                flex: 1,
                                                                textTransform:
                                                                    "capitalize",

                                                                // whiteSpace: "nowrap",
                                                            }}
                                                            startIcon={
                                                                <CloudUploadOutlined />
                                                            }
                                                        >
                                                            Pilih File
                                                            <VisuallyHiddenInput
                                                                type="file"
                                                                accept="application/pdf"
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    handleInstrumentChange(
                                                                        event
                                                                    )
                                                                }
                                                                multiple
                                                            />
                                                        </Button>
                                                        <div
                                                            className="flex flex-[1.7] w-full ring-1 rounded-md p-2 justify-between items-center cursor-pointer"
                                                            onClick={(e) =>
                                                                handleOpenInstrumentClick(
                                                                    `${base_url}/storage/${data?.data_mahasiswa?.link_instrument_penilaian.replace(
                                                                        "public/",
                                                                        ""
                                                                    )}`
                                                                )
                                                            }
                                                        >
                                                            {/* <p>Transkrip_nilai_200205002</p> */}
                                                            {instrument ===
                                                            null ? (
                                                                <p>
                                                                    {linkInstrument ===
                                                                    null
                                                                        ? "Tidak ada File"
                                                                        : "Lihat"}
                                                                </p>
                                                            ) : (
                                                                <p className="truncate">
                                                                    {instrument
                                                                        ?.name
                                                                        ?.length >
                                                                    30
                                                                        ? `${instrument?.name.slice(
                                                                              0,
                                                                              30
                                                                          )}...`
                                                                        : instrument?.name}
                                                                </p>
                                                            )}

                                                            <GrAttachment />
                                                        </div>
                                                    </div>
                                                    {fieldErrors.link_instrument && (
                                                        <InputError
                                                            message={
                                                                fieldErrors.link_instrument
                                                            }
                                                        />
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td></td>
                                            <td className="pt-5">
                                                <div className="flex justify-end">
                                                    <Button
                                                        disableElevation
                                                        disabled={
                                                            submissionData?.status ===
                                                            "ditugaskan"
                                                        }
                                                        onClick={() =>
                                                            updateNilai()
                                                        }
                                                        sx={{
                                                            textTransform:
                                                                "capitalize",
                                                        }}
                                                        variant="contained"
                                                    >
                                                        Simpan
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div className="h-10"></div>
                            <hr />
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
                                                        {item.created_by_name}
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
                                            setPrivateComment(e.target.value)
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
                                        onClick={(e) => makePrivateCommenct()}
                                    >
                                        <SendSharp />
                                    </IconButton>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </SupervisorPPLLayout>
        </SekolahProvider>
    );
};

export default ListMahasiswa;
