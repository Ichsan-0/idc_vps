import TempatPPLTable from "@/Components/AdminNew/Tables/PPL/TempatPPLTable";
import TempatKPMTable from "@/Components/AdminNew/Tables/TempatKPMTable";
import Card from "@/Components/Card";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import React from "react";

const ListTempatPPL = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col">
                <PageBreadcrumb pageTitle="Tempat PPL" />
                <Card title="Tempat PPL">
                    <TempatPPLTable />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ListTempatPPL;
