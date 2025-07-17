import React from "react";
import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import {
    Autocomplete,
    Breadcrumbs,
    Button,
    IconButton,
    TextField,
} from "@mui/material";
import { kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";
import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { NavigateNext } from "@mui/icons-material";
import InputError from "@/Components/InputError";

export const AddProdi = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: null,
        kode: null,
    });
    const [name, setName] = useState(null);
    const [code, setCode] = useState(null);

    const handleNameChange = (e) => {
        setName(e.target.value);
        setData("name", e.target.value);
    };
    const handleCodeChange = (e) => {
        setCode(e.target.value);
        setData("kode", e.target.value);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        post("/admin/prodi/save", {
            _method: "post",
        });
    };

    return (
        <section className="main flex">
            <Head title="Add Prodi" />
            <div className="sidebarWrapper flex">
                <Sidebar tabId={2} />
            </div>
            <div className="flex ml-72 w-full flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="flex flex-col w-full px-3 gap-y-3">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                        <Link href="/admin/daftarprodi">Prodi</Link>
                        <Link>Tambah</Link>
                    </Breadcrumbs>
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 ">
                        <div className="flex flex-col w-full">
                            <TextField
                                id="nama"
                                label="Nama Prodi"
                                value={name}
                                onChange={(e) => handleNameChange(e)}
                                placeholder="Nama Tempat KPM"
                                sx={{ width: "100%" }}
                            ></TextField>
                            {errors.name && (
                                <InputError message={errors.name}></InputError>
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <TextField
                                id="kode_prodi"
                                value={code}
                                onChange={(e) => handleCodeChange(e)}
                                label="Kode Prodi"
                                placeholder="Kode Prodi"
                                sx={{ width: "100%" }}
                            ></TextField>
                            {errors.kode && (
                                <InputError message={errors.kode}></InputError>
                            )}
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            onClick={(e) => onSubmit(e)}
                            disabled={processing}
                        >
                            Simpan
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default AddProdi;
