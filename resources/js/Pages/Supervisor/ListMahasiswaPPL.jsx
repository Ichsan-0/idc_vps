import React from "react";

import Sidebar from "../../Components/supervisor/Sidebar/Sidebar";
import Header from "@/Components/supervisor/Header/Header";
import MUIDataTable from "mui-datatables";
import { Alert, Chip, IconButton, Snackbar } from "@mui/material";
import { FiEdit2 } from "react-icons/fi";
import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { useState } from "react";
import { TiEdit } from "react-icons/ti";

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
    { name: "name", label: "Nama Mahasiswa" },
    { name: "nim", label: "NIM" },
    { name: "nama_prodi", label: "Prodi" },
    // {
    //     name: "nama_prodi",
    //     label: "Nama Lowongan",
    //     options: {
    //         filter: true,
    //         sort: true,
    //         customBodyRender: (value, tableMeta) => {
    //             return `PPL ${value}`;
    //         },
    //     },
    // },
    { name: "nama_sekolah", label: "Nama Sekolah" },
    {
        name: "nilai_supervisor_ppl",
        label: "Nilai Supervisor",
        options: {
            customBodyRender: (value, tableMeta) => {
                return <p className="text-center">{value ? value : "-"}</p>;
            },
        },
    },
    {
        name: "nilai_pamong",
        label: "Nilai Pamong",
        options: {
            customBodyRender: (value, tableMeta) => {
                return <p className="text-center">{value ? value : "-"}</p>;
            },
        },
    },
    {
        name: "status",
        label: "Status",
        options: {
            customBodyRender: (value) => (
                <div className="flex flex-row justify-center items-center gap-x-2">
                    <Chip
                        color={`${value === "done" ? "success" : "error"}`}
                        label={value}
                    />
                </div>
            ),
            filter: false,
            sort: false,
        },
    },

    {
        name: "id",
        label: "Action",
        options: {
            customBodyRender: (value) => (
                <div className="flex flex-row justify-center items-center gap-x-2">
                    <ul className="flex flex-row justify-center items-center text-lg">
                        <li
                            className="p-1 bg-yellow-500 text-white cursor-pointer hover:scale-[1.1]"
                            onClick={(e) =>
                                router.get(`/supervisor/editnilai/${value}`)
                            }
                        >
                            <TiEdit />
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

const ListMahasiswaPPL = ({ daftarmahasiswappl, status, flash }) => {
    const [notify, setNotify] = useState(!!flash.message);
    const [notifyStatus, setNotifyStatus] = useState("default");

    useEffect(() => {
        if (flash.message !== null) {
            console.log("notify=> ", notify);
            if (flash.message.success) {
                setNotifyStatus("success");
            } else {
                setNotifyStatus("error");
            }
        }
        setNotify(true);
    }, [flash.message]);
    // console.log(tempat_ppl);
    const handleCloseNotify = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setNotify(false);
    };
    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={3} />
            </div>
            <div className="flex w-full ml-72 flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3">
                    {flash.message && (
                        <Snackbar
                            open={notify}
                            anchorOrigin={{
                                vertical: "top",
                                horizontal: "right",
                            }}
                            autoHideDuration={6000}
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
                    )}

                    <div className="flex w-full  py-2">
                        {status === true ? (
                            <Alert severity="success">
                                Data nilai mahasiswa selesai diisi terimakasih
                                atas bantuannya
                            </Alert>
                        ) : (
                            <Alert severity="error">
                                ada mahasiswa yang belum diinput nilai
                            </Alert>
                        )}
                    </div>
                    <MUIDataTable
                        title={"Daftar Mahasiswa PPL"}
                        data={daftarmahasiswappl}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};

export default ListMahasiswaPPL;
