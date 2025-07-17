import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import MUIDataTable from "mui-datatables";
import { Head, Link, router } from "@inertiajs/react";
import { Alert, Button, Chip, IconButton, Snackbar } from "@mui/material";
import { MdDelete, MdOpenInNew } from "react-icons/md";
import { AiOutlineEye } from "react-icons/ai";
import { FiEdit2 } from "react-icons/fi";
import { TiEdit } from "react-icons/ti";
import Modal from "@/Components/Modal";
import { useState } from "react";
import { useEffect } from "react";

const ListMahsiswa = ({ daftarmahasiswa, flash }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [idObjToDelete, setIdObjToDelete] = useState(null);
    const [notify, setNotify] = useState(flash.message !== null ? true : false);
    const [notifyStatus, setNotifyStatus] = useState("default");
    const getStatus = (value) => {
        let color = "default";
        if (value === "submitted") {
            color = "warning";
        } else if (value === "rejected") {
            color = "error";
        } else if (value === "accepted") {
            color = "success";
        }
        return color;
    };

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
        { name: "name", label: "Nama" },
        { name: "nim", label: "NIM" },

        { name: "nama_prodi", label: "Prodi" },
        { name: "no_hp_wa", label: "No HP/WA" },
        {
            name: "status",
            label: "Status",
            options: {
                customBodyRender: (value) => (
                    <div className="flex flex-row justify-center items-center gap-x-2">
                        <Chip color={`${getStatus(value)}`} label={value} />
                    </div>
                ),
                filter: false,
                sort: false,
            },
        },
        {
            name: "nim",
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
                            <MdDelete />
                        </li>
                    </ul>
                ),
                filter: false,
                sort: false,
                setCellHeaderProps: () => ({
                    style: { textAlign: "center" },
                }),
            },
        },
    ];

    const options = {
        filterType: "multiselect",
        selectableRows: false,
    };

    const onDialogClose = () => {
        setOpenDialog(false);
        setIdObjToDelete(null);
    };

    const handleOnViewClick = (e, id) => {
        e.preventDefault();
        router.visit(`/admin/mahasiswa/detail/${id}`);
    };

    const handleOnEditClick = (e, id) => {
        e.preventDefault();
        router.visit(`/admin/mahasiswa/detail/${id}`);
    };

    const handleOnDeleteClick = (e, id) => {
        setOpenDialog(true);
        setIdObjToDelete(id);
    };

    const handleConfirmClick = (e) => {
        e.preventDefault();
        // router.post(
        //     `/admin/supervisor/${idObjToDelete}`,
        //     { _method: "delete" },
        //     { preserveScroll: true }
        // );
        onDialogClose();
    };

    useEffect(() => {
        if (flash.message) {
            console.log("notify");
            if (flash.message.success) {
                setNotifyStatus("success");
            } else {
                setNotifyStatus("error");
            }
        }
        setNotify(true);
    }, [flash.message]);

    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };

    // console.log(tempat_ppl);
    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={4} />
            </div>
            <div className="flex w-full ml-72 flex-col">
                <Header></Header>
                <Head title="Daftar Mahasiswa" />
                <div className="space"></div>
                <div className="px-3">
                    <div className="flex w-full justify-start gap-x-2 py-2">
                        {/* <Button
                            variant="contained"
                            onClick={(e) => {
                                e.preventDefault();
                                router.visit("/admin/addmahasiswa");
                            }}
                        >
                            Import
                        </Button> */}
                    </div>
                    <MUIDataTable
                        title={"Daftar Mahasiswa"}
                        data={daftarmahasiswa}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
            <Modal show={openDialog} closeable={true} onClose={onDialogClose}>
                <div className="p-3">
                    <ul className=" flex flex-col">
                        <li className="text-md font-bold">
                            Yakin ingin menghapus
                        </li>
                        <li className="text-sm mt-3">
                            Data yang sudah dihapus tidak bisa dikembalikan
                        </li>
                        <li className="text-sm mt-3 flex justify-end gap-x-4 w-full">
                            <button
                                className="flex ring-1 ring-blue-500 rounded-md p-2 text-blue-500 hover:bg-blue-500/10"
                                onClick={(e) => handleConfirmClick(e)}
                            >
                                yakin
                            </button>
                            <button
                                className="flex ring-1 bg-blue-500 rounded-md p-2 text-white hover:bg-blue-500/90"
                                onClick={onDialogClose}
                            >
                                tidak
                            </button>
                        </li>
                    </ul>
                </div>
            </Modal>
            <Snackbar
                open={notify}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                }}
                autoHideDuration={2000}
                onClose={handleCloseNotify}
            >
                <Alert
                    onClose={handleCloseNotify}
                    severity={notifyStatus}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {flash.message && flash.message[notifyStatus]}
                </Alert>
            </Snackbar>
        </section>
    );
};

export default ListMahsiswa;
