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

export const AddTempatPPL = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: null,
        description: null,
        regency: null,
        sub_district: null,
        village: null,
    });

    const [name, setName] = useState(null);
    const [description, setDescription] = useState(null);
    const [qouta, setQouta] = useState(null);

    const dataKabupaten = kabupaten("11");
    const [subDistrictData, setSubDistrictData] = useState([]);
    const [villageData, setVillageData] = useState([]);

    const [regency, setRegency] = useState(null);
    const [subDistrict, setSubDistrict] = useState(null);
    const [village, setVillage] = useState(null);

    const handleNameChange = (e) => {
        setData("name", e.target.value);
        setName(e.target.value);
    };
    const handleDescriptionChange = (e) => {
        setData("description", e.target.value);
        setDescription(e.target.value);
    };

    const handleKabupatenChange = (e, value) => {
        setRegency(value.kode);
        setSubDistrictData(kecamatan(value.kode));
        setData("regency", value.kode);
    };

    const handleKecamatanChange = (e, value) => {
        setSubDistrict(value.kode);
        setVillageData(desa(value.kode));
        setData("sub_district", value.kode);
    };

    const handleVillageChange = (e, value) => {
        setData("village", value.kode);
        setVillage(value.kode);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        post("/admin/tempatppl/save");
    };

    return (
        <section className="main flex">
            <Head title="Add Tempat PPL" />
            <div className="sidebarWrapper flex">
                <Sidebar tabId={3} />
            </div>
            <div className="flex ml-72 w-full flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="flex flex-col w-full px-3 gap-y-3">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                        <Link href="/admin/daftartempatppl">Tempat PPL</Link>
                        <Link>Add</Link>
                    </Breadcrumbs>
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 ">
                        <div className="flex flex-col w-full">
                            <TextField
                                id="nama"
                                label="Nama Tempat"
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
                        {/* <div className="flex flex-col w-full">
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
                            {errors.qouta && (
                                <InputError message={errors.qouta}></InputError>
                            )}
                        </div> */}
                        <div className="flex flex-col w-full">
                            <Autocomplete
                                id="kabupaten"
                                sx={{ width: "100%" }}
                                options={dataKabupaten}
                                getOptionLabel={(option) => option.nama}
                                onChange={(e, value) =>
                                    handleKabupatenChange(e, value)
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Kabupaten" />
                                )}
                            ></Autocomplete>
                            {errors.regency && (
                                <InputError message={errors.regency} />
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <Autocomplete
                                id="kecamatan"
                                sx={{ width: "100%" }}
                                options={subDistrictData}
                                getOptionLabel={(option) => option.nama}
                                onChange={(e, value) =>
                                    handleKecamatanChange(e, value)
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Kecamatan" />
                                )}
                            ></Autocomplete>
                            {errors.sub_district && (
                                <InputError message={errors.sub_district} />
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <Autocomplete
                                id="desa"
                                sx={{ width: "100%" }}
                                options={villageData}
                                getOptionLabel={(option) => option.nama}
                                onChange={(e, value) =>
                                    handleVillageChange(e, value)
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Desa" />
                                )}
                            ></Autocomplete>
                            {errors.village && (
                                <InputError message={errors.village} />
                            )}
                        </div>
                    </div>
                    <div>
                        <Button
                            variant="contained"
                            disabled={processing}
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
export default AddTempatPPL;
