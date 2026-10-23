import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import Card from "@/Components/Card";
import CamatKeuchikTable from "@/Components/AdminNew/Tables/CamatKeuchikTable";

const List = ({ base_url, flash }) => {
    return (
        <AdminLayout>
            <Head title="Camat & Keuchik" />

            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb
                    pageTitle="Camat & Keuchik"
                    home="/admin/dashboard"
                />
                <Card title="Daftar Camat & Keuchik">
                    <CamatKeuchikTable base_url={base_url} flash={flash} />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default List;
