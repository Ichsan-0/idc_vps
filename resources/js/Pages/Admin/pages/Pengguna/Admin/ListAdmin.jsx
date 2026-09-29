import React from "react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import Card from "@/Components/Card";
import AdminTable from "@/Components/AdminNew/Tables/Users/AdminTable";
import { Head } from "@inertiajs/react";

const ListAdmin = ({ base_url }) => {
    return (
        <AdminLayout>
            <Head title="Daftar Admin" />
            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb pageTitle="Daftar Admin" />
                <Card title="Daftar Pengguna Admin">
                    <AdminTable base_url={base_url} />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ListAdmin;
