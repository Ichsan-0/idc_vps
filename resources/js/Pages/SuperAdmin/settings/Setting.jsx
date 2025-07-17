import Card from "@/Components/Card";
import SuperAdminLayout from "../../../Layouts/SuperAdmin/SuperAdminLayout";
import GelombangTable from "@/Components/SuperAdmin/Tables/GelombangTable";
import PageBreadcrumb from "@/Components/PageBreadcrumb";

const Setting = () => {
    return (
        <SuperAdminLayout>
            <div className="flex flex-col">
              <PageBreadcrumb pageTitle="Setting"/>
                <Card title="Gelombang">
                    <GelombangTable />
                </Card>
            </div>
        </SuperAdminLayout>
    );
};

export default Setting;
