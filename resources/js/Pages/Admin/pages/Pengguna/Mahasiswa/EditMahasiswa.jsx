import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import MUIDataTable from "mui-datatables";
import {
    Autocomplete,
    Breadcrumbs,
    Button,
    IconButton,
    TextField,
} from "@mui/material";
import { MdDelete } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";

const AddMahasiswa = ({ datamahasiswa, dataprodi, datalowongan }) => {
    const [selectedLowonganPPL, setSelectedLowonganPPL] = useState(
        datamahasiswa?.id_lowongan_ppl
            ? datalowongan.find((lw) => lw.id === datamahasiswa.id_lowongan_ppl)
            : null
    );
    const [selectedProdi, setSelectedProdi] = useState(
        datamahasiswa?.id_prodi
            ? dataprodi.find((prd) => prd.id === datamahasiswa.id_prodi)
            : null
    );

    const [selectedIdProdi, setSelectedIdProdi] = useState(
        selectedProdi?.id || null
    );

    const [selectedIdLowongan, setSelectedIdLowongan] = useState(
        selectedLowonganPPL?.id || null
    );

    function submit(e) {
        e.preventDefault();
        router.post(`/admin/mahasiswa/update/${datamahasiswa.nim}`, {
            _method: "patch",
            id_prodi: selectedIdProdi,
            id_lowongan_ppl: selectedIdLowongan,
        });
    }

    const handleIdLowonganChange = (e, value) => {
        setSelectedLowonganPPL(value);
        setSelectedIdLowongan(value.id);
    };
    const handleIdProdiChange = (e, value) => {
        setSelectedProdi(value);
        setSelectedIdProdi(value.id);
    };
    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={1} />
            </div>
            <div className="flex w-full ml-72 flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3">
                    <Breadcrumbs>
                        <Link href="/admin/daftarmahasiswa">
                            Daftar Mahasiswa
                        </Link>
                        <Link>Edit Mahasiswa</Link>
                    </Breadcrumbs>
                    <div className="flex w-full py-2">
                        <form
                            className="flex flex-col gap-y-3 w-full"
                            onSubmit={submit}
                        >
                            <TextField
                                label="Nama"
                                disabled
                                value={datamahasiswa.name}
                                fullWidth
                                sx={{ width: "400px" }}
                            />
                            <TextField
                                label="NIM"
                                disabled
                                value={datamahasiswa.nim}
                                fullWidth
                                sx={{ width: "400px" }}
                            />
                            <Autocomplete
                                value={selectedProdi}
                                options={dataprodi}
                                getOptionLabel={(op) => op.name}
                                onChange={(e, value) =>
                                    handleIdProdiChange(e, value)
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Prodi" />
                                )}
                            />
                            <Autocomplete
                                value={selectedLowonganPPL}
                                options={datalowongan}
                                getOptionLabel={(op) => op.nama_lowongan}
                                onChange={(e, value) =>
                                    handleIdLowonganChange(e, value)
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Lowongan PPL"
                                    />
                                )}
                            />

                            <div>
                                <Button variant="contained" type="submit">
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AddMahasiswa;
