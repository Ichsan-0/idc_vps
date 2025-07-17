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

export const AddLowonganPPL = ({ daftar_prodi, daftar_sekolah }) => {
    const { data, setData, post, processing, errors } = useForm({
        name: null,
        description: null,
        quota: null,
        id_sekolah: null,
        id_prodi: null,
    });
    const [name, setName] = useState(null);
    const [description, setDescription] = useState(null);
    const [qouta, setQouta] = useState(null);

    const [daftarProdi, setDaftarProdi] = useState(daftar_prodi);
    const [daftarSekolah, setDaftarSekolah] = useState(daftar_sekolah);
    const [prodi, setProdi] = useState(null);
    const [sekolah, setSekolah] = useState(null);

    const handleNameChange = (e) => {
        setData("name", e.target.value);
        setName(e.target.value);
    };
    const handleDescriptionChange = (e) => {
        setData("description", e.target.value);
        setDescription(e.target.value);
    };
    const handleQuotaChange = (e) => {
        setQouta(e.target.value);
        setData("quota", e.target.value);
    };
    const handleSekolahChange = (e, value) => {
        setSekolah(value);
        setData("id_sekolah", value.id);
    };
    const handleProdiChange = (e, value) => {
        setProdi(value);
        setData("id_prodi", value.id);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        post("/admin/lowonganppl/save");
    };

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Head title="Tambah Lowongan PPL" />
                <Sidebar tabId={3} />
            </div>
            <div className="flex ml-72 w-full flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="flex flex-col w-full px-3 gap-y-3">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                        <Link href="/admin/daftarlowonganppl">
                            Lowongan PPL
                        </Link>
                        <Link>Add</Link>
                    </Breadcrumbs>
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 ">
                        <div className="flex flex-col w-full">
                            <TextField
                                id="nama"
                                label="Nama Lowongan"
                                placeholder="Nama Tempat KPM"
                                onChange={(e) => handleNameChange(e)}
                                multiline
                                sx={{ width: "100%" }}
                            ></TextField>
                            {errors.name && (
                                <InputError message={errors.name} />
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <TextField
                                id="deskripsi"
                                label="Deskripsi"
                                placeholder="Deskripsi"
                                onChange={(e) => handleDescriptionChange(e)}
                                multiline
                                sx={{ width: "100%" }}
                            ></TextField>
                            {errors.description && (
                                <InputError message={errors.description} />
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <TextField
                                id="kuota"
                                type="text"
                                value={qouta}
                                inputMode="decimal"
                                label="Quota"
                                placeholder="quota"
                                sx={{ width: "100%" }}
                                onChange={(e) => handleQuotaChange(e)}
                            ></TextField>
                            {errors.quota && (
                                <InputError message={errors.quota}></InputError>
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <Autocomplete
                                id="prodi"
                                sx={{ width: "100%" }}
                                options={daftarProdi}
                                getOptionLabel={(option) => option.name}
                                onChange={(e, value) =>
                                    handleProdiChange(e, value)
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Prodi" />
                                )}
                            ></Autocomplete>
                            {errors.id_prodi && (
                                <InputError message={errors.id_prodi} />
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <Autocomplete
                                id="sekolah"
                                sx={{ width: "100%" }}
                                options={daftarSekolah}
                                getOptionLabel={(option) => option.name}
                                onChange={(e, value) =>
                                    handleSekolahChange(e, value)
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Sekolah" />
                                )}
                            ></Autocomplete>
                            {errors.id_sekolah && (
                                <InputError message={errors.id_sekolah} />
                            )}
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            disableElevation
                            disabled={processing}
                            sx={{ textTransform: "capitalize" }}
                            onClick={(e) => onSubmit(e)}
                        >
                            Simpan
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default AddLowonganPPL;
