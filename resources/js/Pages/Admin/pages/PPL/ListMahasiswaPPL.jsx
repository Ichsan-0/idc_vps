import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import MUIDataTable from "mui-datatables";
import { Link, router } from "@inertiajs/react";
import { Button, IconButton } from "@mui/material";
import { MdDelete } from "react-icons/md";
import { GrFormView } from "react-icons/gr";

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
    {
        name: "id",
        label: "Action",
        options: {
            customBodyRender: (value) => (
                <div className="flex flex-row justify-center items-center gap-x-2">
                    <Link>
                        <IconButton
                            onClick={(e) => {
                                e.preventDefault();
                                router.get(`/admin/detailpelamarppl/${value}`);
                            }}
                        >
                            <GrFormView className="text-3xl text-blue-500" />
                        </IconButton>
                    </Link>

                    <IconButton>
                        <MdDelete className="text-2xl text-red-500" />
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

const ListMahasiswaPPL = ({ daftarprodi }) => {
    // console.log(tempat_ppl);
    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={1} />
            </div>
            <div className="flex w-full ml-72">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3 mt-20">
                    <div className="flex w-full justify-end py-2">
                        <Button variant="contained">Tambah</Button>
                    </div>
                    <MUIDataTable
                        title={"Daftar Program Studi"}
                        data={daftarprodi}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};

export default ListMahasiswaPPL;
