import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import Card from "@/Components/Card";
import TaskKpmTable from "@/Components/AdminNew/Tables/TaskKpmTable";

const List = ({ base_url, flash }) => {
    return (
        <AdminLayout>
            <Head title="Tugas KPM" />

            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb
                    pageTitle="Tugas KPM"
                    home="/admin/dashboard"
                />
                <Card title="Daftar Tugas KPM">
                    <TaskKpmTable base_url={base_url} flash={flash} />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default List;
