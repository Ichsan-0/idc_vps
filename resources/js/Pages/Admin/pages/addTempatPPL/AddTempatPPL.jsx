import React, { useState, useEffect } from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import {
    Autocomplete,
    Box,
    Breadcrumbs,
    Button,
    InputLabel,
    MenuItem,
    TextField,
    Typography,
} from "@mui/material";
import { Link, useForm } from "@inertiajs/react";
import { provinsi, kabupaten, kecamatan, desa } from "daftar-wilayah-indonesia";

const AddTempatPPL = ({ daftar_supervisor }) => {
    const [nama, setNama] = useState();
    const { data, setData, post, processing, erros } = useForm({
        nama: "",
        provinsi: "",
        kabupaten: "",
        kecamatan: "",
        desa: "",
        id_supervisor: null,
    });

    const onSubmit = (e) => {
        e.preventDefault();
        post(route("admin.addtempatppl"));
    };

    const [daftarProvinsi, setDaftarProvinsi] = useState([]);
    const [daftarKabupaten, setDaftarKabupaten] = useState([]);
    const [daftarKecamatan, setDaftarKecamatan] = useState([]);
    const [daftarDesa, setDaftarDesa] = useState([]);

    const [prov, setProv] = useState(null);
    const [kab, setKab] = useState(null);
    const [kec, setKec] = useState(null);
    const [kelurahan, setKelurahan] = useState(null);

    const [supervisor, setSupervisor] = useState(null);

    useEffect(() => {
        setDaftarProvinsi(provinsi());
    }, []);

    const handleProvChange = (event, value) => {
        setProv(value);
        setDaftarKabupaten(kabupaten(value?.kode || ""));
        setKab(null);
        setKec(null);
        setKelurahan(null);
        setData("provinsi", value.nama);
    };

    const handleKabChange = (event, value) => {
        setKab(value);
        setDaftarKecamatan(kecamatan(value?.kode || ""));
        setKec(null);
        setKelurahan(null);
        setData("kabupaten", value.nama);
    };

    const handleKecChange = (event, value) => {
        setKec(value);
        setDaftarDesa(desa(value?.kode || ""));
        setKelurahan(null);
        setData("kecamatan", value.nama);
    };
    const handleSupervisorChange = (event, value) => {
        setSupervisor(event.target.value);
    };

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={2} />
            </div>
            <div className="flex w-full ml-72">
                <Header />
                <div className="space"></div>
                <div className="flex flex-col w-full px-3 mt-20">
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link href="/admin/tempatppl">Tempat PPL</Link>
                        <Typography>Tambah Tempat PPL</Typography>
                    </Breadcrumbs>
                    <div className="felx w-full mt-3 ">
                        <form
                            className="flex flex-col w-full gap-y-4"
                            onSubmit={onSubmit}
                        >
                            <TextField
                                id="nama"
                                label="Nama"
                                value={nama}
                                required
                                onChange={(event, value) => {
                                    setNama(event.target.value);
                                    setData("nama", event.target.value);
                                }}
                            />
                            <Typography>Alamat</Typography>
                            <Autocomplete
                                id="provinsi"
                                value={prov}
                                required
                                options={daftarProvinsi}
                                getOptionLabel={(option) => option.nama}
                                onChange={handleProvChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Provinsi" />
                                )}
                            />
                            <Autocomplete
                                id="kabupaten"
                                value={kab}
                                required
                                options={daftarKabupaten}
                                getOptionLabel={(option) => option.nama}
                                onChange={handleKabChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Kabupaten" />
                                )}
                            />
                            <Autocomplete
                                id="kecamatan"
                                required
                                value={kec}
                                options={daftarKecamatan}
                                getOptionLabel={(option) => option.nama}
                                onChange={handleKecChange}
                                renderInput={(params) => (
                                    <TextField {...params} label="Kecamatan" />
                                )}
                            />
                            <Autocomplete
                                id="desa"
                                required
                                value={kelurahan}
                                options={daftarDesa}
                                getOptionLabel={(option) => option.nama}
                                onChange={(event, value) => {
                                    setKelurahan(value);
                                    setData("desa", value.nama);
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Desa" />
                                )}
                            />
                            <Typography>Supervisor</Typography>
                            <Autocomplete
                                id="id_supervisor"
                                value={supervisor}
                                options={daftar_supervisor}
                                getOptionLabel={(option) => option.nama}
                                onChange={(event, value) => {
                                    setSupervisor(value);
                                    // console.log(value.supervisor_id);
                                    setData(
                                        "id_supervisor",
                                        value.supervisor_id
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Supervisor" />
                                )}
                            />
                            <Box>
                                <Button variant="contained" onClick={onSubmit}>
                                    Simpan
                                </Button>
                            </Box>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AddTempatPPL;
