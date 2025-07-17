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

const ListLowonganPPL = ({ daftarlowonganppl }) => {
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
            name: "name",
            label: "Nama Lowongan",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return `${value}`;
                },
            },
        },
        {
            name: "sekolah",
            label: "Nama Sekolah",
            options: {
                customBodyRender: (value) => (
                    <div className="">
                        <p>{value.name}</p>
                    </div>
                ),
                filter: false,
                sort: false,
            },
        },
        { name: "quota", label: "Kuota" },
        { name: "accepted_pelamar_count", label: "Terisi" },

        {
            name: "id",
            label: "Action",
            options: {
                customBodyRender: (value) => (
                    <div className="flex flex-row justify-center items-center gap-x-2">
                        <ul className="flex flex-row justify-center items-center text-lg">
                            <li
                                className="bg-green-500 text-white p-1 rounded-l-md cursor-pointer hover:scale-[1.1]"
                                onClick={(e) => handleOnViewClick(e, value)}
                            >
                                <MdOpenInNew />
                            </li>
                            <li
                                className="p-1 bg-yellow-500 text-white cursor-pointer hover:scale-[1.1]"
                                onClick={(e) => handleOnEditClick(e, value)}
                            >
                                <TiEdit />
                            </li>
                            <li
                                className="text-white bg-red-500 p-1  rounded-r-md cursor-pointer hover:scale-[1.1] "
                                onClick={(e) => handleOnDeleteClick(e, value)}
                            >
                                <MdDelete />
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

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Head title="Lowongan PPL" />
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
                    <div className="flex w-full py-2 gap-x-2">
                        {/* <Button
                            variant="outlined"
                            sx={{ textTransform: "capitalize" }}
                            disableElevation
                            onClick={(e) => {
                                e.preventDefault();
                                router.visit("/admin/addlowonganppl");
                            }}
                        >
                            Import
                        </Button> */}
                        <Button
                            variant="contained"
                            disableElevation
                            sx={{ textTransform: "capitalize" }}
                            onClick={(e) => {
                                e.preventDefault();
                                router.visit("/admin/lowonganppl/add");
                            }}
                        >
                            Tambah
                        </Button>
                    </div>
                    <MUIDataTable
                        title={"Daftar Lowongan PPL"}
                        data={daftarlowonganppl}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};

export default ListLowonganPPL;
