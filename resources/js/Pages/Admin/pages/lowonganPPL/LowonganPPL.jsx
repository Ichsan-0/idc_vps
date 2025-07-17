import React from "react";

import TableLowonganPPL from "./TableLowonganPPL";
import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import { MdOutlineOpenInNew } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import { TbEdit } from "react-icons/tb";
import { Button, IconButton } from "@mui/material";
import MUIDataTable from "mui-datatables";
import { Head } from "@inertiajs/react";

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
    { name: "nama_tempat_ppl", label: "Sekolah" },
    { name: "nama_prodi", label: "Prodi" },
    { name: "qouta", label: "Kuota" },
    { name: "terisi", label: "Terisi" },
    {
        name: "id_tempat",
        label: "Action",
        options: {
            customBodyRender: (value) => (
                <div className="">
                    <IconButton>
                        <MdOutlineOpenInNew className="text-[#1972d6]" />
                    </IconButton>
                    <IconButton>
                        <TbEdit className="text-md text-[#1972d6]" />
                    </IconButton>
                    <IconButton>
                        <MdDeleteForever className="text-md text-red-500" />
                    </IconButton>
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

const TempatPPL = ({ lowongan_ppl }) => {
    // console.log(tempat_ppl);
    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Head title="Lowongan PPL" />
                <Sidebar tabId={2} />
            </div>
            <div className="flex ml-72 w-full">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3 mt-20 w-full">
                    <div className="flex w-full justify-end mb-2">
                        <Button variant="contained">Tambah</Button>
                    </div>
                    <MUIDataTable
                        title={"Daftar Lowongan PPL"}
                        data={lowongan_ppl}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};

export default TempatPPL;
