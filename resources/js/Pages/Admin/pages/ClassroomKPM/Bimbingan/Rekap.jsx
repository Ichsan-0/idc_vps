import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import Card from "@/Components/Card";
import BimbinganRekapTable from "@/Components/AdminNew/Tables/BimbinganRekapTable";

const Rekap = ({ base_url, flash, gelombang_list = [] }) => {
    return (
        <AdminLayout>
            <Head title="Rekap Bimbingan" />

            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb
                    pageTitle="Rekap Bimbingan"
                    home="/admin/dashboard"
                />
                <Card title="Rekap Isi Bimbingan Mahasiswa">
                    <BimbinganRekapTable
                        base_url={base_url}
                        flash={flash}
                        gelombangList={gelombang_list}
                    />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default Rekap;
