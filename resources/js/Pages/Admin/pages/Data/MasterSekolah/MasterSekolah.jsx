import Card from "@/Components/Card";
import GelombangTable from "@/Components/SuperAdmin/Tables/GelombangTable";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import AdminLayout from "@/Layouts/Admin/AdminLayout";
import MasterSekolahTable from "@/Components/AdminNew/Tables/MasterSekolahTable";

const MasterSekolah = () => {
    return (
        <AdminLayout>
            <div className="flex flex-col">
              <PageBreadcrumb pageTitle="Master Sekolah"/>
                <Card title="Data Sekolah">
                    <MasterSekolahTable />
                </Card>
            </div>
        </AdminLayout>
    );
};

export default MasterSekolah;
