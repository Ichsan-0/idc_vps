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
    { name: "nim" },
    { name: "nama_mahasiswa", label: "Nama Mahasiswa" },
    { name: "jk", label: "Jenis Kelamin" },
    { name: "nama_prodi", label: "Prodi" },
    { name: "nama_lowongan_ppl", label: "Lowongan" },
    { name: "nama_tempat_ppl", label: "Sekolah" },
    { name: "kuota", label: "kuota" },
    { name: "terisi", label: "Terisi" },
    { name: "jumlahpelamar", label: "Jumlah Pelamar" },
    {
        name: "id_lamaran",
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

const DaftarPelamarPPL = ({ daftarpelamarppl }) => {
    // console.log(tempat_ppl);
    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={2} />
            </div>
            <div className="flex w-full ml-72">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3 mt-20">
                    <MUIDataTable
                        title={"Daftar Pelamar PPL"}
                        data={daftarpelamarppl}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};

export default DaftarPelamarPPL;
