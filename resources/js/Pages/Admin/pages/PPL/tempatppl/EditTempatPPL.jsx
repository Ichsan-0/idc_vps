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
import { Head, Link, router, useForm } from "@inertiajs/react";
import { NavigateNext } from "@mui/icons-material";
import InputError from "@/Components/InputError";

export const EditTempatPPL = ({ tempatppl, supervisordata }) => {
    const [name, setName] = useState(tempatppl?.name || null);
    const [description, setDescription] = useState(
        tempatppl?.description || null
    );
    const [qouta, setQouta] = useState(null);

    const [dataSupervisor, setDataSupervisor] = useState(supervisordata);
    const [supervisor, setSupervisor] = useState(
        tempatppl.username_supervisor !== null
            ? supervisordata.find(
                  (itm) => itm.username === tempatppl.username_supervisor
              )
            : null
    );

    const dataKabupaten = kabupaten("11");
    const [subDistrictData, setSubDistrictData] = useState(
        tempatppl.regency !== null ? kecamatan(tempatppl.regency) : []
    );
    const [villageData, setVillageData] = useState(
        tempatppl.sub_district !== null ? desa(tempatppl.sub_district) : []
    );

    const [regency, setRegency] = useState(() => {
        let obj;
        if (tempatppl.regency !== null) {
            obj = kabupaten("11").find((itm) => itm.kode === tempatppl.regency);
            return obj;
        } else {
            return null;
        }
    });
    const [subDistrict, setSubDistrict] = useState(() => {
        let obj;
        if (tempatppl.regency !== null && tempatppl.sub_district !== null) {
            obj = kecamatan(tempatppl.regency).find(
                (itm) => itm.kode === tempatppl.sub_district
            );
            return obj;
        } else {
            return null;
        }
    });
    const [village, setVillage] = useState(() => {
        let obj;
        if (tempatppl.sub_district !== null && tempatppl.village !== null) {
            obj = desa(tempatppl.sub_district).find(
                (itm) => itm.kode === tempatppl.village
            );
            return obj;
        } else {
            return null;
        }
    });
    const { data, setData, post, processing, errors } = useForm({
        name: name,
        regency: regency?.kode,
        sub_district: subDistrict?.kode,
        village: village?.kode,
        username_supervisor: supervisor?.username,
    });

    const handleNameChange = (e) => {
        setData("name", e.target.value);
        setName(e.target.value);
    };
    const handleDescriptionChange = (e) => {
        setData("description", e.target.value);
        setDescription(e.target.value);
    };

    const handleKabupatenChange = (e, value) => {
        setRegency(value);
        setSubDistrictData(kecamatan(value.kode));
        setData("regency", value.kode);
    };

    const handleKecamatanChange = (e, value) => {
        setSubDistrict(value);
        setVillageData(desa(value.kode));
        setData("sub_district", value.kode);
    };

    const handleVillageChange = (e, value) => {
        setData("village", value.kode);
        setVillage(value);
    };

    const handleSupervisorChange = (e, value) => {
        setSupervisor(value);
        console.log(value.username);
        setData("username_supervisor", value.username);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        router.post(`/admin/tempatppl/update/${tempatppl.id}`, {
            _method: "patch",
            ...data,
        });
    };

    return (
        <section className="main flex">
            <Head title="Edit Tempat PPL" />
            <div className="sidebarWrapper flex">
                <Sidebar tabId={3} />
            </div>
            <div className="flex ml-72 w-full flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="flex flex-col w-full px-3 gap-y-3">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                        <Link href="/admin/daftartempatppl">Tempat PPL</Link>
                        <Link>Edit</Link>
                    </Breadcrumbs>
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 ">
                        <div className="flex flex-col w-full">
                            <TextField
                                id="nama"
                                label="Nama Tempat"
                                value={name}
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
                            <Autocomplete
                                id="supervisor"
                                sx={{ width: "100%" }}
                                value={supervisor}
                                options={dataSupervisor}
                                getOptionLabel={(option) => option.name}
                                onChange={(e, value) =>
                                    handleSupervisorChange(e, value)
                                }
                                renderInput={(params) => (
                                    <TextField {...params} label="Supervisor" />
                                )}
                            ></Autocomplete>
                            {errors.regency && (
                                <InputError message={errors.regency} />
                            )}
                        </div>

                        <div className="flex flex-col w-full">
                            <Autocomplete
                                id="kabupaten"
                                sx={{ width: "100%" }}
                                value={regency}
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
                                value={subDistrict}
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
                                value={village}
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
export default EditTempatPPL;
