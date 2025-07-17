import React from "react";
import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import {
    Autocomplete,
    Breadcrumbs,
    Button,
    IconButton,
    TextField,
} from "@mui/material";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { NavigateNext } from "@mui/icons-material";
import MUIDataTable from "mui-datatables";
import { MdDelete } from "react-icons/md";
import { MdOpenInNew } from "react-icons/md";
import { data } from "autoprefixer";
import { TiEdit } from "react-icons/ti";
import Modal from "@/Components/Modal";
import { useEffect } from "react";

export const DetailTempatPPL = ({ sekolah, pelamar, lowongan }) => {
    const dataKabupaten = kabupaten("11");

    const columns_lowongan = [
        {
            name: "No",
            label: "No",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return tableMeta.rowIndex + 1; // Adjust index to be 1-based
                },
            },
        },
        { name: "name" },
        { name: "quota", label: "Kuota" },
        { name: "accepted_pelamar_count", label: "Terisi" },
        {
            name: "id",
            label: "Action",
            options: {
                customBodyRender: (value) => (
                    <ul className="flex flex-row justify-center items-center text-lg">
                        <li
                            className="bg-green-500 text-white p-1 rounded-l-md cursor-pointer hover:scale-[1.1]"
                            onClick={(e) => handleOnViewClick(e, value)}
                        >
                            <MdOpenInNew />
                        </li>
                        <li className="p-1 bg-yellow-500 text-white cursor-pointer hover:scale-[1.1]">
                            <TiEdit
                                onClick={(e) => handleOnEditClick(e, value)}
                            />
                        </li>
                        <li className="text-white bg-red-500 p-1  rounded-r-md cursor-pointer hover:scale-[1.1]">
                            <MdDelete
                                onClick={(e) => handleOnDeleteClick(e, value)}
                            />
                        </li>
                    </ul>
                ),
                filter: false,
                sort: false,
            },
        },
    ];
    const handleOnViewClick = (e, value) => {
        e.preventDefault();
        router.get(`/admin/lowonganppl/detail/${value}`);
    };

    const handleOnEditClick = (e, value) => {
        e.preventDefault();
        router.get(`/admin/lowonganppl/edit/${value}`);
    };
    const [idToDelete, setIdToDelete] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const handleOnDeleteClick = (e, value) => {
        e.preventDefault();
        setOpenDialog(true);
        setIdToDelete(value);
    };
    const columns_pelamar = [
        {
            name: "No",
            label: "No",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return tableMeta.rowIndex + 1; // Adjust index to be 1-based
                },
            },
        },
        {
            name: "nama_mahasiswa",
            label: "Nama",
            options: {
                customBodyRender: (value) => <p>{value}</p>,
            },
        },
        {
            name: "nim",
            label: "NIM",
            options: {
                customBodyRender: (value) => <p>{value}</p>,
            },
        },

        {
            name: "nama_prodi",
            label: "Prodi",
            options: {
                customBodyRender: (value) => <p>{value}</p>,
            },
        },
        {
            name: "jk",
            label: "Jenis Kelamin",
            options: {
                customBodyRender: (value) => <p>{value}</p>,
            },
        },
        { name: "no_hp_wa", label: "No HP" },
        { name: "status", label: "Status" },
        {
            name: "id",
            label: "Action",
            options: {
                customBodyRender: (value) => (
                    <ul className="flex flex-row justify-center items-center text-lg">
                        <li
                            className="bg-green-500 text-white p-1 rounded-md cursor-pointer hover:scale-[1.1]"
                            onClick={(e) => handleOnViewPelamarClick(e, value)}
                        >
                            <MdOpenInNew />
                        </li>
                    </ul>
                ),
                filter: false,
                sort: false,
            },
        },
    ];
    const handleOnViewPelamarClick = (e, value) => {
        router.get(`/admin/pelamarppl/detail/${value}`);
    };

    const options = {
        filterType: "multiselect",
        selectableRows: false,
    };

    const daftarKabupaten = kabupaten("11");
    const [regency, setRegency] = useState(
        daftarKabupaten.find((itm) => itm.kode === sekolah.regency).name
    );

    const [subDistrict, setSubDistrict] = useState(
        kecamatan(sekolah?.regency).find(
            (itm) => itm.kode === sekolah?.sub_district
        ).name
    );

    const [village, setVillage] = useState(
        desa(sekolah?.sub_district).find((itm) => itm.kode === sekolah?.village)
    );
    useEffect(() => {
        console.log(subDistrict);
    }, [regency]);

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={3} />
                <Head title="Detail Tempat PPL" />
                <Modal
                    show={openDialog}
                    closeable={true}
                    onClose={(e) => setOpenDialog(false)}
                    onConfirm={(e) => {
                        router.post(
                            `/admin/lowonganppl/delete/${idToDelete}`,
                            { _method: "delete" },
                            { preserveScroll: true }
                        );
                        setOpenDialog(false);
                    }}
                />
            </div>
            <div className="flex ml-72 w-full flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="flex flex-col w-full px-3 gap-y-3">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                        <Link href="/admin/daftartempatppl">Tempat PPL</Link>
                        <Link>Detail</Link>
                    </Breadcrumbs>
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 p-4 bg-white rounded-md shadow-md">
                        <div className="w-full">
                            <table className="table-auto">
                                <tbody>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Nama Sekolah
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {sekolah?.name}
                                        </td>
                                    </tr>

                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Kabupaten
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {
                                                daftarKabupaten.find(
                                                    (item) =>
                                                        item.kode ===
                                                        sekolah.regency
                                                )?.nama
                                            }
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Kecamatan
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {
                                                kecamatan(
                                                    sekolah?.regency
                                                ).find(
                                                    (item) =>
                                                        item.kode ===
                                                        sekolah?.sub_district
                                                )?.nama
                                            }
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Desa
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {
                                                desa(
                                                    sekolah?.sub_district
                                                ).find(
                                                    (item) =>
                                                        item.kode ===
                                                        sekolah?.village
                                                )?.nama
                                            }
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
                                            Supervisor
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap"></td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            Jumlah Alokasi Mahasiswa
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {sekolah.jumlah_alokasi}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            Jumlah Terisi
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {sekolah.jumlah_terisi}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <MUIDataTable
                        title={"Lowongan"}
                        data={lowongan}
                        columns={columns_lowongan}
                        options={options}
                    />
                    <MUIDataTable
                        title={"Pelamar"}
                        data={pelamar}
                        columns={columns_pelamar}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};
export default DetailTempatPPL;
