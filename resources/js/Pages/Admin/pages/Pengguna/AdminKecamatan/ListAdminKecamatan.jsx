import React from "react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import Card from "@/Components/Card";
import OperatorAccountTable from "@/Components/AdminNew/Tables/Users/OperatorAccountTable";
import { Head } from "@inertiajs/react";

const ListAdminKecamatan = ({ base_url, kecamatan_list = [] }) => {
    return (
        <AdminLayout>
            <Head title="Admin Kecamatan" />
            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb pageTitle="Admin Kecamatan" />
                <Card title="Daftar Pengguna Admin Kecamatan">
                    <OperatorAccountTable
                        base_url={base_url}
                        type="kecamatan"
                        options={kecamatan_list}
                    />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ListAdminKecamatan;
