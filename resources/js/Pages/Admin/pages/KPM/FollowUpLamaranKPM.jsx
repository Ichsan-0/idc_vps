import React from "react";
import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import {
    Autocomplete,
    Breadcrumbs,
    Button,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
} from "@mui/material";
import { CgAttachment } from "react-icons/cg";
import { kabupaten, kecamatan, desa, provinsi } from "daftar-wilayah-indonesia";
import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { NavigateNext } from "@mui/icons-material";
import { useEffect } from "react";

export const FollowUpLamaranKPM = ({ lamaran, base_url, tempatkpm }) => {
    const prv = provinsi();
    const [province, setProvince] = useState(
        prv.find((itm) => {
            return itm.kode === lamaran.data_user.province_code;
        })?.nama || null
    );

    const [regency, setRegency] = useState(
        kabupaten(lamaran?.data_user?.province_code).find((itm) => {
            return itm.kode === lamaran?.data_user?.regency_code;
        }).nama || null
    );

    const [subDistrict, setSubDistrict] = useState(
        kecamatan(lamaran?.data_user?.regency_code).find((itm) => {
            return itm.kode === lamaran?.data_user?.subdistrict_code;
        })?.nama || null
    );
    const [village, setVillage] = useState(
        desa(lamaran?.data_user?.subdistrict_code).find((itm) => {
            return itm.kode === lamaran?.data_user?.village_code;
        })?.nama || null
    );
    const [keterangan, setKeterangan] = useState(lamaran?.keterangan || null);

    const [status, setStatus] = useState(lamaran?.status || null);
    const { setData, post, processing } = useForm({
        status: status,
        keterangan: keterangan,
    });

    const handleKeteranganChange = (e) => {
        setKeterangan(e.target.value);
        setData("keterangan", e.target.value);
    };

    const handleStatusChange = (e) => {
        setStatus(e.target.value);
        setData("status", e.target.value);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        post(`/admin/pelamarkpm/followup/${lamaran.id}`);
    };
    useEffect(() => {
        console.log(province);
        console.log(provinsi());
        console.log(status);
    }, []);

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={2} />
            </div>
            <div className="flex ml-72 w-full flex-col">
                <Header></Header>
                <Head title={`${lamaran?.pelamar?.name}`} />
                <div className="space"></div>
                <div className="flex flex-col w-full px-3 gap-y-3">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                        <Link href="/admin/tempatkpm/pelamar/list">
                            Mahasiswa
                        </Link>
                        <Link>Detail</Link>
                    </Breadcrumbs>
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 p-4 bg-white rounded-md shadow-md">
                        <div className="w-full">
                            <table className="table-auto">
                                <tbody>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Nama
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {lamaran?.pelamar?.name}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Email
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {lamaran?.pelamar?.email}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            No HP/WA
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {lamaran?.data_user?.no_hp_wa}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Provinsi
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {province}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Kabupaten
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {regency}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Kecamatan
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {subDistrict}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Desa
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {village}
                                        </td>
                                    </tr>

                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Lowongan Yang Dilamar
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {lamaran?.kpm?.name}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Kuota
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {lamaran?.kpm?.qouta}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Terisi
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {tempatkpm?.accepted_pelamar_count}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Jumlah Laki-Laki
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {tempatkpm?.jumlah_pria}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Jumlah Perempuan
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {tempatkpm?.jumlah_wanita}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="w-full">
                            <table className="table-auto">
                                <tbody>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            NIM
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {lamaran?.pelamar?.username}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            Prodi
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {lamaran?.data_user?.prodi?.name}
                                        </td>
                                    </tr>
                                    <tr className="bg-yellow-300">
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            Jenis Kelamin
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {lamaran?.data_user?.jk}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            IPK
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {lamaran?.data_user?.ipk}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            Semester
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {lamaran?.data_user?.semester}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            Nilai Micro Teaching
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {
                                                lamaran?.data_user
                                                    ?.nilai_micro_teaching
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            Cluster Kegiatan
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {
                                                lamaran?.data_user
                                                    ?.cluster_kegiatan
                                            }
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            Transkrip Nilai
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            <div>
                                                {lamaran?.data_user
                                                    ?.link_transkrip_nilai && (
                                                    <a
                                                        target="_blank"
                                                        className="flex bg-blue-500 font-normal gap-x-2 justify-center items-center text-white px-3 py-1 rounded-md hover:bg-blue-500/85"
                                                        href={`/storage/${lamaran.data_user.link_transkrip_nilai}`}
                                                    >
                                                        <CgAttachment />
                                                        {lamaran.data_user.link_transkrip_nilai
                                                            .split("/")
                                                            .pop()}
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="bg-white rounded-md shadow-md p-4 gap-y-3 flex flex-col">
                        <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3  ">
                            <div className="flex w-full flex-col gap-y-3">
                                <FormControl fullWidth>
                                    <InputLabel id="status_label">
                                        Status
                                    </InputLabel>
                                    <Select
                                        labelId="status_label"
                                        value={status}
                                        id="status"
                                        onChange={(e) => handleStatusChange(e)}
                                    >
                                        <MenuItem value={"submitted"}>
                                            Submitted
                                        </MenuItem>
                                        <MenuItem value={"rejected"}>
                                            Reject
                                        </MenuItem>
                                        <MenuItem value={"accepted"}>
                                            Accept
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                                <div className="flex flex-col w-full">
                                    <textarea
                                        rows={4}
                                        value={keterangan}
                                        style={{ width: "100%" }}
                                        className="rounded-md"
                                        onChange={(e) =>
                                            handleKeteranganChange(e)
                                        }
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-start gap-y-2">
                            <Button
                                variant="contained"
                                disableElevation
                                sx={{ textTransform: "capitalize" }}
                                disabled={processing}
                                onClick={(e) => onSubmit(e)}
                            >
                                Simpan
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default FollowUpLamaranKPM;
