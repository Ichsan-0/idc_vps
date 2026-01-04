import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import MUIDataTable from "mui-datatables";
import { Breadcrumbs, Button, IconButton, TextField } from "@mui/material";
import { MdDelete } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { useState } from "react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";

const AddAdmin = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [passowrd, setPassword] = useState("");

    function submit(e) {
        e.preventDefault();
        router.post("/admin/save", {
            _method: "post",
            name: name,
            email: email,
            username: username,
            password: passowrd,
        });
    }

    return (
        <AdminLayout>
            <section className="main flex">

                <div className="flex w-full flex-col">
                    <Head title="Add Admin" />
                    <div className="space"></div>
                    <div className="px-3">
                        <Breadcrumbs>
                            <Link href="/admin/users/admin/list">Daftar Admin</Link>
                            <Link>Tambah Admin</Link>
                        </Breadcrumbs>
                        <div className="flex w-full py-2">
                            <form
                                autoComplete={false}
                                className="flex flex-col gap-y-3"
                                onSubmit={submit}
                            >
                                <TextField
                                    required
                                    type="text"
                                    sx={{ width: "300px" }}
                                    value={name}
                                    onChange={(e) => {
                                        setName(e.target.value);
                                    }}
                                    label="Name"
                                />
                                <TextField
                                    required
                                    type="email"
                                    sx={{ width: "300px" }}
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                    }}
                                    label="Email"
                                />
                                <TextField
                                    required
                                    type="email"
                                    sx={{ width: "300px" }}
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                    }}
                                    label="Username"
                                />
                                <TextField
                                    required
                                    type="password"
                                    sx={{ width: "300px" }}
                                    value={passowrd}
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                    label="Password"
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
        </AdminLayout>
    );
};

export default AddAdmin;
