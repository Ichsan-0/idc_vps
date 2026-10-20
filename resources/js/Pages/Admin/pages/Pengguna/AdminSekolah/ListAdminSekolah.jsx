import React from "react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import Card from "@/Components/Card";
import OperatorAccountTable from "@/Components/AdminNew/Tables/Users/OperatorAccountTable";
import { Head } from "@inertiajs/react";

const ListAdminSekolah = ({ base_url, sekolah_list = [] }) => {
    return (
        <AdminLayout>
            <Head title="Admin Sekolah" />
            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb pageTitle="Admin Sekolah" />
                <Card title="Daftar Pengguna Admin Sekolah">
                    <OperatorAccountTable
                        base_url={base_url}
                        type="sekolah"
                        options={sekolah_list}
                    />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ListAdminSekolah;
