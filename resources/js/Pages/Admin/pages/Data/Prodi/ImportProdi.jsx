import React from "react";

import Sidebar from "@/Components/admin/Sidebar/Sidebar";
import Header from "@/Components/admin/Header/Header";
import MUIDataTable from "mui-datatables";
import { Breadcrumbs, Button, IconButton } from "@mui/material";
import { MdDelete } from "react-icons/md";
import { GrFormView } from "react-icons/gr";
import { Head, Link, router, useForm } from "@inertiajs/react";

const ImportProdi = () => {
    const { data, setData, post, progress, errors } = useForm({
        dataprodi: null,
    });

    function submit(e) {
        e.preventDefault();
        router.post("/admin/importdataprodi", {
            _method: "post",
            dataprodi: data.dataprodi,
        });
    }
    return (
        <section className="main flex">
            <div className="sidebarWrapper flex">
                <Sidebar tabId={1} />
            </div>
            <div className="flex w-full ml-72 flex-col">
                <Header></Header>
                <div className="space"></div>
                <div className="px-3">
                    <Breadcrumbs>
                        <Link href="/admin/daftarprodi">List Prodi</Link>
                        <Link>Import Prodi</Link>
                    </Breadcrumbs>
                    <div className="flex w-full  py-2">
                        <form
                            className="flex flex-col gap-y-3"
                            onSubmit={submit}
                        >
                            <input
                                className="flex w-full"
                                labelId="khs"
                                type="file"
                                onChange={(e) =>
                                    setData("dataprodi", e.target.files[0])
                                }
                            />
                            {progress && (
                                <progress value={progress.percentage} max="100">
                                    {progress.percentage}%
                                </progress>
                            )}
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

export default ImportProdi;
