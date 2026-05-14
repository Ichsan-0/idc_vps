import React from "react";

import TableTempatPPL from "./TableTempatPPL";
import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import MUIDataTable from "mui-datatables";
import { Button, IconButton } from "@mui/material";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";
import { MdOutlineOpenInNew } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import { TbEdit } from "react-icons/tb";

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
    { name: "nama" },
    { name: "nama_supervisor", label: "Nama Supervisor" },
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

const TempatPPL = ({ tempat_ppl }) => {
    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={2} />
            </div>
            <div className="w-full ml-72">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3 pt-20">
                    <div className="flex w-full justify-end mb-2">
                        <Button variant="contained">Tambah</Button>
                    </div>
                    <MUIDataTable
                        title={"Daftar Tempat PPL"}
                        data={tempat_ppl}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};

export default TempatPPL;
