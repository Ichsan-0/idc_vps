import TempatKPMTable from "@/Components/AdminNew/Tables/TempatKPMTable";
import Card from "@/Components/Card";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import React from "react";

const ListTempatKPM = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col">
                <PageBreadcrumb pageTitle="Tempat KPM" />
                <Card title="Tempat KPM">
                    <TempatKPMTable />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ListTempatKPM;
