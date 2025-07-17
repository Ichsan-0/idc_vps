import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import { Breadcrumbs, Button, TextField } from "@mui/material";

import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import { NavigateNext } from "@mui/icons-material";

const EditProdi = ({ prodi }) => {
    const [name, setName] = useState(prodi?.name || null);
    const [code, setCode] = useState(prodi?.kode || null);
    const { data, setData, post, processing, errors } = useForm({
        name: name,
        kode: code,
    });
    function submit(e) {
        e.preventDefault();
        router.post(`/admin/prodi/${prodi.id}`, {
            _method: "patch",
            ...data,
        });
    }
    const handleNamaChange = (e) => {
        setName(e.target.value);
        setData("name", e.target.value);
    };

    const handleCodeChange = (e) => {
        setCode(e.target.value);
        setData("kode", e.target.value);
    };
    return (
        <section className="main flex">
            <Head title="Edit Prodi" />
            <div className="sidebarWrapper flex">
                <Sidebar tabId={1} />
            </div>
            <div className="flex w-full ml-72 flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3 ">
                    <Breadcrumbs separator={<NavigateNext fontSize="small" />}>
                        <Link href="/admin/daftarprodi">Prodi</Link>
                        <Link>Edit</Link>
                    </Breadcrumbs>
                    <div className="flex w-full  py-2">
                        <form
                            className="flex flex-col gap-y-3 w-full"
                            onSubmit={submit}
                        >
                            <div className="flex w-full">
                                <TextField
                                    fullWidth
                                    value={name}
                                    onChange={(e) => handleNamaChange(e)}
                                ></TextField>
                            </div>
                            <div className="flex w-full">
                                <TextField
                                    fullWidth
                                    value={code}
                                    onChange={(e) => handleCodeChange(e)}
                                ></TextField>
                            </div>
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

export default EditProdi;
