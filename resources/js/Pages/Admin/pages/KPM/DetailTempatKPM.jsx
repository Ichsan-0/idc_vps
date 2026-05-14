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
import { Head, Link, router } from "@inertiajs/react";
import { NavigateNext } from "@mui/icons-material";
import MUIDataTable from "mui-datatables";
import { MdDelete } from "react-icons/md";
import { MdOpenInNew } from "react-icons/md";
import { TiEdit } from "react-icons/ti";

export const DetailTempatKPM = ({ tempat_kpm, pelamar }) => {
    const dataKabupaten = kabupaten("11");
    const [subDistrictData, setSubDistrictData] = useState([]);
    const [villageData, setVillageData] = useState([]);

    const [regency, setRegency] = useState(null);
    const [subDistrict, setSubDistrict] = useState(null);
    const [village, setVillage] = useState(null);

    const handleKabupatenChange = (e, value) => {
        setRegency(value.kode);
        setSubDistrictData(kecamatan(value.kode));
    };

    const handleKecamatanChange = (e, value) => {
        setSubDistrict(value.kode);
        setVillageData(desa(value.kode));
    };

    const handleVillageChange = (e, value) => {
        setVillage(value.kode);
    };
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

        {
            name: "pelamar",
            label: "Nama",
            options: {
                customBodyRender: (value) => <p>{value.name}</p>,
            },
        },
        {
            name: "pelamar",
            label: "NIM",
            options: {
                customBodyRender: (value) => <p>{value.username}</p>,
            },
        },
        {
            name: "data_user",
            label: "Prodi",
            options: {
                customBodyRender: (value) => <p>{value.prodi.name}</p>,
            },
        },
        {
            name: "data_user",
            label: "Jenis Kelamin",
            options: {
                customBodyRender: (value) => <p>{value.jk}</p>,
            },
        },

        { name: "status", label: "Status" },
        {
            name: "id",
            label: "Action",
            options: {
                customBodyRender: (value) => (
                    <ul className="flex flex-row justify-center items-center text-lg">
                        <li
                            className="bg-green-500 text-white p-1 rounded-md cursor-pointer hover:scale-[1.1]"
                            onClick={(e) => handleOnViewClick(e, value)}
                        >
                            <MdOpenInNew />
                        </li>
                        {/* <li className="p-1 bg-yellow-500 text-white cursor-pointer hover:scale-[1.1]">
                            <TiEdit
                                onClick={(e) => handleOnEditClick(e, value)}
                            />
                        </li> */}
                        {/* <li className="text-white bg-red-500 p-1  rounded-r-md cursor-pointer hover:scale-[1.1]">
                            <MdDelete
                                onClick={(e) => handleOnDeleteClick(e, value)}
                            />
                        </li> */}
                    </ul>
                ),
                filter: false,
                sort: false,
            },
        },
    ];

    const handleOnViewClick = (e, value) => {
        router.get(`/admin/pelamarkpm/detail/${value}`);
    };

    const options = {
        filterType: "multiselect",
        selectableRows: false,
    };

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={2} />
                <Head title="Detail Tempat KPM" />
            </div>
            <div className="flex ml-72 w-full flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="flex flex-col w-full px-3 gap-y-3">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                        <Link href="/admin/tempatkpm">Tempat KPM</Link>
                        <Link>Detail</Link>
                    </Breadcrumbs>
                    <div className="grid grid-cols-1 md:grid-cols-2 w-full gap-3 p-4 bg-white rounded-md shadow-md">
                        <div className="w-full">
                            <table className="table-auto">
                                <tbody>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Nama Tempat KPM
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {tempat_kpm.name}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Kuota
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {tempat_kpm.qouta}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Terisi
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {tempat_kpm.accepted_pelamar_count}
                                        </td>
                                    </tr>

                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Kabupaten
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {
                                                dataKabupaten.find(
                                                    (item) =>
                                                        item.kode ===
                                                        tempat_kpm.regency
                                                )?.nama
                                            }
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Kecamatan
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {kecamatan(tempat_kpm.regency).find(
                                                (item) =>
                                                    item.kode ===
                                                    tempat_kpm.sub_district
                                            )?.nama || null}
                                        </td>
                                    </tr>
                                    <tr className="gap-3">
                                        <td className="text-gray-600 text-end align-top pr-2">
                                            Desa
                                        </td>
                                        <td className="text-gray-950 font-semibold align-top">
                                            {desa(tempat_kpm.sub_district).find(
                                                (item) =>
                                                    item.kode ===
                                                    tempat_kpm.village
                                            )?.nama || null}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="w-full">
                            <table className="table-auto">
                                <tbody>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            Deskripsi
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {tempat_kpm.description}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="text-gray-600 align-top text-end pr-2">
                                            Supervisor
                                        </td>
                                        <td className="text-gray-950 font-semibold text-wrap">
                                            {tempat_kpm.username_supervisor}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <MUIDataTable
                        title={"Pelamar"}
                        data={pelamar}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};
export default DetailTempatKPM;
