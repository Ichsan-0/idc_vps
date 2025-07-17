import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import { MdDelete } from "react-icons/md";

import { MdOpenInNew } from "react-icons/md";
import { TiEdit } from "react-icons/ti";
import { Button, IconButton } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { Head, router } from "@inertiajs/react";
import Modal from "@/Components/Modal";
import { useState } from "react";
import { kecamatan } from "daftar-wilayah-indonesia";

const TempatKPM = ({ tempat_kpm }) => {
    // console.log(tempat_ppl);

    const preprocessData = tempat_kpm.map((item) => {
        const kec = kecamatan(item.location.regency).find(
            (itm) => itm.kode === item.location.sub_district
        )?.nama;

        return { ...item, location_name: kec };
    });

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
        { name: "name" },
        // { name: "regency" },
        // { name: "regency" },
        {
            name: "location_name",
            label: "Kecamatan",
        },

        {
            name: "qouta",
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
                    <p className="text-center">{value}</p>
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
            label: "Jumlah Perempuan",
            options: {
                customBodyRender: (value) => (
                    <p className="text-center">{value}</p>
                ),
            },
        },

        { name: "nama_supervisor", label: "Nama Supervisor" },
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

    const options = {
        filterType: "multiselect",
        selectableRows: false,
    };

    const [idToDelete, setIdToDelete] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const handleOnDeleteClick = (e, value) => {
        setIdToDelete(value);
        setOpenDialog(true);
    };

    const handleOnViewClick = (e, value) => {
        e.preventDefault();
        router.visit(`/admin/tempatkpm/detail/${value}`);
    };
    const handleOnEditClick = (e, value) => {
        e.preventDefault();
        router.visit(`/admin/tempatkpm/edit/${value}`);
    };

    return (
        <section className="main flex">
            <Head title="Tempat KPM" />
            <div className="sidebarWrapper flex">
                <Sidebar tabId={2} />
            </div>
            <div className="flex ml-72 w-full flex-col">
                <Header></Header>
                <Modal
                    show={openDialog}
                    closeable={true}
                    onClose={(e) => setOpenDialog(false)}
                    onConfirm={(e) => {
                        router.post(
                            `/admin/tempatkpm/delete/${idToDelete}`,
                            { _method: "delete" },
                            { preserveScroll: true }
                        );
                        setOpenDialog(false);
                    }}
                />
                <div className="space"></div>
                <div className="px-3 w-full">
                    <div className="flex w-full justify-end mb-2">
                        <Button
                            variant="contained"
                            onClick={(e) =>
                                router.visit("/admin/tempatkpm/add")
                            }
                        >
                            Tambah
                        </Button>
                    </div>
                    <MUIDataTable
                        title={"Tempat KPM"}
                        data={preprocessData}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};

export default TempatKPM;
