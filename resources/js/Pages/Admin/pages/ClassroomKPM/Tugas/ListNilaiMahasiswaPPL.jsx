import React from "react";
import { Head } from "@inertiajs/react";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import Card from "@/Components/Card";
import PplScoreTable from "@/Components/AdminNew/Tables/PplScoreTable";

const ListNilaiMahasiswaPPL = ({ base_url, flash }) => {
    return (
        <AdminLayout>
            <Head title="Nilai PPL" />

            <div className="flex flex-col gap-y-4">
                <PageBreadcrumb
                    pageTitle="Nilai PPL"
                    home="/admin/dashboard"
                />
                <Card title="Rekap Nilai PPL">
                    <PplScoreTable base_url={base_url} flash={flash} />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default ListNilaiMahasiswaPPL;
