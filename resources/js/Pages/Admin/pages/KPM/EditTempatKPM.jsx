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

export const EditTempatKPM = ({ tempat_kpm, supervisor }) => {
    const [name, setName] = useState(tempat_kpm?.name || null);
    const [description, setDescription] = useState(
        tempat_kpm?.description || null
    );
    const [qouta, setQouta] = useState(tempat_kpm?.qouta || null);

    const dataKabupaten = kabupaten("11");
    const [subDistrictData, setSubDistrictData] = useState(() => {
        if (tempat_kpm.regency !== null) {
            return kecamatan(tempat_kpm.regency);
        }
        return null;
    });

    const [regency, setRegency] = useState(() => {
        let obj;
        if (tempat_kpm.regency !== null) {
            obj = dataKabupaten.find((itm) => {
                return itm.kode === tempat_kpm.regency;
            });
            return obj;
        }
        return null;
    });
    const [subDistrict, setSubDistrict] = useState(() => {
        let obj;
        if (tempat_kpm.sub_district !== null && tempat_kpm.regency !== null) {
            obj = kecamatan(tempat_kpm.regency).find(
                (itm) => itm.kode === tempat_kpm.sub_district
            );
            return obj;
        }
        return [];
    });
    const [villageData, setVillageData] = useState(() => {
        if (tempat_kpm.sub_district !== null) {
            return desa(tempat_kpm.sub_district);
        }
        return [];
    });
    const [village, setVillage] = useState(() => {
        if (tempat_kpm.sub_district !== null && tempat_kpm.village !== null) {
            return desa(tempat_kpm.sub_district).find(
                (itm) => itm.kode === tempat_kpm.village
            );
        }
        return null;
    });

    const [usernameSupervisor, setUsernameSupervisor] = useState(
        tempat_kpm.username_supervisor
            ? supervisor.find(
                  (itm) => itm.username === tempat_kpm.username_supervisor
              )
            : null
    );

    const { data, setData, post, processing, errors } = useForm({
        name: name,
        regency: regency?.kode,
        description: description,
        sub_district: subDistrict?.kode,
        qouta: qouta,
        village: village?.kode,
        username_supervisor: usernameSupervisor?.username,
    });

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
        setData("qouta", e.target.value);
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

    const onSubmit = (e) => {
        e.preventDefault();
        post(`/admin/tempatkpm/update/${tempat_kpm.id}`);
    };

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={2} />
            </div>
            <div className="flex ml-72 w-full flex-col">
                <Header></Header>
                <Head title={tempat_kpm.name} />
                <div className="space"></div>
                <div className="flex flex-col w-full px-3 gap-y-3">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                        <Link href="/admin/tempatkpm">Tempat KPM</Link>
                        <Link>Add</Link>
                    </Breadcrumbs>
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 ">
                        <div className="flex flex-col w-full">
                            <TextField
                                id="nama"
                                value={name}
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
                                value={description}
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
                            {errors.qouta && (
                                <InputError message={errors.qouta}></InputError>
                            )}
                        </div>
                        <div className="flex flex-col w-full">
                            <Autocomplete
                                id="kabupaten"
                                sx={{ width: "100%" }}
                                options={dataKabupaten}
                                value={regency}
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
                                value={subDistrict}
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
                        <div className="flex flex-col w-full">
                            <Autocomplete
                                id="supervisor"
                                sx={{ width: "100%" }}
                                value={usernameSupervisor}
                                options={supervisor}
                                getOptionLabel={(option) => option.name}
                                onChange={(e, value) => {
                                    setUsernameSupervisor(value);
                                    setData(
                                        "username_supervisor",
                                        value.username
                                    );
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Supervisor" />
                                )}
                            ></Autocomplete>
                            {errors.username_supervisor && (
                                <InputError
                                    message={errors.username_supervisor}
                                />
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
export default EditTempatKPM;
