import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import MUIDataTable from "mui-datatables";
import { Head, Link, router } from "@inertiajs/react";
import { Alert, Button, Snackbar } from "@mui/material";
import { MdDelete, MdOpenInNew } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { TiEdit } from "react-icons/ti";
import Modal from "@/Components/Modal";
import { useState } from "react";
import { useEffect } from "react";

const ListProdi = ({ daftarprodi, flash }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [idObjToDelete, setIdObjToDelete] = useState(null);
    const [notify, setNotify] = useState(flash.message !== null ? true : false);
    const [notifyStatus, setNotifyStatus] = useState("default");

    const columns = [
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
        { name: "name", label: "Nama" },
        { name: "kode", label: "Kode" },
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
        router.visit(`/admin/prodi/edit/${id}`);
    };

    const handleOnEditClick = (e, id) => {
        e.preventDefault();
        router.visit(`/admin/prodi/edit/${id}`);
    };

    const handleOnDeleteClick = (e, id) => {
        setOpenDialog(true);
        setIdObjToDelete(id);
    };

    const handleConfirmClick = () => {
        router.post(
            `/admin/prodi/${idObjToDelete}`,
            { _method: "delete" },
            { preserveScroll: true }
        );
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

    return (
        <section className="main flex">
            <Head title="Prodi" />
            <div className="sidebarWrapper flex">
                <Sidebar tabId={1} />
            </div>
            <div className="flex w-full ml-72 flex-col">
                <Header></Header>

                <Modal
                    show={openDialog}
                    closeable={true}
                    onClose={onDialogClose}
                    onConfirm={() => handleConfirmClick()}
                ></Modal>
                <div className="space"></div>
                <div className="px-3 ">
                    <div className="flex w-full justify-end gap-x-3 py-2">
                        <Button
                            variant="outlined"
                            onClick={(e) => {
                                e.preventDefault();
                                router.visit("/admin/prodi/import");
                            }}
                        >
                            Import
                        </Button>
                        <Button
                            variant="contained"
                            onClick={(e) => {
                                e.preventDefault();
                                router.visit("/admin/prodi/add");
                            }}
                        >
                            Tambah
                        </Button>
                    </div>
                    <MUIDataTable
                        title={"Daftar Program Studi"}
                        data={daftarprodi}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
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

export default ListProdi;
