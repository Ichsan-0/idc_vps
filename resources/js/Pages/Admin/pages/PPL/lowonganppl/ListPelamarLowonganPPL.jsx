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

const ListPelamarLowonganPPL = ({ pelamar }) => {
    const columns = [
        {
            name: "No",
            label: "No",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return tableMeta.rowIndex + 1;
                },
            },
        },
        {
            name: "user",
            label: "Nama",
            options: {
                customBodyRender: (value) => <p>{value?.name}</p>,
                filter: false,
                sort: false,
            },
        },
        {
            name: "user",
            label: "NIM",
            options: {
                customBodyRender: (value) => <p>{value?.username}</p>,
                filter: false,
                sort: false,
            },
        },
        {
            name: "data_user",
            label: "Prodi",
            options: {
                customBodyRender: (value) => <p>{value?.prodi?.name}</p>,
                filter: false,
                sort: false,
            },
        },
        {
            name: "ppl",
            label: "Nama Sekolah",
            options: {
                customBodyRender: (value) => (
                    <p
                        className="cursor-pointer text-blue-700"
                        onClick={() =>
                            router.visit(
                                `/admin/tempatppl/detail/${value?.sekolah?.id}`
                            )
                        }
                    >
                        {value?.sekolah?.name}
                    </p>
                ),
                filter: false,
                sort: false,
            },
        },

        {
            name: "ppl",
            label: "Nama Lowongan",
            options: {
                customBodyRender: (value) => (
                    <p
                        className="cursor-pointer text-blue-700"
                        onClick={() =>
                            router.get(`/admin/lowonganppl/detail/${value?.id}`)
                        }
                    >
                        {value?.name}
                    </p>
                ),
                filter: false,
                sort: false,
            },
        },
        {
            name: "ppl",
            label: "Kuota",
            options: {
                customBodyRender: (value) => <p>{value?.quota}</p>,
                filter: false,
                sort: false,
            },
        },
        {
            name: "terisi",
            label: "Terisi",
            options: {
                customBodyRender: (value) => (
                    <p>{value?.accepted_pelamar_count}</p>
                ),
                filter: false,
                sort: false,
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
    };

    const handleOnViewClick = (e, value) => {
        e.preventDefault();
        router.get(`/admin/pelamarppl/detail/${value}`);
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

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Head title="Pelamar Lowongan PPL" />
                <Sidebar tabId={3} />
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

            <div className="flex w-full ml-72 flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3">
                    <div className="flex w-full py-2 gap-x-2"></div>
                    <MUIDataTable
                        title={"Daftar Pelamar PPL yang belum Disetujui"}
                        data={pelamar}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};

export default ListPelamarLowonganPPL;
