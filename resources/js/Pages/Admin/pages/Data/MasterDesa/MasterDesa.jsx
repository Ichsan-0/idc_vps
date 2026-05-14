import Card from "@/Components/Card";
import GelombangTable from "@/Components/SuperAdmin/Tables/GelombangTable";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import MasterDesaTable from "@/Components/AdminNew/Tables/MasterDesaTable";

const MasterDesa = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col">
                <PageBreadcrumb pageTitle="Master Desa" />
                <Card title="Data Desa">
                    <MasterDesaTable />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default MasterDesa;
