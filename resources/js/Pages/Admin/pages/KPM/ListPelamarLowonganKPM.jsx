import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import MUIDataTable from "mui-datatables";
import { Head, Link, router } from "@inertiajs/react";
import { Button, IconButton } from "@mui/material";
import { MdDelete, MdOpenInNew } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { AiOutlineEye } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { TiEdit } from "react-icons/ti";
import Modal from "@/Components/Modal";
import { useState } from "react";

const ListPelamarLowonganKPM = ({ pelamar }) => {
    const columns = [
        {
            name: "No",
            label: "No",
            options: {
                customBodyRender: (value, tableMeta) => {
                    return tableMeta.rowIndex + 1;
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
                customBodyRender: (value) => (
                    <p className="text-center">{value}</p>
                ),
            },
        },
        {
            name: "nama_tempat_kpm",
            label: "Nama Desa",
            options: {
                options: {
                    customBodyRender: (value) => <p>{value}</p>,
                },
            },
        },

        {
            name: "quota",
            label: "Kuota",
            options: {
                customBodyRender: (value) => (
                    <p className="text-center">{value}</p>
                ),
            },
        },
        {
            name: "accepted_pelamar_count",
            label: "Terisi",
            options: {
                customBodyRender: (value) => (
                    <p className="bg-red-400/35 flex justify-center py-2 rounded-md">
                        {value}
                    </p>
                ),
            },
        },
        {
            name: "jumlah_pria",
            label: "Laki-Laki",
            options: {
                customBodyRender: (value) => (
                    <p className="text-center">{value}</p>
                ),
            },
        },
        {
            name: "jumlah_wanita",
            label: "Perempuan",
            options: {
                customBodyRender: (value) => (
                    <p className="text-center">{value}</p>
                ),
            },
        },
        // { name: "quota", label: "Kuota" },
        // { name: "accepted_pelamar_count", label: "Terisi" },

        {
            name: "id",
            label: "Action",
            options: {
                customBodyRender: (value) => (
                    <div className="flex flex-row justify-center items-center gap-x-2">
                        <ul className="flex flex-row justify-center items-center text-lg">
                            <li
                                className="bg-green-500 text-white p-1 rounded-md cursor-pointer hover:scale-[1.1]"
                                onClick={(e) => handleOnViewClick(e, value)}
                            >
                                <MdOpenInNew />
                            </li>
                        </ul>
                    </div>
                ),
                filter: false,
                sort: false,
            },
        },
    ];

    const options = {
        filterType: "multiselect",
        selectableRows: false,
        setRowProps: () => ({
            style: {
                padding: "2px 4px", // Adjust padding to control row height
            },
        }),
    };

    const handleOnViewClick = (e, value) => {
        e.preventDefault();
        router.get(`/admin/pelamarkpm/detail/${value}`);
    };

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Head title="Pelamar Lowongan PPL" />
                <Sidebar tabId={2} />
            </div>

            <div className="flex w-full ml-72 flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3">
                    <div className="flex w-full py-2 gap-x-2"></div>
                    <MUIDataTable
                        title={"Daftar Pelamar KPM yang belum Disetujui"}
                        data={pelamar}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};

export default ListPelamarLowonganKPM;
