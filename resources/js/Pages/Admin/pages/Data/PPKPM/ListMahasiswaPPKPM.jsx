import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import MUIDataTable from "mui-datatables";
import { Head, router } from "@inertiajs/react";
import { MdOpenInNew } from "react-icons/md";

import Modal from "@/Components/Modal";
import { useState } from "react";
import { kecamatan } from "daftar-wilayah-indonesia";

const ListMahasiswaPPKPM = ({ mahasiswa }) => {
    const preprocessData = mahasiswa.map((item) => {
        let data = null;
        if (item.nama_tempat_kpm !== null) {
            const kec = kecamatan(item.location?.regency).find(
                (itm) => itm.kode === item.location?.sub_district
            )?.nama;
            data = { ...item, location_name: kec };
        } else {
            data = { ...item, location_name: null };
        }
        if (item.nama_sekolah !== null) {
            const kec = kecamatan(item.lokasi_sekolah?.regency).find(
                (itm) => itm.kode === item.lokasi_sekolah?.sub_district
            )?.nama;
            data = { ...data, kecamatan_sekolah: kec };
        } else {
            data = { ...data, kecamatan_sekolah: null };
        }

        return data;
    });

    const columns = [
        {
            name: "No",
            label: "No",
            options: {
                filter: false,
                sort: false,
                customBodyRender: (value, tableMeta) => {
                    return tableMeta.rowIndex + 1;
                },
            },
        },
        {
            name: "name",
            label: "Nama",
            options: {
                customBodyRender: (value) => <p>{value}</p>,
            },
        },
        {
            name: "nim",
            label: "NIM",
            options: {
                customBodyRender: (value) => <p>{value}</p>,
            },
        },
        { name: "jk", label: "Jenis Kelamin" },
        { name: "no_hp_wa", label: "No Hp" },

        {
            name: "nama_prodi",
            label: "Prodi",
            options: {
                customBodyRender: (value) => <p>{value}</p>,
            },
        },
        {
            name: "cluster_kegiatan",
            label: "Cluster Kegiatan",
        },
        {
            name: "nama_sekolah",
            label: "Nama Sekolah",
        },
        {
            name: "kecamatan_sekolah",
            label: "Kecamatan Sekolah",
        },

        {
            name: "nama_tempat_kpm",
            label: "Tempat KPM",
        },
        {
            name: "location_name",
            label: "Kecamatan KPM",
        },

        // { name: "quota", label: "Kuota" },
        // { name: "accepted_pelamar_count", label: "Terisi" },

        // {
        //     name: "nim",
        //     label: "Action",
        //     options: {
        //         customBodyRender: (value) => (
        //             <div className="flex flex-row justify-center items-center gap-x-2">
        //                 <ul className="flex flex-row justify-center items-center text-lg">
        //                     <li
        //                         className="bg-green-500 text-white p-1 rounded-md cursor-pointer hover:scale-[1.1]"
        //                         onClick={(e) => handleOnViewClick(e, value)}
        //                     >
        //                         <MdOpenInNew />
        //                     </li>
        //                 </ul>
        //             </div>
        //         ),
        //         filter: false,
        //         sort: false,
        //     },
        // },
    ];

    const options = {
        filterType: "multiselect",
        selectableRows: false,
        responsive: "standard",
    };

    const handleOnViewClick = (e, value) => {
        e.preventDefault();
        // router.get(`/admin/pelamarppl/detail/${value}`);
    };

    const handleOnEditClick = (e, value) => {
        e.preventDefault();
        router.get(`/admin/lowonganppl/edit/${value}`);
    };
    const [idToDelete, setIdToDelete] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);

    const handleOnDeleteClick = (e, value) => {
        e.preventDefault();
        setOpenDialog(true);
        setIdToDelete(value);
    };

    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Head title="Mahasiswa PPKPM" />
                <Sidebar tabId={1} />
                <Modal
                    show={openDialog}
                    closeable={true}
                    onClose={(e) => setOpenDialog(false)}
                    onConfirm={(e) => {
                        router.post(
                            `/admin/lowonganppl/delete/${idToDelete}`,
                            { _method: "delete" },
                            { preserveScroll: true }
                        );
                        setOpenDialog(false);
                    }}
                />
            </div>

            <div className="flex w-full ml-72 flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3">
                    <div className="flex w-full py-2 gap-x-2"></div>
                    <MUIDataTable
                        title={"Mahasiswa PPKPM"}
                        data={preprocessData}
                        columns={columns}
                        options={options}
                    />
                </div>
            </div>
        </section>
    );
};

export default ListMahasiswaPPKPM;
