import Card from "@/Components/Card";
import SuperAdminLayout from "../../../Layouts/SuperAdmin/SuperAdminLayout";
import GelombangTable from "@/Components/SuperAdmin/Tables/GelombangTable";
import PageBreadcrumb from "@/Components/PageBreadcrumb";
import ImportMahasiswa from "./ImportMahasiswa";

const Setting = ({ DATA }) => {
    return (
        <SuperAdminLayout>
            <div className="flex flex-col">
                <PageBreadcrumb pageTitle="Import Data" />
                <div className="flex flex-col gap-3">
                    <Card title="Import Mahasiswa"><ImportMahasiswa/></Card>
                    <Card title="Import Supervisor"></Card>
                </div>
            </div>
        </SuperAdminLayout>
    );
};

export default Setting;
