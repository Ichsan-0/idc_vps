import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import Card from "@/Components/Card";
import PamongKepsekTable from "@/Components/AdminNew/Tables/PamongKepsekTable";

const List = ({ base_url, flash }) => {
    return (
        <AdminLayout>
            <Head title="Pamong & Kepala Sekolah" />

            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb
                    pageTitle="Pamong & Kepala Sekolah"
                    home="/admin/dashboard"
                />
                <Card title="Daftar Pamong & Kepala Sekolah">
                    <PamongKepsekTable base_url={base_url} flash={flash} />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default List;
