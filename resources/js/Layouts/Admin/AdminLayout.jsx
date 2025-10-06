import Header from "@/Components/AdminNew/Header/Header";
import Sidebar from "@/Components/AdminNew/Sidebar/Sidebar";
import { Head } from "@inertiajs/react";
import React, { useState } from "react";

const AdminLayout = ({ children, title="IDC" }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="dark:bg-boxdark-2 dark:text-bodydark font-satoshi">
            <Head title={title}/>
            {/* <!-- ===== Page Wrapper Start ===== --> */}
            <div className="flex h-screen overflow-hidden">
                {/* <!-- ===== Sidebar Start ===== --> */}
                <Sidebar
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
                {/* <!-- ===== Sidebar End ===== --> */}

                {/* <!-- ===== Content Area Start ===== --> */}
                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    {/* <!-- ===== Header Start ===== --> */}
                    <Header
                        sidebarOpen={sidebarOpen}
                        setSidebarOpen={setSidebarOpen}
                    />
                    {/* <!-- ===== Header End ===== --> */}

                    {/* <!-- ===== Main Content Start ===== --> */}
                    <main>
                        <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                            {children}
                        </div>
                        {/* <footer className="flex bg-white p-5 justify-center items-center text-sm">
                            Copyright © 2024 PT. EduTestMarket
                        </footer> */}
                    </main>
                    {/* <!-- ===== Main Content End ===== --> */}
                </div>
                {/* <!-- ===== Content Area End ===== --> */}
            </div>
            {/* <!-- ===== Page Wrapper End ===== --> */}
        </div>
    );
};

export default AdminLayout;
