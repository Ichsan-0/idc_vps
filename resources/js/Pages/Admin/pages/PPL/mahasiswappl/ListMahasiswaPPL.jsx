import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import MUIDataTable from "mui-datatables";
import { Head, Link, router } from "@inertiajs/react";
import { Alert, Button, IconButton, Snackbar } from "@mui/material";
import { MdDelete } from "react-icons/md";

import { MdOpenInNew } from "react-icons/md";
import { TiEdit } from "react-icons/ti";
import { useState } from "react";
import { useEffect } from "react";
import Modal from "@/Components/Modal";

const ListMahasiswaPPL = ({ daftarmahasiswappl, flash }) => {
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
                    return tableMeta.rowIndex + 1;
                },
            },
        },
        {
            name: "user",
            label: "Nama Mahasiswa",
            options: {
                customBodyRender: (value) => {
                    return <p>{value.name}</p>;
                },
            },
        },
        {
            name: "user",
            label: "NIM",
            options: {
                customBodyRender: (value) => {
                    return <p>{value.username}</p>;
                },
            },
        },
        {
            name: "data_user",
            label: "Prodi",
            options: {
                customBodyRender: (value) => {
                    return <p>{value?.prodi?.name}</p>;
                },
            },
        },
        {
            name: "ppl",
            label: "Nama Sekolah",
            options: {
                customBodyRender: (value) => {
                    return <p>{value?.sekolah?.name}</p>;
                },
            },
        },
        {
            name: "ppl",
            label: "Nama Supervisor",
            options: {
                customBodyRender: (value) => {
                    return <p>{value?.sekolah?.supervisor?.name}</p>;
                },
            },
        },
        {
            name: "data_user",
            label: "Nilai Supervisor",
            options: {
                customBodyRender: (value, tableMeta) => {
                    return (
                        <p className="text-center">
                            {value.nilai_supervisor_ppl
                                ? value.nilai_supervisor_ppls
                                : "-"}
                        </p>
                    );
                },
            },
        },
        {
            name: "data_user",
            label: "Nilai Pamong",
            options: {
                customBodyRender: (value, tableMeta) => {
                    return (
                        <p className="text-center">
                            {value.nilai_pamong ? value.nilai_pamong : "-"}
                        </p>
                    );
                },
            },
        },

        // {
        //     name: "nim",
        //     label: "Action",
        //     options: {
        //         customBodyRender: (value) => (
        //             <ul className="flex flex-row justify-center items-center text-lg">
        //                 <li className="bg-green-500 text-white p-1 rounded-l-md cursor-pointer hover:scale-[1.1]">
        //                     <MdOpenInNew />
        //                 </li>
        //                 <li className="p-1 bg-yellow-500 text-white cursor-pointer hover:scale-[1.1]">
        //                     <TiEdit
        //                         onClick={(e) => handleOnEditClick(e, value)}
        //                     />
        //                 </li>
        //                 <li className="text-white bg-red-500 p-1  rounded-r-md cursor-pointer hover:scale-[1.1]">
        //                     <MdDelete
        //                         onClick={(e) => handleOnDeleteClick(e, value)}
        //                     />
        //                 </li>
        //             </ul>
        //         ),
        //         filter: false,
        //         sort: false,
        //     },
        // },
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
        router.visit(`/admin/mahasiswappl/edit/${id}`);
    };

    const handleOnEditClick = (e, id) => {
        e.preventDefault();
        router.visit(`/admin/mahasiswappl/edit/${id}`);
    };

    const handleOnDeleteClick = (e, id) => {
        setOpenDialog(true);
        setIdObjToDelete(id);
    };

    const handleConfirmClick = (e) => {
        e.preventDefault();
        // router.post(
        //     `/admin/prodi/${idObjToDelete}`,
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
                <Sidebar tabId={3} />
                <Head title="List Mahasiswa PPL" />
            </div>
            <div className="flex w-full ml-72 flex-col">
                <Header></Header>
                <Modal
                    show={openDialog}
                    closeable={true}
                    onClose={onDialogClose}
                >
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
                <div className="space"></div>
                <div className="px-3">
                    <div className="flex w-full  py-2">
                        {/* <Button
                            variant="contained"
                            onClick={(e) => {
                                e.preventDefault();
                                router.visit("/admin/addlowonganppl");
                            }}
                        >
                            Tambah
                        </Button> */}
                    </div>
                    <MUIDataTable
                        title={"Daftar Mahasiswa PPL"}
                        data={daftarmahasiswappl}
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

export default ListMahasiswaPPL;
