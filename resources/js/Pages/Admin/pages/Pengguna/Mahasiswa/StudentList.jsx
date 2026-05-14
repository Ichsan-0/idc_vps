import TempatKPMTable from "@/Components/AdminNew/Tables/TempatKPMTable";
import StudentListTable from "@/Components/AdminNew/Tables/Users/StudentListTable";
import Card from "@/Components/Card";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import React from "react";

const StudentList = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col">
                <PageBreadcrumb pageTitle="Mahasiswa" />
                <Card title="Mahasiswa">
                    <StudentListTable />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default StudentList;
