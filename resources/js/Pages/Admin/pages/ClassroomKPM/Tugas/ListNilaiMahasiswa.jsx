import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import Card from "@/Components/Card";
import KpmScoreTable from "@/Components/AdminNew/Tables/KpmScoreTable";

const ListNilaiMahasiswa = ({ base_url, flash }) => {
    return (
        <AdminLayout>
            <Head title="Nilai KPM" />

            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb
                    pageTitle="Nilai KPM"
                    home="/admin/dashboard"
                />
                <Card title="Rekap Nilai KPM">
                    <KpmScoreTable base_url={base_url} flash={flash} />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ListNilaiMahasiswa;
