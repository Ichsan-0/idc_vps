import React from "react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import Card from "@/Components/Card";
import SupervisorKPMTable from "@/Components/AdminNew/Tables/Users/SupervisorKPMTable";
import { Head } from "@inertiajs/react";

const List = ({ base_url }) => {
    return (
        <AdminLayout>
            <Head title="Supervisor KPM" />
            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb pageTitle="Supervisor KPM" />
                <Card title="Daftar Pengguna Supervisor KPM">
                    <SupervisorKPMTable base_url={base_url} />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default List;
